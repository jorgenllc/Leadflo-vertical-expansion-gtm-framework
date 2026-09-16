import type { CSSProperties, ReactNode } from 'react';
import { c, font, radius, tint } from '../theme';

export const Card = ({
  children,
  style,
  dark = false,
  pad = '18px 20px',
}: {
  children: ReactNode;
  style?: CSSProperties;
  dark?: boolean;
  pad?: string;
}) => (
  <div
    style={{
      background: dark ? c.dark : c.surface,
      border: `1px solid ${dark ? 'transparent' : c.border}`,
      borderRadius: radius.md,
      padding: pad,
      ...style,
    }}
  >
    {children}
  </div>
);

export const Chip = ({
  children,
  color = c.text,
  bg,
  style,
}: {
  children: ReactNode;
  color?: string;
  bg?: string;
  style?: CSSProperties;
}) => (
  <span
    style={{
      display: 'inline-block',
      padding: '2px 8px',
      borderRadius: radius.sm,
      fontSize: 10.5,
      fontWeight: 600,
      letterSpacing: '0.06em',
      textTransform: 'uppercase',
      background: bg ?? (color === c.text ? c.off : tint(color, 0.09)),
      color: color === c.text ? c.text : color,
      border: `1px solid ${color === c.text ? c.border : tint(color, 0.22)}`,
      whiteSpace: 'nowrap',
      ...style,
    }}
  >
    {children}
  </span>
);

export const SectionHead = ({
  eyebrow,
  title,
  sub,
  accent = c.accent,
}: {
  eyebrow: string;
  title: string;
  sub?: string;
  accent?: string;
}) => (
  <div style={{ marginBottom: 24 }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
      <div style={{ width: 3, height: 14, background: accent, borderRadius: 2, flexShrink: 0 }} />
      <span
        style={{
          fontSize: 10.5,
          fontWeight: 600,
          color: c.muted,
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
        }}
      >
        {eyebrow}
      </span>
    </div>
    <h2
      style={{
        fontFamily: font.serif,
        fontSize: 26,
        fontWeight: 400,
        color: c.navy,
        margin: '0 0 8px',
        letterSpacing: '-0.01em',
        lineHeight: 1.2,
      }}
    >
      {title}
    </h2>
    {sub && (
      <p style={{ color: c.muted, fontSize: 14, lineHeight: 1.65, maxWidth: 640, margin: 0 }}>{sub}</p>
    )}
  </div>
);

export const Divider = ({ style }: { style?: CSSProperties }) => (
  <div style={{ borderTop: `1px solid ${c.border}`, margin: '22px 0', ...style }} />
);

export const Label = ({ children, color = c.muted }: { children: ReactNode; color?: string }) => (
  <p
    style={{
      fontSize: 10.5,
      fontWeight: 700,
      color,
      textTransform: 'uppercase',
      letterSpacing: '0.08em',
      margin: '0 0 10px',
    }}
  >
    {children}
  </p>
);

export const Button = ({
  children,
  onClick,
  variant = 'default',
  size = 'md',
  disabled,
  style,
  title,
}: {
  children: ReactNode;
  onClick?: () => void;
  variant?: 'default' | 'primary' | 'dark' | 'ghost' | 'danger';
  size?: 'sm' | 'md';
  disabled?: boolean;
  style?: CSSProperties;
  title?: string;
}) => {
  const palette: Record<string, CSSProperties> = {
    default: { background: c.surface, color: c.text, border: `1px solid ${c.borderStrong}` },
    primary: { background: c.accent, color: c.accentInk, border: `1px solid ${c.accent}` },
    dark: { background: c.dark, color: c.white, border: `1px solid ${c.dark}` },
    ghost: { background: 'transparent', color: c.muted, border: '1px solid transparent' },
    danger: { background: c.redBg, color: c.red, border: `1px solid ${c.redLine}` },
  };
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      style={{
        padding: size === 'sm' ? '5px 11px' : '8px 15px',
        borderRadius: radius.md,
        fontSize: size === 'sm' ? 12 : 12.5,
        fontWeight: 600,
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.45 : 1,
        transition: 'all 0.14s',
        ...palette[variant],
        ...style,
      }}
    >
      {children}
    </button>
  );
};

/** Copy-to-clipboard wrapper for anything a rep needs to paste into an email tool. */
export const CopyBox = ({
  text,
  label,
  mono = false,
}: {
  text: string;
  label?: string;
  mono?: boolean;
}) => {
  const copy = () => {
    void navigator.clipboard?.writeText(text);
  };
  return (
    <div style={{ position: 'relative' }}>
      {label && <Label>{label}</Label>}
      <pre
        style={{
          fontSize: 13,
          background: c.off,
          border: `1px solid ${c.border}`,
          borderRadius: radius.md,
          padding: '14px 16px',
          margin: 0,
          whiteSpace: 'pre-wrap',
          lineHeight: 1.7,
          fontFamily: mono ? font.mono : font.sans,
          color: c.text,
        }}
      >
        {text}
      </pre>
      <button
        type="button"
        onClick={copy}
        style={{
          position: 'absolute',
          top: label ? 26 : 8,
          right: 8,
          padding: '3px 9px',
          fontSize: 10.5,
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
          borderRadius: radius.sm,
          border: `1px solid ${c.borderStrong}`,
          background: c.surface,
          color: c.muted,
          cursor: 'pointer',
        }}
      >
        Copy
      </button>
    </div>
  );
};

/** Score ring — 0–100 fit, or a struck-through state when disqualified. */
export const ScoreRing = ({
  score,
  disqualified,
  size = 56,
  color = c.green,
}: {
  score: number;
  disqualified?: boolean;
  size?: number;
  color?: string;
}) => {
  const stroke = 5;
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const pct = disqualified ? 1 : Math.max(0, Math.min(100, score)) / 100;
  const ringColor = disqualified ? c.red : color;

  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={c.border} strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={ringColor}
          strokeWidth={stroke}
          strokeDasharray={circ}
          strokeDashoffset={circ * (1 - pct)}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.4s ease, stroke 0.2s' }}
        />
      </svg>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
        }}
      >
        {disqualified ? (
          <span style={{ fontSize: 17, fontWeight: 900, color: c.red, lineHeight: 1 }}>DQ</span>
        ) : (
          <span
            style={{
              fontSize: size > 48 ? 18 : 14,
              fontWeight: 800,
              color: c.navy,
              fontFamily: font.mono,
              lineHeight: 1,
            }}
          >
            {score}
          </span>
        )}
      </div>
    </div>
  );
};

export const Stat = ({
  value,
  label,
  color = c.navy,
  mono = true,
}: {
  value: string;
  label: string;
  color?: string;
  mono?: boolean;
}) => (
  <div>
    <p
      style={{
        fontSize: 19,
        fontWeight: 800,
        color,
        margin: '0 0 2px',
        letterSpacing: '-0.02em',
        fontFamily: mono ? font.mono : font.sans,
      }}
    >
      {value}
    </p>
    <p
      style={{
        fontSize: 10,
        color: c.muted,
        margin: 0,
        textTransform: 'uppercase',
        letterSpacing: '0.07em',
        fontWeight: 600,
      }}
    >
      {label}
    </p>
  </div>
);

export const Empty = ({ icon, title, body }: { icon: string; title: string; body: string }) => (
  <div style={{ textAlign: 'center', padding: '60px 24px', maxWidth: 420, margin: '0 auto' }}>
    <div style={{ fontSize: 32, marginBottom: 12, opacity: 0.6 }}>{icon}</div>
    <p style={{ fontSize: 15, fontWeight: 700, color: c.navy, margin: '0 0 6px' }}>{title}</p>
    <p style={{ fontSize: 13, color: c.muted, margin: 0, lineHeight: 1.65 }}>{body}</p>
  </div>
);
