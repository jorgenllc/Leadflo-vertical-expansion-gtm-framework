/**
 * Reference content migrated verbatim from the original Leadflo playbook.
 *
 * Nothing in here is paraphrased. The ICP definition, disqualifiers, competitor
 * verdicts, personas, talk tracks, sequences, seasonal angles and partner notes
 * are the strings from the v1 site, because they are the hand-authored asset the
 * rebuild exists to operationalize. The methodology engine in
 * `data/methodologies.ts` reads from these structures rather than restating them.
 */

export const ICP_HEADLINE = {
  eyebrow: 'ICP & Market Opportunity',
  title: "Who Leadflo Is (and Isn't) Built For",
  sub: 'This ICP is deliberately narrow. Tighter targeting means sharper messaging, faster qualification, and higher conversion. The disqualifiers are as important as the fit criteria.',
};

export const ICP_TILES: [string, string][] = [
  ['HVAC + Plumbing', 'Primary verticals'],
  ['3–15 Techs', 'Target company size'],
  ['$500K–$3M', 'Annual revenue range'],
  ['HCP / None', 'Current FSM platform'],
];

export interface IcpCriterion {
  label: string;
  value: string;
  sub: string;
  icon: string;
}

export const ICP_CRITERIA: IcpCriterion[] = [
  {
    label: 'Company Size',
    value: '3–15 field techs',
    sub: '1–3 office staff, or owner running phones themselves',
    icon: '👷',
  },
  {
    label: 'Annual Revenue',
    value: '$500K–$3M',
    sub: 'Below the threshold where ServiceTitan ROI makes sense',
    icon: '💵',
  },
  {
    label: 'Website Traffic',
    value: '500–2,000+ mo. visitors',
    sub: 'Active on Google LSAs or running paid search',
    icon: '📊',
  },
  {
    label: 'Current Tech Stack',
    value: 'HCP, Jobber, or None',
    sub: 'No dedicated AI intake or chat tool in use',
    icon: '⚙️',
  },
  {
    label: 'Lead Profile',
    value: 'Primarily residential',
    sub: 'Emergency calls, seasonal spikes, evenings & weekends are peak windows',
    icon: '🏠',
  },
  {
    label: 'Pain Signal',
    value: 'Missing after-hours leads',
    sub: "No chat on site, or using HCP's basic chat bubble with no AI or qualification",
    icon: '🚨',
  },
];

export const HARD_DISQUALIFIERS: string[] = [
  '20+ technicians',
  'Already on ServiceTitan',
  'Primarily commercial / B2B',
  'No website or under 300 monthly visitors',
  'Solo operator — no support staff',
  'Revenue above $5M',
];

export const GTM_THESIS =
  "Leadflo targets the gap below ServiceTitan's floor — owner-operated HVAC and plumbing shops paying for leads but losing them after hours because their chat tool has no AI, no qualification logic, and goes dark at 5pm. These shops can't justify ST's enterprise price tag but need enterprise-grade intake capability.";

export const POSITIONING_LINE = '"ServiceTitan capability. None of the $50K implementation."';

export interface WinZone {
  id: string;
  icon: string;
  title: string;
  color: 'sky' | 'violet' | 'green';
  body: string;
  signal: string;
}

export const WIN_ZONES: WinZone[] = [
  {
    id: 'hcp',
    icon: '🏆',
    title: 'HCP User Base — Primary Win Zone',
    color: 'sky',
    body: "HCP's built-in chat is universally panned by actual users — no AI, no qualification logic, shuts off after hours and reverts to a contact form. HCP serves exactly the 3–15 tech profile that is Leadflo's ICP. These shops are already frustrated with their chat tool and have not committed to an enterprise stack.",
    signal: "Ask: 'Are you using the chat widget that comes with HousecallPro?'",
  },
  {
    id: 'nofsm',
    icon: '📵',
    title: 'No FSM Platform — Fear Anchor Play',
    color: 'violet',
    body: "Owner-operators still running phones themselves, using Google Calendar or paper dispatch. They've never heard of Scheduling Pro. Leadflo is the AI upgrade that costs a fraction of the full ServiceTitan stack — positioned as a bridge, not a downgrade.",
    signal: "Ask: 'What's your process for web leads that come in after hours?'",
  },
  {
    id: 'growth',
    icon: '📈',
    title: 'Growth-Stage Shops ($1M–$3M) — Aspirational Anchor',
    color: 'green',
    body: "ServiceTitan is aspirational for these shops but cost-prohibitive at $245–$500+/tech/month plus $5–50K implementation. Leadflo delivers the AI intake capability now, without locking them into an enterprise platform. Bridge play: 'Same capability, none of the complexity.'",
    signal: "Ask: 'Have you looked at ServiceTitan? What stopped you?'",
  },
];

/* ------------------------------------------------------------------ *
 * Competitive intel
 * ------------------------------------------------------------------ */

export interface Competitor {
  name: string;
  icon: string;
  chat: string;
  ai: string;
  afterHours: string;
  threat: 'Low' | 'Medium' | 'High';
  verdict: string;
  dispatchEdge: string;
}

export const COMPETITORS: Competitor[] = [
  {
    name: 'HousecallPro',
    icon: '🏠',
    chat: 'Basic chat bubble — in-house built',
    ai: 'None. No logic, no qualification',
    afterHours: 'Reverts to contact form',
    threat: 'Low',
    verdict:
      "Weak product. Customers are frustrated with it. This is Leadflo's primary displacement target within the HCP customer base.",
    dispatchEdge:
      'AI qualification, 24/7 coverage, video-enabled engagement, dispatch-ready lead routing. Not even a close comparison.',
  },
  {
    name: 'ServiceTitan (Base)',
    icon: '🔧',
    chat: 'Web Scheduler + Chat to Text widget',
    ai: 'Minimal. Basic form only',
    afterHours: 'Limited without add-ons',
    threat: 'Medium',
    verdict:
      "Targets larger shops (20+ techs). Too expensive and complex for Leadflo's 3–15 tech ICP. Rarely a head-to-head competitor at this market segment.",
    dispatchEdge:
      'Price, simplicity, no $50K implementation. Leadflo is positioned as the accessible alternative for shops that aspire to ST but can\'t justify the cost.',
  },
  {
    name: 'ServiceTitan Scheduling Pro',
    icon: '⚡',
    chat: 'Conditional workflow, decision tree, job info capture, brand customization',
    ai: 'Conditional logic, 1–2 qualifying questions, dispatch-ready',
    afterHours: '24/7 via Schedule Engine (human agents)',
    threat: 'High',
    verdict:
      "Real competitor IF targeting the same ICP. Has conditional workflows, qualification logic, 24/7 human agents, and full ST dispatch integration. However — it's locked inside ST, which self-selects Leadflo's ICP out.",
    dispatchEdge:
      "ST Scheduling Pro only exists inside the ST platform. Leadflo's ICP can't afford ST. Shops that have Scheduling Pro have already disqualified themselves.",
  },
];

export interface AvoidStSignal {
  title: string;
  body: string;
  tag: string;
}

export const AVOID_ST_SIGNALS: AvoidStSignal[] = [
  {
    title: 'Cost & Complexity Mismatch',
    body: "ServiceTitan shops are paying $245–$500+/tech/month on the base platform alone, plus $5K–$50K in implementation fees. These are sophisticated, enterprise-minded operators with dedicated IT and office staff. Scheduling Pro is a natural upsell they've already been pitched — Leadflo enters as a redundant tool, not a solution.",
    tag: 'Cost Signal',
  },
  {
    title: 'Scheduling Pro Is a Real Competitor in This Segment',
    body: "Unlike HCP's chat bubble (called 'an utter waste of time' by actual users), Scheduling Pro features conditional workflows, job qualification logic, 24/7 human-agent live chat via Schedule Engine, and full ServiceTitan dispatch integration. Competing head-to-head here means going up against a well-funded, deeply integrated product within a locked-in platform.",
    tag: 'Product Signal',
  },
  {
    title: "ServiceTitan Self-Selects These Shops Out of Leadflo's Range",
    body: "ServiceTitan has publicly stated its platform is 'not optimized for companies with 3 or fewer technicians' and is best suited for 20+ tech operations. The shops that can afford and fully leverage Scheduling Pro are already above Leadflo's ICP ceiling. Pursuing them means longer sales cycles, higher churn risk, and direct feature comparison against a better-resourced incumbent.",
    tag: 'ICP Signal',
  },
];

export const RULE_OF_THUMB =
  "If they're on ServiceTitan — disqualify immediately. If they're on HCP, Jobber, or nothing — that's your market. Every prospecting decision flows from this filter.";

/* ------------------------------------------------------------------ *
 * Channels
 * ------------------------------------------------------------------ */

export interface Channel {
  icon: string;
  name: string;
  priority: string;
  color: 'green' | 'amber';
  allocation: number;
  why: string;
  timing: string;
  dos: string[];
  donts: string[];
  tactics: { t: string; d: string }[];
}

export const CHANNELS: Channel[] = [
  {
    icon: '📞',
    name: 'Cold Calling',
    priority: 'Tier 1',
    color: 'green',
    allocation: 30,
    why: "These owners answer the phone — it's their business. Best for HCP-shop displacement. Sharp opener + trade language converts faster than any digital channel.",
    timing: 'Tue–Thu · 7:30–9:30am & 4:30–6:00pm local time',
    dos: [
      'Ask for owner by first name',
      'Lead with HCP chat question for HCP shops',
      'Lead with fear anchor for no-FSM shops',
      'Under 30 seconds to the ask',
    ],
    donts: [
      'Pitch to the CSR or office manager first',
      "Use the word 'platform' or 'solution'",
      'Call Monday morning or Friday afternoon',
      'Mention ServiceTitan unless they bring it up',
    ],
    tactics: [
      {
        t: 'HCP Shop Opener',
        d: "'Hey [Name], quick question — are you using the chat widget that comes with HousecallPro?' [Pause] 'Yeah, we hear that a lot. The issue is it shuts off after hours and there's no AI — so if someone hits your site at 9pm with a dead furnace, they're just gone.'",
      },
      {
        t: 'No-FSM Fear Anchor',
        d: "'The bigger HVAC shops in your market are running AI intake tools that capture and qualify every website lead 24/7 — even at 2am when the AC dies. If your site doesn't have that, you're handing those leads to competitors who do.'",
      },
      {
        t: 'Qualification on the Call',
        d: "Two questions to qualify fast: (1) 'Are you on ServiceTitan?' [if yes, disengage politely] (2) 'About how many techs are you running?' [if 20+, disengage]. Don't invest time before running these filters.",
      },
    ],
  },
  {
    icon: '📧',
    name: 'Cold Email',
    priority: 'Tier 1',
    color: 'green',
    allocation: 25,
    why: 'Highest-leverage async channel. Two distinct sequences: HCP displacement sequence and no-FSM fear anchor sequence. Never send a generic sequence — segment first.',
    timing: 'Send Tue–Thu · 7:00–9:00am recipient time',
    dos: [
      'Segment before sending — HCP vs. no-FSM',
      'Personalize to their LSA presence or review count',
      'Subject lines under 7 words',
      'Plain text only — looks more human',
    ],
    donts: [
      'Send the same sequence to all prospects',
      'Lead with product features in the opener',
      'Use HTML email templates',
      'Reference ServiceTitan as a competitor they should fear',
    ],
    tactics: [
      {
        t: 'HCP Displacement Sequence',
        d: "Open with the chat widget question. Frame as fixing their existing setup, not replacing HCP. 'You keep everything in HCP — we just replace the part that's broken.' 4 touches over 14 days.",
      },
      {
        t: 'No-FSM Fear Anchor Sequence',
        d: "Open with: 'The bigger shops in your market are running AI intake 24/7.' Make the competitive gap feel real and immediate. No-FSM shops respond to the fear of being left behind by better-equipped competitors.",
      },
      {
        t: 'LSA + Review Signal Personalization',
        d: "Scrape LSA rankings. Mention their market position. 'You're running LSAs in [City] — do you know what your web response looks like at 10pm tonight?' Let their own investment create the urgency.",
      },
    ],
  },
  {
    icon: '📘',
    name: 'Organic Social (Facebook)',
    priority: 'Tier 1',
    color: 'green',
    allocation: 20,
    why: 'The highest-leverage free channel for this ICP. HCP and Jobber users are active in trade Facebook Groups and regularly complain about their tools. These organic conversations are the best prospecting intelligence available.',
    timing: 'Post 6–9am or 7–9pm — when owners are off the tools',
    dos: [
      'Monitor HCP and Jobber complaint threads — these are warm leads',
      'Post value before promoting anything',
      'Engage on HCP chat complaints specifically',
      'Share stats that make the after-hours problem feel real',
    ],
    donts: [
      'Drop promo links in groups without context',
      'Talk about ServiceTitan as a competitor',
      'Post corporate-sounding content',
    ],
    tactics: [
      {
        t: 'Monitor HCP Complaint Threads',
        d: "Search Facebook Groups for posts about HCP's chat widget. Any contractor complaining about it is a warm prospect. Engage with empathy first: 'We hear this a lot — what's been the biggest issue for you?' DM after establishing rapport.",
      },
      {
        t: 'Groups to Join & Monitor',
        d: 'HVAC Business Owners & Managers, HousecallPro Users Community, Plumbing Business Owners Network, Contractor Profit & Growth, Jobber Users Group. These communities have organic pain-point conversations daily.',
      },
      {
        t: 'Value Post That Works',
        d: "'Quick question for HVAC shop owners on HousecallPro — what do you do with web leads that come in after your office closes? Trying to understand how different shops handle the after-hours gap.' Listen. Never pitch in the thread.",
      },
    ],
  },
  {
    icon: '📸',
    name: 'Organic Social (Instagram)',
    priority: 'Tier 2',
    color: 'amber',
    allocation: 10,
    why: 'Supporting channel for brand building and retargeting. Trade owners follow competitors and vendors here. Content should make the HCP chat gap feel relatable.',
    timing: '3x/week · Reels outperform static by 4:1 for this audience',
    dos: [
      "Show the Leadflo widget vs. HCP's basic chat",
      'Before/after: what HCP chat does at 9pm vs. what Leadflo does',
      'Trade-specific hashtags',
      'Story polls that surface the pain',
    ],
    donts: ['Generic SaaS marketing visuals', 'Mention ServiceTitan', 'Post without relevance to home services'],
    tactics: [
      {
        t: 'HCP Chat Comparison Reel',
        d: "15-second Reel: 'What happens when someone hits your site at 9pm with no AC. If you're on HCP's chat → [contact form screenshot]. With Leadflo → [real-time video engagement + dispatch in 90s].' Show the contrast.",
      },
      {
        t: 'Story Poll for Prospecting',
        d: "'HousecallPro users: what happens to your web leads after hours? A) They get handled B) They hit a form and wait C) Not sure.' The responses are warm prospect signals.",
      },
    ],
  },
  {
    icon: '✍️',
    name: 'Inbound / Content',
    priority: 'Tier 2',
    color: 'amber',
    allocation: 8,
    why: 'Long-play authority builder. Key focus: content that ranks for terms HCP and Jobber users search when frustrated with their chat tool.',
    timing: '1–2 pieces per month, repurposed across all channels',
    dos: [
      "Target search terms like 'HousecallPro chat not working after hours'",
      'Build the Lead Leak Calculator as a gated tool',
      'Write for HVAC/plumbing owners, not general audiences',
    ],
    donts: [
      "Generic SaaS content that doesn't mention the ICP's specific tools",
      'Content that positions against ServiceTitan',
    ],
    tactics: [
      {
        t: 'Lead Leak Calculator',
        d: "Interactive tool: 'How much revenue is your website leaking after hours?' Inputs: monthly web leads, after-hours %, avg ticket. Output: monthly and annual revenue at risk. Gate with email. Distribute via Facebook Groups and outbound.",
      },
      {
        t: 'HCP Chat Frustration Content',
        d: "Article: 'Why HousecallPro's chat widget fails your HVAC business after hours (and what to do about it).' SEO play targeting frustrated HCP users actively searching for alternatives.",
      },
    ],
  },
  {
    icon: '🏛️',
    name: 'Trade Shows & Events',
    priority: 'Tier 2',
    color: 'amber',
    allocation: 7,
    why: 'High-trust, in-person channel. The HCP user base shows up at Service World and ACCA. Attending these events as a partner to HCP — not a competitor — is the right frame.',
    timing: 'Plan 6–8 weeks in advance. Pre-book meetings before arriving.',
    dos: [
      "Frame as the 'missing piece' for HCP shops",
      'Pre-book meetings with prospects before the show',
      'Attend HCP user sessions to understand pain firsthand',
    ],
    donts: [
      'Position against ServiceTitan in conversations',
      "Exhibit before you've attended as a visitor",
      'Rely on walk-up booth traffic alone',
    ],
    tactics: [
      {
        t: 'Key Events',
        d: 'Service World Expo (fall — ServiceTitan/HCP ecosystem), ACCA Conference (spring — HVAC owners), PHCCExpo (fall — plumbing owners), EGIA Contractor University events.',
      },
      {
        t: 'Pre-Show Outreach',
        d: "Email prospects 3 weeks out: 'I'll be at Service World — worth 15 minutes to show you what we're building for HCP shops? We replace the after-hours gap without disrupting anything else you use in HCP.'",
      },
    ],
  },
];

/* ------------------------------------------------------------------ *
 * Personas
 * ------------------------------------------------------------------ */

export interface Persona {
  id: string;
  emoji: string;
  name: string;
  role: string;
  priority: string;
  priorityColor: 'green' | 'amber';
  revenue: string;
  team: string;
  stack: string;
  bio: string;
  day: string[];
  pains: string[];
  angle: string;
  hook: string;
  doSay: string[];
  dontSay: string[];
  /** Which segment this persona belongs to — used to pick talk tracks per lead. */
  segment: 'hcp_displacement' | 'no_fsm_fear_anchor' | 'either';
}

export const PERSONAS: Persona[] = [
  {
    id: 'hcp_owner',
    emoji: '🔨',
    name: 'The HCP Owner-Operator',
    role: 'Owner / Founder on HousecallPro',
    priority: 'Primary Target',
    priorityColor: 'green',
    revenue: '$500K–$2M',
    team: '3–10 techs',
    stack: 'HousecallPro',
    segment: 'hcp_displacement',
    bio: "Bought into HCP for job management — it works well for dispatch and invoicing. But the chat widget is useless and they know it. They're losing after-hours leads and have no good solution in front of them. Leadflo is the fix they didn't know existed.",
    day: [
      '6:30am — Checks HCP dispatch board before coffee',
      '8am–5pm — On job sites or managing from the truck',
      'Evening — Scrolls Facebook, occasionally frustrated about missed calls',
      'Weekends — Admin catchup, occasionally vents in HCP user groups about the chat feature',
    ],
    pains: [
      'HCP chat shuts off after hours — reverts to a contact form',
      "No AI qualification — even when chat is on, it's just a bubble",
      "Paying for LSAs but can't see which leads actually converted",
      'After-hours no-cool/no-heat calls going to voicemail or a dead form',
      "Doesn't want to move to ServiceTitan — too expensive, too complex",
    ],
    angle: 'You keep everything in HCP. We just replace the part that\'s broken.',
    hook: "Quick question — are you using the chat widget that comes with HousecallPro? [pause] Yeah, we hear that a lot. It shuts off after hours and there's no AI — so if someone hits your site at 9pm with a dead furnace, they're just gone. Leadflo fixes that gap without touching anything else in HCP.",
    doSay: [
      'replace the chat widget',
      'keep everything in HCP',
      'booked jobs',
      'after-hours coverage',
      'no AI, no qualification',
      'dispatch-ready',
    ],
    dontSay: ['replace HCP', 'ServiceTitan', 'platform migration', 'enterprise software'],
  },
  {
    id: 'off_platform_owner',
    emoji: '📵',
    name: 'The Off-Platform Owner',
    role: 'Owner — Google Calendar / Paper Dispatch',
    priority: 'Primary Target',
    priorityColor: 'green',
    revenue: '$500K–$1.5M',
    team: '2–8 techs',
    stack: 'No FSM',
    segment: 'no_fsm_fear_anchor',
    bio: 'Running the phones themselves or with one office person. Jobs tracked in a spreadsheet or Google Calendar. Has a website (probably basic), runs LSAs, but has no chat, no AI, no intake process. Most vulnerable to losing leads to competitors who do.',
    day: [
      '6am — Up early, answers the first calls of the day personally',
      'All day — On the tools while also trying to manage inbound calls',
      "Miss calls constantly — can't be on a roof AND answer the phone",
      'Evening — Realizes they missed leads, not sure how many',
    ],
    pains: [
      "Can't answer the phone while on a job site",
      'No visibility into how many web leads they\'re missing',
      "Competitors running LSAs are faster — owner doesn't know why they're losing bids",
      'No after-hours process at all — website just has a phone number and a form',
      "Feels like they need ServiceTitan but can't afford or justify it",
    ],
    angle: "The bigger shops in your market are running AI intake 24/7. You don't have to spend $50K to get that.",
    hook: "The bigger HVAC shops in your market are running AI intake tools that capture and qualify every website lead 24/7 — even at 2am when the AC dies. If your site doesn't have that, you're handing those leads to competitors who do. Leadflo gives you that same capability without locking you into a $500/month-per-tech enterprise platform.",
    doSay: [
      'booked jobs',
      'after-hours coverage',
      'same capability as the big shops',
      'no ServiceTitan price tag',
      'dispatch-ready leads',
    ],
    dontSay: ['HousecallPro', 'ServiceTitan', 'workflow automation', 'lead management platform'],
  },
  {
    id: 'csr',
    emoji: '📋',
    name: 'The CSR / Office Manager',
    role: 'Office Manager / Dispatcher — HCP or Jobber shops',
    priority: 'Champion & Influencer',
    priorityColor: 'amber',
    revenue: 'N/A — Salaried',
    team: 'Works with 5–20 techs',
    stack: 'HCP or Jobber',
    segment: 'either',
    bio: "Runs the day-to-day in HCP. Books jobs, dispatches techs, manages the phone. Knows the after-hours gap better than the owner. If HCP's chat is failing, she's the one dealing with the morning callback queue. Can be a powerful internal champion.",
    day: [
      '7:30am — Opens HCP, reviews overnight web submissions',
      'All day — Answering calls, booking in HCP, managing callbacks',
      'Afternoons — Following up on web leads that came in after 5pm yesterday',
      'End of day — Stressing about leads that came in after she left',
    ],
    pains: [
      'HCP chat turns off at 5pm — she has no after-hours coverage',
      'Web form leads sit overnight with no follow-up process',
      'Dispatching techs to calls that turn out to be DIY issues or bad-fit jobs',
      'Owner asks her about missed leads and she has no good answer',
    ],
    angle: "You shouldn't have to start every morning chasing last night's web leads.",
    hook: 'If someone fills out your website at 9pm tonight, what happens to that lead before 8am tomorrow?',
    doSay: [
      'overnight web leads',
      'morning callback queue',
      'HCP dispatch',
      'after-hours coverage',
      'saves time in the morning',
    ],
    dontSay: ['workflow automation', 'AI platform', 'enterprise software'],
  },
];

/* ------------------------------------------------------------------ *
 * Messaging & talk tracks
 * ------------------------------------------------------------------ */

export interface TalkTrack {
  id: string;
  label: string;
  icon: string;
  color: 'sky' | 'violet';
  context: string;
  script: string;
  keyFrames: string[];
}

export const TALK_TRACKS: TalkTrack[] = [
  {
    id: 'hcp',
    label: 'HCP Shop Talk Track',
    icon: '🏠',
    color: 'sky',
    context:
      "Prospect is currently on HousecallPro. They have HCP's basic chat. They're likely frustrated with it but haven't found an alternative. Leadflo is the fix — not a replacement for HCP.",
    script: `"Hey [Name], quick question — are you using the chat widget that comes with HousecallPro?

[Pause — let them answer]

Yeah, we hear that a lot. The issue is it shuts off after hours and there's no AI, so if someone hits your site at 9pm with a dead furnace, they're just gone.

Leadflo replaces that with an AI that qualifies the lead, captures the job info, and keeps them engaged until your team gets back to them — without replacing anything else you're using in HCP."`,
    keyFrames: [
      'Lead with the HCP chat question — not a pitch',
      'Validate their frustration before solving it',
      "Emphasize 'without replacing anything in HCP'",
      'The job still flows into HCP — nothing changes except the intake layer',
    ],
  },
  {
    id: 'nofsm',
    label: 'No-FSM Fear Anchor',
    icon: '📵',
    color: 'violet',
    context:
      'Prospect is not on any FSM platform — running phones themselves, Google Calendar, or paper dispatch. They have never heard of Scheduling Pro. Their fear is being left behind by better-equipped competitors.',
    script: `"The bigger HVAC shops in your market are running AI intake tools that capture and qualify every website lead 24/7 — even at 2am when the AC dies.

If your site doesn't have that, you're handing those leads to competitors who do.

Leadflo gives you that same capability without locking you into a $500/month-per-tech enterprise platform."`,
    keyFrames: [
      "Never name ServiceTitan — say 'enterprise platform'",
      'The fear is competitive disadvantage, not product features',
      'Position Leadflo as the accessible bridge — same capability, fraction of cost',
      "Follow with: 'What's your current process for web leads after hours?'",
    ],
  },
];

export interface QualifyingQuestion {
  q: string;
  action: string;
  outcome: 'Disqualify' | 'Filter' | 'Qualify' | 'Pain Signal';
  color: 'red' | 'amber' | 'green' | 'violet';
}

export const QUALIFYING_QUESTIONS: QualifyingQuestion[] = [
  {
    q: 'Are you on ServiceTitan?',
    action: 'If YES → Disqualify politely and move on. Do not pitch.',
    outcome: 'Disqualify',
    color: 'red',
  },
  {
    q: 'About how many techs are you running?',
    action: 'If 20+ → Disqualify. If 3–15 → Continue.',
    outcome: 'Filter',
    color: 'amber',
  },
  {
    q: 'What platform are you using for dispatch and scheduling?',
    action: 'HCP/Jobber/Nothing → Qualified. ST/other enterprise → Disqualify.',
    outcome: 'Qualify',
    color: 'green',
  },
  {
    q: "What's your process for web leads that come in after hours?",
    action: "Any answer except 'we have a 24/7 AI tool' is a pain signal. Continue.",
    outcome: 'Pain Signal',
    color: 'violet',
  },
];

/* ------------------------------------------------------------------ *
 * Outreach sequences
 * ------------------------------------------------------------------ */

export interface SequenceTouch {
  touch: string;
  day: string;
  type: string;
  color: 'sky' | 'violet' | 'amber' | 'green' | 'muted';
  subject: string;
  body: string;
}

export const HCP_SEQUENCE: SequenceTouch[] = [
  {
    touch: 'Email 1',
    day: 'Day 1',
    type: 'HCP Chat Hook',
    color: 'sky',
    subject: 'Quick question about your HousecallPro chat widget',
    body: `[Name],

Quick question — are you using the chat widget that comes with HousecallPro for your website?

Most HCP shops I talk to either turned it off or just leave it on even though it shuts down after hours. The problem is that a homeowner who hits your site at 9pm with a dead furnace doesn't get a response — they fill out a form and wait until morning.

By then, they've already called someone else.

Leadflo replaces that with an AI that responds in real time, qualifies the job, and keeps them engaged until your team picks it up in the morning — without changing anything else you use in HCP.

Worth a 15-minute look?

— [Your Name]`,
  },
  {
    touch: 'Email 2',
    day: 'Day 4',
    type: 'Revenue Math',
    color: 'violet',
    subject: "What HCP's after-hours chat gap is costing you",
    body: `[Name],

If you're getting 30–50 web leads a month — conservative for an HVAC shop your size running LSAs — and HCP's chat is off after 5pm, you're likely losing 20–30% of those leads to slower follow-up.

At a $600 average ticket, that's $3,600–$9,000 in missed booked jobs. Every month.

Leadflo covers that gap without touching anything else in HCP. The job still flows into your HCP board — you just don't lose it first.

Happy to show you a 15-minute walk-through?

— [Your Name]`,
  },
  {
    touch: 'Email 3',
    day: 'Day 8',
    type: 'Competitor Pressure',
    color: 'amber',
    subject: 'The shops beating you on LSA response time',
    body: `[Name],

The HVAC shops winning on LSA in [City] right now are responding to web leads in under 2 minutes — day or night.

HCP's chat widget doesn't do that. It's a contact form in disguise after 5pm.

78% of homeowners book the first company to respond. If your site isn't responding, someone else is.

15 minutes — I'll show you exactly what Leadflo looks like on an HCP shop like yours.

— [Your Name]`,
  },
  {
    touch: 'Email 4',
    day: 'Day 13',
    type: 'Breakup / Resource',
    color: 'muted',
    subject: 'Leaving this here for you',
    body: `[Name],

I'll keep this short — if the timing's off, totally fine.

I put together a one-page breakdown of the HCP chat gap and what Leadflo does differently: [link]. Might be useful for peak season planning even if now's not the right time.

If you ever want to see it live on an HCP site like yours, my calendar link is below.

— [Your Name]
[Calendly link]`,
  },
];

export const NOFSM_SEQUENCE: SequenceTouch[] = [
  {
    touch: 'Email 1',
    day: 'Day 1',
    type: 'Fear Anchor',
    color: 'violet',
    subject: 'What the big HVAC shops in [City] are doing at 2am',
    body: `[Name],

Quick observation — the larger HVAC shops in [City] are running AI intake tools that capture and qualify every web lead 24/7. Even at 2am when the AC dies.

If your site doesn't have that, those leads are going to whoever does.

Leadflo gives you that same capability without locking you into a $500/month-per-tech enterprise platform.

— [Your Name]`,
  },
  {
    touch: 'Email 2',
    day: 'Day 4',
    type: 'Cost Contrast',
    color: 'green',
    subject: 'Enterprise-grade intake. Not an enterprise price tag.',
    body: `[Name],

Most AI intake tools built for home services shops are either garbage (generic chat widgets with no AI) or require a full ServiceTitan implementation — $245+ per tech per month plus a $10–50K setup.

Leadflo is purpose-built for residential HVAC and plumbing shops — responds to every web visitor in under 90 seconds, qualifies the job, and books it before they call someone else.

No six-figure commitment. No 3-month onboarding.

Worth 15 minutes?

— [Your Name]`,
  },
  {
    touch: 'Email 3',
    day: 'Day 9',
    type: 'Peak Season Urgency',
    color: 'amber',
    subject: "Summer's 6 weeks out — what's your after-hours web process?",
    body: `[Name],

Peak season is close. Last year, how many web leads did you miss during the first heat wave?

Most HVAC shops that don't have 24/7 AI coverage lose their highest-urgency leads exactly when they can least afford to — when the phones are buried and the web form sits until morning.

Happy to show you what Leadflo looks like on a site like yours before summer hits.

— [Your Name]`,
  },
  {
    touch: 'Email 4',
    day: 'Day 14',
    type: 'Breakup',
    color: 'muted',
    subject: 'One last thing',
    body: `[Name],

Last note from me — here's a quick breakdown of what your competitors are using for after-hours web intake and what it's costing shops that don't: [link].

If the timing ever works, my calendar's below.

— [Your Name]
[Calendly link]`,
  },
];

export interface CallScriptStep {
  step: string;
  content: string;
  note: string;
}

export const CALL_SCRIPT: CallScriptStep[] = [
  {
    step: 'Qualify First',
    content:
      "Before the pitch: 'Hey [Name], this is [Your Name]. Quick question before I say anything else — are you on ServiceTitan?' [If yes → 'Got it, no worries — have a great day.']",
    note: "Qualify before pitching. Don't waste a single word on a disqualified prospect.",
  },
  {
    step: 'HCP Mode',
    content:
      "'Quick question — are you using the chat widget that comes with HousecallPro?' [Pause] 'Yeah, we hear that a lot. It shuts off after hours with no AI — if someone hits your site at 9pm with a dead furnace, they're just gone. Leadflo replaces that without changing anything else in HCP.'",
    note: 'For HCP shops. Lead with the widget question. Validate before solving.',
  },
  {
    step: 'No-FSM Mode',
    content:
      "'The bigger HVAC shops in your market are running AI intake 24/7 — even at 2am when the AC dies. If your site doesn't have that, you're handing those leads to competitors who do. Leadflo gives you that capability without a $500/month-per-tech enterprise platform.'",
    note: 'For no-FSM shops. Fear anchor, then immediate contrast with cost.',
  },
  {
    step: 'The Ask',
    content:
      "'Can I show you 15 minutes of what it looks like on an HVAC site like yours? I'll show you specifically how it handles the after-hours gap.'",
    note: "Short demo framing. Not 'a call' — 'what it looks like on a site like yours.'",
  },
];

export const CALL_WINDOW = {
  window: 'Tue–Thu · 7:30–9:30am & 4:30–6:00pm local time',
  note: 'These owners are on job sites 8am–4pm. Catch them before the first call of the day or when they\'re wrapping up.',
};

/* ------------------------------------------------------------------ *
 * Seasonal
 * ------------------------------------------------------------------ */

export interface Season {
  s: string;
  m: string;
  icon: string;
  color: 'amber' | 'red' | 'violet' | 'dark';
  urgency: string;
  context: string;
  angle: string;
  /** Calendar months this season covers, for "where are we now" detection. */
  months: number[];
}

export const SEASONS: Season[] = [
  {
    s: 'Pre-Peak Spring',
    m: 'March–May',
    icon: '🌱',
    color: 'amber',
    urgency: 'High',
    months: [2, 3, 4],
    context:
      'Best outreach window — owners have time and are thinking about summer. This is when HCP shops are most open to fixing their after-hours gap before it becomes a crisis.',
    angle:
      "Summer's 6 weeks out. Last year, how many web leads did you miss during the first heat wave? Let's fix the HCP chat gap before it happens again.",
  },
  {
    s: 'Peak Summer',
    m: 'June–August',
    icon: '☀️',
    color: 'red',
    urgency: 'Extreme',
    months: [5, 6, 7],
    context:
      'Phones buried. HCP chat off. After-hours web leads piling up in the morning queue. Owners are stressed and moving fast. Keep outreach extremely short — they have no bandwidth.',
    angle: "Your HCP chat is off right now and it's 9pm. What's happening to those web leads tonight?",
  },
  {
    s: 'Shoulder Fall',
    m: 'Sept–Nov',
    icon: '🍂',
    color: 'violet',
    urgency: 'Medium',
    months: [8, 9, 10],
    context:
      "Post-peak retrospective window. Owners have bandwidth and regrets. Replacement job season. Great time to run the 'what slipped through summer' angle.",
    angle:
      "Peak season's over. How many after-hours web leads sat in your HCP form until morning? Here's what that number looks like.",
  },
  {
    s: 'Peak Winter',
    m: 'Dec–Feb',
    icon: '❄️',
    color: 'dark',
    urgency: 'Extreme',
    months: [11, 0, 1],
    context:
      'No-heat calls at midnight. Same dynamic as summer but for heating. HCP shops in Sunbelt markets (Dallas, Atlanta, Charlotte) feel this hard.',
    angle:
      "A no-heat call at midnight in January is a $4,000 job. Your HCP chat won't catch it. Leadflo will.",
  },
];

/* ------------------------------------------------------------------ *
 * Partners
 * ------------------------------------------------------------------ */

export interface Partner {
  icon: string;
  name: string;
  tier: string;
  color: 'sky' | 'violet' | 'amber' | 'dark';
  headline: string;
  why: string;
  angle: string;
  structure: string[];
  tension: string;
}

export const PARTNERS: Partner[] = [
  {
    icon: '🏠',
    name: 'HousecallPro',
    tier: 'Co-opetition Partner',
    color: 'sky',
    headline:
      "Leadflo replaces HCP's weakest feature — and that keeps customers on HCP instead of churning to ServiceTitan.",
    why: "HCP's chat bubble is universally disliked. If HCP customers don't get a proper AI intake solution, they eventually migrate to ServiceTitan for Scheduling Pro — and HCP loses the account entirely. Leadflo prevents that migration. The pitch to HCP: 'We fix the part your customers hate, which keeps them on your platform.'",
    angle:
      "Your customers are frustrated with your chat widget. We replace it — and they stay in HCP for everything else. We're not competing with HCP; we're fixing the feature that's driving your churn.",
    structure: [
      'Marketplace listing — Leadflo as the recommended chat/intake solution for HCP shops',
      'Native API integration: Leadflo-booked jobs flow into HCP as dispatch-ready records',
      "Co-marketing to HCP's HVAC/Plumbing user base",
      'HCP CSMs refer Leadflo when customers ask about web lead conversion',
    ],
    tension:
      "This is co-opetition. Leadflo displaces HCP's native chat widget. The key framing: we're not competing with HCP's FSM business — we're making it stickier by fixing a feature gap they haven't prioritized.",
  },
  {
    icon: '🏢',
    name: 'HVAC/Plumbing Marketing Agencies',
    tier: 'Highest Priority',
    color: 'violet',
    headline: 'Agencies drive the traffic. Leadflo makes it convert. A natural co-sell with no overlap.',
    why: "Digital agencies serving HVAC and plumbing clients are already invested in their clients' success. They drive LSA, paid search, and SEO traffic. If that traffic doesn't convert, their own ROI story weakens. Leadflo makes their campaigns look better — which is a natural sell.",
    angle:
      "You're generating the demand. Leadflo closes the gap between the click and the booked job. Your clients win, your retention improves, and you have a stronger attribution story.",
    structure: [
      'Referral fee per closed Leadflo account',
      'White-label or co-sell arrangement',
      'Joint case study development once early clients are live',
      "Agency co-marketing: 'Our clients get priority Leadflo onboarding'",
    ],
    tension: 'None. Pure complementary play. No product overlap.',
  },
  {
    icon: '🏛️',
    name: 'ACCA / PHCC',
    tier: 'Brand & Access',
    color: 'amber',
    headline: 'Association endorsement shortcuts the trust gap that makes cold outreach harder.',
    why: "ACCA (HVAC) and PHCC (Plumbing) members are exactly Leadflo's ICP. Association preferred vendor status is borrowed trust at scale — and with zero logos, that trust gap is Leadflo's biggest sales friction point right now.",
    angle:
      "We're building the only intake solution purpose-built for HVAC and Plumbing contractors below the ServiceTitan price threshold. We'd love to bring it to your member base.",
    structure: [
      'Member discount / preferred vendor status',
      'Association newsletter feature',
      "'Peak Season Lead Response' webinar sponsorship",
      'Conference booth presence at ACCA Conference and PHCCExpo',
    ],
    tension: 'None. Association relationships take time but compound.',
  },
  {
    icon: '🏠',
    name: 'Nuvehome.com',
    tier: 'Co-Sell Opportunity',
    color: 'dark',
    headline: 'Overlapping contractor networks — a referral structure benefits both sides.',
    why: 'This partner operates in the home services space with existing contractor relationships. A co-sell or referral arrangement surfaces warm HVAC/Plumbing accounts that already trust their network.',
    angle:
      'Our contractor bases overlap. Leadflo solves the web lead conversion problem for shops already in your network. A referral structure requires zero product work from either side.',
    structure: [
      'Referral fee for closed Leadflo accounts from partner network',
      'Co-marketing to shared audience',
      'Joint content (webinar, guide)',
      'Data sharing on overlapping accounts',
    ],
    tension:
      "Understand the Nuvehome model clearly before structuring — ensure there's no conflict in contractor base overlap.",
  },
];

/* ------------------------------------------------------------------ *
 * Framing / attribution
 * ------------------------------------------------------------------ */

export const PORTFOLIO_NOTE =
  'This tool was built independently as a personal SDR workflow system for a previous employer in the AI chat / home services SaaS space. Company name and specific product references have been anonymized under "Leadflo" per an IP assignment clause in my employment agreement. The GTM framework, research methodology, ICP logic, and outreach architecture are entirely my own work.';

export const BYLINE = 'Built by Johnny Scott · 2025';
export const AUTHOR = { name: 'Johnny Scott', role: 'SDR / GTM Strategist', linkedin: 'https://linkedin.com/in/johnny-b-scott' };

export const HEADER_CHIPS: [string, string, string][] = [
  ['HCP / No-FSM Only', '#C5DDFF', '#1D4ED8'],
  ['3–15 Techs', '#F4FB6E', '#5B4A00'],
  ['$500K–$3M', '#C1B7FF', '#5B3FC1'],
  ['❌ No ST Shops', '#FEE2E2', '#DC2626'],
];
