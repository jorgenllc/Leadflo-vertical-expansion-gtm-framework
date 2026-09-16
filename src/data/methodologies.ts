/**
 * The methodology engine.
 *
 * GAP, SPIN and Challenger are not three hardcoded question lists — each is a
 * generator that takes a specific shop (plus its fit assessment and leak math)
 * and emits a discovery path with the shop's real facts already interpolated.
 *
 * The three frameworks deliberately produce *structurally* different calls, not
 * reworded versions of the same call:
 *
 *   GAP        — quantification-led. Establish current state, get the prospect to
 *                articulate a future state, then measure the distance in dollars.
 *                The prospect does the math out loud.
 *   SPIN       — question-led (Rackham). Four escalating question types. The rep
 *                mostly asks; implications are drawn by the prospect, never asserted.
 *   Challenger — assertion-led (Dixon & Adamson). Teach a commercial insight that
 *                reframes the problem, then drown it in data and emotional impact
 *                before the solution is ever named.
 *
 * Which one a rep should pick genuinely depends on the lead, so `recommendFor`
 * below returns a real recommendation with reasoning rather than a default.
 */

import type {
  FitAssessment,
  LeakMath,
  MethodologyId,
  MethodologyPlaybook,
  Shop,
} from '../lib/types';
import { c } from '../theme';
import { currentSeason } from '../lib/season';

export const METHODOLOGY_IDS: MethodologyId[] = ['gap', 'spin', 'challenger'];

export const METHODOLOGY_META: Record<
  MethodologyId,
  { name: string; subtitle: string; origin: string; color: string; shape: string }
> = {
  gap: {
    name: 'GAP Selling',
    subtitle: 'Current state → future state → the cost of the distance',
    origin: 'Keenan, "Gap Selling" (2018)',
    color: c.gap,
    shape: 'Quantification-led. The prospect does the math out loud.',
  },
  spin: {
    name: 'SPIN Selling',
    subtitle: 'Situation → Problem → Implication → Need-Payoff',
    origin: 'Rackham, Huthwaite research (1988)',
    color: c.spin,
    shape: 'Question-led. You ask; they conclude. Never assert the implication.',
  },
  challenger: {
    name: 'Challenger Sale',
    subtitle: 'Teach → Tailor → Take Control',
    origin: 'Dixon & Adamson, CEB research (2011)',
    color: c.challenger,
    shape: 'Assertion-led. Lead with an insight that reframes their problem.',
  },
};

/* ------------------------------------------------------------------ *
 * Interpolation context
 * ------------------------------------------------------------------ */

interface Ctx {
  /** Contact first name, or a safe fallback. */
  first: string;
  shopName: string;
  city: string;
  /** "HousecallPro" | "Jobber" | "no scheduling platform" etc. */
  stackLabel: string;
  /** "HVAC" | "plumbing" | "HVAC and plumbing" */
  trade: string;
  /** "furnace" in winter, "AC" in summer — the failure the homeowner calls about. */
  breakdown: string;
  techs: string;
  leads: string;
  ticket: string;
  monthlyLeak: string;
  annualLeak: string;
  lostLeads: string;
  isHcp: boolean;
  isNoFsm: boolean;
  season: string;
  /** True when the numbers behind the leak math are assumptions, not Close data. */
  estimated: boolean;
}

const money = (n: number) =>
  n >= 1000 ? `$${Math.round(n).toLocaleString('en-US')}` : `$${Math.round(n)}`;

function buildCtx(shop: Shop, fit: FitAssessment, leak: LeakMath): Ctx {
  const owner = shop.contacts[0];
  const first = owner?.name?.trim().split(/\s+/)[0] || 'there';
  const season = currentSeason();
  const isWinter = season.s === 'Peak Winter';
  const trade =
    shop.vertical === 'plumbing' ? 'plumbing' : shop.vertical === 'both' ? 'HVAC and plumbing' : 'HVAC';

  const stackLabel =
    shop.fsmStack === 'housecallpro'
      ? 'HousecallPro'
      : shop.fsmStack === 'jobber'
        ? 'Jobber'
        : shop.fsmStack === 'servicetitan'
          ? 'ServiceTitan'
          : shop.fsmStack === 'none'
            ? 'no scheduling platform'
            : 'your current setup';

  return {
    first,
    shopName: shop.name,
    city: shop.city || 'your market',
    stackLabel,
    trade,
    breakdown: trade === 'plumbing' ? 'a burst pipe' : isWinter ? 'a dead furnace' : 'a dead AC',
    techs: shop.techCount ? String(shop.techCount) : 'your',
    leads: String(leak.monthlyWebLeads),
    ticket: money(leak.avgTicket),
    monthlyLeak: money(leak.monthlyLeak),
    annualLeak: money(leak.annualLeak),
    lostLeads: leak.lostLeadsPerMonth.toFixed(1).replace(/\.0$/, ''),
    isHcp: fit.segment === 'hcp_displacement',
    isNoFsm: fit.segment === 'no_fsm_fear_anchor',
    season: season.s,
    estimated: shop.monthlyWebLeads == null || shop.avgTicket == null,
  };
}

/* ------------------------------------------------------------------ *
 * GAP Selling
 * ------------------------------------------------------------------ */

function buildGap(x: Ctx): MethodologyPlaybook {
  const meta = METHODOLOGY_META.gap;
  return {
    id: 'gap',
    ...meta,
    northStar:
      'No gap, no deal. Do not present anything until the prospect has stated the future state themselves and agreed the distance costs money.',
    bestFor:
      'Shops where you already have real numbers — web lead volume, average ticket, LSA spend. GAP is strongest when the gap can be made arithmetic.',
    failureMode:
      'Turning into an interrogation. If you run current-state questions without ever getting to a future state the prospect articulates, you have gathered data and built no urgency.',
    dimensions: [
      {
        id: 'current_state',
        label: 'Current state established',
        anchor: 'You can state their after-hours intake process in one sentence and they would agree with it.',
      },
      {
        id: 'future_state',
        label: 'Future state in their words',
        anchor: 'They described what they want to happen at 9pm — unprompted, not agreeing to your version.',
      },
      {
        id: 'gap_quantified',
        label: 'Gap quantified in dollars',
        anchor: `They said a number out loud, or accepted ${x.monthlyLeak}/month without pushback.`,
      },
      {
        id: 'impact_owned',
        label: 'Impact owned, not argued',
        anchor: 'They connected the missed leads to a business consequence they care about.',
      },
      {
        id: 'priority',
        label: 'Priority established',
        anchor: 'They told you where this ranks against their other problems, and it was top three.',
      },
    ],
    stages: [
      {
        id: 'gap_current',
        label: 'Current State',
        intent: 'Get a factual, un-editorialized picture of how web leads are handled right now.',
        coaching:
          'Ask for mechanics, not opinions. "What happens" beats "are you happy with". You are building the baseline you will later price.',
        questions: [
          {
            id: 'gap_current_1',
            text: x.isHcp
              ? `Walk me through what happens today when someone lands on ${x.shopName}'s site at 9pm — are you using the chat widget that comes with HousecallPro?`
              : `Walk me through what happens today when someone lands on ${x.shopName}'s site at 9pm with ${x.breakdown} — where does that go?`,
            listenFor:
              'Whether there is any intake at all after hours, and whether they already know it is broken.',
            ifThen: x.isHcp
              ? 'If they confirm the HCP widget: do not pitch yet. Log it and keep collecting current state.'
              : 'If the answer is "a form" or "voicemail" — that is your baseline. Write the exact words down.',
          },
          {
            id: 'gap_current_2',
            text: `Roughly how many web leads is ${x.shopName} getting a month right now — form fills, chats, LSA calls, all of it?`,
            listenFor: 'A number. If they do not have one, that absence is itself the current state.',
            ifThen: x.estimated
              ? `No number means you are working off the ${x.leads}/month assumption — flag that as a discovery gap, do not present it as fact.`
              : `Compare against the ${x.leads}/month on file in Close and reconcile any difference out loud.`,
          },
          {
            id: 'gap_current_3',
            text: `And who's actually handling those overnight — is that you, or does someone in the office pick it up in the morning?`,
            listenFor:
              'Whether the owner is the intake system. If so, the cost is their own time and it compounds.',
            ifThen:
              'If an office manager handles the morning queue, you just found your champion — get their name.',
          },
          {
            id: 'gap_current_4',
            text: `Are you on ServiceTitan, or something else for dispatch and scheduling?`,
            listenFor: 'ServiceTitan. Anything else is workable.',
            ifThen: 'If ServiceTitan → disqualify politely and end the call. Do not pitch.',
            isFilter: true,
          },
        ],
      },
      {
        id: 'gap_future',
        label: 'Future State',
        intent: 'Make the prospect describe what they actually want to happen — in their own words.',
        coaching:
          'This is the stage reps skip, and skipping it is why GAP calls collapse into feature pitches. Stay quiet after you ask.',
        questions: [
          {
            id: 'gap_future_1',
            text: `Forget what's possible for a second — if a homeowner hits your site at 2am with ${x.breakdown}, what would you want to happen?`,
            listenFor:
              'Their version of the ideal. Usually "someone answers" or "it gets on the board for the morning".',
            ifThen: 'Whatever they say — repeat it back verbatim. That sentence is the future state you will price.',
          },
          {
            id: 'gap_future_2',
            text: `If that were handled every night automatically, what would change for ${x.shopName}?`,
            listenFor:
              'Booked jobs, less morning chasing, fewer leads to competitors, or their own evenings back.',
          },
          {
            id: 'gap_future_3',
            text: `What's stopped you from fixing that already?`,
            listenFor:
              x.isNoFsm
                ? 'Cost fear, or the assumption that this requires an enterprise platform.'
                : 'Belief that the HCP widget is as good as it gets, or that changing it means changing HCP.',
            ifThen:
              'Their stated obstacle is the objection you will handle later. Do not handle it now — just capture it.',
          },
        ],
      },
      {
        id: 'gap_measure',
        label: 'Measure the Gap',
        intent: 'Convert the distance between current and future state into arithmetic the prospect agrees with.',
        coaching:
          'Do the math *with* them, not at them. Ask for each input rather than presenting a finished number — a figure they helped calculate is one they cannot dismiss.',
        assertion: `Based on ${x.leads} web leads a month and a ${x.ticket} average ticket, the after-hours gap is somewhere around ${x.monthlyLeak} a month — about ${x.annualLeak} a year. That's roughly ${x.lostLeads} jobs a month that reach your site and never reach your board.`,
        questions: [
          {
            id: 'gap_measure_1',
            text: `What's a typical ticket for you on a residential ${x.trade} call — not the big replacements, just an average service call?`,
            listenFor: 'A dollar figure. This is the multiplier for everything that follows.',
            ifThen: `On file we have ${x.ticket}. If they say something different, use theirs — it's their math now.`,
          },
          {
            id: 'gap_measure_2',
            text: `Of those ${x.leads} leads a month, what share do you think come in after you've closed for the day?`,
            listenFor:
              'Usually 30–40%, and they usually underestimate. Emergency trades skew heavily after-hours.',
          },
          {
            id: 'gap_measure_3',
            text: `So if we're being conservative and say you lose a quarter of those to whoever answers first — does ${x.monthlyLeak} a month sound high, low, or about right to you?`,
            listenFor:
              'Any answer except "high" means the gap is established. "About right" is the outcome you want.',
            ifThen:
              'If they say "high", ask what number they would use — then use theirs. A smaller number they own beats a bigger one they reject.',
          },
        ],
      },
      {
        id: 'gap_impact',
        label: 'Impact & Cost of Inaction',
        intent: 'Attach the quantified gap to a consequence the prospect actually cares about.',
        coaching:
          'Money is not automatically motivating to an owner-operator. Find whether the real cost is revenue, competitive position, or their own time.',
        questions: [
          {
            id: 'gap_impact_1',
            text: `${x.city} has ${x.trade} shops responding to web leads in under two minutes, day or night. If they're getting to those homeowners first — what does that do to you over a season?`,
            listenFor: 'Recognition that this is a competitive loss, not just an admin gap.',
          },
          {
            id: 'gap_impact_2',
            text:
              x.season === 'Peak Summer' || x.season === 'Peak Winter'
                ? `You're in the thick of it right now. What happened last night with web leads — honestly?`
                : `When peak season hits, does this problem get better or worse?`,
            listenFor: 'Their own escalation. Peak season is when the gap is most expensive and most visible.',
          },
          {
            id: 'gap_impact_3',
            text: `If nothing changes between now and next peak, what's that season look like?`,
            listenFor: 'Cost of inaction in their words. This is the line you quote back in the follow-up email.',
          },
        ],
      },
      {
        id: 'gap_priority',
        label: 'Priority & Next Step',
        intent: 'Find out where this ranks, and convert to a concrete next step or a clean no.',
        coaching:
          'A prospect who agrees there is a gap but ranks it fifth is not a deal this quarter. Better to know now.',
        questions: [
          {
            id: 'gap_priority_1',
            text: `Against everything else on your plate this quarter — hiring, trucks, marketing spend — where does fixing the after-hours gap actually sit?`,
            listenFor: 'Top three, or not. Both answers are useful.',
          },
          {
            id: 'gap_priority_2',
            text: `Can I show you fifteen minutes of what this looks like on ${x.trade === 'plumbing' ? 'a plumbing' : 'an HVAC'} site like yours — specifically how it handles the ${x.isHcp ? 'HCP' : 'after-hours'} gap?`,
            listenFor: 'A yes with a day attached. "Send me something" is a soft no — push once for a time.',
          },
        ],
      },
    ],
    emailOpener: {
      subject: x.isHcp
        ? `${x.monthlyLeak}/mo — the HousecallPro chat gap at ${x.shopName}`
        : `${x.monthlyLeak}/mo leaking out of ${x.shopName}'s site after hours`,
      body: `${x.first},

Quick bit of math rather than a pitch.

${x.shopName} looks like roughly ${x.leads} web leads a month. At a ${x.ticket} average ticket, if even a quarter of the after-hours ones go to whoever answers first, that's about ${x.monthlyLeak} a month — ${x.annualLeak} a year — reaching your site and never reaching your board.

${
  x.isHcp
    ? "I'd rather check my numbers than argue them. What actually happens to a web lead at 9pm right now, with the HCP widget?"
    : `I'd rather check my numbers than argue them. What actually happens to a web lead at 9pm right now?`
}

If my figures are off, tell me and I'll drop it.

— [Your Name]`,
    },
  };
}

/* ------------------------------------------------------------------ *
 * SPIN Selling
 * ------------------------------------------------------------------ */

function buildSpin(x: Ctx): MethodologyPlaybook {
  const meta = METHODOLOGY_META.spin;
  return {
    id: 'spin',
    ...meta,
    northStar:
      'The prospect must say the implication out loud. The moment you state it for them, it becomes your claim instead of their conclusion.',
    bestFor:
      'First conversations, and anyone who gets defensive when challenged. SPIN is the safest framework for a cold owner-operator who did not ask to be called.',
    failureMode:
      'Stacking situation questions. Rackham\'s own finding: high performers ask fewer situation questions and more implication questions. Research they could have done themselves burns the call.',
    dimensions: [
      {
        id: 'situation_efficiency',
        label: 'Situation efficiency',
        anchor: 'Three situation questions or fewer — everything else was pre-researched before dialing.',
      },
      {
        id: 'problem_admitted',
        label: 'Explicit problem admitted',
        anchor: 'They stated a problem in their own words rather than agreeing with yours.',
      },
      {
        id: 'implication_drawn',
        label: 'Implication drawn by prospect',
        anchor: 'They connected the problem to a consequence without you naming it first.',
      },
      {
        id: 'need_payoff',
        label: 'Need-payoff articulated',
        anchor: 'They described the value of solving it — that sentence is your close.',
      },
      {
        id: 'talk_ratio',
        label: 'Talk ratio',
        anchor: 'They talked more than you did. On a SPIN call that is the whole game.',
      },
    ],
    stages: [
      {
        id: 'spin_situation',
        label: 'Situation',
        intent: 'Establish minimum viable context. Three questions maximum.',
        coaching:
          'Everything you can look up, look up. Situation questions are the only kind that actively cost you credibility when overused.',
        questions: [
          {
            id: 'spin_s_1',
            text: `${x.first}, how many techs are you running at ${x.shopName} these days?`,
            listenFor: '3–15 keeps you in ICP. 20+ ends the call.',
            ifThen: `Close has ${x.techs === 'your' ? 'no tech count' : x.techs}. Confirm rather than assume — a stale number misprices the whole call.`,
            isFilter: true,
          },
          {
            id: 'spin_s_2',
            text: x.isHcp
              ? `And you're running everything through HousecallPro for dispatch and invoicing?`
              : `What are you using to keep track of jobs and dispatch right now?`,
            listenFor: 'Stack confirmation. ServiceTitan is a hard stop.',
            isFilter: true,
          },
          {
            id: 'spin_s_3',
            text: `Where's most of your work coming in from — LSAs, organic, referral?`,
            listenFor:
              'LSA spend means they are already paying for the leads they are about to admit they lose. That is leverage later.',
          },
        ],
      },
      {
        id: 'spin_problem',
        label: 'Problem',
        intent: 'Surface an explicit problem the prospect states themselves.',
        coaching:
          'Ask about the mechanism, not their satisfaction. "What happens when…" produces admissions; "are you happy with…" produces defensiveness.',
        questions: [
          {
            id: 'spin_p_1',
            text: `What happens to a web lead that comes in after your office closes?`,
            listenFor: 'The gap, described by them. Do not fill a pause here.',
            ifThen: x.isHcp
              ? 'If they mention the HCP widget shutting off — that is the explicit problem. Stop and stay there.'
              : 'If the answer is a form or voicemail, ask how long until someone sees it.',
          },
          {
            id: 'spin_p_2',
            text: `How do you know whether those ever got called back?`,
            listenFor:
              'Usually: they do not know. The absence of visibility is often a sharper problem than the loss itself.',
          },
          {
            id: 'spin_p_3',
            text: x.isHcp
              ? `Has the chat widget in HCP ever actually booked you a job?`
              : `Has anyone ever called you back and said they'd already gone with someone else?`,
            listenFor:
              'A specific story. One concrete lost job is worth more than any aggregate statistic you could quote.',
            ifThen: 'Get details — when, what job, what size. You will reference it for the rest of the cycle.',
          },
        ],
      },
      {
        id: 'spin_implication',
        label: 'Implication',
        intent: 'Let the prospect follow the problem through to its consequences. This stage creates the urgency.',
        coaching:
          'Rackham\'s core finding lives here: implication questions separate top performers from everyone else. Resist stating the consequence — ask the question that makes them state it.',
        questions: [
          {
            id: 'spin_i_1',
            text: `If that's happening most nights, what does that add up to over a month?`,
            listenFor:
              'Them doing the arithmetic unprompted. Silence is fine — let them work. Never supply the number.',
            ifThen: `If they land near ${x.monthlyLeak}, they built your business case for you. If they lowball it, accept their figure.`,
          },
          {
            id: 'spin_i_2',
            text: `You're paying for LSA clicks either way — what does it mean when one of those clicks lands at 10pm?`,
            listenFor: 'Recognition that they already paid for the lead they lost. That reframe lands hard.',
          },
          {
            id: 'spin_i_3',
            text: `And when it's peak season and the phones are already buried — does that get better or worse?`,
            listenFor:
              'Escalation. The gap is worst precisely when each lead is worth the most, and they know it.',
          },
          {
            id: 'spin_i_4',
            text: `What does that do to the ${x.city} shops you're bidding against who are answering in two minutes?`,
            listenFor:
              'Competitive framing, arrived at on their own. This is the closest SPIN gets to a Challenger reframe.',
          },
        ],
      },
      {
        id: 'spin_needpayoff',
        label: 'Need-Payoff',
        intent: 'Have the prospect describe the value of a solution, so the close is their sentence, not yours.',
        coaching:
          'If they describe the payoff, you do not have to sell the product. Their answer here is the exact copy to use in your follow-up.',
        questions: [
          {
            id: 'spin_n_1',
            text: `If every one of those after-hours leads got answered, qualified, and was sitting on your board by 7am — what's that worth to you?`,
            listenFor: 'A number, or a description of relief. Either is your close.',
          },
          {
            id: 'spin_n_2',
            text: x.isHcp
              ? `And if that happened without changing anything else about how you use HCP — would that be worth fifteen minutes to look at?`
              : `And if you could get that without an enterprise platform contract — worth fifteen minutes to look at?`,
            listenFor: 'The commitment. The conditional they just accepted is your positioning, in their mouth.',
          },
          {
            id: 'spin_n_3',
            text: `Who else would need to see it before you'd make a call on something like this?`,
            listenFor:
              'Decision process. In a 3–15 tech shop it is usually the owner alone, but the office manager can kill it.',
          },
        ],
      },
    ],
    emailOpener: {
      subject: x.isHcp ? 'Your HousecallPro chat after 5pm' : 'Web leads after hours — one question',
      body: `${x.first},

One question, not a pitch.

What happens to a web lead that hits ${x.shopName}'s site after the office closes?

${
  x.isHcp
    ? "Most HCP shops tell me the chat widget goes dark and it turns into a form that sits until morning. If that's roughly right for you, I'd like to ask a second question."
    : "Most shops your size tell me it turns into a form that sits until morning. If that's roughly right for you, I'd like to ask a second question."
}

If it's already handled, say so and I'll stop.

— [Your Name]`,
    },
  };
}

/* ------------------------------------------------------------------ *
 * Challenger
 * ------------------------------------------------------------------ */

function buildChallenger(x: Ctx): MethodologyPlaybook {
  const meta = METHODOLOGY_META.challenger;
  return {
    id: 'challenger',
    ...meta,
    northStar:
      'Teach them something about their own business they did not know. If the insight is not uncomfortable, it is not an insight — it is a feature list.',
    bestFor:
      x.isNoFsm
        ? 'Exactly this lead. Off-platform owners have no idea the capability gap exists, so the reframe genuinely teaches — and the fear anchor in the playbook is already a Challenger move.'
        : 'Shops that think their setup is fine, and growth-stage owners who believe the only upgrade path is an enterprise platform.',
    failureMode:
      'Being aggressive instead of insightful. Challenger is not confrontation — it is teaching. Without a genuinely non-obvious insight you are just a rude rep, and an owner-operator will hang up.',
    dimensions: [
      {
        id: 'insight_landed',
        label: 'Insight landed',
        anchor: 'They went quiet, or said some version of "I hadn\'t thought about it like that."',
      },
      {
        id: 'reframe_specific',
        label: 'Reframe was tailored',
        anchor: 'The insight used their city, their stack, their trade — not a generic industry statistic.',
      },
      {
        id: 'data_credible',
        label: 'Rational drowning held up',
        anchor: 'You cited numbers you can defend, and they did not challenge the arithmetic.',
      },
      {
        id: 'emotional_impact',
        label: 'Emotional impact made it theirs',
        anchor: 'They told you their own version of the story before you asked for it.',
      },
      {
        id: 'control',
        label: 'Took control',
        anchor: 'You asked for the specific next step and did not soften it into "let me send you something."',
      },
    ],
    stages: [
      {
        id: 'ch_warmer',
        label: 'The Warmer',
        intent: 'Earn the right to teach by demonstrating you already understand their world.',
        coaching:
          'No rapport-building small talk. Credibility here comes from specificity — hypothesize their problem before they describe it, and be right.',
        assertion: `"${x.first}, I work with residential ${x.trade} shops running ${x.techs === 'your' ? 'a handful of' : x.techs} techs${x.isHcp ? ' on HousecallPro' : ''} in markets like ${x.city}. The pattern I see almost every time: the shop is spending real money on LSAs, the phones get answered fine during the day, and then there's a window between about 6pm and 7am where the leads they already paid for go somewhere else. I'm not calling to ask whether that's a problem — I'm calling because I think it's bigger than most owners realize."`,
        questions: [
          {
            id: 'ch_w_1',
            text: `Before I get into it — are you on ServiceTitan? If you are, I'll save you the call.`,
            listenFor: 'ServiceTitan. Volunteering to disqualify yourself buys real credibility.',
            ifThen: 'If yes → end it graciously. The goodwill is worth more than the forced pitch.',
            isFilter: true,
          },
        ],
      },
      {
        id: 'ch_reframe',
        label: 'The Reframe',
        intent: 'Deliver the commercial insight — the counterintuitive claim that resets how they see the problem.',
        coaching:
          'This is the whole methodology. Deliver it and then stop talking. If you rush into the solution you have wasted the insight.',
        assertion: x.isHcp
          ? `"Here's the part most HCP shops have backwards. You think your problem is response time — that you're a bit slow at night. It isn't. Your problem is that you're paying full price for leads and receiving a fraction of them. The chat widget in HousecallPro isn't a slow version of intake, it's a contact form wearing a chat costume: no AI, no qualification, and after 5pm it stops even pretending. So every LSA dollar you spend after dinner is buying a lead for the shop that answers instead of you. You're not losing leads at the intake stage — you're losing them at the *purchase* stage, and it shows up in your ad spend, not your voicemail."`
          : `"Here's the part most shops your size have backwards. You assume the ${x.city} shops beating you on the big jobs are winning on price, reputation, or a bigger truck fleet. Mostly they're winning at 11pm. They've got AI intake answering, qualifying, and booking while you're asleep — and it costs them a fraction of what people assume, because they didn't buy an enterprise platform to get it. The gap between you and them isn't capability you can't afford. It's capability you don't know is available below the enterprise price tag. So every night the market quietly reallocates your leads, and nothing in your reporting tells you it happened."`,
        questions: [
          {
            id: 'ch_r_1',
            text: `Does that match what you're seeing, or does it sound off?`,
            listenFor:
              'Engagement with the frame. Even pushback is good — it means the insight registered.',
            ifThen: 'If they go quiet, wait. Do not rescue the silence; that pause is the insight landing.',
          },
        ],
      },
      {
        id: 'ch_drowning',
        label: 'Rational Drowning',
        intent: 'Make the insight undeniable with numbers specific to their shop.',
        coaching:
          'Their numbers, not industry averages. And only numbers you can defend — one figure you cannot back up collapses the whole frame.',
        assertion: `"Let me put your numbers on it. ${x.leads} web leads a month, ${x.ticket} average ticket. Emergency trades run 30 to 40 percent of inbound outside business hours — call it a third. Roughly 78% of homeowners book the first company that actually responds. Even assuming you eventually recover most of them, losing a quarter of that after-hours third puts you at about ${x.lostLeads} jobs a month, or ${x.monthlyLeak}. That's ${x.annualLeak} a year${x.estimated ? ' on the volume figures I have — correct me where I\'m wrong' : ''}. And you already paid the ad cost on every one of them."`,
        questions: [
          {
            id: 'ch_d_1',
            text: `Which of those numbers is wrong for you — the volume, the ticket, or the after-hours share?`,
            listenFor:
              'A correction. Asking them to break your math is confident and it hands you real data.',
            ifThen: 'Recalculate on the spot with their figure. Doing it live is more persuasive than any deck.',
          },
        ],
      },
      {
        id: 'ch_emotional',
        label: 'Emotional Impact',
        intent: 'Move it from a spreadsheet problem to their problem.',
        coaching:
          'Now you ask. The story has to become theirs, and it only does that if they tell it.',
        questions: [
          {
            id: 'ch_e_1',
            text: `When's the last time you found out a homeowner called you first and went with someone else?`,
            listenFor: 'A specific story. This is the emotional anchor for the entire cycle.',
          },
          {
            id: 'ch_e_2',
            text:
              x.season === 'Peak Summer' || x.season === 'Peak Winter'
                ? `You're in peak right now. How many of last night's web leads do you think are sitting in a form somewhere?`
                : `Last peak season — how many of these do you think you never even saw?`,
            listenFor: 'An uncomfortable estimate. Let it sit before you move on.',
          },
          {
            id: 'ch_e_3',
            text: `And you're the one carrying that, right — the phone's on you after hours?`,
            listenFor:
              'The personal cost. For an owner-operator this often matters more than the revenue figure.',
          },
        ],
      },
      {
        id: 'ch_newway',
        label: 'A New Way',
        intent: 'Describe the required capability without naming your product. Solution-agnostic on purpose.',
        coaching:
          'Set the criteria before you name the vendor. Done properly, they conclude they need this category and you are simply the one who explained it.',
        assertion: `"What actually fixes this isn't faster callbacks — it's intake that doesn't depend on someone being awake. Three things have to be true. One: something responds inside ninety seconds, at 2am, in a real conversation rather than a form. Two: it qualifies — is this ${x.breakdown === 'a burst pipe' ? 'an emergency or a quote request' : 'no-cool or a maintenance question'}, what's the address, is it their property — so you're not dispatching a truck at 7am to a DIY question. Three: the qualified job lands ${x.isHcp ? 'in HousecallPro as a dispatch-ready record, so nothing about your board changes' : 'somewhere your team will actually see it at 7am'}. Miss any of those and you've bought a chat bubble."`,
        questions: [
          {
            id: 'ch_nw_1',
            text: `If you were buying something like that, which of those three would you care most about?`,
            listenFor:
              'Their priority ranking — which becomes the demo agenda. You are now co-authoring the criteria.',
          },
        ],
      },
      {
        id: 'ch_solution',
        label: 'Our Solution & Take Control',
        intent: 'Name Leadflo against criteria the prospect just agreed to, then drive a specific next step.',
        coaching:
          'Take control means asking for the meeting with a time attached. "I\'ll send some information" is where Challenger calls go to die.',
        assertion: x.isHcp
          ? `"That's what Leadflo is. It replaces the HCP chat widget specifically — AI that responds in real time, qualifies the job, keeps the homeowner engaged, and drops a dispatch-ready record into HousecallPro. Everything else in HCP stays exactly as it is. We're not asking you to migrate anything; we're replacing the one piece that stops working at 5pm. And it's a fraction of what the enterprise platforms charge to get the same capability."`
          : `"That's what Leadflo is — purpose-built for residential ${x.trade} shops your size. Responds to every web visitor in under ninety seconds, qualifies the job, books it before they call someone else. Same capability the big shops in ${x.city} are running, without the $500-per-tech-per-month enterprise platform and the implementation bill behind it."`,
        questions: [
          {
            id: 'ch_s_1',
            text: `I've got fifteen minutes Thursday morning before your day starts, or Tuesday at the end of it — I'll run it against ${x.shopName}'s actual site and show you what happens at 9pm. Which works?`,
            listenFor: 'A day. Two concrete options beat an open-ended ask.',
            ifThen: `If "send me something" — answer: "I will, but it lands better if you've seen it run on your own site. Fifteen minutes Thursday?" Push once, then honor a real no.`,
          },
        ],
      },
    ],
    emailOpener: {
      subject: x.isHcp
        ? `You're buying leads you never receive`
        : `What the ${x.city} shops beating you are doing at 11pm`,
      body: `${x.first},

${
  x.isHcp
    ? `A pattern I see in nearly every HousecallPro shop, and most owners have it backwards.

You'd assume the after-hours problem is response time — that you're a little slow at night. It isn't. HCP's chat widget is a contact form in a chat costume: no AI, no qualification, and after 5pm it stops pretending. So the LSA dollars you spend in the evening buy leads for whoever answers instead of you.

On ${x.shopName}'s volume — roughly ${x.leads} a month at a ${x.ticket} ticket — that's about ${x.monthlyLeak} a month in jobs that reached your site and never reached your board. You paid the ad cost on every one.`
    : `A pattern worth knowing about, because most owners your size read it wrong.

You'd assume the ${x.city} shops winning the bigger jobs are beating you on price or reputation. Mostly they're beating you at 11pm — AI intake answering and qualifying while you're asleep, for a fraction of what people assume, because they didn't buy an enterprise platform to get it.

On ${x.shopName}'s volume — roughly ${x.leads} a month at a ${x.ticket} ticket — the after-hours gap is about ${x.monthlyLeak} a month.`
}

Tell me which number is wrong and I'll redo the math. Fifteen minutes Thursday and I'll run it against your actual site.

— [Your Name]`,
    },
  };
}

/* ------------------------------------------------------------------ *
 * Public API
 * ------------------------------------------------------------------ */

export function buildMethodology(
  id: MethodologyId,
  shop: Shop,
  fit: FitAssessment,
  leak: LeakMath,
): MethodologyPlaybook {
  const x = buildCtx(shop, fit, leak);
  if (id === 'gap') return buildGap(x);
  if (id === 'spin') return buildSpin(x);
  return buildChallenger(x);
}

/**
 * Which framework fits this specific lead, and why.
 *
 * Deliberately opinionated — a recommendation with no reasoning is a coin flip
 * with extra steps.
 */
export function recommendFor(
  shop: Shop,
  fit: FitAssessment,
): { id: MethodologyId; reason: string } {
  if (fit.disqualified) {
    return {
      id: 'spin',
      reason:
        'Disqualified on the record — if you call at all, run two SPIN situation questions to confirm the data is right, then close it out.',
    };
  }

  const hasNumbers = shop.monthlyWebLeads != null && shop.avgTicket != null;
  const touched = Boolean(shop.lastActivityDate);

  if (fit.segment === 'no_fsm_fear_anchor') {
    return {
      id: 'challenger',
      reason:
        "Off-platform owner. They don't know the capability gap exists, so a reframe genuinely teaches — and the playbook's fear anchor is already a Challenger move. SPIN would spend the call collecting facts they can't contextualize.",
    };
  }

  if (fit.segment === 'hcp_displacement' && hasNumbers) {
    return {
      id: 'gap',
      reason:
        'HCP shop with real volume and ticket data in Close. GAP turns that into arithmetic the owner does out loud, which beats asserting the same number at them.',
    };
  }

  if (fit.segment === 'hcp_displacement' && !touched) {
    return {
      id: 'spin',
      reason:
        "First touch on an HCP shop with thin data. SPIN is the low-risk opener — the widget question is already a textbook problem question, and you'll collect the numbers GAP needs for call two.",
    };
  }

  return {
    id: 'spin',
    reason:
      'Not enough in Close to justify a quantified GAP call or a tailored Challenger reframe. Run SPIN, gather the facts, then switch frameworks once you know the volume and ticket.',
  };
}
