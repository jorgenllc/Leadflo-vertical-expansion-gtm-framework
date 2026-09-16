# Leadflo — Sales Enablement Workspace

A rebuild of the Leadflo GTM playbook as a working sales tool rather than a reference site.
Live Close CRM pipeline on one side, a methodology engine — **GAP / SPIN / Challenger** — on the
other, with ICP scoring and revenue math connecting them.

> **Portfolio note.** Built independently as a personal SDR workflow system for a previous
> employer in the AI chat / home services SaaS space. Company name and product references are
> anonymized under "Leadflo" per an IP assignment clause. The GTM framework, research
> methodology, ICP logic and outreach architecture are the author's own work.
> Built by Johnny Scott.

---

## What it does

**Pipeline** — every Close lead scored 0–100 against the ICP (tech count, FSM platform, revenue
band, demand signal, after-hours pain signal). Disqualifiers are **hard stops, not deductions**:
a ServiceTitan shop with otherwise perfect numbers shows `DQ`, never a near-miss score. Leads
sort with disqualified ones sunk to the bottom.

**Lead Workspace** — the fit breakdown with per-factor evidence, the segment the scorer resolved
(HCP displacement vs. no-FSM fear anchor), the matching win zone, persona and talk track, plus a
live after-hours leak calculator. Every number the methodology quotes recalculates from those
sliders, so you can re-do the math on the call when a prospect corrects you.

**Discovery Call** — runs the selected methodology stage by stage: generated questions with what
to listen for and how to handle the answer, assertions to deliver verbatim where the framework
calls for them, framework-specific self-scoring, and a structured call note that posts back to
Close as an activity.

**Reference** — the original playbook's eight tabs (ICP, Competitive Intel, Channels, Personas,
Seasonal, Messaging, Sequences, Partners), content unchanged, now sitting behind the working views.

---

## The methodology engine

`src/data/methodologies.ts` is the heart of the app. The three frameworks are **generators**, not
three hardcoded question lists — each takes a shop plus its fit assessment and leak math, and
emits a discovery path with that shop's real facts interpolated (owner first name, city, trade,
tech count, stack, lead volume, ticket, seasonal breakdown mode).

They produce *structurally* different calls, not reworded ones:

| Framework | Shape | Stages |
|---|---|---|
| **GAP Selling** (Keenan) | Quantification-led — the prospect does the math out loud | Current State → Future State → Measure the Gap → Impact & Cost of Inaction → Priority & Next Step |
| **SPIN Selling** (Rackham) | Question-led — you ask, they conclude | Situation → Problem → Implication → Need-Payoff |
| **Challenger** (Dixon & Adamson) | Assertion-led — teach a commercial insight first | Warmer → Reframe → Rational Drowning → Emotional Impact → A New Way → Our Solution & Take Control |

Each also rewrites the opening email in its own voice, carries its own scoring dimensions, and
declares its own failure mode.

`recommendFor(shop, fit)` returns an opinionated pick **with reasoning** — an off-platform owner
gets Challenger because the reframe genuinely teaches; an HCP shop with real volume data gets GAP
because the gap can be made arithmetic; a thin first-touch lead gets SPIN to gather the facts the
other two need. Overriding the recommendation is one click, and the UI says what it overrode.

---

## Architecture

```
src/
  lib/
    types.ts         Domain model shared by the CRM layer, scorer and UI
    closeClient.ts   LeadSource interface — live Close client + demo fixture client
    scoring.ts       ICP fit engine, disqualifiers, leak calculator
    season.ts        Which seasonal window we're in, weeks to next peak
  data/
    playbook.ts      All v1 reference content, migrated verbatim
    methodologies.ts GAP / SPIN / Challenger generators + recommendation logic
    fixtures.ts      Demo pipeline (invented shops, not scraped businesses)
  views/             Pipeline, LeadWorkspace, Discovery, Reference
  components/ui.tsx  Primitives
api/
  close/[...path].ts Serverless proxy holding CLOSE_API_KEY
```

### Why there's a server proxy

Close authenticates with HTTP Basic auth using the API key as the username, and `api.close.com`
sends no CORS headers. A browser therefore can't call it directly — and a key shipped to the
client would be readable by anyone who opens devtools. So `/api/close/*` is the only place the
key is read.

The proxy is deliberately restrictive: only the endpoints this app uses, only with the methods it
needs, and `DELETE` isn't routed at all, so a frontend bug can't destroy CRM data. Extend the
`ALLOWED` table in `api/close/[...path].ts` if you add a call.

### Custom fields resolve by name

Close custom fields are per-org opaque ids (`lcf_…`). Rather than hardcoding them, the client
fetches `custom_field/lead/` on first load and matches field **names** fuzzily — `Tech Count`,
`# of Techs` and `Technicians` all resolve to `techCount`. Point the app at a different Close org
and it re-learns the ids. Where a field genuinely doesn't exist, the client falls back to reading
the lead description, and the scorer marks the factor `inferred` rather than scoring it as a pass.

### Demo mode is a feature, not a fallback

The data layer is an interface with two implementations. With no `CLOSE_API_KEY` set, the app runs
fully against `src/data/fixtures.ts` — nine invented HVAC and plumbing shops covering both win-zone
segments, every hard disqualifier, a growth-stage aspirational anchor, and a deliberately thin lead
that exercises the missing-data path. Anyone opening the link sees a working tool, not a login wall.

---

## Running it

```bash
npm install
npm run dev        # Vite only — demo mode works, live mode has no proxy
```

For live mode locally you need the serverless function, which means the Vercel CLI:

```bash
npm i -g vercel
echo "CLOSE_API_KEY=api_xxx" > .env      # or: vercel env pull
vercel dev                                # serves the app AND /api/close/*
```

`npm run dev` alone is fine for everything except live Close calls — the sidebar will tell you the
proxy didn't respond rather than failing silently.

```bash
npm run build       # tsc -b && vite build
npm run typecheck
```

## Deploying to Vercel

1. Push this repo to GitHub and import it in Vercel. Framework preset: **Vite** (already declared
   in `vercel.json`, along with the SPA rewrite that excludes `/api/`).
2. **Settings → Environment Variables → add `CLOSE_API_KEY`** (Production, Preview, Development).
   Do *not* prefix it with `VITE_` — that would inline your key into the client bundle.
3. Redeploy. The sidebar's data-source toggle will connect and show your Close org name.

Until the key is set, the deployment serves demo mode and the Pipeline view shows setup
instructions instead of an error.

### Close API key

Close → Settings → Developer → API Keys. The proxy uses these endpoints:

| Endpoint | Method | Used for |
|---|---|---|
| `me/` | GET | Connection check, org name |
| `lead/` | GET | Pipeline |
| `custom_field/lead/` | GET | Resolving qualifying fields by name |
| `activity/note/` | POST | Writing the call note back |
| `lead/{id}/` | PUT | Status updates (routed, not yet wired to UI) |

---

## Known scope boundaries

- **Write-back is notes only.** Opportunity creation and lead status changes are allowed by the
  proxy but not yet surfaced in the UI.
- **Call state is in-memory.** Answers and self-scores live in React state, so a refresh clears an
  in-progress call. The note is designed to be logged to Close at the end of the call, which is
  where persistence belongs — but if you want resumable calls, that wants `localStorage` or a
  Close custom activity type.
- **Lead volume and average ticket drive the whole leak model.** Where Close doesn't have them the
  app uses the playbook's conservative defaults (40 leads/mo, $600 ticket, 33% after hours, 25%
  lost) and labels the figure as an assumption. Confirm on the call before quoting it.
- **No pagination.** The pipeline fetches the first 50 leads. Close's `_skip`/`_limit` is wired in
  the client but not exposed in the UI.
