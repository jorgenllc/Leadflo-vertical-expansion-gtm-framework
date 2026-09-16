/**
 * Reference views — the original playbook's eight tabs, rehoused in the
 * workspace shell. Content is untouched; what changed is that these are now
 * reference material sitting behind the working views rather than the whole app.
 */

import { useState } from 'react';
import { c, font, radius, tint } from '../theme';
import {
  AVOID_ST_SIGNALS,
  CALL_SCRIPT,
  CALL_WINDOW,
  CHANNELS,
  COMPETITORS,
  GTM_THESIS,
  HARD_DISQUALIFIERS,
  HCP_SEQUENCE,
  ICP_CRITERIA,
  ICP_HEADLINE,
  ICP_TILES,
  NOFSM_SEQUENCE,
  PARTNERS,
  PERSONAS,
  POSITIONING_LINE,
  QUALIFYING_QUESTIONS,
  RULE_OF_THUMB,
  SEASONS,
  TALK_TRACKS,
  WIN_ZONES,
} from '../data/playbook';
import { currentSeason } from '../lib/season';
import { Card, Chip, CopyBox, Divider, Label, SectionHead } from '../components/ui';

/** Map the palette keys used in the playbook data onto theme colors. */
const col = (k: string): string =>
  (
    ({
      sky: c.sky,
      violet: c.violet,
      green: c.green,
      amber: c.amber,
      red: c.red,
      dark: c.dark,
      muted: c.muted,
    }) as Record<string, string>
  )[k] ?? c.navy;

const threatColor = (t: string) => (t === 'High' ? c.red : t === 'Medium' ? c.amber : c.green);
const threatBg = (t: string) => (t === 'High' ? c.redBg : t === 'Medium' ? c.amberBg : c.greenBg);

/* ================================================================== *
 * ICP & Overview
 * ================================================================== */

export function IcpView() {
  return (
    <div style={{ animation: 'lf-fade 0.2s ease' }}>
      <SectionHead eyebrow={ICP_HEADLINE.eyebrow} title={ICP_HEADLINE.title} sub={ICP_HEADLINE.sub} />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10, marginBottom: 24 }}>
        {ICP_TILES.map(([v, l]) => (
          <Card key={v} dark style={{ textAlign: 'center' }} pad="16px 14px">
            <p
              style={{
                fontSize: 21,
                fontWeight: 900,
                color: c.accent,
                margin: '0 0 4px',
                letterSpacing: '-0.02em',
              }}
            >
              {v}
            </p>
            <p
              style={{
                fontSize: 10.5,
                color: c.lavender,
                margin: 0,
                opacity: 0.7,
                textTransform: 'uppercase',
                letterSpacing: '0.07em',
              }}
            >
              {l}
            </p>
          </Card>
        ))}
      </div>

      <Label color={c.navy}>Ideal Customer Profile — Full Definition</Label>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 24 }}>
        {ICP_CRITERIA.map((cr) => (
          <Card key={cr.label} style={{ borderTop: `3px solid ${c.navy}` }}>
            <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
              <span style={{ fontSize: 19 }}>{cr.icon}</span>
              <div>
                <p
                  style={{
                    fontSize: 10.5,
                    fontWeight: 700,
                    color: c.muted,
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    margin: '0 0 2px',
                  }}
                >
                  {cr.label}
                </p>
                <p style={{ fontSize: 13.5, fontWeight: 800, color: c.navy, margin: '0 0 4px' }}>{cr.value}</p>
                <p style={{ fontSize: 12, color: c.muted, margin: 0, lineHeight: 1.5 }}>{cr.sub}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
        <div>
          <Label color={c.red}>🚫 Hard Disqualifiers — Stop Here</Label>
          <Card style={{ background: c.redBg, border: `1px solid ${c.redLine}` }}>
            <p style={{ fontSize: 12.5, color: c.red, fontWeight: 700, margin: '0 0 12px' }}>
              If any of these are true, do not pursue. Move on immediately.
            </p>
            {HARD_DISQUALIFIERS.map((d) => (
              <div key={d} style={{ display: 'flex', gap: 10, marginBottom: 8 }}>
                <span style={{ color: c.red, fontWeight: 900, fontSize: 15, flexShrink: 0, lineHeight: 1.2 }}>
                  ✕
                </span>
                <p style={{ fontSize: 13, color: c.text, margin: 0, fontWeight: 600 }}>{d}</p>
              </div>
            ))}
          </Card>
        </div>
        <div>
          <Label color={c.navy}>Core GTM Thesis</Label>
          <Card dark style={{ marginBottom: 10 }}>
            <p style={{ color: c.lavender, fontSize: 13, lineHeight: 1.65, margin: 0 }}>{GTM_THESIS}</p>
          </Card>
          <Card style={{ background: c.greenBg, border: '1px solid #BBF7D0' }}>
            <p style={{ fontSize: 11.5, fontWeight: 700, color: c.green, margin: '0 0 6px' }}>
              The Positioning in One Line
            </p>
            <p style={{ fontSize: 13.5, color: c.text, fontStyle: 'italic', margin: 0, lineHeight: 1.6 }}>
              {POSITIONING_LINE}
            </p>
          </Card>
        </div>
      </div>

      <Label color={c.navy}>Three Win Zones — Where Leadflo Wins Cleanly</Label>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {WIN_ZONES.map((w) => (
          <Card key={w.id} style={{ borderLeft: `4px solid ${col(w.color)}` }}>
            <div style={{ display: 'flex', gap: 12 }}>
              <span style={{ fontSize: 21, flexShrink: 0 }}>{w.icon}</span>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 14, fontWeight: 800, color: c.navy, margin: '0 0 6px' }}>{w.title}</p>
                <p style={{ fontSize: 13, color: c.muted, margin: '0 0 10px', lineHeight: 1.6 }}>{w.body}</p>
                <div
                  style={{
                    background: tint(col(w.color), 0.07),
                    borderRadius: 7,
                    padding: '7px 12px',
                    display: 'inline-block',
                    border: `1px solid ${tint(col(w.color), 0.16)}`,
                  }}
                >
                  <p style={{ fontSize: 12, color: col(w.color), margin: 0, fontWeight: 700 }}>
                    🎯 Qualifier: <span style={{ fontStyle: 'italic', fontWeight: 400 }}>{w.signal}</span>
                  </p>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

/* ================================================================== *
 * Competitive Intel
 * ================================================================== */

export function CompetitiveView() {
  const [tab, setTab] = useState(0);
  return (
    <div style={{ animation: 'lf-fade 0.2s ease' }}>
      <SectionHead
        eyebrow="Competitive Intelligence"
        title="Know Exactly Who You're Up Against"
        sub="The competitive landscape is simple: HCP's chat is weak (your displacement target), ServiceTitan base is too expensive for your ICP, and Scheduling Pro is a real competitor you'll rarely face because it's locked inside a platform your prospects can't afford."
      />

      <Label color={c.navy}>Competitive Landscape</Label>
      <div style={{ border: `1px solid ${c.border}`, borderRadius: radius.lg, overflow: 'hidden', marginBottom: 24 }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1.8fr 2fr 2fr 2fr 1fr',
            background: c.dark,
            padding: '10px 16px',
            gap: 12,
          }}
        >
          {['Platform', 'Chat Capability', 'AI / Qualification', 'After-Hours', 'Threat Level'].map((h) => (
            <p
              key={h}
              style={{
                fontSize: 10.5,
                fontWeight: 700,
                color: c.lavender,
                margin: 0,
                textTransform: 'uppercase',
                letterSpacing: '0.07em',
                opacity: 0.7,
              }}
            >
              {h}
            </p>
          ))}
        </div>
        {COMPETITORS.map((cp, i) => (
          <div
            key={cp.name}
            style={{
              display: 'grid',
              gridTemplateColumns: '1.8fr 2fr 2fr 2fr 1fr',
              padding: '14px 16px',
              gap: 12,
              borderTop: i > 0 ? `1px solid ${c.border}` : 'none',
              alignItems: 'center',
              background: i % 2 === 0 ? c.white : c.off,
            }}
          >
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <span style={{ fontSize: 15 }}>{cp.icon}</span>
              <p style={{ fontSize: 12.5, fontWeight: 700, color: c.navy, margin: 0 }}>{cp.name}</p>
            </div>
            {[cp.chat, cp.ai, cp.afterHours].map((v, j) => (
              <p key={j} style={{ fontSize: 12, color: c.muted, margin: 0, lineHeight: 1.5 }}>
                {v}
              </p>
            ))}
            <span
              style={{
                fontSize: 11,
                fontWeight: 700,
                background: threatBg(cp.threat),
                color: threatColor(cp.threat),
                borderRadius: 6,
                padding: '4px 9px',
                textAlign: 'center',
              }}
            >
              {cp.threat}
            </span>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
        {COMPETITORS.map((cp) => (
          <Card key={cp.name} style={{ borderLeft: `4px solid ${threatColor(cp.threat)}` }}>
            <div style={{ display: 'flex', gap: 12 }}>
              <span style={{ fontSize: 19 }}>{cp.icon}</span>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 6 }}>
                  <p style={{ fontSize: 14, fontWeight: 800, color: c.navy, margin: 0 }}>{cp.name}</p>
                  <Chip color={threatColor(cp.threat)}>{cp.threat} Threat</Chip>
                </div>
                <p style={{ fontSize: 12.5, color: c.muted, margin: '0 0 8px', lineHeight: 1.6 }}>{cp.verdict}</p>
                <div style={{ background: c.off, borderRadius: 7, padding: '8px 12px' }}>
                  <p style={{ fontSize: 11.5, fontWeight: 700, color: c.navy, margin: '0 0 2px' }}>
                    Leadflo's Edge
                  </p>
                  <p style={{ fontSize: 12.5, color: c.muted, margin: 0, lineHeight: 1.5 }}>{cp.dispatchEdge}</p>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Divider />
      <Label color={c.red}>Why Leadflo Should Not Pursue ServiceTitan Shops</Label>
      <div style={{ display: 'flex', gap: 8, marginBottom: 14, flexWrap: 'wrap' }}>
        {AVOID_ST_SIGNALS.map((s, i) => (
          <button
            key={s.tag}
            type="button"
            onClick={() => setTab(i)}
            style={{
              padding: '7px 14px',
              borderRadius: radius.md,
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: 12.5,
              border: `2px solid ${tab === i ? c.red : c.border}`,
              background: tab === i ? c.redBg : c.white,
              color: tab === i ? c.red : c.navy,
            }}
          >
            {s.tag}
          </button>
        ))}
      </div>
      <Card style={{ borderLeft: `4px solid ${c.red}` }}>
        <p style={{ fontSize: 14, fontWeight: 800, color: c.navy, margin: '0 0 6px' }}>
          {AVOID_ST_SIGNALS[tab].title}
        </p>
        <p style={{ fontSize: 13, color: c.muted, margin: 0, lineHeight: 1.7 }}>{AVOID_ST_SIGNALS[tab].body}</p>
      </Card>

      <Card dark style={{ marginTop: 16 }}>
        <Label color={c.onDark}>The Rule of Thumb</Label>
        <p style={{ color: c.white, fontSize: 15, fontWeight: 700, margin: 0, lineHeight: 1.5 }}>
          {RULE_OF_THUMB}
        </p>
      </Card>
    </div>
  );
}

/* ================================================================== *
 * Channels
 * ================================================================== */

export function ChannelsView() {
  const [i, setI] = useState(0);
  const ch = CHANNELS[i];
  return (
    <div style={{ animation: 'lf-fade 0.2s ease' }}>
      <SectionHead
        eyebrow="Channel Strategy"
        title="Where to Show Up & How"
        sub="Six active channels, all calibrated to the 3–15 tech ICP. The key shift: every channel now has two modes — HCP shop displacement and no-FSM fear anchor."
      />

      <div style={{ display: 'flex', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
        {CHANNELS.map((x, j) => (
          <button
            key={x.name}
            type="button"
            onClick={() => setI(j)}
            style={{
              padding: '7px 13px',
              borderRadius: radius.md,
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: 12.5,
              border: `2px solid ${i === j ? col(x.color) : c.border}`,
              background: i === j ? col(x.color) : c.white,
              color: i === j ? c.white : c.navy,
            }}
          >
            {x.icon} {x.name}
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginBottom: 20 }}>
        {CHANNELS.map((x, j) => (
          <div
            key={x.name}
            title={`${x.name}: ${x.allocation}%`}
            onClick={() => setI(j)}
            style={{
              flex: x.allocation,
              height: 5,
              background: i === j ? col(x.color) : c.border,
              borderRadius: 4,
              cursor: 'pointer',
              transition: 'background 0.2s',
            }}
          />
        ))}
        <span style={{ fontSize: 11, color: c.muted, whiteSpace: 'nowrap' }}>effort allocation</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        <div>
          <Card style={{ marginBottom: 12 }}>
            <div style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
              <span style={{ fontSize: 21 }}>{ch.icon}</span>
              <div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 15, fontWeight: 800, color: c.navy }}>{ch.name}</span>
                  <Chip color={col(ch.color)}>{ch.priority}</Chip>
                  <span style={{ fontSize: 12, fontWeight: 700, color: c.navy, fontFamily: font.mono }}>
                    {ch.allocation}%
                  </span>
                </div>
                <p style={{ fontSize: 12, color: c.muted, margin: '2px 0 0' }}>⏰ {ch.timing}</p>
              </div>
            </div>
            <p style={{ color: c.muted, fontSize: 13, lineHeight: 1.65, margin: 0 }}>{ch.why}</p>
          </Card>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <Card style={{ background: c.greenBg, border: '1px solid #BBF7D0' }}>
              <Label color={c.green}>✅ Do</Label>
              {ch.dos.map((d) => (
                <p key={d} style={{ fontSize: 12, color: c.text, margin: '0 0 5px', lineHeight: 1.45 }}>
                  • {d}
                </p>
              ))}
            </Card>
            <Card style={{ background: c.redBg, border: `1px solid ${c.redLine}` }}>
              <Label color={c.red}>🚫 Don't</Label>
              {ch.donts.map((d) => (
                <p key={d} style={{ fontSize: 12, color: c.text, margin: '0 0 5px', lineHeight: 1.45 }}>
                  • {d}
                </p>
              ))}
            </Card>
          </div>
        </div>

        <Card style={{ background: c.off }}>
          <Label color={c.navy}>Tactics</Label>
          {ch.tactics.map((t) => (
            <div
              key={t.t}
              style={{
                background: c.white,
                border: `1px solid ${c.border}`,
                borderRadius: radius.md,
                padding: '12px 14px',
                marginBottom: 10,
              }}
            >
              <p style={{ fontWeight: 700, fontSize: 13, color: c.navy, margin: '0 0 4px' }}>{t.t}</p>
              <p style={{ fontSize: 12.5, color: c.muted, margin: 0, lineHeight: 1.6 }}>{t.d}</p>
            </div>
          ))}
        </Card>
      </div>
    </div>
  );
}

/* ================================================================== *
 * Personas
 * ================================================================== */

export function PersonasView() {
  const [i, setI] = useState(0);
  const p = PERSONAS[i];
  return (
    <div style={{ animation: 'lf-fade 0.2s ease' }}>
      <SectionHead
        eyebrow="Buyer Personas"
        title="Three Profiles, Two Conversations"
        sub="The ICP narrows to two distinct conversation modes: HCP displacement and no-FSM fear anchor. Know which mode you're in before you open your mouth."
      />

      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        {PERSONAS.map((x, j) => (
          <button
            key={x.id}
            type="button"
            onClick={() => setI(j)}
            style={{
              padding: '8px 16px',
              borderRadius: radius.md,
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: 13,
              border: `2px solid ${i === j ? c.navy : c.border}`,
              background: i === j ? c.accent : c.surface,
              color: i === j ? c.navy : c.text,
            }}
          >
            {x.emoji} {x.name.replace('The ', '')}
          </button>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <Card>
            <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
              <span style={{ fontSize: 30 }}>{p.emoji}</span>
              <div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 4 }}>
                  <span style={{ fontSize: 15, fontWeight: 800, color: c.navy }}>{p.name}</span>
                  <Chip color={col(p.priorityColor)}>{p.priority}</Chip>
                </div>
                <p style={{ margin: 0, fontSize: 12.5, color: c.muted }}>{p.role}</p>
                <div style={{ marginTop: 6, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {[p.revenue, p.team].map((t) => (
                    <span
                      key={t}
                      style={{
                        fontSize: 11.5,
                        background: c.off,
                        color: c.text,
                        padding: '2px 8px',
                        borderRadius: 5,
                        fontWeight: 600,
                      }}
                    >
                      {t}
                    </span>
                  ))}
                  <span
                    style={{
                      fontSize: 11.5,
                      background: tint(c.sky, 0.1),
                      color: c.sky,
                      padding: '2px 8px',
                      borderRadius: 5,
                      fontWeight: 600,
                    }}
                  >
                    {p.stack}
                  </span>
                </div>
              </div>
            </div>
            <p style={{ fontSize: 13, color: c.muted, lineHeight: 1.65, margin: 0 }}>{p.bio}</p>
          </Card>

          <Card>
            <Label color={c.navy}>🕐 Their Day</Label>
            {p.day.map((d, j) => (
              <div key={d} style={{ display: 'flex', gap: 10, marginBottom: 7 }}>
                <div
                  style={{
                    width: 18,
                    height: 18,
                    borderRadius: '50%',
                    background: c.off,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    marginTop: 2,
                  }}
                >
                  <span style={{ fontSize: 9, color: c.muted, fontWeight: 800 }}>{j + 1}</span>
                </div>
                <p style={{ fontSize: 12.5, color: c.muted, margin: 0, lineHeight: 1.5 }}>{d}</p>
              </div>
            ))}
          </Card>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <Card>
            <Label color={c.navy}>⚡ Top Pain Points</Label>
            {p.pains.map((x) => (
              <div key={x} style={{ display: 'flex', gap: 8, marginBottom: 7 }}>
                <span style={{ color: c.red, fontSize: 13, flexShrink: 0 }}>▸</span>
                <p style={{ fontSize: 12.5, color: c.text, margin: 0, lineHeight: 1.5 }}>{x}</p>
              </div>
            ))}
          </Card>

          <Card dark>
            <Label color={c.onDark}>🎯 Messaging Angle</Label>
            <p style={{ color: c.white, fontSize: 14, fontWeight: 700, lineHeight: 1.5, margin: '0 0 12px' }}>
              {p.angle}
            </p>
            <Label color={c.onDark}>Opening Hook</Label>
            <p style={{ color: c.lavender, fontSize: 13, fontStyle: 'italic', margin: '0 0 14px', lineHeight: 1.6 }}>
              "{p.hook}"
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div style={{ background: tint(c.greenLight, 0.1), borderRadius: radius.md, padding: '10px 12px' }}>
                <Label color={c.greenLight}>✅ Say</Label>
                {p.doSay.map((w) => (
                  <span
                    key={w}
                    style={{
                      display: 'inline-block',
                      fontSize: 10.5,
                      background: 'rgba(255,255,255,0.09)',
                      color: c.lavender,
                      borderRadius: 5,
                      padding: '2px 7px',
                      margin: '0 2px 3px 0',
                      fontWeight: 600,
                    }}
                  >
                    {w}
                  </span>
                ))}
              </div>
              <div style={{ background: tint(c.red, 0.1), borderRadius: radius.md, padding: '10px 12px' }}>
                <Label color="#FC8181">🚫 Avoid</Label>
                {p.dontSay.map((w) => (
                  <span
                    key={w}
                    style={{
                      display: 'inline-block',
                      fontSize: 10.5,
                      background: 'rgba(255,255,255,0.06)',
                      color: '#FC8181',
                      borderRadius: 5,
                      padding: '2px 7px',
                      margin: '0 2px 3px 0',
                      fontWeight: 600,
                    }}
                  >
                    {w}
                  </span>
                ))}
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

/* ================================================================== *
 * Seasonal
 * ================================================================== */

export function SeasonalView() {
  const now = currentSeason();
  return (
    <div style={{ animation: 'lf-fade 0.2s ease' }}>
      <SectionHead
        eyebrow="Seasonal Playbook"
        title="Timing the HCP Displacement Conversation"
        sub="The ICP shift to HCP shops means seasonal timing maps differently. Pre-peak is your highest-ROI outreach window — owners have time to fix the problem before it costs them."
      />
      {SEASONS.map((s) => {
        const active = s.s === now.s;
        return (
          <Card
            key={s.s}
            style={{
              marginBottom: 12,
              borderLeft: `4px solid ${col(s.color)}`,
              background: active ? tint(col(s.color), 0.04) : c.surface,
              border: active ? `1px solid ${tint(col(s.color), 0.3)}` : `1px solid ${c.border}`,
            }}
          >
            <div style={{ display: 'flex', gap: 14 }}>
              <span style={{ fontSize: 23, flexShrink: 0 }}>{s.icon}</span>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 6, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 14, fontWeight: 800, color: c.navy }}>{s.s}</span>
                  <span style={{ fontSize: 12, color: c.muted, fontWeight: 600 }}>{s.m}</span>
                  <Chip color={col(s.color)}>{s.urgency} Urgency</Chip>
                  {active && <Chip color={c.accentInk} bg={c.accent}>You are here</Chip>}
                </div>
                <p style={{ fontSize: 13, color: c.muted, margin: '0 0 10px', lineHeight: 1.6 }}>{s.context}</p>
                <div style={{ background: c.dark, borderRadius: radius.md, padding: '10px 14px' }}>
                  <Label color={col(s.color)}>Outreach Angle</Label>
                  <p style={{ color: c.white, fontSize: 13, margin: 0, fontStyle: 'italic', lineHeight: 1.6 }}>
                    "{s.angle}"
                  </p>
                </div>
              </div>
            </div>
          </Card>
        );
      })}
      <p style={{ fontSize: 12, color: c.faint, margin: '4px 0 0', fontStyle: 'italic' }}>
        Plumbing runs on the same framework — freeze events and holiday load replace the heat-wave spikes.
      </p>
    </div>
  );
}

/* ================================================================== *
 * Messaging & talk tracks
 * ================================================================== */

export function MessagingView() {
  return (
    <div style={{ animation: 'lf-fade 0.2s ease' }}>
      <SectionHead
        eyebrow="Messaging & Talk Tracks"
        title="Two Conversations. Zero Overlap."
        sub="Every prospect falls into one of two conversation modes. Know which mode before you open your mouth. Mixing the scripts is where deals fall apart."
      />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 28 }}>
        {TALK_TRACKS.map((t) => (
          <Card key={t.id} style={{ borderTop: `4px solid ${col(t.color)}` }}>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 10 }}>
              <span style={{ fontSize: 19 }}>{t.icon}</span>
              <span style={{ fontSize: 15, fontWeight: 800, color: c.navy }}>{t.label}</span>
              <Chip color={col(t.color)}>Confirmed</Chip>
            </div>
            <p
              style={{
                fontSize: 12.5,
                color: c.muted,
                margin: '0 0 14px',
                lineHeight: 1.6,
                fontStyle: 'italic',
                background: c.off,
                borderRadius: 7,
                padding: '8px 12px',
              }}
            >
              Context: {t.context}
            </p>
            <pre
              style={{
                fontSize: 13,
                background: c.dark,
                borderRadius: radius.md,
                padding: '14px 16px',
                margin: '0 0 14px',
                whiteSpace: 'pre-wrap',
                lineHeight: 1.8,
                fontFamily: font.sans,
                color: c.lavender,
              }}
            >
              {t.script}
            </pre>
            <Label color={col(t.color)}>Key Framing Rules</Label>
            {t.keyFrames.map((k) => (
              <div key={k} style={{ display: 'flex', gap: 8, marginBottom: 5 }}>
                <span style={{ color: col(t.color), fontWeight: 700, fontSize: 12, flexShrink: 0 }}>→</span>
                <p style={{ fontSize: 12.5, color: c.muted, margin: 0, lineHeight: 1.5 }}>{k}</p>
              </div>
            ))}
          </Card>
        ))}
      </div>

      <Divider />
      <Label color={c.navy}>Qualifying Questions — Run These Before Pitching</Label>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {QUALIFYING_QUESTIONS.map((q, i) => (
          <div
            key={q.q}
            style={{
              display: 'flex',
              gap: 14,
              alignItems: 'flex-start',
              background: c.white,
              border: `1px solid ${c.border}`,
              borderRadius: radius.lg,
              padding: '14px 16px',
            }}
          >
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: 8,
                background: tint(col(q.color), 0.1),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <span style={{ fontSize: 12, fontWeight: 900, color: col(q.color) }}>{i + 1}</span>
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 14, fontWeight: 700, color: c.navy, margin: '0 0 4px', fontStyle: 'italic' }}>
                "{q.q}"
              </p>
              <p style={{ fontSize: 12.5, color: c.muted, margin: 0, lineHeight: 1.5 }}>{q.action}</p>
            </div>
            <Chip color={col(q.color)}>{q.outcome}</Chip>
          </div>
        ))}
      </div>

      <Card dark style={{ marginTop: 16 }}>
        <Label color={c.onDark}>The Positioning In One Line — Use It Everywhere</Label>
        <p style={{ color: c.white, fontSize: 15, fontWeight: 700, margin: 0, lineHeight: 1.5 }}>
          {POSITIONING_LINE}
        </p>
      </Card>
    </div>
  );
}

/* ================================================================== *
 * Sequences
 * ================================================================== */

export function SequencesView() {
  const [seg, setSeg] = useState<'hcp' | 'nofsm'>('hcp');
  const [chan, setChan] = useState<'email' | 'call'>('email');
  const seq = seg === 'hcp' ? HCP_SEQUENCE : NOFSM_SEQUENCE;

  return (
    <div style={{ animation: 'lf-fade 0.2s ease' }}>
      <SectionHead
        eyebrow="Outreach Sequences"
        title="Two Sequences. Always Segmented."
        sub="Never send a generic sequence. Prospects are either HCP shops (displacement play) or no-FSM shops (fear anchor play). The talk track, subject lines, and framing are different for each."
      />

      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        {(
          [
            { id: 'hcp' as const, label: '🏠 HCP Displacement' },
            { id: 'nofsm' as const, label: '📵 No-FSM Fear Anchor' },
          ]
        ).map((o) => (
          <button
            key={o.id}
            type="button"
            onClick={() => setSeg(o.id)}
            style={{
              padding: '7px 14px',
              borderRadius: radius.md,
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: 12.5,
              border: `2px solid ${seg === o.id ? c.navy : c.border}`,
              background: seg === o.id ? c.accent : c.surface,
              color: seg === o.id ? c.navy : c.text,
            }}
          >
            {o.label}
          </button>
        ))}
        <div style={{ display: 'flex', gap: 6, marginLeft: 'auto' }}>
          {(
            [
              { id: 'email' as const, label: '📧 Email' },
              { id: 'call' as const, label: '📞 Call Script' },
            ]
          ).map((o) => (
            <button
              key={o.id}
              type="button"
              onClick={() => setChan(o.id)}
              style={{
                padding: '7px 14px',
                borderRadius: radius.md,
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: 12.5,
                border: `2px solid ${chan === o.id ? c.navy : c.border}`,
                background: chan === o.id ? c.navy : c.surface,
                color: chan === o.id ? c.white : c.text,
              }}
            >
              {o.label}
            </button>
          ))}
        </div>
      </div>

      {chan === 'email' ? (
        <>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
            {seq.map((t, i) => (
              <div key={t.touch} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ textAlign: 'center' }}>
                  <div
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: '50%',
                      background: col(t.color),
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <span style={{ fontSize: 11, fontWeight: 900, color: c.white }}>{i + 1}</span>
                  </div>
                  <p style={{ fontSize: 10, color: c.muted, margin: '3px 0 0', fontWeight: 600 }}>{t.day}</p>
                </div>
                {i < seq.length - 1 && <div style={{ width: 32, height: 2, background: c.border }} />}
              </div>
            ))}
          </div>
          {seq.map((t) => (
            <Card key={t.touch} style={{ marginBottom: 12, borderLeft: `4px solid ${col(t.color)}` }}>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 10, flexWrap: 'wrap' }}>
                <Chip color={col(t.color)}>{t.touch}</Chip>
                <span style={{ fontSize: 12, color: c.muted, fontWeight: 600 }}>{t.day}</span>
                <Chip color={col(t.color)}>{t.type}</Chip>
              </div>
              <p style={{ fontSize: 12.5, fontWeight: 700, color: c.navy, margin: '0 0 10px' }}>
                Subject: <span style={{ color: col(t.color) }}>{t.subject}</span>
              </p>
              <CopyBox text={t.body} />
            </Card>
          ))}
        </>
      ) : (
        <>
          <Card dark style={{ marginBottom: 16 }}>
            <Label color={c.onDark}>Call Windows</Label>
            <p style={{ color: c.white, fontSize: 14, fontWeight: 700, margin: '0 0 2px' }}>{CALL_WINDOW.window}</p>
            <p style={{ color: c.lavender, fontSize: 12.5, margin: 0, opacity: 0.75 }}>{CALL_WINDOW.note}</p>
          </Card>
          {CALL_SCRIPT.map((s) => (
            <Card key={s.step} style={{ marginBottom: 10, display: 'flex', gap: 14 }}>
              <div style={{ width: 90, flexShrink: 0 }}>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: c.navy,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}
                >
                  {s.step}
                </span>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ background: c.dark, borderRadius: radius.md, padding: '10px 14px', marginBottom: 8 }}>
                  <p style={{ color: c.white, fontSize: 13, margin: 0, lineHeight: 1.6, fontStyle: 'italic' }}>
                    "{s.content}"
                  </p>
                </div>
                <p style={{ fontSize: 12, color: c.muted, margin: 0, lineHeight: 1.5 }}>💡 {s.note}</p>
              </div>
            </Card>
          ))}
        </>
      )}
    </div>
  );
}

/* ================================================================== *
 * Partners
 * ================================================================== */

export function PartnersView() {
  const [i, setI] = useState(0);
  const p = PARTNERS[i];
  return (
    <div style={{ animation: 'lf-fade 0.2s ease' }}>
      <SectionHead
        eyebrow="Partner Strategy"
        title="Co-opetition, Co-sell & Borrowed Trust"
        sub="The HCP relationship is the most nuanced in this stack — Leadflo displaces their weakest feature while simultaneously partnering with them. Every other partner is pure complementary play."
      />

      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        {PARTNERS.map((x, j) => (
          <button
            key={x.name}
            type="button"
            onClick={() => setI(j)}
            style={{
              padding: '8px 16px',
              borderRadius: radius.md,
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: 12.5,
              border: `2px solid ${i === j ? col(x.color) : c.border}`,
              background: i === j ? col(x.color) : c.white,
              color: i === j ? c.white : c.navy,
            }}
          >
            {x.icon} {x.name}
          </button>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <Card style={{ borderTop: `4px solid ${col(p.color)}` }}>
            <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: 10 }}>
              <span style={{ fontSize: 23 }}>{p.icon}</span>
              <div>
                <div style={{ display: 'flex', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 15, fontWeight: 800, color: c.navy }}>{p.name}</span>
                  <Chip color={col(p.color)}>{p.tier}</Chip>
                </div>
                <p style={{ fontSize: 13, color: col(p.color), fontWeight: 700, margin: 0, fontStyle: 'italic' }}>
                  {p.headline}
                </p>
              </div>
            </div>
            <p style={{ fontSize: 13, color: c.muted, lineHeight: 1.65, margin: 0 }}>{p.why}</p>
          </Card>

          <Card
            style={{
              background: p.name === 'HousecallPro' ? '#FEF9C3' : c.greenBg,
              border: `1px solid ${p.name === 'HousecallPro' ? c.amberLine : '#BBF7D0'}`,
            }}
          >
            <Label color={p.name === 'HousecallPro' ? '#854D0E' : c.green}>⚠️ Partnership Tension Note</Label>
            <p style={{ fontSize: 12.5, color: c.text, margin: 0, lineHeight: 1.6 }}>{p.tension}</p>
          </Card>

          <Card dark>
            <Label color={c.onDark}>Pitch Angle</Label>
            <p style={{ color: c.lavender, fontSize: 13, fontStyle: 'italic', lineHeight: 1.6, margin: 0 }}>
              "{p.angle}"
            </p>
          </Card>
        </div>

        <Card style={{ background: c.off }}>
          <Label color={c.navy}>🤝 Partnership Structure</Label>
          {p.structure.map((s, j) => (
            <div
              key={s}
              style={{
                background: c.white,
                border: `1px solid ${c.border}`,
                borderRadius: radius.md,
                padding: '12px 14px',
                marginBottom: 10,
                display: 'flex',
                gap: 10,
              }}
            >
              <span
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: 6,
                  background: tint(col(p.color), 0.12),
                  color: col(p.color),
                  fontSize: 11,
                  fontWeight: 800,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                {j + 1}
              </span>
              <p style={{ fontSize: 13, color: c.text, margin: 0, lineHeight: 1.5 }}>{s}</p>
            </div>
          ))}
        </Card>
      </div>
    </div>
  );
}
