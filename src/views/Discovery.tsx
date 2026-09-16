import { useMemo, useState } from 'react';
import { c, font, radius, tint } from '../theme';
import type {
  CallAnswers,
  FitAssessment,
  LeakMath,
  MethodologyId,
  MethodologyPlaybook,
  Shop,
} from '../lib/types';
import type { LeadSource } from '../lib/closeClient';
import { SEGMENT_LABEL } from '../lib/scoring';
import { METHODOLOGY_IDS, METHODOLOGY_META } from '../data/methodologies';
import { Button, Card, Chip, CopyBox, Empty, Label, SectionHead } from '../components/ui';

const money = (n: number) => `$${Math.round(n).toLocaleString('en-US')}`;

export function Discovery({
  shop,
  fit,
  leak,
  playbook,
  recommended,
  answers,
  onAnswer,
  onMethodology,
  source,
}: {
  shop: Shop | null;
  fit: FitAssessment | null;
  leak: LeakMath | null;
  playbook: MethodologyPlaybook | null;
  recommended: { id: MethodologyId; reason: string } | null;
  answers: CallAnswers;
  onAnswer: (qid: string, value: string) => void;
  onMethodology: (id: MethodologyId) => void;
  source: LeadSource;
}) {
  const [stageIdx, setStageIdx] = useState(0);
  const [scores, setScores] = useState<Record<string, number>>({});
  const [outcome, setOutcome] = useState<string>('');
  const [logState, setLogState] = useState<{ status: 'idle' | 'sending' | 'done' | 'error'; message?: string }>({
    status: 'idle',
  });

  // Every hook must run on every render, including the no-lead render — a hook
  // placed after the early return below changes the hook count when the selected
  // lead becomes null (switching data source, for instance) and React unmounts
  // the whole tree. Hence the null-tolerant memo.
  const callNote = useMemo(
    () =>
      shop && fit && leak && playbook
        ? buildCallNote({ shop, fit, leak, playbook, answers, scores, outcome })
        : '',
    [shop, fit, leak, playbook, answers, scores, outcome],
  );

  if (!shop || !fit || !leak || !playbook || !recommended) {
    return (
      <Empty
        icon="▶"
        title="No call to run"
        body="Select a lead first. The discovery runner generates its question path from that lead's facts, so it needs one loaded."
      />
    );
  }

  const stage = playbook.stages[Math.min(stageIdx, playbook.stages.length - 1)];
  const answeredCount = playbook.stages
    .flatMap((s) => s.questions)
    .filter((q) => (answers[q.id] ?? '').trim().length > 0).length;
  const totalQuestions = playbook.stages.flatMap((s) => s.questions).length;

  const logToClose = async () => {
    setLogState({ status: 'sending' });
    const res = await source.logNote(shop.id, callNote);
    setLogState({
      status: res.ok ? 'done' : 'error',
      message: res.message,
    });
  };

  return (
    <div style={{ animation: 'lf-fade 0.2s ease' }}>
      <SectionHead
        eyebrow={`Discovery call · ${playbook.name}`}
        title={`Running ${playbook.name} on ${shop.name}`}
        sub={playbook.northStar}
        accent={playbook.color}
      />

      {/* Switch framework mid-call — the whole point of the tool */}
      <div style={{ display: 'flex', gap: 7, marginBottom: 16, alignItems: 'center', flexWrap: 'wrap' }}>
        <span style={{ fontSize: 11, color: c.muted, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em' }}>
          Switch framework
        </span>
        {METHODOLOGY_IDS.map((id) => {
          const meta = METHODOLOGY_META[id];
          const active = playbook.id === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => {
                onMethodology(id);
                setStageIdx(0);
              }}
              style={{
                padding: '5px 11px',
                borderRadius: radius.md,
                fontSize: 11.5,
                fontWeight: 700,
                cursor: 'pointer',
                border: `1.5px solid ${active ? meta.color : c.border}`,
                background: active ? meta.color : c.surface,
                color: active ? c.white : c.text,
              }}
            >
              {meta.name}
            </button>
          );
        })}
        <span style={{ marginLeft: 'auto', fontSize: 11.5, color: c.muted, fontFamily: font.mono }}>
          {answeredCount}/{totalQuestions} captured
        </span>
      </div>

      {/* Stage stepper */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 18, flexWrap: 'wrap' }}>
        {playbook.stages.map((s, i) => {
          const active = i === stageIdx;
          const done = s.questions.every((q) => (answers[q.id] ?? '').trim().length > 0);
          return (
            <button
              key={s.id}
              type="button"
              onClick={() => setStageIdx(i)}
              style={{
                flex: '1 1 120px',
                padding: '9px 10px',
                borderRadius: radius.sm,
                cursor: 'pointer',
                textAlign: 'left',
                border: 'none',
                borderTop: `3px solid ${active ? playbook.color : done ? c.green : c.border}`,
                background: active ? tint(playbook.color, 0.07) : c.surface,
                transition: 'all 0.15s',
              }}
            >
              <p
                style={{
                  fontSize: 9.5,
                  fontWeight: 700,
                  color: c.faint,
                  margin: '0 0 2px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.07em',
                }}
              >
                {String(i + 1).padStart(2, '0')} {done ? '✓' : ''}
              </p>
              <p
                style={{
                  fontSize: 11.5,
                  fontWeight: active ? 800 : 600,
                  color: active ? playbook.color : c.navy,
                  margin: 0,
                  lineHeight: 1.3,
                }}
              >
                {s.label}
              </p>
            </button>
          );
        })}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,2fr) minmax(0,1fr)', gap: 14 }}>
        {/* ---------- Stage body ---------- */}
        <div>
          <Card style={{ borderLeft: `4px solid ${playbook.color}`, marginBottom: 12 }}>
            <p style={{ fontSize: 15, fontWeight: 800, color: c.navy, margin: '0 0 5px' }}>{stage.label}</p>
            <p style={{ fontSize: 12.5, color: c.muted, margin: '0 0 10px', lineHeight: 1.6 }}>{stage.intent}</p>
            <div
              style={{
                background: c.amberBg,
                border: `1px solid ${c.amberLine}`,
                borderRadius: radius.sm,
                padding: '8px 12px',
              }}
            >
              <p style={{ fontSize: 12, color: '#854D0E', margin: 0, lineHeight: 1.6 }}>
                <strong>Coaching:</strong> {stage.coaching}
              </p>
            </div>
          </Card>

          {stage.assertion && (
            <Card dark style={{ marginBottom: 12 }}>
              <Label color={c.onDark}>Deliver this — then stop talking</Label>
              <p style={{ fontSize: 13.5, color: c.white, margin: 0, lineHeight: 1.75 }}>{stage.assertion}</p>
            </Card>
          )}

          {stage.questions.map((q, i) => {
            const value = answers[q.id] ?? '';
            return (
              <Card
                key={q.id}
                style={{
                  marginBottom: 10,
                  borderLeft: q.isFilter ? `4px solid ${c.red}` : undefined,
                }}
              >
                <div style={{ display: 'flex', gap: 10 }}>
                  <div
                    style={{
                      width: 22,
                      height: 22,
                      borderRadius: radius.sm,
                      background: q.isFilter ? c.redBg : tint(playbook.color, 0.1),
                      color: q.isFilter ? c.red : playbook.color,
                      fontSize: 10.5,
                      fontWeight: 800,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      marginTop: 2,
                    }}
                  >
                    {i + 1}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    {q.isFilter && (
                      <Chip color={c.red} style={{ marginBottom: 6 }}>
                        Filter — run before pitching
                      </Chip>
                    )}
                    <p
                      style={{
                        fontSize: 14,
                        fontWeight: 700,
                        color: c.navy,
                        margin: '0 0 7px',
                        lineHeight: 1.55,
                        fontStyle: 'italic',
                      }}
                    >
                      "{q.text}"
                    </p>
                    <p style={{ fontSize: 11.5, color: c.muted, margin: '0 0 4px', lineHeight: 1.55 }}>
                      <strong style={{ color: c.text }}>Listen for:</strong> {q.listenFor}
                    </p>
                    {q.ifThen && (
                      <p style={{ fontSize: 11.5, color: c.muted, margin: '0 0 9px', lineHeight: 1.55 }}>
                        <strong style={{ color: c.text }}>Then:</strong> {q.ifThen}
                      </p>
                    )}
                    <textarea
                      value={value}
                      onChange={(e) => onAnswer(q.id, e.target.value)}
                      placeholder="Type what they said…"
                      rows={2}
                      style={{
                        width: '100%',
                        padding: '8px 10px',
                        fontSize: 12.5,
                        fontFamily: font.sans,
                        lineHeight: 1.6,
                        border: `1px solid ${value ? tint(playbook.color, 0.4) : c.border}`,
                        borderRadius: radius.sm,
                        background: value ? tint(playbook.color, 0.04) : c.off,
                        color: c.text,
                        resize: 'vertical',
                        outline: 'none',
                      }}
                    />
                  </div>
                </div>
              </Card>
            );
          })}

          <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
            <Button
              onClick={() => setStageIdx((i) => Math.max(0, i - 1))}
              disabled={stageIdx === 0}
            >
              ← Previous
            </Button>
            <Button
              variant="primary"
              onClick={() => setStageIdx((i) => Math.min(playbook.stages.length - 1, i + 1))}
              disabled={stageIdx >= playbook.stages.length - 1}
            >
              Next stage →
            </Button>
          </div>
        </div>

        {/* ---------- Right column: scoring + note ---------- */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <Card pad="14px 16px">
            <Label>Lead at a glance</Label>
            <p style={{ fontSize: 12.5, color: c.text, margin: '0 0 6px', lineHeight: 1.6 }}>
              <strong>{shop.name}</strong>
              {shop.city ? ` · ${shop.city}` : ''}
            </p>
            <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginBottom: 10 }}>
              <Chip color={fit.disqualified ? c.red : c.green}>
                {fit.disqualified ? 'Disqualified' : `Fit ${fit.score}`}
              </Chip>
              <Chip color={c.sky}>{SEGMENT_LABEL[fit.segment]}</Chip>
            </div>
            <p style={{ fontSize: 11.5, color: c.muted, margin: 0, lineHeight: 1.6, fontFamily: font.mono }}>
              {shop.techCount ?? '?'} techs · {shop.fsmStack ?? 'stack ?'}
              <br />
              {money(leak.monthlyLeak)}/mo leak
            </p>
            {fit.disqualified && (
              <div
                style={{
                  marginTop: 10,
                  background: c.redBg,
                  border: `1px solid ${c.redLine}`,
                  borderRadius: radius.sm,
                  padding: '8px 11px',
                }}
              >
                <p style={{ fontSize: 11.5, color: c.red, margin: 0, fontWeight: 700, lineHeight: 1.5 }}>
                  {fit.recommendation}
                </p>
              </div>
            )}
          </Card>

          <Card pad="14px 16px">
            <Label>Call quality — {playbook.name}</Label>
            <p style={{ fontSize: 11.5, color: c.muted, margin: '0 0 12px', lineHeight: 1.55 }}>
              Score yourself against this framework's own criteria, not a generic call scorecard.
            </p>
            {playbook.dimensions.map((d) => (
              <div key={d.id} style={{ marginBottom: 12 }}>
                <p style={{ fontSize: 12, fontWeight: 700, color: c.navy, margin: '0 0 3px' }}>{d.label}</p>
                <p style={{ fontSize: 11, color: c.muted, margin: '0 0 6px', lineHeight: 1.5 }}>{d.anchor}</p>
                <div style={{ display: 'flex', gap: 3 }}>
                  {[1, 2, 3, 4, 5].map((n) => {
                    const on = (scores[d.id] ?? 0) >= n;
                    return (
                      <button
                        key={n}
                        type="button"
                        onClick={() => setScores((p) => ({ ...p, [d.id]: p[d.id] === n ? 0 : n }))}
                        style={{
                          flex: 1,
                          height: 20,
                          borderRadius: 3,
                          cursor: 'pointer',
                          border: `1px solid ${on ? playbook.color : c.border}`,
                          background: on ? playbook.color : c.surface,
                          fontSize: 9.5,
                          fontWeight: 800,
                          color: on ? c.white : c.faint,
                        }}
                      >
                        {n}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </Card>

          <Card pad="14px 16px">
            <Label>Outcome</Label>
            {['Meeting booked', 'Callback scheduled', 'Not now — nurture', 'Disqualified on call', 'No answer'].map(
              (o) => (
                <button
                  key={o}
                  type="button"
                  onClick={() => setOutcome(outcome === o ? '' : o)}
                  style={{
                    display: 'block',
                    width: '100%',
                    textAlign: 'left',
                    padding: '7px 10px',
                    marginBottom: 4,
                    fontSize: 12,
                    fontWeight: 600,
                    borderRadius: radius.sm,
                    cursor: 'pointer',
                    border: `1px solid ${outcome === o ? c.navy : c.border}`,
                    background: outcome === o ? c.navy : c.surface,
                    color: outcome === o ? c.white : c.text,
                  }}
                >
                  {o}
                </button>
              ),
            )}
          </Card>
        </div>
      </div>

      {/* ---------- Call note + write-back ---------- */}
      <div style={{ marginTop: 22 }}>
        <SectionHead
          eyebrow="Write-back"
          title="Call note, structured by the framework you ran"
          sub="The note follows the methodology's own stages, so a teammate reading it in Close can see which framework was used and where the call actually got to."
          accent={playbook.color}
        />
        <CopyBox text={callNote} mono />
        <div style={{ display: 'flex', gap: 9, alignItems: 'center', marginTop: 12, flexWrap: 'wrap' }}>
          <Button
            variant="dark"
            onClick={logToClose}
            disabled={logState.status === 'sending' || answeredCount === 0}
            title={answeredCount === 0 ? 'Capture at least one answer first' : undefined}
          >
            {logState.status === 'sending'
              ? 'Logging…'
              : source.mode === 'live'
                ? '⤴ Log note to Close'
                : '⤴ Log note (demo)'}
          </Button>
          {logState.status === 'done' && (
            <span style={{ fontSize: 12, color: c.green, fontWeight: 700 }}>
              ✓ {logState.message ?? 'Logged.'}
            </span>
          )}
          {logState.status === 'error' && (
            <span style={{ fontSize: 12, color: c.red, fontWeight: 700 }}>✕ {logState.message}</span>
          )}
          {source.mode === 'demo' && logState.status === 'idle' && (
            <span style={{ fontSize: 11.5, color: c.muted }}>
              Demo mode — this writes nowhere. Switch the data source to Live to post it as a Close activity.
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * Call note generation
 * ------------------------------------------------------------------ */

function buildCallNote({
  shop,
  fit,
  leak,
  playbook,
  answers,
  scores,
  outcome,
}: {
  shop: Shop;
  fit: FitAssessment;
  leak: LeakMath;
  playbook: MethodologyPlaybook;
  answers: CallAnswers;
  scores: Record<string, number>;
  outcome: string;
}): string {
  const lines: string[] = [];
  const date = new Date().toISOString().slice(0, 10);

  lines.push(`DISCOVERY CALL — ${playbook.name}`);
  lines.push(`${shop.name}${shop.city ? ` · ${shop.city}, ${shop.state ?? ''}`.trimEnd() : ''} · ${date}`);
  lines.push('');
  lines.push(
    `Segment: ${SEGMENT_LABEL[fit.segment]} | ICP fit: ${fit.disqualified ? 'DISQUALIFIED' : `${fit.score}/100 (${fit.band})`}`,
  );
  if (fit.disqualifiers.length) {
    lines.push(`Disqualifiers: ${fit.disqualifiers.map((d) => d.label).join('; ')}`);
  }
  lines.push(
    `After-hours leak used on call: ${money(leak.monthlyLeak)}/mo (${money(leak.annualLeak)}/yr) — ${leak.monthlyWebLeads} leads/mo, ${money(leak.avgTicket)} ticket, ${Math.round(leak.afterHoursShare * 100)}% after hours, ${Math.round(leak.closeRate * 100)}% lost to first responder.`,
  );
  lines.push('');

  for (const stage of playbook.stages) {
    const captured = stage.questions.filter((q) => (answers[q.id] ?? '').trim());
    if (!captured.length) continue;
    lines.push(`── ${stage.label.toUpperCase()} ──`);
    for (const q of captured) {
      lines.push(`Q: ${q.text}`);
      lines.push(`A: ${answers[q.id].trim()}`);
      lines.push('');
    }
  }

  const scored = playbook.dimensions.filter((d) => (scores[d.id] ?? 0) > 0);
  if (scored.length) {
    lines.push('── CALL QUALITY (self-scored, 1–5) ──');
    for (const d of scored) lines.push(`${d.label}: ${scores[d.id]}/5`);
    const avg = scored.reduce((s, d) => s + scores[d.id], 0) / scored.length;
    lines.push(`Average: ${avg.toFixed(1)}/5`);
    lines.push('');
  }

  if (outcome) {
    lines.push(`OUTCOME: ${outcome}`);
    lines.push('');
  }

  lines.push(`Framework north star: ${playbook.northStar}`);
  lines.push('— Logged from the Leadflo sales-enablement workspace.');

  return lines.join('\n');
}
