import { useCallback, useEffect, useMemo, useState } from 'react';
import { c, font, radius, tint } from './theme';
import { createSource, type LeadSource, type SourceMode, type SourceStatus } from './lib/closeClient';
import type { CallAnswers, MethodologyId, Shop } from './lib/types';
import { assessFit, computeLeak, LEAK_DEFAULTS } from './lib/scoring';
import { buildMethodology, recommendFor } from './data/methodologies';
import { AUTHOR, BYLINE, HEADER_CHIPS, PORTFOLIO_NOTE } from './data/playbook';
import { Pipeline } from './views/Pipeline';
import { LeadWorkspace } from './views/LeadWorkspace';
import { Discovery } from './views/Discovery';
import {
  IcpView,
  CompetitiveView,
  ChannelsView,
  PersonasView,
  SeasonalView,
  MessagingView,
  SequencesView,
  PartnersView,
} from './views/Reference';

type ViewId =
  | 'pipeline'
  | 'lead'
  | 'discovery'
  | 'icp'
  | 'competitive'
  | 'channels'
  | 'personas'
  | 'seasonal'
  | 'messaging'
  | 'sequences'
  | 'partners';

const NAV: { group: string; items: { id: ViewId; label: string; icon: string }[] }[] = [
  {
    group: 'Work',
    items: [
      { id: 'pipeline', label: 'Pipeline', icon: '◧' },
      { id: 'lead', label: 'Lead Workspace', icon: '◉' },
      { id: 'discovery', label: 'Discovery Call', icon: '▶' },
    ],
  },
  {
    group: 'Reference',
    items: [
      { id: 'icp', label: 'ICP & Overview', icon: '📍' },
      { id: 'competitive', label: 'Competitive Intel', icon: '⚔️' },
      { id: 'channels', label: 'Channels', icon: '📡' },
      { id: 'personas', label: 'Personas', icon: '👤' },
      { id: 'seasonal', label: 'Seasonal', icon: '📅' },
      { id: 'messaging', label: 'Messaging', icon: '💬' },
      { id: 'sequences', label: 'Sequences', icon: '📨' },
      { id: 'partners', label: 'Partners', icon: '🤝' },
    ],
  },
];

export function App() {
  const [mode, setMode] = useState<SourceMode>('demo');
  const [source, setSource] = useState<LeadSource>(() => createSource('demo'));
  const [status, setStatus] = useState<SourceStatus | null>(null);
  const [shops, setShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [view, setView] = useState<ViewId>('pipeline');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  /** Methodology override per lead — null means "use the recommendation". */
  const [methodOverride, setMethodOverride] = useState<Record<string, MethodologyId>>({});
  /** Live call answers, keyed lead id → question id → answer. */
  const [answers, setAnswers] = useState<Record<string, CallAnswers>>({});
  /** Leak calculator overrides per lead. */
  const [leakOverrides, setLeakOverrides] = useState<Record<string, Partial<typeof LEAK_DEFAULTS>>>({});

  // Swap the data source whenever the mode toggles, then reload.
  useEffect(() => {
    const next = createSource(mode);
    setSource(next);
    let cancelled = false;

    (async () => {
      setLoading(true);
      setLoadError(null);
      const st = await next.status();
      if (cancelled) return;
      setStatus(st);

      if (!st.connected) {
        setShops([]);
        setLoading(false);
        return;
      }
      try {
        const rows = await next.listShops({ limit: 50 });
        if (cancelled) return;
        setShops(rows);
      } catch (e) {
        if (!cancelled) setLoadError((e as Error).message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [mode]);

  // Keep a lead selected so the workspace is never empty on first open.
  useEffect(() => {
    if (!selectedId && shops.length) setSelectedId(shops[0].id);
    if (selectedId && shops.length && !shops.some((s) => s.id === selectedId)) {
      setSelectedId(shops[0].id);
    }
  }, [shops, selectedId]);

  const shop = useMemo(() => shops.find((s) => s.id === selectedId) ?? null, [shops, selectedId]);
  const fit = useMemo(() => (shop ? assessFit(shop) : null), [shop]);
  const leak = useMemo(
    () => (shop ? computeLeak(shop, leakOverrides[shop.id] ?? {}) : null),
    [shop, leakOverrides],
  );
  const recommended = useMemo(() => (shop && fit ? recommendFor(shop, fit) : null), [shop, fit]);
  const methodology: MethodologyId | null = shop
    ? (methodOverride[shop.id] ?? recommended?.id ?? 'spin')
    : null;
  const playbook = useMemo(
    () => (shop && fit && leak && methodology ? buildMethodology(methodology, shop, fit, leak) : null),
    [shop, fit, leak, methodology],
  );

  const openLead = useCallback((id: string, target: ViewId = 'lead') => {
    setSelectedId(id);
    setView(target);
  }, []);

  const setMethodology = useCallback(
    (id: MethodologyId) => {
      if (!shop) return;
      setMethodOverride((prev) => ({ ...prev, [shop.id]: id }));
    },
    [shop],
  );

  const setAnswer = useCallback(
    (qid: string, value: string) => {
      if (!shop) return;
      setAnswers((prev) => ({ ...prev, [shop.id]: { ...(prev[shop.id] ?? {}), [qid]: value } }));
    },
    [shop],
  );

  const activeColor = playbook?.color ?? c.accent;

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: c.bg, fontFamily: font.sans }}>
      {/* ---------------- Left rail ---------------- */}
      <nav
        style={{
          width: 218,
          flexShrink: 0,
          background: c.darker,
          borderRight: `1px solid ${c.darkBorder}`,
          display: 'flex',
          flexDirection: 'column',
          position: 'sticky',
          top: 0,
          height: '100vh',
          overflowY: 'auto',
        }}
      >
        <div style={{ padding: '16px 16px 14px' }}>
          <div style={{ display: 'flex', alignItems: 'baseline' }}>
            <span style={{ fontWeight: 900, fontSize: 18, color: c.white, letterSpacing: '-0.02em' }}>
              Lead
            </span>
            <span style={{ fontWeight: 300, fontSize: 18, color: c.white, letterSpacing: '-0.01em' }}>
              flo
            </span>
          </div>
          <span
            style={{
              fontSize: 7.5,
              color: c.onDark,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              fontWeight: 600,
            }}
          >
            Sales Enablement Workspace
          </span>
        </div>

        {NAV.map((g) => (
          <div key={g.group} style={{ padding: '6px 8px 10px' }}>
            <p
              style={{
                fontSize: 9.5,
                fontWeight: 700,
                color: '#6A6560',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                margin: '0 0 6px 8px',
              }}
            >
              {g.group}
            </p>
            {g.items.map((item) => {
              const active = view === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setView(item.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 9,
                    width: '100%',
                    textAlign: 'left',
                    padding: '7px 9px',
                    marginBottom: 1,
                    borderRadius: radius.sm,
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: 12.5,
                    fontWeight: active ? 700 : 500,
                    background: active ? tint(c.accent, 0.13) : 'transparent',
                    color: active ? c.onDark : '#A8A29C',
                    transition: 'all 0.13s',
                  }}
                >
                  <span style={{ fontSize: 11, width: 13, textAlign: 'center', flexShrink: 0 }}>
                    {item.icon}
                  </span>
                  {item.label}
                </button>
              );
            })}
          </div>
        ))}

        <div style={{ marginTop: 'auto', padding: '14px 16px', borderTop: `1px solid ${c.darkBorder}` }}>
          <SourceToggle mode={mode} status={status} onChange={setMode} />
        </div>
      </nav>

      {/* ---------------- Main column ---------------- */}
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
        {/* Context bar — which lead is loaded and which framework is live */}
        <header
          style={{
            background: c.surface,
            borderBottom: `1px solid ${c.border}`,
            padding: '11px 24px',
            display: 'flex',
            alignItems: 'center',
            gap: 14,
            position: 'sticky',
            top: 0,
            zIndex: 50,
            flexWrap: 'wrap',
          }}
        >
          {shop ? (
            <>
              <div style={{ minWidth: 0 }}>
                <p
                  style={{
                    fontSize: 13.5,
                    fontWeight: 800,
                    color: c.navy,
                    margin: 0,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {shop.name}
                </p>
                <p style={{ fontSize: 11, color: c.muted, margin: 0 }}>
                  {[shop.city, shop.state].filter(Boolean).join(', ') || 'Location unknown'}
                  {shop.statusLabel ? ` · ${shop.statusLabel}` : ''}
                </p>
              </div>
              {playbook && (
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    padding: '4px 10px',
                    borderRadius: radius.sm,
                    background: tint(activeColor, 0.1),
                    color: activeColor,
                    border: `1px solid ${tint(activeColor, 0.28)}`,
                  }}
                >
                  {playbook.name}
                </span>
              )}
            </>
          ) : (
            <p style={{ fontSize: 12.5, color: c.muted, margin: 0 }}>No lead selected</p>
          )}

          <div style={{ marginLeft: 'auto', display: 'flex', gap: 5, flexWrap: 'wrap' }}>
            {HEADER_CHIPS.map(([label, bg, fg]) => (
              <span
                key={label}
                style={{
                  fontSize: 10.5,
                  background: bg,
                  color: fg,
                  border: `1px solid ${fg}30`,
                  borderRadius: radius.sm,
                  padding: '3px 9px',
                  fontWeight: 600,
                  whiteSpace: 'nowrap',
                }}
              >
                {label}
              </span>
            ))}
          </div>
        </header>

        <main style={{ flex: 1, padding: '26px 24px 40px', maxWidth: 1180, width: '100%' }}>
          {view === 'pipeline' && (
            <Pipeline
              shops={shops}
              loading={loading}
              error={loadError}
              status={status}
              selectedId={selectedId}
              onOpen={openLead}
            />
          )}

          {view === 'lead' && (
            <LeadWorkspace
              shop={shop}
              fit={fit}
              leak={leak}
              methodology={methodology}
              playbook={playbook}
              recommended={recommended}
              onMethodology={setMethodology}
              onLeakChange={(next) =>
                shop && setLeakOverrides((prev) => ({ ...prev, [shop.id]: next }))
              }
              leakOverride={shop ? (leakOverrides[shop.id] ?? {}) : {}}
              onStartCall={() => setView('discovery')}
            />
          )}

          {view === 'discovery' && (
            /* Keyed on lead + framework so stage position, self-scores and outcome
               reset when either changes — a Challenger scorecard should not carry
               over onto a SPIN call, or onto a different shop. */
            <Discovery
              key={`${shop?.id ?? 'none'}:${methodology ?? 'none'}`}
              shop={shop}
              fit={fit}
              leak={leak}
              playbook={playbook}
              recommended={recommended}
              answers={shop ? (answers[shop.id] ?? {}) : {}}
              onAnswer={setAnswer}
              onMethodology={setMethodology}
              source={source}
            />
          )}

          {view === 'icp' && <IcpView />}
          {view === 'competitive' && <CompetitiveView />}
          {view === 'channels' && <ChannelsView />}
          {view === 'personas' && <PersonasView />}
          {view === 'seasonal' && <SeasonalView />}
          {view === 'messaging' && <MessagingView />}
          {view === 'sequences' && <SequencesView />}
          {view === 'partners' && <PartnersView />}
        </main>

        {/* ---------------- Provenance ---------------- */}
        <footer style={{ borderTop: `1px solid ${c.border}`, background: c.surface }}>
          <div
            style={{
              background: c.off,
              borderBottom: `1px solid ${c.border}`,
              padding: '10px 24px',
              display: 'flex',
              alignItems: 'flex-start',
              gap: 10,
            }}
          >
            <span style={{ fontSize: 14, lineHeight: 1.4 }}>🔒</span>
            <p style={{ fontSize: 11.5, color: c.muted, margin: 0, lineHeight: 1.6, maxWidth: 900 }}>
              <strong style={{ color: c.text }}>Portfolio Note:</strong> {PORTFOLIO_NOTE}{' '}
              <span style={{ fontStyle: 'italic' }}>{BYLINE}</span>
            </p>
          </div>
          <div style={{ padding: '16px 24px', textAlign: 'center' }}>
            <p style={{ fontSize: 11.5, color: c.muted, margin: 0 }}>
              Built by <strong style={{ color: c.navy }}>{AUTHOR.name}</strong> · {AUTHOR.role} ·{' '}
              <a
                href={AUTHOR.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: c.text, textDecoration: 'none', fontWeight: 600 }}
              >
                LinkedIn
              </a>
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * Data-source toggle — always visible, because a rep needs to know at a
 * glance whether they are looking at their real pipeline or fixtures.
 * ------------------------------------------------------------------ */

function SourceToggle({
  mode,
  status,
  onChange,
}: {
  mode: SourceMode;
  status: SourceStatus | null;
  onChange: (m: SourceMode) => void;
}) {
  const live = mode === 'live';
  const ok = status?.connected;
  const dot = !status ? '#6A6560' : ok ? c.greenLight : c.red;

  return (
    <div>
      <p
        style={{
          fontSize: 9.5,
          fontWeight: 700,
          color: '#6A6560',
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
          margin: '0 0 7px',
        }}
      >
        Data source
      </p>
      <div
        style={{
          display: 'flex',
          background: '#1E1E1B',
          border: `1px solid ${c.darkBorder}`,
          borderRadius: radius.md,
          padding: 2,
          marginBottom: 9,
        }}
      >
        {(['demo', 'live'] as SourceMode[]).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => onChange(m)}
            style={{
              flex: 1,
              padding: '5px 0',
              fontSize: 11,
              fontWeight: 700,
              borderRadius: radius.sm - 1,
              border: 'none',
              cursor: 'pointer',
              background: mode === m ? tint(c.accent, 0.15) : 'transparent',
              color: mode === m ? c.onDark : '#8A857F',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
            }}
          >
            {m}
          </button>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 6, alignItems: 'flex-start' }}>
        <span
          style={{
            width: 6,
            height: 6,
            borderRadius: '50%',
            background: dot,
            marginTop: 5,
            flexShrink: 0,
            animation: !status ? 'lf-pulse 1.2s infinite' : undefined,
          }}
        />
        <p style={{ fontSize: 10.5, color: '#8A857F', margin: 0, lineHeight: 1.5 }}>
          {!status
            ? 'Checking…'
            : ok
              ? status.orgName
              : live
                ? status.unconfigured
                  ? 'No API key on this deployment — running fixtures.'
                  : `Close error: ${status.message}`
                : 'Unavailable'}
        </p>
      </div>
    </div>
  );
}
