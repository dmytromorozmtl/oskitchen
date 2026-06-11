import type { QuizDefinition } from "@/lib/training/quiz-engine";

import {
  FORBIDDEN_CLAIMS_TRAINING_HEADLINE,
  FORBIDDEN_CLAIMS_TRAINING_PASS_PERCENT,
  FORBIDDEN_CLAIMS_TRAINING_PASS_THRESHOLD,
  FORBIDDEN_CLAIMS_TRAINING_ROUTE,
} from "@/lib/marketing/forbidden-claims-training-policy";

export const FORBIDDEN_CLAIMS_TRAINING_EYEBROW =
  "Sales & GTM · Quarterly re-certification" as const;

export const FORBIDDEN_CLAIMS_TRAINING_SUBLINE =
  "Pass ≥8/10 before customer demos. SKIPPED ≠ PASS — leave Integration Health BETA rows visible and verify claims on the release branch." as const;

/** Ten certification questions — synced with docs/forbidden-claims-training.md answer key. */
export const FORBIDDEN_CLAIMS_TRAINING_QUIZ: QuizDefinition = {
  passingScore: FORBIDDEN_CLAIMS_TRAINING_PASS_PERCENT,
  questions: [
    {
      id: "q1-doordash-skipped",
      type: "MULTIPLE_CHOICE",
      prompt:
        'A prospect asks: "Is DoorDash live?" The smoke artifact shows SKIPPED. What do you say?',
      options: [
        { id: "a", label: "Yes, we integrate with DoorDash." },
        {
          id: "b",
          label:
            "DoorDash is BETA — live ingest verified only after staging smoke PASS with your credentials.",
          correct: true,
        },
        { id: "c", label: "Same as Toast — fully live." },
      ],
      explanation: "SKIPPED ≠ PASS. Show Integration Health honestly.",
    },
    {
      id: "q2-yes-verdict",
      type: "MULTIPLE_CHOICE",
      prompt: "Which verdict allows a headline without qualification?",
      options: [
        { id: "a", label: "ONLY_WITH_CAVEAT" },
        { id: "b", label: "YES", correct: true },
        { id: "c", label: "ILLUSTRATIVE" },
      ],
      explanation: "Only YES claims may appear as headlines without caveats.",
    },
    {
      id: "q3-skipped-visible",
      type: "MULTIPLE_CHOICE",
      prompt: "Integration Health shows SKIPPED for WooCommerce. You should:",
      options: [
        { id: "a", label: "Refresh until green before sharing screen" },
        {
          id: "b",
          label: "Leave SKIPPED visible and explain what proof is missing",
          correct: true,
        },
        { id: "c", label: "Skip integrations in the demo" },
      ],
      explanation: "Honesty moat — never hide SKIPPED rows.",
    },
    {
      id: "q4-unified-inventory",
      type: "MULTIPLE_CHOICE",
      prompt: '"Unified inventory across POS and storefront" is:',
      options: [
        { id: "a", label: "YES — safe headline" },
        { id: "b", label: "FORBIDDEN — use POS-only depletion language", correct: true },
        { id: "c", label: 'OK if you add "coming soon"' },
      ],
      explanation: "Dual-ledger policy — forbidden unified inventory claim.",
    },
    {
      id: "q5-verify-claims",
      type: "MULTIPLE_CHOICE",
      prompt: "Before updating outbound email sequences, you must:",
      options: [
        { id: "a", label: "Get verbal founder approval only" },
        { id: "b", label: "Ensure verify-claims passes on the release branch", correct: true },
        { id: "c", label: "Copy competitor websites" },
      ],
      explanation: "CI gate before GTM copy changes.",
    },
    {
      id: "q6-zero-live",
      type: "MULTIPLE_CHOICE",
      prompt: "0 LIVE integrations means:",
      options: [
        { id: "a", label: 'Do not say "production-ready integrations"', correct: true },
        { id: "b", label: 'OK to say "all channels live" in enterprise decks' },
        { id: "c", label: "Hide Integration Health page" },
      ],
      explanation: "Registry honesty — no blanket LIVE claims.",
    },
    {
      id: "q7-ai-line",
      type: "MULTIPLE_CHOICE",
      prompt: "AI differentiation safe line:",
      options: [
        { id: "a", label: "Perfect predictions every shift" },
        {
          id: "b",
          label: "Seven AI modules in production — each at qualified maturity",
          correct: true,
        },
        { id: "c", label: "Untouchable moat vs Toast" },
      ],
      explanation: "Qualified AI line from sales-safe registry.",
    },
    {
      id: "q8-offline-pos",
      type: "MULTIPLE_CHOICE",
      prompt: "Offline POS claim:",
      options: [
        { id: "a", label: "Production-ready offline card payments" },
        { id: "b", label: "Offline queue preview — not rush-hour certified", correct: true },
        { id: "c", label: "Works exactly like Square offline" },
      ],
      explanation: "Offline is engineering preview only.",
    },
    {
      id: "q9-no-go",
      type: "MULTIPLE_CHOICE",
      prompt: "Pilot GO/NO-GO shows NO-GO. On a discovery call you:",
      options: [
        { id: "a", label: '"Production-ready platform"' },
        {
          id: "b",
          label: "Disclose pilot proof gaps and scope design partner program honestly",
          correct: true,
        },
        { id: "c", label: "Promise SSO by end of quarter" },
      ],
      explanation: "NO-GO honesty — no over-promise.",
    },
    {
      id: "q10-soc2",
      type: "MULTIPLE_CHOICE",
      prompt: "SOC 2 Type II in a proposal:",
      options: [
        { id: "a", label: "Allowed if customer requires it" },
        { id: "b", label: "FORBIDDEN — not certified; offer security posture doc", correct: true },
        { id: "c", label: "OK in footer only" },
      ],
      explanation: "Forbidden enterprise compliance claim.",
    },
  ],
};

export const FORBIDDEN_CLAIMS_TRAINING_CERTIFICATION_PLEDGE = [
  "Not use forbidden claims in decks, email, or live calls",
  "Leave Integration Health SKIPPED/BETA rows visible in demos",
  "Escalate unclear claims to sales-safe-claims-registry + legal",
  "Re-certify quarterly or after verify-claims failure on main",
] as const;

export {
  FORBIDDEN_CLAIMS_TRAINING_HEADLINE,
  FORBIDDEN_CLAIMS_TRAINING_PASS_THRESHOLD,
  FORBIDDEN_CLAIMS_TRAINING_ROUTE,
};
