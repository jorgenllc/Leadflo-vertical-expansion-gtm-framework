/** Core domain types shared by the Close data layer, the scoring engine and the UI. */

/** Which field-service platform the shop runs today. Drives segment + win zone. */
export type FsmStack = 'housecallpro' | 'jobber' | 'none' | 'servicetitan' | 'other';

export type Vertical = 'hvac' | 'plumbing' | 'both' | 'other';

/**
 * The two conversation modes the original playbook is built around, plus a
 * disqualified state. Everything downstream — talk tracks, sequences, the
 * methodology's reframe asset — keys off this.
 */
export type Segment = 'hcp_displacement' | 'no_fsm_fear_anchor' | 'disqualified' | 'unknown';

export interface Contact {
  id: string;
  name: string;
  title?: string;
  emails: string[];
  phones: string[];
  /** Which persona this contact maps to, if we can tell from the title. */
  personaId?: string;
}

/**
 * A shop, normalized out of a Close lead.
 *
 * Close stores the qualifying facts (tech count, revenue band, FSM platform) in
 * lead custom fields, which are account-specific IDs. `lib/closeClient` resolves
 * them by NAME at runtime so this shape stays stable regardless of which Close
 * org the app is pointed at.
 */
export interface Shop {
  id: string;
  name: string;
  url?: string;
  description?: string;
  city?: string;
  state?: string;
  statusLabel?: string;
  /** Close's own lead status id, kept for write-back. */
  statusId?: string;
  contacts: Contact[];

  // Qualifying facts — any may be missing, which is itself signal.
  techCount?: number;
  annualRevenue?: number;
  monthlyTraffic?: number;
  fsmStack?: FsmStack;
  vertical?: Vertical;
  runningLsa?: boolean;
  hasSiteChat?: boolean;
  monthlyWebLeads?: number;
  avgTicket?: number;

  /** Free-text notes pulled from Close so a rep sees history in-workspace. */
  lastActivity?: string;
  lastActivityDate?: string;

  /** Present only in demo mode, so the UI can label fixtures honestly. */
  isFixture?: boolean;
}

export type DisqualifierId =
  | 'techs_20_plus'
  | 'on_servicetitan'
  | 'commercial_b2b'
  | 'no_website_or_low_traffic'
  | 'solo_operator'
  | 'revenue_above_5m';

export interface DisqualifierHit {
  id: DisqualifierId;
  label: string;
  /** Why this specific shop tripped it, with the actual number quoted. */
  evidence: string;
}

export interface FitFactor {
  label: string;
  /** -1 .. 1 — negative drags fit down, positive lifts it. */
  weight: number;
  /** 0 .. 1 — how well this shop scores on the factor. */
  score: number;
  evidence: string;
  /** True when we are guessing because Close has no value for it. */
  inferred: boolean;
}

export interface FitAssessment {
  /** 0–100. Only meaningful when `disqualified` is false. */
  score: number;
  band: 'strong' | 'workable' | 'weak' | 'disqualified';
  disqualified: boolean;
  disqualifiers: DisqualifierHit[];
  factors: FitFactor[];
  segment: Segment;
  /** Which of the three win zones this shop sits in, if any. */
  winZoneId?: string;
  /** What the rep should do about it, in one line. */
  recommendation: string;
  /** Fields Close is missing that would sharpen the score. */
  missing: string[];
}

export type MethodologyId = 'gap' | 'spin' | 'challenger';

/** One question a rep actually reads aloud, generated for this shop. */
export interface GeneratedQuestion {
  id: string;
  /** The question, with the shop's real facts already interpolated. */
  text: string;
  /** What the rep is listening for. */
  listenFor: string;
  /** How to handle the likely answer. */
  ifThen?: string;
  /** Marks a question that exists to surface a hard disqualifier. */
  isFilter?: boolean;
}

export interface MethodologyStage {
  id: string;
  label: string;
  /** One line on the job this stage does inside the framework. */
  intent: string;
  /** Coaching note — how this stage goes wrong. */
  coaching: string;
  questions: GeneratedQuestion[];
  /** Copy the rep can deliver verbatim at this stage, when the framework calls for it. */
  assertion?: string;
}

export interface MethodologyScoreDimension {
  id: string;
  label: string;
  /** What a 5/5 sounds like on a call. */
  anchor: string;
}

export interface MethodologyPlaybook {
  id: MethodologyId;
  name: string;
  subtitle: string;
  origin: string;
  color: string;
  /** When this framework is the right pick for this specific shop. */
  bestFor: string;
  /** How this framework fails when misapplied. */
  failureMode: string;
  stages: MethodologyStage[];
  dimensions: MethodologyScoreDimension[];
  /** Methodology-flavored rewrite of the opening email. */
  emailOpener: { subject: string; body: string };
  /** The one-line frame the rep holds in their head during the call. */
  northStar: string;
}

/** A rep's answers during a live call, keyed by question id. */
export type CallAnswers = Record<string, string>;

export interface LeakMath {
  monthlyWebLeads: number;
  afterHoursShare: number;
  avgTicket: number;
  closeRate: number;
  lostLeadsPerMonth: number;
  monthlyLeak: number;
  annualLeak: number;
}
