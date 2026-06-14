import type { DesignPartnerEmailSequenceP258StepId } from "@/lib/marketing/design-partner-email-sequence-p2-58-policy";

export type DesignPartnerEmailSequenceP258Step = {
  id: DesignPartnerEmailSequenceP258StepId;
  stepNumber: 1 | 2 | 3 | 4 | 5;
  label: string;
  sendDayOffset: number;
  goal: string;
  primaryCta: string;
  subjectLines: readonly [string, string];
  previewText: string;
  bodyTemplate: string;
  crmStage: string;
  attachments: readonly string[];
};

export const DESIGN_PARTNER_EMAIL_SEQUENCE_P2_58_BOOK_DEMO_URL =
  "https://os-kitchen.com/book-demo?utm_source=founder_outreach&utm_medium=email&utm_campaign=dp_seq_p2_58" as const;

export const DESIGN_PARTNER_EMAIL_SEQUENCE_P2_58_DEMO_URL =
  "https://os-kitchen.com/demo?utm_source=founder_outreach&utm_medium=email&utm_campaign=dp_seq_p2_58_demo" as const;

export const DESIGN_PARTNER_EMAIL_SEQUENCE_P2_58_PRICING_URL =
  "https://os-kitchen.com/pricing?utm_source=founder_outreach&utm_medium=email&utm_campaign=dp_seq_p2_58_offer" as const;

/** Canonical 5-step founder-led design partner outbound sequence (P2-58). */
export const DESIGN_PARTNER_EMAIL_SEQUENCE_P2_58_STEPS: readonly DesignPartnerEmailSequenceP258Step[] =
  [
    {
      id: "problem",
      stepNumber: 1,
      label: "Problem",
      sendDayOffset: 0,
      goal: "Name the operator pain and invite co-build",
      primaryCta: 'Reply "interested" or book 15-min fit call',
      subjectLines: [
        "Co-build the ops layer for [SEGMENT] operators?",
        "[PAIN_HOOK] — still manual at [OPERATOR_NAME]?",
      ],
      previewText: "Small cohort · honest BETA labels · no fake LIVE badges.",
      bodyTemplate: `Hi [FIRST_NAME],

I'm [FOUNDER_NAME], founder of OS Kitchen. We built a web-based operating system for [SEGMENT] teams who outgrow copying orders between Shopify, DMs, and the kitchen whiteboard.

If [PAIN_HOOK] sounds familiar, you're exactly who we're recruiting as a **founding design partner** (≤[COHORT_SIZE] slots this quarter):

• Weekly 30–45 min feedback on order hub → production → KDS
• Honest **BETA** / **SKIPPED** labels — we show integration health truthfully
• No logo buyers — we need operators who will tell us where the workflow breaks

**Honest scope:** **0 signed founding customers today** · marketplace ingest is BETA · we do not claim LIVE marketplace ops without your credentials.

Reply "interested" or grab 15 minutes:
[BOOK_DEMO_URL]

— [FOUNDER_NAME]
Founder, OS Kitchen`,
      crmStage: "dp_seq_p2_58_problem_sent",
      attachments: [],
    },
    {
      id: "solution",
      stepNumber: 2,
      label: "Solution",
      sendDayOffset: 3,
      goal: "Explain how OS Kitchen solves the pain — with limits",
      primaryCta: "Reply with top 2 workflow pain points",
      subjectLines: [
        "Re: Co-build the ops layer for [SEGMENT] operators?",
        "What OS Kitchen actually includes (honest scope)",
      ],
      previewText: "Order hub → KDS → production — with BETA labels spelled out.",
      bodyTemplate: `Hi [FIRST_NAME],

Following up in case timing was off — here's how we solve [PAIN_HOOK] without overselling:

**One spine:** webhook / storefront order → order hub → KitchenTask on KDS → production list → packing verification.

**Today Command Center** at /dashboard/today — daily briefing from your real hub signals (AI-assisted, not magic AGI).

**Integrations:** WooCommerce and Shopify paths are **BETA** when you configure credentials. DoorDash / Uber Eats / Grubhub are partner-gated — Integration Health Center shows PASS, SKIPPED, or FAILED — not a blanket green badge.

**What we won't claim:** Toast-class hardware bundles · offline POS as a sales guarantee · SOC 2 Type II in the pilot term · customer logos we don't have.

If this matches how [OPERATOR_NAME] runs ops, reply with your top 2 pain points — I'll tell you honestly if we're the wrong tool.

— [FOUNDER_NAME]`,
      crmStage: "dp_seq_p2_58_solution_sent",
      attachments: [],
    },
    {
      id: "demo",
      stepNumber: 3,
      label: "Demo",
      sendDayOffset: 6,
      goal: "Drive interactive demo or live fit call",
      primaryCta: "Book demo or try interactive sandbox",
      subjectLines: [
        "15-min walkthrough — order hub to KDS bump",
        "Try the interactive demo before a call?",
      ],
      previewText: "Live sandbox with test credentials · no production traffic required.",
      bodyTemplate: `Hi [FIRST_NAME],

Quick demo invite — two options, zero pressure:

**Option A — 15-min fit call:** I'll walk your [SEGMENT] workflow on a staging workspace and show where order hub, production, and Today Command Center connect.
[BOOK_DEMO_URL]

**Option B — self-serve sandbox:** Interactive demo with test credentials and honest integration labels (no fake LIVE tiles):
[DEMO_URL]

We'll never ask you to bet rush hour on unproven webhooks — staging first, LOI before production traffic.

— [FOUNDER_NAME]`,
      crmStage: "dp_seq_p2_58_demo_sent",
      attachments: [],
    },
    {
      id: "offer",
      stepNumber: 4,
      label: "Offer",
      sendDayOffset: 9,
      goal: "Present Design Partner Program offer + LOI path",
      primaryCta: "Review LOI + Design Partner Program (90 days free)",
      subjectLines: [
        "Design Partner Program — 90 days free platform",
        "LOI outline for [OPERATOR_NAME]",
      ],
      previewText: "$0 platform / 90 days · weekly sync · optional pilot credit.",
      bodyTemplate: `Hi [FIRST_NAME],

If the demo resonated, here's the formal offer:

**Design Partner Program — free for 90 days**
• $0 platform fee during evaluation ([PRICING_URL])
• Dedicated staging workspace + weekly founder sync
• Prioritized roadmap input on order hub, production, and integration health
• Optional pilot credit toward year-1 subscription after successful evaluation

**Next step:** non-binding LOI (3-month default, weekly sync). Template attached for legal review — countersigned copy before we provision staging or accept production traffic.

Book a fit call to walk through the LOI:
[BOOK_DEMO_URL]

Honest limits: BETA integrations stay labeled BETA · **0 signed founding customers today** · no revenue or margin guarantees.

— [FOUNDER_NAME]

Attachment: LOI from docs/loi-design-partner-template.md (legal-approved PDF only)`,
      crmStage: "dp_seq_p2_58_offer_sent",
      attachments: ["docs/loi-design-partner-template.md"],
    },
    {
      id: "follow_up",
      stepNumber: 5,
      label: "Follow-up",
      sendDayOffset: 14,
      goal: "Respectful close — cohort scarcity + opt-out",
      primaryCta: 'Reply "later", "pass", or book final fit call',
      subjectLines: [
        "Last note — [COHORT_SIZE] design partner slots",
        "Close the loop?",
      ],
      previewText: "Happy to pause outreach — or one call before we fill the cohort.",
      bodyTemplate: `Hi [FIRST_NAME],

Last email from me on this thread.

We're keeping the design partner cohort small ([COHORT_SIZE] operators) so feedback actually shapes the product. Two slots are in conversation; checking once more with [SEGMENT] operators running [PAIN_HOOK].

**If yes:** 15-minute fit call → LOI → staging workspace → golden path before production traffic.
[BOOK_DEMO_URL]

**If not now:** reply "later" or "pass" — I'll stop the sequence.

**If wrong tool:** we likely aren't a fit if you need proprietary POS hardware, offline mode as a guarantee, or production SSO in the pilot term.

Either way — thanks for reading. Building in public with honest labels beats fake LIVE badges.

— [FOUNDER_NAME]

Unsubscribe: [UNSUBSCRIBE_URL]`,
      crmStage: "dp_seq_p2_58_follow_up_sent",
      attachments: [],
    },
  ] as const;

export function getDesignPartnerEmailSequenceP258Step(
  id: DesignPartnerEmailSequenceP258StepId,
): DesignPartnerEmailSequenceP258Step {
  const step = DESIGN_PARTNER_EMAIL_SEQUENCE_P2_58_STEPS.find((row) => row.id === id);
  if (!step) {
    throw new Error(`Unknown design partner email sequence step: ${id}`);
  }
  return step;
}

export function renderDesignPartnerEmailBody(
  template: string,
  tokens: Record<string, string>,
): string {
  return Object.entries(tokens).reduce(
    (body, [key, value]) => body.replaceAll(`[${key}]`, value),
    template,
  );
}
