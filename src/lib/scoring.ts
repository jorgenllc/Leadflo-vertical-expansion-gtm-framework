/**
 * ICP scoring and the leak calculator.
 *
 * Two rules the original playbook is emphatic about, encoded here so the UI
 * cannot accidentally soften them:
 *
 *  1. Disqualifiers are hard stops, not negative weights. A ServiceTitan shop
 *     with otherwise perfect numbers is not a 72 — it is disqualified, and the
 *     rule of thumb is to disqualify immediately.
 *  2. Missing data is never treated as a passing grade. Where Close has no value
 *     we score the factor at a neutral 0.5, flag it `inferred`, and surface it in
 *     `missing` so the rep knows what to ask rather than trusting a number the
 *     data does not support.
 */

import type { DisqualifierHit, FitAssessment, FitFactor, LeakMath, Segment, Shop } from './types';

/* ------------------------------------------------------------------ *
 * Disqualifiers — hard stops
 * ------------------------------------------------------------------ */

function findDisqualifiers(shop: Shop): DisqualifierHit[] {
  const hits: DisqualifierHit[] = [];

  if (shop.techCount != null && shop.techCount >= 20) {
    hits.push({
      id: 'techs_20_plus',
      label: '20+ technicians',
      evidence: `Close has ${shop.techCount} techs — above the 15-tech ceiling and into ServiceTitan's target range.`,
    });
  }

  if (shop.fsmStack === 'servicetitan') {
    hits.push({
      id: 'on_servicetitan',
      label: 'Already on ServiceTitan',
      evidence:
        'Running ServiceTitan. Scheduling Pro is a natural upsell they have already been pitched — Leadflo enters as a redundant tool.',
    });
  }

  if (shop.vertical === 'other') {
    hits.push({
      id: 'commercial_b2b',
      label: 'Primarily commercial / B2B',
      evidence: 'Not tagged as residential HVAC or plumbing. The after-hours emergency dynamic does not apply.',
    });
  }

  if (!shop.url) {
    hits.push({
      id: 'no_website_or_low_traffic',
      label: 'No website',
      evidence: 'No site URL on the lead. With no website there is no intake layer to replace.',
    });
  } else if (shop.monthlyTraffic != null && shop.monthlyTraffic < 300) {
    hits.push({
      id: 'no_website_or_low_traffic',
      label: 'Under 300 monthly visitors',
      evidence: `${shop.monthlyTraffic.toLocaleString('en-US')} monthly visitors — too little traffic for web intake to move the needle.`,
    });
  }

  if (shop.techCount != null && shop.techCount <= 1) {
    hits.push({
      id: 'solo_operator',
      label: 'Solo operator — no support staff',
      evidence: `${shop.techCount} tech on record. A solo operator has no one to hand a qualified job to.`,
    });
  }

  if (shop.annualRevenue != null && shop.annualRevenue > 5_000_000) {
    hits.push({
      id: 'revenue_above_5m',
      label: 'Revenue above $5M',
      evidence: `$${(shop.annualRevenue / 1_000_000).toFixed(1)}M annual revenue — above the ICP ceiling.`,
    });
  }

  return hits;
}

/* ------------------------------------------------------------------ *
 * Segment
 * ------------------------------------------------------------------ */

function resolveSegment(shop: Shop, disqualified: boolean): Segment {
  if (disqualified) return 'disqualified';
  if (shop.fsmStack === 'housecallpro' || shop.fsmStack === 'jobber') return 'hcp_displacement';
  if (shop.fsmStack === 'none') return 'no_fsm_fear_anchor';
  return 'unknown';
}

export const SEGMENT_LABEL: Record<Segment, string> = {
  hcp_displacement: 'HCP Displacement',
  no_fsm_fear_anchor: 'No-FSM Fear Anchor',
  disqualified: 'Disqualified',
  unknown: 'Unsegmented',
};

/* ------------------------------------------------------------------ *
 * Fit factors
 * ------------------------------------------------------------------ */

function buildFactors(shop: Shop): FitFactor[] {
  const f: FitFactor[] = [];

  // Tech count — the sharpest single predictor in the ICP.
  if (shop.techCount == null) {
    f.push({
      label: 'Company size',
      weight: 0.28,
      score: 0.5,
      evidence: 'No tech count in Close. This is the first thing to confirm on the call.',
      inferred: true,
    });
  } else {
    const t = shop.techCount;
    const score = t >= 3 && t <= 15 ? 1 : t === 2 ? 0.55 : t > 15 && t < 20 ? 0.3 : 0.15;
    f.push({
      label: 'Company size',
      weight: 0.28,
      score,
      evidence:
        t >= 3 && t <= 15
          ? `${t} techs — dead center of the 3–15 target.`
          : t === 2
            ? `${t} techs — just under target. Workable if there is office staff.`
            : `${t} techs — outside the 3–15 target range.`,
      inferred: false,
    });
  }

  // FSM stack — determines which win zone and which talk track.
  if (shop.fsmStack == null || shop.fsmStack === 'other') {
    f.push({
      label: 'Current FSM platform',
      weight: 0.26,
      score: 0.5,
      evidence: 'Platform unknown. Segment cannot be confirmed until you ask.',
      inferred: true,
    });
  } else {
    const map: Record<string, { s: number; e: string }> = {
      housecallpro: { s: 1, e: 'On HousecallPro — the primary win zone. Their chat widget is the wedge.' },
      jobber: { s: 0.85, e: 'On Jobber — same profile as HCP, same after-hours gap.' },
      none: { s: 0.9, e: 'No FSM platform. Fear-anchor play; runs phones manually today.' },
      servicetitan: { s: 0, e: 'On ServiceTitan — hard disqualifier.' },
    };
    const m = map[shop.fsmStack];
    f.push({ label: 'Current FSM platform', weight: 0.26, score: m.s, evidence: m.e, inferred: false });
  }

  // Revenue band.
  if (shop.annualRevenue == null) {
    f.push({
      label: 'Annual revenue',
      weight: 0.16,
      score: 0.5,
      evidence: 'No revenue figure. Infer from tech count on the call rather than asking directly.',
      inferred: true,
    });
  } else {
    const r = shop.annualRevenue;
    const score = r >= 500_000 && r <= 3_000_000 ? 1 : r > 3_000_000 && r <= 5_000_000 ? 0.6 : r < 500_000 ? 0.35 : 0.1;
    f.push({
      label: 'Annual revenue',
      weight: 0.16,
      score,
      evidence: `$${(r / 1_000_000).toFixed(2)}M — ${
        r >= 500_000 && r <= 3_000_000
          ? 'inside the $500K–$3M band.'
          : r > 3_000_000
            ? 'above the core band; growth-stage aspirational anchor at best.'
            : 'below the band — may not have the volume to justify it.'
      }`,
      inferred: false,
    });
  }

  // Traffic / paid presence — is there demand to convert?
  const trafficKnown = shop.monthlyTraffic != null;
  if (!trafficKnown && shop.runningLsa == null) {
    f.push({
      label: 'Demand signal',
      weight: 0.16,
      score: 0.5,
      evidence: 'No traffic figure and no LSA flag. Check their LSA presence before dialing.',
      inferred: true,
    });
  } else {
    const t = shop.monthlyTraffic ?? 0;
    const lsa = shop.runningLsa === true;
    const score = lsa && t >= 500 ? 1 : lsa ? 0.85 : t >= 500 ? 0.7 : t > 0 ? 0.4 : 0.5;
    f.push({
      label: 'Demand signal',
      weight: 0.16,
      score,
      evidence: [
        trafficKnown ? `${t.toLocaleString('en-US')} monthly visitors` : 'traffic unknown',
        lsa ? 'running Google LSAs — already paying for the leads they lose' : shop.runningLsa === false ? 'not on LSAs' : 'LSA status unknown',
      ].join(' · '),
      inferred: !trafficKnown,
    });
  }

  // The pain signal itself — no AI intake on site.
  if (shop.hasSiteChat == null) {
    f.push({
      label: 'Pain signal (after-hours intake)',
      weight: 0.14,
      score: 0.5,
      evidence: 'Unknown whether the site has chat. Open their site before the call and look.',
      inferred: true,
    });
  } else {
    f.push({
      label: 'Pain signal (after-hours intake)',
      weight: 0.14,
      score: shop.hasSiteChat ? 0.55 : 1,
      evidence: shop.hasSiteChat
        ? 'Site has some chat widget — confirm whether it is the HCP bubble or a real AI tool.'
        : 'No chat on the site at all. The gap is total and demonstrable.',
      inferred: false,
    });
  }

  return f;
}

/* ------------------------------------------------------------------ *
 * Assessment
 * ------------------------------------------------------------------ */

export function assessFit(shop: Shop): FitAssessment {
  const disqualifiers = findDisqualifiers(shop);
  const disqualified = disqualifiers.length > 0;
  const factors = buildFactors(shop);
  const segment = resolveSegment(shop, disqualified);

  const totalWeight = factors.reduce((s, f) => s + f.weight, 0);
  const raw = factors.reduce((s, f) => s + f.weight * f.score, 0) / (totalWeight || 1);
  const score = Math.round(raw * 100);

  const missing = factors.filter((f) => f.inferred).map((f) => f.label);

  let band: FitAssessment['band'] = 'weak';
  if (disqualified) band = 'disqualified';
  else if (score >= 78) band = 'strong';
  else if (score >= 58) band = 'workable';

  let winZoneId: string | undefined;
  if (!disqualified) {
    if (segment === 'hcp_displacement') winZoneId = 'hcp';
    else if (segment === 'no_fsm_fear_anchor') winZoneId = 'nofsm';
    if (shop.annualRevenue != null && shop.annualRevenue >= 1_000_000 && shop.annualRevenue <= 3_000_000) {
      winZoneId = 'growth';
    }
  }

  let recommendation: string;
  if (disqualified) {
    recommendation =
      disqualifiers[0].id === 'on_servicetitan'
        ? 'Disqualify immediately. Do not pitch — Scheduling Pro already covers this and the comparison is unfavorable.'
        : `Do not pursue: ${disqualifiers[0].label.toLowerCase()}. Move on immediately.`;
  } else if (band === 'strong') {
    recommendation =
      segment === 'hcp_displacement'
        ? 'Prioritize. Textbook HCP displacement — open with the chat widget question.'
        : 'Prioritize. Fear-anchor play — open with what the bigger shops in their market run.';
  } else if (band === 'workable') {
    recommendation = missing.length
      ? `Workable, but ${missing.length} qualifying field${missing.length > 1 ? 's are' : ' is'} missing. Run a discovery call before committing sequence time.`
      : 'Workable. Sequence it, but keep it behind your strong-fit leads.';
  } else {
    recommendation = 'Weak fit. Do not spend sequence time until something in the profile changes.';
  }

  return { score, band, disqualified, disqualifiers, factors, segment, winZoneId, recommendation, missing };
}

/* ------------------------------------------------------------------ *
 * Leak math — the Lead Leak Calculator from the channel playbook,
 * wired into the methodology engine instead of living as a lead magnet.
 * ------------------------------------------------------------------ */

export const LEAK_DEFAULTS = {
  /** Conservative for an HVAC shop running LSAs, per the v1 sequence copy. */
  monthlyWebLeads: 40,
  /** Emergency trades skew after-hours; the playbook uses a third. */
  afterHoursShare: 0.33,
  avgTicket: 600,
  /** Share of after-hours leads lost to whoever responds first. */
  closeRate: 0.25,
};

export function computeLeak(
  shop: Shop,
  overrides: Partial<typeof LEAK_DEFAULTS> = {},
): LeakMath {
  const monthlyWebLeads = overrides.monthlyWebLeads ?? shop.monthlyWebLeads ?? LEAK_DEFAULTS.monthlyWebLeads;
  const avgTicket = overrides.avgTicket ?? shop.avgTicket ?? LEAK_DEFAULTS.avgTicket;
  const afterHoursShare = overrides.afterHoursShare ?? LEAK_DEFAULTS.afterHoursShare;
  const closeRate = overrides.closeRate ?? LEAK_DEFAULTS.closeRate;

  const lostLeadsPerMonth = monthlyWebLeads * afterHoursShare * closeRate;
  const monthlyLeak = lostLeadsPerMonth * avgTicket;

  return {
    monthlyWebLeads,
    afterHoursShare,
    avgTicket,
    closeRate,
    lostLeadsPerMonth,
    monthlyLeak,
    annualLeak: monthlyLeak * 12,
  };
}
