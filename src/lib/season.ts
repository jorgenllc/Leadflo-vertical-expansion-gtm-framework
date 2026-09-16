import { SEASONS, type Season } from '../data/playbook';

/** Which seasonal window we're in right now — drives timing callouts across the app. */
export function currentSeason(date = new Date()): Season {
  const m = date.getMonth();
  return SEASONS.find((s) => s.months.includes(m)) ?? SEASONS[0];
}

/** Weeks until the next peak season starts — used for the pre-peak urgency line. */
export function weeksToNextPeak(date = new Date()): number {
  const peakStarts = [5, 11]; // June (summer), December (winter)
  const y = date.getFullYear();
  const candidates = peakStarts
    .flatMap((m) => [new Date(y, m, 1), new Date(y + 1, m, 1)])
    .filter((d) => d.getTime() > date.getTime())
    .sort((a, b) => a.getTime() - b.getTime());
  const next = candidates[0];
  return Math.max(0, Math.round((next.getTime() - date.getTime()) / (1000 * 60 * 60 * 24 * 7)));
}
