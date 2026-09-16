import { c, font, radius, tint } from '../theme';
import type {
  FitAssessment,
  LeakMath,
  MethodologyId,
  MethodologyPlaybook,
  Shop,
} from '../lib/types';
import { LEAK_DEFAULTS, SEGMENT_LABEL } from '../lib/scoring';
import { METHODOLOGY_IDS, METHODOLOGY_META } from '../data/methodologies';
import { PERSONAS, TALK_TRACKS, WIN_ZONES } from '../data/playbook';
import { currentSeason, weeksToNextPeak } from '../lib/season';
import { Button, Card, Chip, CopyBox, Divider, Empty, Label, ScoreRing, SectionHead } from '../components/ui';

const money = (n: number) => `$${Math.round(n).toLocaleString('en-US')}`;

export function LeadWorkspace({
  shop,
  fit,
  leak,
  methodology,
  playbook,
  recommended,
  onMethodology,
  onLeakChange,
  leakOverride,
  onStartCall,
}: {
  shop: Shop | null;
  fit: FitAssessment | null;
  leak: LeakMath | null;
  methodology: MethodologyId | null;
  playbook: MethodologyPlaybook | null;
  recommended: { id: MethodologyId; reason: string } | null;
  onMethodology: (id: MethodologyId) => void;
  onLeakChange: (next: Partial<typeof LEAK_DEFAULTS>) => void;
  leakOverride: Partial<typeof LEAK_DEFAULTS>;
  onStartCall: () => void;
}) {
  if (!shop || !fit || !leak || !playbook || !methodology || !recommended) {
    return (
      <Empty
        icon="◉"
        title="No lead loaded"
        body="Pick a lead from the pipeline and this becomes its workspace — fit breakdown, revenue math, and the discovery path for whichever methodology you run."
      />
    );
  }

  const persona =
    PERSONAS.find((p) => p.segment === fit.segment) ??
    PERSONAS.find((p) => p.segment === 'either') ??
    PERSONAS[0];
  const track = TALK_TRACKS.find((t) => (fit.segment === 'hcp_displacement' ? t.id === 'hcp' : t.id === 'nofsm'));
  const winZone = WIN_ZONES.find((w) => w.id === fit.winZoneId);
  const season = currentSeason();
  const bandColor = fit.disqualified
    ? c.red
    : fit.band === 'strong'
      ? c.green
      : fit.band === 'workable'
        ? c.amber
        : c.muted;

  return (
    <div style={{ animation: 'lf-fade 0.2s ease' }}>
      <SectionHead
        eyebrow="Lead Workspace"
        title={shop.name}
        sub={shop.description}
        accent={playbook.color}
      />

      {/* ---------- Fit + disqualifiers ---------- */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
        <Card style={{ borderTop: `3px solid ${bandColor}` }}>
          <div style={{ display: 'flex', gap: 14, alignItems: 'center', marginBottom: 14 }}>
            <ScoreRing score={fit.score} disqualified={fit.disqualified} size={64} color={bandColor} />
            <div>
              <div style={{ display: 'flex', gap: 7, marginBottom: 5, flexWrap: 'wrap' }}>
                <Chip color={bandColor}>{fit.band}</Chip>
                <Chip
                  color={
                    fit.segment === 'hcp_displacement'
                      ? c.sky
                      : fit.segment === 'no_fsm_fear_anchor'
                        ? c.spin
                        : c.muted
                  }
                >
                  {SEGMENT_LABEL[fit.segment]}
                </Chip>
              </div>
              <p style={{ fontSize: 12.5, color: c.text, margin: 0, lineHeight: 1.55, fontWeight: 600 }}>
                {fit.recommendation}
              </p>
            </div>
          </div>

          <Label>ICP factor breakdown</Label>
          {fit.factors.map((f) => (
            <div key={f.label} style={{ marginBottom: 9 }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 3 }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: c.navy }}>{f.label}</span>
                <span style={{ fontSize: 10.5, color: c.faint, fontFamily: font.mono }}>
                  ×{f.weight.toFixed(2)}
                </span>
                {f.inferred && (
                  <Chip color={c.amber} style={{ fontSize: 9 }}>
                    No data
                  </Chip>
                )}
                <span
                  style={{
                    marginLeft: 'auto',
                    fontSize: 11,
                    fontFamily: font.mono,
                    fontWeight: 700,
                    color: f.score >= 0.8 ? c.green : f.score >= 0.5 ? c.amber : c.red,
                  }}
                >
                  {Math.round(f.score * 100)}
                </span>
              </div>
              <div style={{ height: 4, background: c.off, borderRadius: 3, overflow: 'hidden' }}>
                <div
                  style={{
                    width: `${f.score * 100}%`,
                    height: '100%',
                    background: f.inferred ? c.borderStrong : bandColor,
                    borderRadius: 3,
                    transition: 'width 0.35s',
                  }}
                />
              </div>
              <p style={{ fontSize: 11.5, color: c.muted, margin: '4px 0 0', lineHeight: 1.5 }}>
                {f.evidence}
              </p>
            </div>
          ))}
        </Card>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {fit.disqualifiers.length > 0 ? (
            <Card style={{ background: c.redBg, border: `1px solid ${c.redLine}` }}>
              <Label color={c.red}>🚫 Hard disqualifier — stop here</Label>
              {fit.disqualifiers.map((d) => (
                <div key={d.id} style={{ display: 'flex', gap: 9, marginBottom: 9 }}>
                  <span style={{ color: c.red, fontWeight: 900, fontSize: 15, flexShrink: 0, lineHeight: 1.2 }}>
                    ✕
                  </span>
                  <div>
                    <p style={{ fontSize: 13, color: c.text, margin: '0 0 2px', fontWeight: 700 }}>
                      {d.label}
                    </p>
                    <p style={{ fontSize: 12, color: c.muted, margin: 0, lineHeight: 1.5 }}>{d.evidence}</p>
                  </div>
                </div>
              ))}
            </Card>
          ) : (
            winZone && (
              <Card style={{ borderLeft: `4px solid ${playbook.color}` }}>
                <Label>Win zone</Label>
                <div style={{ display: 'flex', gap: 10 }}>
                  <span style={{ fontSize: 20, flexShrink: 0 }}>{winZone.icon}</span>
                  <div>
                    <p style={{ fontSize: 13.5, fontWeight: 800, color: c.navy, margin: '0 0 5px' }}>
                      {winZone.title}
                    </p>
                    <p style={{ fontSize: 12.5, color: c.muted, margin: '0 0 9px', lineHeight: 1.6 }}>
                      {winZone.body}
                    </p>
                    <div
                      style={{
                        background: tint(playbook.color, 0.07),
                        border: `1px solid ${tint(playbook.color, 0.2)}`,
                        borderRadius: radius.sm,
                        padding: '7px 11px',
                      }}
                    >
                      <p style={{ fontSize: 12, color: playbook.color, margin: 0, fontWeight: 700 }}>
                        🎯 Qualifier:{' '}
                        <span style={{ fontStyle: 'italic', fontWeight: 400 }}>{winZone.signal}</span>
                      </p>
                    </div>
                  </div>
                </div>
              </Card>
            )
          )}

          {fit.missing.length > 0 && !fit.disqualified && (
            <Card style={{ background: c.amberBg, border: `1px solid ${c.amberLine}` }}>
              <Label color={c.amber}>Close is missing {fit.missing.length} qualifying field
                {fit.missing.length > 1 ? 's' : ''}</Label>
              <p style={{ fontSize: 12.5, color: c.text, margin: '0 0 8px', lineHeight: 1.6 }}>
                These are scored neutral, not passing — the fit number is softer than it looks until you
                fill them in.
              </p>
              <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                {fit.missing.map((m) => (
                  <Chip key={m} color={c.amber}>
                    {m}
                  </Chip>
                ))}
              </div>
            </Card>
          )}

          <Card pad="14px 16px">
            <Label>Contacts in Close</Label>
            {shop.contacts.length === 0 && (
              <p style={{ fontSize: 12.5, color: c.muted, margin: 0 }}>No contacts on this lead.</p>
            )}
            {shop.contacts.map((ct) => (
              <div
                key={ct.id}
                style={{
                  display: 'flex',
                  gap: 9,
                  alignItems: 'center',
                  paddingBottom: 8,
                  marginBottom: 8,
                  borderBottom: `1px solid ${c.off}`,
                }}
              >
                <div
                  style={{
                    width: 26,
                    height: 26,
                    borderRadius: radius.sm,
                    background: c.off,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 11,
                    fontWeight: 800,
                    color: c.muted,
                    flexShrink: 0,
                  }}
                >
                  {ct.name.slice(0, 1)}
                </div>
                <div style={{ minWidth: 0 }}>
                  <p style={{ fontSize: 12.5, fontWeight: 700, color: c.navy, margin: 0 }}>{ct.name}</p>
                  <p style={{ fontSize: 11, color: c.muted, margin: 0 }}>
                    {[ct.title, ct.phones[0], ct.emails[0]].filter(Boolean).join(' · ')}
                  </p>
                </div>
              </div>
            ))}
            {shop.lastActivity && (
              <>
                <Label>Last activity</Label>
                <p style={{ fontSize: 12, color: c.muted, margin: 0, lineHeight: 1.6 }}>
                  {shop.lastActivity}
                  {shop.lastActivityDate ? ` (${shop.lastActivityDate})` : ''}
                </p>
              </>
            )}
          </Card>
        </div>
      </div>

      {/* ---------- Leak calculator ---------- */}
      <Card dark style={{ marginBottom: 14 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 20, flexWrap: 'wrap' }}>
          <div style={{ flex: '1 1 320px', minWidth: 280 }}>
            <p
              style={{
                fontSize: 10.5,
                fontWeight: 700,
                color: c.onDark,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                margin: '0 0 6px',
              }}
            >
              After-hours leak — {shop.name}
            </p>
            <p style={{ fontSize: 12.5, color: c.lavender, margin: '0 0 16px', lineHeight: 1.6, opacity: 0.8 }}>
              The Lead Leak Calculator from the channel playbook, wired to this lead instead of living as a
              gated lead magnet. Adjust it live on the call — every number the methodology quotes recalculates
              from here.
            </p>

            {(
              [
                { key: 'monthlyWebLeads' as const, label: 'Monthly web leads', min: 5, max: 250, step: 1, fmt: (v: number) => String(v) },
                { key: 'avgTicket' as const, label: 'Average ticket', min: 150, max: 2500, step: 10, fmt: (v: number) => money(v) },
                { key: 'afterHoursShare' as const, label: 'Share after hours', min: 0.05, max: 0.7, step: 0.01, fmt: (v: number) => `${Math.round(v * 100)}%` },
                { key: 'closeRate' as const, label: 'Lost to first responder', min: 0.05, max: 0.6, step: 0.01, fmt: (v: number) => `${Math.round(v * 100)}%` },
              ]
            ).map((f) => {
              const value = leak[f.key];
              const isOverridden = leakOverride[f.key] != null;
              return (
                <div key={f.key} style={{ marginBottom: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 5 }}>
                    <span style={{ fontSize: 11.5, color: c.lavender, fontWeight: 600 }}>{f.label}</span>
                    <span
                      style={{
                        marginLeft: 'auto',
                        fontSize: 12.5,
                        fontFamily: font.mono,
                        fontWeight: 700,
                        color: isOverridden ? c.onDark : c.white,
                      }}
                    >
                      {f.fmt(value)}
                    </span>
                  </div>
                  <input
                    type="range"
                    min={f.min}
                    max={f.max}
                    step={f.step}
                    value={value}
                    onChange={(e) =>
                      onLeakChange({ ...leakOverride, [f.key]: parseFloat(e.target.value) })
                    }
                    style={{ width: '100%', accentColor: c.accent, cursor: 'pointer' }}
                  />
                </div>
              );
            })}

            {Object.keys(leakOverride).length > 0 && (
              <Button variant="ghost" size="sm" onClick={() => onLeakChange({})} style={{ color: c.onDark, paddingLeft: 0 }}>
                ↺ Reset to Close data
              </Button>
            )}
          </div>

          <div style={{ flex: '0 1 240px' }}>
            <p
              style={{
                fontSize: 40,
                fontWeight: 800,
                color: c.onDark,
                margin: '0 0 2px',
                fontFamily: font.mono,
                letterSpacing: '-0.03em',
                lineHeight: 1,
              }}
            >
              {money(leak.monthlyLeak)}
            </p>
            <p style={{ fontSize: 11, color: c.lavender, margin: '0 0 14px', opacity: 0.75 }}>
              per month · {money(leak.annualLeak)} a year
            </p>
            <div style={{ borderTop: `1px solid ${c.darkBorder}`, paddingTop: 12 }}>
              <p style={{ fontSize: 12.5, color: c.white, margin: '0 0 5px', fontWeight: 700 }}>
                ≈ {leak.lostLeadsPerMonth.toFixed(1).replace(/\.0$/, '')} jobs a month
              </p>
              <p style={{ fontSize: 11.5, color: c.lavender, margin: 0, lineHeight: 1.6, opacity: 0.75 }}>
                reaching the site and never reaching the board.
                {shop.runningLsa ? ' They already paid the LSA cost on every one.' : ''}
              </p>
            </div>
            {(shop.monthlyWebLeads == null || shop.avgTicket == null) && (
              <p
                style={{
                  fontSize: 11,
                  color: c.onDark,
                  margin: '12px 0 0',
                  lineHeight: 1.55,
                  paddingTop: 10,
                  borderTop: `1px solid ${c.darkBorder}`,
                }}
              >
                ⚠ Working from playbook assumptions — Close has no{' '}
                {[shop.monthlyWebLeads == null ? 'lead volume' : null, shop.avgTicket == null ? 'average ticket' : null]
                  .filter(Boolean)
                  .join(' or ')}
                . Confirm on the call before quoting this figure.
              </p>
            )}
          </div>
        </div>
      </Card>

      {/* ---------- Methodology switcher ---------- */}
      <Divider />
      <SectionHead
        eyebrow="Methodology"
        title="Pick the framework, not just the script"
        sub="Each framework restructures the call, the question set, and the opening email — these are three different conversations with the same lead, not three phrasings of one."
        accent={playbook.color}
      />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 14 }}>
        {METHODOLOGY_IDS.map((id) => {
          const meta = METHODOLOGY_META[id];
          const active = methodology === id;
          const isRec = recommended.id === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => onMethodology(id)}
              style={{
                textAlign: 'left',
                padding: '14px 16px',
                borderRadius: radius.md,
                cursor: 'pointer',
                background: active ? tint(meta.color, 0.07) : c.surface,
                border: `2px solid ${active ? meta.color : c.border}`,
                transition: 'all 0.15s',
                position: 'relative',
              }}
            >
              {isRec && (
                <span
                  style={{
                    position: 'absolute',
                    top: -8,
                    right: 10,
                    fontSize: 9,
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    letterSpacing: '0.07em',
                    background: c.accent,
                    color: c.accentInk,
                    borderRadius: 3,
                    padding: '2px 6px',
                  }}
                >
                  Recommended
                </span>
              )}
              <p
                style={{
                  fontSize: 14,
                  fontWeight: 800,
                  color: active ? meta.color : c.navy,
                  margin: '0 0 3px',
                }}
              >
                {meta.name}
              </p>
              <p style={{ fontSize: 11.5, color: c.muted, margin: '0 0 8px', lineHeight: 1.5 }}>
                {meta.subtitle}
              </p>
              <p style={{ fontSize: 11, color: active ? meta.color : c.faint, margin: 0, fontWeight: 600 }}>
                {meta.shape}
              </p>
            </button>
          );
        })}
      </div>

      <Card style={{ borderLeft: `4px solid ${methodology === recommended.id ? c.accent : c.amber}`, marginBottom: 14 }}>
        <Label color={methodology === recommended.id ? c.accentInk : c.amber}>
          {methodology === recommended.id ? 'Why this framework for this lead' : 'You have overridden the recommendation'}
        </Label>
        <p style={{ fontSize: 13, color: c.text, margin: 0, lineHeight: 1.7 }}>
          {methodology === recommended.id
            ? recommended.reason
            : `Recommended was ${METHODOLOGY_META[recommended.id].name} — ${recommended.reason}`}
        </p>
      </Card>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
        <Card dark>
          <Label color={c.onDark}>North star for this call</Label>
          <p style={{ fontSize: 14, color: c.white, margin: '0 0 14px', lineHeight: 1.55, fontWeight: 600 }}>
            {playbook.northStar}
          </p>
          <Label color={c.onDark}>Best for</Label>
          <p style={{ fontSize: 12.5, color: c.lavender, margin: '0 0 12px', lineHeight: 1.6 }}>
            {playbook.bestFor}
          </p>
          <Label color="#FC8181">Failure mode</Label>
          <p style={{ fontSize: 12.5, color: c.lavender, margin: 0, lineHeight: 1.6 }}>
            {playbook.failureMode}
          </p>
        </Card>

        <Card>
          <Label>Stage path · {playbook.stages.length} stages</Label>
          {playbook.stages.map((s, i) => (
            <div key={s.id} style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
              <div
                style={{
                  width: 20,
                  height: 20,
                  borderRadius: '50%',
                  background: tint(playbook.color, 0.12),
                  color: playbook.color,
                  fontSize: 10,
                  fontWeight: 800,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  marginTop: 1,
                }}
              >
                {i + 1}
              </div>
              <div>
                <p style={{ fontSize: 12.5, fontWeight: 700, color: c.navy, margin: '0 0 2px' }}>
                  {s.label}
                  <span style={{ fontSize: 10.5, color: c.faint, fontWeight: 500, marginLeft: 7 }}>
                    {s.questions.length} question{s.questions.length === 1 ? '' : 's'}
                    {s.assertion ? ' + assertion' : ''}
                  </span>
                </p>
                <p style={{ fontSize: 11.5, color: c.muted, margin: 0, lineHeight: 1.5 }}>{s.intent}</p>
              </div>
            </div>
          ))}
          <Button
            variant="primary"
            onClick={onStartCall}
            style={{ width: '100%', marginTop: 6 }}
          >
            ▶ Run this call
          </Button>
        </Card>
      </div>

      {/* ---------- Generated assets ---------- */}
      <Divider />
      <SectionHead
        eyebrow="Generated for this lead"
        title="Opener, persona and talk track"
        sub="The email opener is rewritten in the selected methodology's voice with this shop's numbers already in it. The persona and talk track come from the playbook, matched to the segment the scorer resolved."
        accent={playbook.color}
      />

      <Card style={{ marginBottom: 14, borderTop: `3px solid ${playbook.color}` }}>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 12, flexWrap: 'wrap' }}>
          <Chip color={playbook.color}>{playbook.name} opener</Chip>
          <span style={{ fontSize: 12.5, fontWeight: 700, color: c.navy }}>
            Subject: <span style={{ color: playbook.color }}>{playbook.emailOpener.subject}</span>
          </span>
        </div>
        <CopyBox text={playbook.emailOpener.body} />
      </Card>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        <Card>
          <div style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
            <span style={{ fontSize: 26 }}>{persona.emoji}</span>
            <div>
              <p style={{ fontSize: 14, fontWeight: 800, color: c.navy, margin: '0 0 2px' }}>
                {persona.name}
              </p>
              <p style={{ fontSize: 11.5, color: c.muted, margin: 0 }}>{persona.role}</p>
            </div>
          </div>
          <p style={{ fontSize: 12.5, color: c.muted, margin: '0 0 12px', lineHeight: 1.6 }}>{persona.bio}</p>
          <Label>Their top pains</Label>
          {persona.pains.slice(0, 3).map((p) => (
            <div key={p} style={{ display: 'flex', gap: 7, marginBottom: 6 }}>
              <span style={{ color: c.red, fontSize: 12, flexShrink: 0 }}>▸</span>
              <p style={{ fontSize: 12, color: c.text, margin: 0, lineHeight: 1.5 }}>{p}</p>
            </div>
          ))}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 9, marginTop: 12 }}>
            <div style={{ background: c.greenBg, borderRadius: radius.sm, padding: '9px 11px' }}>
              <Label color={c.green}>✅ Say</Label>
              {persona.doSay.slice(0, 4).map((w) => (
                <span
                  key={w}
                  style={{
                    display: 'inline-block',
                    fontSize: 10.5,
                    background: c.white,
                    color: c.text,
                    borderRadius: 4,
                    padding: '2px 6px',
                    margin: '0 3px 3px 0',
                    fontWeight: 600,
                  }}
                >
                  {w}
                </span>
              ))}
            </div>
            <div style={{ background: c.redBg, borderRadius: radius.sm, padding: '9px 11px' }}>
              <Label color={c.red}>🚫 Avoid</Label>
              {persona.dontSay.map((w) => (
                <span
                  key={w}
                  style={{
                    display: 'inline-block',
                    fontSize: 10.5,
                    background: c.white,
                    color: c.red,
                    borderRadius: 4,
                    padding: '2px 6px',
                    margin: '0 3px 3px 0',
                    fontWeight: 600,
                  }}
                >
                  {w}
                </span>
              ))}
            </div>
          </div>
        </Card>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {track && (
            <Card style={{ borderTop: `3px solid ${track.color === 'sky' ? c.sky : c.spin}` }}>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 10 }}>
                <span style={{ fontSize: 18 }}>{track.icon}</span>
                <span style={{ fontSize: 13.5, fontWeight: 800, color: c.navy }}>{track.label}</span>
              </div>
              <p
                style={{
                  fontSize: 12,
                  color: c.muted,
                  margin: '0 0 11px',
                  lineHeight: 1.6,
                  fontStyle: 'italic',
                  background: c.off,
                  borderRadius: radius.sm,
                  padding: '8px 11px',
                }}
              >
                Context: {track.context}
              </p>
              <Label>Key framing rules</Label>
              {track.keyFrames.map((k) => (
                <div key={k} style={{ display: 'flex', gap: 7, marginBottom: 5 }}>
                  <span style={{ color: track.color === 'sky' ? c.sky : c.spin, fontWeight: 700, fontSize: 11.5 }}>
                    →
                  </span>
                  <p style={{ fontSize: 12, color: c.muted, margin: 0, lineHeight: 1.5 }}>{k}</p>
                </div>
              ))}
            </Card>
          )}

          <Card style={{ borderLeft: `4px solid ${c.amber}` }}>
            <Label color={c.amber}>
              {season.icon} Timing — {season.s} ({season.m})
            </Label>
            <p style={{ fontSize: 12.5, color: c.muted, margin: '0 0 10px', lineHeight: 1.6 }}>
              {season.context}
            </p>
            <div style={{ background: c.dark, borderRadius: radius.sm, padding: '10px 13px' }}>
              <p style={{ fontSize: 12.5, color: c.white, margin: 0, fontStyle: 'italic', lineHeight: 1.6 }}>
                "{season.angle}"
              </p>
            </div>
            <p style={{ fontSize: 11.5, color: c.faint, margin: '9px 0 0' }}>
              {weeksToNextPeak()} weeks to the next peak window.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}
