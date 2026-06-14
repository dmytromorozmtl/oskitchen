/**
 * P1-34 — AI messaging: "AI-assisted" not "AI-powered" in marketing copy.
 *
 * @see docs/ai-messaging-p1-34.md
 */

export const AI_MESSAGING_P1_34_POLICY_ID = "ai-messaging-p1-34-v1" as const;

export const AI_MESSAGING_P1_34_DOC = "docs/ai-messaging-p1-34.md" as const;

export const AI_MESSAGING_P1_34_ARTIFACT = "artifacts/ai-messaging-p1-34.json" as const;

export const AI_MESSAGING_P1_34_AUDIT_MODULE =
  "lib/marketing/ai-messaging-p1-34-audit.ts" as const;

export const AI_MESSAGING_P1_34_CHECK_NPM_SCRIPT = "check:ai-messaging-p1-34" as const;

export const AI_MESSAGING_P1_34_CI_NPM_SCRIPT = "test:ci:ai-messaging-p1-34" as const;

export const AI_MESSAGING_P1_34_UNIT_TEST = "tests/unit/ai-messaging-p1-34.test.ts" as const;

export const AI_MESSAGING_P1_34_CI_WORKFLOW = ".github/workflows/ci.yml" as const;

/** Approved customer-facing umbrella line for AI features. */
export const AI_MESSAGING_P1_34_APPROVED_LINE =
  "AI-assisted operations — human-in-the-loop, verify before acting" as const;

/** Banned in GTM/marketing copy — implies unqualified autonomy. */
export const AI_MESSAGING_P1_34_BANNED_PHRASES = [
  "AI-powered",
  "AI powered",
  "fully AI-powered",
  "fully ai-powered",
  "AI-Powered",
] as const;

export const AI_MESSAGING_P1_34_SCAN_PATHS = [
  "lib/marketing",
  "components/marketing",
  "app/ai",
  "app/trust",
  "lib/ai/ai-honesty-labels.ts",
  "docs/ai-moats-honest-positioning.md",
  "docs/ai-honesty-policy.md",
  "marketing/forbidden-claims-training.md",
] as const;

export const AI_MESSAGING_P1_34_SCAN_EXCLUDE_FILES = [
  "lib/marketing/ai-messaging-p1-34-policy.ts",
  "lib/marketing/ai-messaging-p1-34-audit.ts",
  "tests/unit/ai-messaging-p1-34.test.ts",
  "lib/marketing/ai-moats-honest-positioning-policy.ts",
  "lib/marketing/competitive-battle-cards-policy.ts",
  "lib/marketing/objection-handling-policy.ts",
  "lib/marketing/demo-script-15min-policy.ts",
] as const;

export const AI_MESSAGING_P1_34_WIRING_PATHS = [
  AI_MESSAGING_P1_34_DOC,
  AI_MESSAGING_P1_34_AUDIT_MODULE,
  AI_MESSAGING_P1_34_UNIT_TEST,
  AI_MESSAGING_P1_34_ARTIFACT,
  AI_MESSAGING_P1_34_CI_WORKFLOW,
  "lib/marketing/forbidden-claims-cheat-sheet-content.ts",
  "components/marketing/ai-moats-honest-positioning-content.tsx",
] as const;
