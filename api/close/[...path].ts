/**
 * Close CRM proxy (Vercel serverless function, Node runtime).
 *
 * Why this exists: Close authenticates with HTTP Basic auth using the API key as
 * the username, and api.close.com sends no CORS headers. A browser therefore
 * cannot call it directly, and shipping the key to the client would publish it to
 * anyone who opens devtools. This function is the only place the key is read.
 *
 * Requests arrive as /api/close/<close-api-path> and are forwarded to
 * https://api.close.com/api/v1/<close-api-path> with the Authorization header
 * attached server-side. The response body is passed through unchanged.
 *
 * Deliberately restrictive: only the endpoints this app actually uses are
 * allowed, and only with the methods it actually needs. A leaked frontend bug
 * should not be able to delete a lead, so DELETE is not routed at all.
 */

interface Req {
  method?: string;
  url?: string;
  query: Record<string, string | string[] | undefined>;
  body?: unknown;
  headers: Record<string, string | string[] | undefined>;
}

interface Res {
  status(code: number): Res;
  json(body: unknown): void;
  setHeader(name: string, value: string): void;
  end(body?: string): void;
}

const CLOSE_BASE = 'https://api.close.com/api/v1';

/** path prefix → methods permitted on it. */
const ALLOWED: { prefix: RegExp; methods: string[] }[] = [
  { prefix: /^me\/?$/, methods: ['GET'] },
  { prefix: /^lead\/?$/, methods: ['GET'] },
  { prefix: /^lead\/[\w-]+\/?$/, methods: ['GET', 'PUT'] },
  { prefix: /^contact\/?$/, methods: ['GET'] },
  { prefix: /^contact\/[\w-]+\/?$/, methods: ['GET'] },
  { prefix: /^opportunity\/?$/, methods: ['GET'] },
  { prefix: /^activity\/?$/, methods: ['GET'] },
  { prefix: /^activity\/note\/?$/, methods: ['GET', 'POST'] },
  { prefix: /^activity\/call\/?$/, methods: ['GET', 'POST'] },
  { prefix: /^task\/?$/, methods: ['GET', 'POST'] },
  { prefix: /^custom_field\/lead\/?$/, methods: ['GET'] },
  { prefix: /^custom_field\/(contact|opportunity)\/?$/, methods: ['GET'] },
  { prefix: /^status\/lead\/?$/, methods: ['GET'] },
  { prefix: /^saved_search\/?$/, methods: ['GET'] },
];

function isAllowed(path: string, method: string): boolean {
  return ALLOWED.some((r) => r.prefix.test(path) && r.methods.includes(method));
}

export default async function handler(req: Req, res: Res) {
  const method = (req.method ?? 'GET').toUpperCase();

  if (method === 'OPTIONS') {
    res.setHeader('Allow', 'GET, POST, PUT');
    res.status(204).end();
    return;
  }

  const apiKey = process.env.CLOSE_API_KEY;
  if (!apiKey) {
    // 503 rather than 401: the app is fine, the deployment simply has no key yet.
    // The client uses `unconfigured` to show setup instructions instead of an error.
    res.status(503).json({
      error: 'CLOSE_API_KEY is not set on this deployment.',
      unconfigured: true,
      hint: 'Vercel → Project → Settings → Environment Variables → add CLOSE_API_KEY, then redeploy. Until then the app runs in demo mode.',
    });
    return;
  }

  // Rebuild the Close path from the catch-all segment.
  const raw = req.query.path;
  const segments = Array.isArray(raw) ? raw : raw ? [raw] : [];
  const path = segments.join('/');

  if (!path) {
    res.status(400).json({ error: 'No Close API path supplied.' });
    return;
  }

  // Forward the querystring, minus the routing param Vercel injected.
  const qs = new URLSearchParams();
  const incoming = new URL(req.url ?? '', 'http://localhost');
  incoming.searchParams.forEach((value, key) => {
    if (key !== 'path') qs.append(key, value);
  });

  const normalized = path.endsWith('/') ? path : `${path}/`;
  if (!isAllowed(normalized, method)) {
    res.status(403).json({
      error: `Not permitted: ${method} ${path}`,
      hint: 'This proxy only routes the Close endpoints the workspace uses. Extend ALLOWED in api/close/[...path].ts if you need another one.',
    });
    return;
  }

  const target = `${CLOSE_BASE}/${normalized}${qs.toString() ? `?${qs}` : ''}`;
  const auth = Buffer.from(`${apiKey}:`).toString('base64');

  try {
    const upstream = await fetch(target, {
      method,
      headers: {
        Authorization: `Basic ${auth}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: method === 'GET' ? undefined : JSON.stringify(req.body ?? {}),
    });

    const text = await upstream.text();

    // Close rate limits with a 429 and a documented backoff payload — surface it
    // as-is so the UI can tell the user to wait rather than reporting a generic failure.
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Cache-Control', 'no-store');
    res.status(upstream.status).end(text || '{}');
  } catch (e) {
    res.status(502).json({
      error: `Could not reach Close: ${(e as Error).message}`,
    });
  }
}
