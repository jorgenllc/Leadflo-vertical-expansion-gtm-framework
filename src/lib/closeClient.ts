/**
 * Close CRM data layer.
 *
 * Close authenticates with HTTP Basic auth using the API key as the username,
 * which makes direct browser calls a non-starter twice over: the API sends no
 * CORS headers, and a key shipped to the client would be readable by anyone who
 * opens devtools. So every live call goes through the serverless proxy in
 * `/api/close/[...path].ts`, which holds `CLOSE_API_KEY` server-side.
 *
 * Both implementations satisfy the same `LeadSource` interface, so the UI never
 * knows whether it is reading live pipeline or fixtures.
 */

import type { Contact, FsmStack, Shop, Vertical } from './types';
import { FIXTURE_SHOPS } from '../data/fixtures';

export type SourceMode = 'live' | 'demo';

export interface SourceStatus {
  mode: SourceMode;
  connected: boolean;
  /** Close organization name, when live and reachable. */
  orgName?: string;
  /** User-facing explanation when not connected. */
  message?: string;
  /** True when the proxy reports no API key configured (expected pre-launch). */
  unconfigured?: boolean;
}

export interface LeadSource {
  mode: SourceMode;
  status(): Promise<SourceStatus>;
  listShops(opts?: { query?: string; limit?: number }): Promise<Shop[]>;
  logNote(shopId: string, note: string): Promise<{ ok: boolean; id?: string; message?: string }>;
}

/* ------------------------------------------------------------------ *
 * Demo source
 * ------------------------------------------------------------------ */

const latency = (ms = 240) => new Promise((r) => setTimeout(r, ms));

export function createDemoSource(): LeadSource {
  // Notes logged in demo mode stay in memory so the write-back flow is
  // demonstrable end to end without inventing a fake Close response.
  const notes: { shopId: string; note: string; at: string }[] = [];

  return {
    mode: 'demo',
    async status() {
      await latency(120);
      return {
        mode: 'demo',
        connected: true,
        orgName: 'Demo pipeline (fixtures)',
        message: `${FIXTURE_SHOPS.length} representative HVAC and plumbing shops. No Close credentials in use.`,
      };
    },
    async listShops(opts) {
      await latency();
      const q = opts?.query?.trim().toLowerCase();
      const all = FIXTURE_SHOPS;
      if (!q) return all;
      return all.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          (s.city ?? '').toLowerCase().includes(q) ||
          s.contacts.some((ct) => ct.name.toLowerCase().includes(q)),
      );
    },
    async logNote(shopId, note) {
      await latency(320);
      notes.push({ shopId, note, at: new Date().toISOString() });
      return {
        ok: true,
        id: `demo_note_${notes.length}`,
        message: 'Logged locally in demo mode — nothing was written to a CRM.',
      };
    },
  };
}

/* ------------------------------------------------------------------ *
 * Live source
 * ------------------------------------------------------------------ */

interface CloseCustomField {
  id: string;
  name: string;
}

interface CloseContact {
  id: string;
  name?: string;
  title?: string;
  emails?: { email: string }[];
  phones?: { phone: string }[];
}

interface CloseLead {
  id: string;
  display_name?: string;
  name?: string;
  url?: string;
  description?: string;
  status_label?: string;
  status_id?: string;
  addresses?: { city?: string; state?: string }[];
  contacts?: CloseContact[];
  custom?: Record<string, unknown>;
  [k: string]: unknown;
}

async function proxy<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`/api/close/${path.replace(/^\//, '')}`, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...(init?.headers ?? {}) },
  });
  const text = await res.text();
  let body: unknown;
  try {
    body = text ? JSON.parse(text) : {};
  } catch {
    throw new Error(`Proxy returned non-JSON (${res.status}): ${text.slice(0, 160)}`);
  }
  if (!res.ok) {
    const b = body as { error?: string; message?: string; unconfigured?: boolean };
    const err = new Error(b.error || b.message || `Close request failed (${res.status})`) as Error & {
      unconfigured?: boolean;
      status?: number;
    };
    err.unconfigured = b.unconfigured;
    err.status = res.status;
    throw err;
  }
  return body as T;
}

/**
 * Close custom fields are per-org opaque ids (`lcf_…`), so we resolve them by
 * NAME at runtime. That keeps the app portable across Close orgs — point it at a
 * different account and it re-learns the field ids on first load.
 *
 * Matching is fuzzy on purpose: real Close orgs name these things
 * "Tech Count", "# of Techs", "Technicians", and all three should resolve.
 */
const FIELD_MATCHERS: { key: keyof Shop; patterns: RegExp[] }[] = [
  { key: 'techCount', patterns: [/tech/i, /technician/i, /crew size/i] },
  { key: 'annualRevenue', patterns: [/revenue/i, /annual sales/i, /arr/i] },
  { key: 'monthlyTraffic', patterns: [/traffic/i, /visitors/i, /sessions/i] },
  { key: 'fsmStack', patterns: [/fsm/i, /platform/i, /software/i, /crm/i, /stack/i] },
  { key: 'vertical', patterns: [/vertical/i, /trade/i, /industry/i] },
  { key: 'monthlyWebLeads', patterns: [/web lead/i, /leads per month/i, /monthly leads/i, /inbound leads/i] },
  { key: 'avgTicket', patterns: [/ticket/i, /avg job/i, /average job/i, /job value/i] },
  { key: 'runningLsa', patterns: [/lsa/i, /local service ad/i] },
  { key: 'hasSiteChat', patterns: [/chat/i] },
];

function buildFieldMap(fields: CloseCustomField[]): Partial<Record<keyof Shop, string>> {
  const map: Partial<Record<keyof Shop, string>> = {};
  for (const { key, patterns } of FIELD_MATCHERS) {
    const hit = fields.find((f) => patterns.some((p) => p.test(f.name)));
    if (hit) map[key] = hit.id;
  }
  return map;
}

const toNumber = (v: unknown): number | undefined => {
  if (typeof v === 'number' && Number.isFinite(v)) return v;
  if (typeof v === 'string') {
    // Tolerate "$1.2M", "1,200,000", "12 techs"
    const s = v.replace(/[,$\s]/g, '');
    const mMatch = /^([\d.]+)m$/i.exec(s);
    if (mMatch) return parseFloat(mMatch[1]) * 1_000_000;
    const kMatch = /^([\d.]+)k$/i.exec(s);
    if (kMatch) return parseFloat(kMatch[1]) * 1_000;
    const n = parseFloat(s);
    if (Number.isFinite(n)) return n;
  }
  return undefined;
};

const toBool = (v: unknown): boolean | undefined => {
  if (typeof v === 'boolean') return v;
  if (typeof v === 'string') {
    if (/^(yes|true|y|1)$/i.test(v.trim())) return true;
    if (/^(no|false|n|0|none)$/i.test(v.trim())) return false;
  }
  return undefined;
};

function normalizeStack(v: unknown): FsmStack | undefined {
  if (typeof v !== 'string') return undefined;
  const s = v.toLowerCase();
  if (/service\s*titan|servicetitan|\bst\b/.test(s)) return 'servicetitan';
  if (/housecall|hcp/.test(s)) return 'housecallpro';
  if (/jobber/.test(s)) return 'jobber';
  if (/none|nothing|no fsm|paper|calendar|spreadsheet|manual/.test(s)) return 'none';
  return 'other';
}

function normalizeVertical(v: unknown): Vertical | undefined {
  if (typeof v !== 'string') return undefined;
  const s = v.toLowerCase();
  const hvac = /hvac|heating|air|cooling/.test(s);
  const plumb = /plumb/.test(s);
  if (hvac && plumb) return 'both';
  if (hvac) return 'hvac';
  if (plumb) return 'plumbing';
  if (/commercial|industrial|b2b/.test(s)) return 'other';
  return undefined;
}

/** Pull a custom value whether Close returns `custom: {id: v}` or flat `custom.id` keys. */
function customValue(lead: CloseLead, fieldId?: string): unknown {
  if (!fieldId) return undefined;
  if (lead.custom && typeof lead.custom === 'object' && fieldId in lead.custom) {
    return (lead.custom as Record<string, unknown>)[fieldId];
  }
  return lead[`custom.${fieldId}`];
}

function mapContacts(raw: CloseContact[] = []): Contact[] {
  return raw.map((ct) => {
    const title = ct.title ?? undefined;
    let personaId: string | undefined;
    if (title) {
      if (/owner|founder|president|principal/i.test(title)) personaId = 'owner';
      else if (/office|csr|dispatch|admin|manager/i.test(title)) personaId = 'csr';
    }
    return {
      id: ct.id,
      name: ct.name?.trim() || 'Unnamed contact',
      title,
      emails: (ct.emails ?? []).map((e) => e.email).filter(Boolean),
      phones: (ct.phones ?? []).map((p) => p.phone).filter(Boolean),
      personaId,
    };
  });
}

function mapLead(lead: CloseLead, fields: Partial<Record<keyof Shop, string>>): Shop {
  const addr = lead.addresses?.[0];
  const desc = lead.description ?? '';

  // Fall back to reading the description when custom fields are absent — plenty
  // of real Close orgs keep this detail in prose rather than structured fields.
  const stackFromText = normalizeStack(desc) ?? undefined;
  const verticalFromText = normalizeVertical(`${lead.display_name ?? ''} ${desc}`) ?? undefined;

  return {
    id: lead.id,
    name: lead.display_name || lead.name || 'Untitled lead',
    url: lead.url ?? undefined,
    description: desc || undefined,
    city: addr?.city ?? undefined,
    state: addr?.state ?? undefined,
    statusLabel: lead.status_label ?? undefined,
    statusId: lead.status_id ?? undefined,
    contacts: mapContacts(lead.contacts),
    techCount: toNumber(customValue(lead, fields.techCount)),
    annualRevenue: toNumber(customValue(lead, fields.annualRevenue)),
    monthlyTraffic: toNumber(customValue(lead, fields.monthlyTraffic)),
    fsmStack: normalizeStack(customValue(lead, fields.fsmStack)) ?? stackFromText,
    vertical: normalizeVertical(customValue(lead, fields.vertical)) ?? verticalFromText,
    monthlyWebLeads: toNumber(customValue(lead, fields.monthlyWebLeads)),
    avgTicket: toNumber(customValue(lead, fields.avgTicket)),
    runningLsa: toBool(customValue(lead, fields.runningLsa)),
    hasSiteChat: toBool(customValue(lead, fields.hasSiteChat)),
  };
}

export function createLiveSource(): LeadSource {
  let fieldMapPromise: Promise<Partial<Record<keyof Shop, string>>> | null = null;

  const fieldMap = () => {
    if (!fieldMapPromise) {
      fieldMapPromise = proxy<{ data: CloseCustomField[] }>('custom_field/lead/?_limit=200')
        .then((r) => buildFieldMap(r.data ?? []))
        .catch(() => ({}));
    }
    return fieldMapPromise;
  };

  return {
    mode: 'live',
    async status() {
      try {
        const me = await proxy<{ organizations?: { name: string }[]; first_name?: string }>('me/');
        return {
          mode: 'live',
          connected: true,
          orgName: me.organizations?.[0]?.name ?? 'Close',
        };
      } catch (e) {
        const err = e as Error & { unconfigured?: boolean; status?: number };

        // Distinguish the three failures a rep can actually act on, because
        // "Failed to fetch" tells them nothing about which one they hit.
        let message = err.message;
        if (err.unconfigured) {
          message =
            'No CLOSE_API_KEY set on the deployment. Add it in Vercel → Settings → Environment Variables and redeploy.';
        } else if (/failed to fetch|networkerror|non-JSON/i.test(err.message)) {
          message =
            'The /api/close proxy did not respond. Live mode needs the serverless function running — use `vercel dev` locally, or check the deployment if this is production.';
        } else if (err.status === 401) {
          message = 'Close rejected the API key (401). Check the value of CLOSE_API_KEY.';
        } else if (err.status === 429) {
          message = 'Close is rate limiting this key (429). Wait a moment and retry.';
        }

        return { mode: 'live', connected: false, unconfigured: err.unconfigured, message };
      }
    },
    async listShops(opts) {
      const limit = opts?.limit ?? 50;
      const params = new URLSearchParams({ _limit: String(limit) });
      if (opts?.query) params.set('query', opts.query);
      const [fields, res] = await Promise.all([
        fieldMap(),
        proxy<{ data: CloseLead[] }>(`lead/?${params.toString()}`),
      ]);
      return (res.data ?? []).map((l) => mapLead(l, fields));
    },
    async logNote(shopId, note) {
      try {
        const res = await proxy<{ id: string }>('activity/note/', {
          method: 'POST',
          body: JSON.stringify({ lead_id: shopId, note }),
        });
        return { ok: true, id: res.id, message: 'Note written to Close.' };
      } catch (e) {
        return { ok: false, message: (e as Error).message };
      }
    },
  };
}

export const createSource = (mode: SourceMode): LeadSource =>
  mode === 'live' ? createLiveSource() : createDemoSource();
