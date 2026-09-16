import { useMemo, useState } from 'react';
import { c, font, radius, tint } from '../theme';
import type { Shop } from '../lib/types';
import type { SourceStatus } from '../lib/closeClient';
import { assessFit, computeLeak, SEGMENT_LABEL } from '../lib/scoring';
import { recommendFor, METHODOLOGY_META } from '../data/methodologies';
import { Card, Chip, Empty, Label, ScoreRing, SectionHead, Stat } from '../components/ui';

type Filter = 'all' | 'strong' | 'hcp' | 'nofsm' | 'dq' | 'thin';

const FILTERS: { id: Filter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'strong', label: 'Strong fit' },
  { id: 'hcp', label: 'HCP displacement' },
  { id: 'nofsm', label: 'No-FSM' },
  { id: 'thin', label: 'Missing data' },
  { id: 'dq', label: 'Disqualified' },
];

const money = (n: number) => `$${Math.round(n).toLocaleString('en-US')}`;

export function Pipeline({
  shops,
  loading,
  error,
  status,
  selectedId,
  onOpen,
}: {
  shops: Shop[];
  loading: boolean;
  error: string | null;
  status: SourceStatus | null;
  selectedId: string | null;
  onOpen: (id: string, view?: 'lead' | 'discovery') => void;
}) {
  const [filter, setFilter] = useState<Filter>('all');
  const [q, setQ] = useState('');

  const rows = useMemo(
    () =>
      shops.map((shop) => {
        const fit = assessFit(shop);
        return { shop, fit, leak: computeLeak(shop), rec: recommendFor(shop, fit) };
      }),
    [shops],
  );

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return rows
      .filter(({ shop, fit }) => {
        if (needle && !`${shop.name} ${shop.city ?? ''}`.toLowerCase().includes(needle)) return false;
        switch (filter) {
          case 'strong':
            return fit.band === 'strong';
          case 'hcp':
            return fit.segment === 'hcp_displacement';
          case 'nofsm':
            return fit.segment === 'no_fsm_fear_anchor';
          case 'dq':
            return fit.disqualified;
          case 'thin':
            return !fit.disqualified && fit.missing.length > 0;
          default:
            return true;
        }
      })
      // Disqualified leads sink; otherwise highest fit first. A rep should never
      // have to scroll past a dead lead to reach a live one.
      .sort((a, b) => {
        if (a.fit.disqualified !== b.fit.disqualified) return a.fit.disqualified ? 1 : -1;
        return b.fit.score - a.fit.score;
      });
  }, [rows, filter, q]);

  const summary = useMemo(() => {
    const live = rows.filter((r) => !r.fit.disqualified);
    return {
      total: rows.length,
      qualified: live.length,
      dq: rows.length - live.length,
      strong: rows.filter((r) => r.fit.band === 'strong').length,
      pipelineLeak: live.reduce((s, r) => s + r.leak.annualLeak, 0),
    };
  }, [rows]);

  if (loading) {
    return (
      <div>
        <SectionHead eyebrow="Pipeline" title="Loading pipeline…" />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              style={{
                height: 68,
                background: c.surface,
                border: `1px solid ${c.border}`,
                borderRadius: radius.md,
                animation: 'lf-pulse 1.3s infinite',
                animationDelay: `${i * 0.12}s`,
              }}
            />
          ))}
        </div>
      </div>
    );
  }

  if (status && !status.connected) {
    return (
      <div>
        <SectionHead
          eyebrow="Pipeline"
          title={status.unconfigured ? 'Close is not configured yet' : 'Close is unreachable'}
          sub={status.message}
        />
        <Card style={{ borderLeft: `4px solid ${status.unconfigured ? c.amber : c.red}` }}>
          <Label color={status.unconfigured ? c.amber : c.red}>
            {status.unconfigured ? 'Setup required' : 'Connection error'}
          </Label>
          <p style={{ fontSize: 13, color: c.text, margin: '0 0 12px', lineHeight: 1.7 }}>
            {status.unconfigured
              ? 'The deployment has no CLOSE_API_KEY. Add it under Vercel → Settings → Environment Variables and redeploy, and this view switches to live pipeline. Until then, flip the data source to Demo in the sidebar — every feature works against fixtures.'
              : status.message}
          </p>
          <pre
            style={{
              fontFamily: font.mono,
              fontSize: 11.5,
              background: c.off,
              border: `1px solid ${c.border}`,
              borderRadius: radius.sm,
              padding: '10px 12px',
              margin: 0,
              color: c.muted,
            }}
          >
            CLOSE_API_KEY=api_xxxxxxxxxxxxxxxxxxxx
          </pre>
        </Card>
      </div>
    );
  }

  return (
    <div style={{ animation: 'lf-fade 0.2s ease' }}>
      <SectionHead
        eyebrow="Pipeline"
        title="Every lead, scored against the ICP"
        sub="Fit is computed from the qualifying criteria in the playbook — tech count, FSM platform, revenue band, demand signal and after-hours pain. Disqualifiers are hard stops, not deductions, so a ServiceTitan shop never surfaces as a near-miss."
      />

      {/* Summary strip */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
          gap: 10,
          marginBottom: 18,
        }}
      >
        <Card pad="14px 16px">
          <Stat value={String(summary.total)} label="Leads loaded" />
        </Card>
        <Card pad="14px 16px">
          <Stat value={String(summary.strong)} label="Strong fit" color={c.green} />
        </Card>
        <Card pad="14px 16px">
          <Stat value={String(summary.qualified)} label="In ICP" />
        </Card>
        <Card pad="14px 16px">
          <Stat value={String(summary.dq)} label="Disqualified" color={c.red} />
        </Card>
        <Card pad="14px 16px" dark>
          <p
            style={{
              fontSize: 19,
              fontWeight: 800,
              color: c.onDark,
              margin: '0 0 2px',
              fontFamily: font.mono,
              letterSpacing: '-0.02em',
            }}
          >
            {money(summary.pipelineLeak)}
          </p>
          <p
            style={{
              fontSize: 10,
              color: c.lavender,
              margin: 0,
              textTransform: 'uppercase',
              letterSpacing: '0.07em',
              fontWeight: 600,
              opacity: 0.7,
            }}
          >
            Annual leak in ICP
          </p>
        </Card>
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 14, flexWrap: 'wrap', alignItems: 'center' }}>
        {FILTERS.map((f) => {
          const active = filter === f.id;
          return (
            <button
              key={f.id}
              type="button"
              onClick={() => setFilter(f.id)}
              style={{
                padding: '6px 12px',
                borderRadius: radius.md,
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer',
                border: `1px solid ${active ? c.navy : c.border}`,
                background: active ? c.navy : c.surface,
                color: active ? c.white : c.text,
              }}
            >
              {f.label}
            </button>
          );
        })}
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Filter by name or city…"
          style={{
            marginLeft: 'auto',
            padding: '7px 11px',
            fontSize: 12.5,
            fontFamily: font.sans,
            border: `1px solid ${c.border}`,
            borderRadius: radius.md,
            background: c.surface,
            color: c.text,
            minWidth: 210,
            outline: 'none',
          }}
        />
      </div>

      {error && (
        <Card style={{ background: c.redBg, border: `1px solid ${c.redLine}`, marginBottom: 14 }}>
          <p style={{ fontSize: 12.5, color: c.red, margin: 0, fontWeight: 600 }}>{error}</p>
        </Card>
      )}

      {filtered.length === 0 ? (
        <Empty
          icon="🗂"
          title="Nothing matches that filter"
          body="Clear the filter or widen the search. In demo mode the fixture set covers both win zones plus every disqualifier."
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {filtered.map(({ shop, fit, leak, rec }) => {
            const selected = shop.id === selectedId;
            const bandColor = fit.disqualified
              ? c.red
              : fit.band === 'strong'
                ? c.green
                : fit.band === 'workable'
                  ? c.amber
                  : c.muted;
            const meta = METHODOLOGY_META[rec.id];

            return (
              <div
                key={shop.id}
                onClick={() => onOpen(shop.id)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') onOpen(shop.id);
                }}
                style={{
                  background: c.surface,
                  border: `1px solid ${selected ? c.navy : c.border}`,
                  borderLeft: `4px solid ${bandColor}`,
                  borderRadius: radius.md,
                  padding: '14px 16px',
                  display: 'grid',
                  gridTemplateColumns: '56px minmax(0,2.2fr) minmax(0,1.5fr) minmax(0,1.1fr) minmax(0,1.5fr)',
                  gap: 14,
                  alignItems: 'center',
                  cursor: 'pointer',
                  opacity: fit.disqualified ? 0.72 : 1,
                  transition: 'border-color 0.14s',
                }}
              >
                <ScoreRing score={fit.score} disqualified={fit.disqualified} color={bandColor} />

                <div style={{ minWidth: 0 }}>
                  <div style={{ display: 'flex', gap: 7, alignItems: 'center', marginBottom: 3 }}>
                    <p
                      style={{
                        fontSize: 13.5,
                        fontWeight: 800,
                        color: c.navy,
                        margin: 0,
                        textDecoration: fit.disqualified ? 'line-through' : 'none',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {shop.name}
                    </p>
                    {shop.isFixture && (
                      <Chip color={c.muted} style={{ fontSize: 9 }}>
                        Demo
                      </Chip>
                    )}
                  </div>
                  <p style={{ fontSize: 11.5, color: c.muted, margin: 0 }}>
                    {[shop.city, shop.state].filter(Boolean).join(', ') || '—'}
                    {shop.contacts[0] ? ` · ${shop.contacts[0].name}` : ''}
                  </p>
                </div>

                <div style={{ minWidth: 0 }}>
                  <Chip
                    color={
                      fit.segment === 'hcp_displacement'
                        ? c.sky
                        : fit.segment === 'no_fsm_fear_anchor'
                          ? c.spin
                          : fit.disqualified
                            ? c.red
                            : c.muted
                    }
                  >
                    {SEGMENT_LABEL[fit.segment]}
                  </Chip>
                  <p style={{ fontSize: 11.5, color: c.muted, margin: '5px 0 0', fontFamily: font.mono }}>
                    {shop.techCount != null ? `${shop.techCount} techs` : 'techs ?'}
                    {' · '}
                    {shop.annualRevenue != null
                      ? `$${(shop.annualRevenue / 1_000_000).toFixed(1)}M`
                      : 'rev ?'}
                  </p>
                </div>

                <div>
                  {fit.disqualified ? (
                    <p style={{ fontSize: 11.5, color: c.red, margin: 0, fontWeight: 700 }}>
                      {fit.disqualifiers[0].label}
                    </p>
                  ) : (
                    <>
                      <p
                        style={{
                          fontSize: 13,
                          fontWeight: 800,
                          color: c.navy,
                          margin: 0,
                          fontFamily: font.mono,
                        }}
                      >
                        {money(leak.monthlyLeak)}
                      </p>
                      <p style={{ fontSize: 10, color: c.muted, margin: 0, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                        /mo leak
                      </p>
                    </>
                  )}
                </div>

                <div style={{ minWidth: 0 }}>
                  {fit.disqualified ? (
                    <p style={{ fontSize: 11.5, color: c.muted, margin: 0, lineHeight: 1.5 }}>
                      {fit.recommendation}
                    </p>
                  ) : (
                    <div
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6,
                        background: tint(meta.color, 0.08),
                        border: `1px solid ${tint(meta.color, 0.24)}`,
                        borderRadius: radius.sm,
                        padding: '5px 9px',
                      }}
                    >
                      <span style={{ fontSize: 10, color: c.muted, fontWeight: 600 }}>RUN</span>
                      <span style={{ fontSize: 11.5, fontWeight: 800, color: meta.color }}>
                        {meta.name}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
