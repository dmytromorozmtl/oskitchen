/**
 * P1-26 — SOC 2 messaging: in progress with Q target, not certified.
 *
 * @see docs/soc2-messaging-p1-26.md
 */

export const SOC2_MESSAGING_P1_26_POLICY_ID = "soc2-messaging-p1-26-v1" as const;

export const SOC2_MESSAGING_P1_26_DOC = "docs/soc2-messaging-p1-26.md" as const;

export const SOC2_MESSAGING_P1_26_ARTIFACT = "artifacts/soc2-messaging-p1-26.json" as const;

export const SOC2_MESSAGING_P1_26_AUDIT_MODULE =
  "lib/marketing/soc2-messaging-p1-26-audit.ts" as const;

export const SOC2_MESSAGING_P1_26_CHECK_NPM_SCRIPT = "check:soc2-messaging-p1-26" as const;

export const SOC2_MESSAGING_P1_26_CI_NPM_SCRIPT = "test:ci:soc2-messaging-p1-26" as const;

export const SOC2_MESSAGING_P1_26_UNIT_TEST = "tests/unit/soc2-messaging-p1-26.test.ts" as const;

export const SOC2_MESSAGING_P1_26_CI_WORKFLOW = ".github/workflows/ci.yml" as const;

/** Approved customer-facing line — SOC 2 Type I roadmap, not attestation. */
export const SOC2_MESSAGING_P1_26_APPROVED_LINE =
  "SOC 2 in progress — Type I target Q4 2026 (not certified)" as const;

/** Banned in GTM/marketing copy — implies certification we do not hold. */
export const SOC2_MESSAGING_P1_26_BANNED_PHRASES = [
  "SOC 2 compliant",
  "SOC2 compliant",
  "SOC 2 certified",
  "SOC2 certified",
  "SOC 2 ready",
  "SOC2 ready",
  "SOC 2 Type II certified",
  "SOC2 Type II certified",
] as const;

export const SOC2_MESSAGING_P1_26_SCAN_PATHS = [
  "lib/marketing",
  "components/marketing",
  "app/trust",
  "docs/TRUST_CENTER_COPY.md",
  "docs/security-one-pager-sales.md",
  "docs/SOC2_ROADMAP_Q4.md",
  "docs/soc2-roadmap-with-timeline.md",
  "marketing/forbidden-claims-training.md",
] as const;

export const SOC2_MESSAGING_P1_26_SCAN_EXCLUDE_FILES = [
  "lib/marketing/soc2-messaging-p1-26-policy.ts",
  "tests/unit/soc2-messaging-p1-26.test.ts",
  "lib/marketing/seo-10-icp-keywords-policy.ts",
  "lib/marketing/competitive-battle-cards-policy.ts",
  "lib/marketing/toast-gap-analysis-public-summary-policy.ts",
  "lib/marketing/press-release-first-design-partner-policy.ts",
  "lib/marketing/loi-template-walkthrough-policy.ts",
  "lib/marketing/pilot-proposal-template-policy.ts",
  "lib/marketing/objection-handling-policy.ts",
  "lib/marketing/demo-script-15min-policy.ts",
  "lib/marketing/discovery-call-script-policy.ts",
  "lib/marketing/email-nurture-5-sequence-policy.ts",
  "lib/marketing/webinar-ghost-kitchens-policy.ts",
  "lib/marketing/analyst-briefing-deck-policy.ts",
] as const;

export const SOC2_MESSAGING_P1_26_WIRING_PATHS = [
  SOC2_MESSAGING_P1_26_DOC,
  SOC2_MESSAGING_P1_26_AUDIT_MODULE,
  SOC2_MESSAGING_P1_26_UNIT_TEST,
  SOC2_MESSAGING_P1_26_ARTIFACT,
  SOC2_MESSAGING_P1_26_CI_WORKFLOW,
  "lib/marketing/forbidden-claims-cheat-sheet-content.ts",
  "docs/TRUST_CENTER_COPY.md",
] as const;
