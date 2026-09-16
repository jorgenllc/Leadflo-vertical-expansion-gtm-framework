/**
 * Design tokens.
 *
 * Carried forward from the original Leadflo playbook so the rebuild reads as an
 * evolution of the same product rather than a different app: warm off-white
 * canvas, near-black ink, acid-yellow accent, and the DM Serif Display / Inter
 * pairing. What changes is the register — the playbook was a document, this is a
 * workspace, so the chrome is denser, the rail is dark, and numbers are set in a
 * monospace face so they stay column-aligned while a rep reads down a list.
 */
export const c = {
  // Surfaces
  bg: '#F9F8F6',
  surface: '#FFFFFF',
  off: '#F2F0EE',
  sunken: '#EDEAE6',
  border: '#E2DFDC',
  borderStrong: '#D3CEC9',

  // Ink
  text: '#0D0D0D',
  navy: '#0D0D0D',
  muted: '#67635F',
  faint: '#98938E',

  // Dark chrome (left rail, inverted cards)
  dark: '#1A1A18',
  darker: '#121211',
  darkBorder: '#2E2E2B',
  onDark: '#EBF212',
  lavender: '#F2F0EE',

  // Accent
  accent: '#EBF212',
  accentInk: '#4A4C00',

  // Methodology identity colors — each methodology owns one hue so the whole
  // workspace visibly re-tints when a rep switches frameworks.
  gap: '#3B82F6',
  spin: '#8B5CF6',
  challenger: '#EA580C',

  // Semantic
  green: '#16A34A',
  greenBg: '#DCFCE7',
  greenLight: '#22C55E',
  amber: '#92400E',
  amberBg: '#FEF3C7',
  amberLine: '#FDE047',
  red: '#DC2626',
  redBg: '#FEE2E2',
  redLine: '#FECACA',
  sky: '#3B82F6',
  violet: '#0D0D0D',
  softPurple: '#C1B7FF',
  softBlue: '#C5DDFF',
  softYellow: '#F4FB6E',
  white: '#FFFFFF',
} as const;

export const font = {
  sans: "'Inter', 'Helvetica Neue', sans-serif",
  serif: "'DM Serif Display', Georgia, serif",
  mono: "'JetBrains Mono', ui-monospace, 'SF Mono', Menlo, monospace",
} as const;

export const radius = { sm: 5, md: 8, lg: 12 } as const;

/** Tint helper — hex + alpha as a two-digit hex suffix. */
export const tint = (hex: string, alpha: number) => {
  const a = Math.round(Math.min(Math.max(alpha, 0), 1) * 255)
    .toString(16)
    .padStart(2, '0');
  return `${hex}${a}`;
};
