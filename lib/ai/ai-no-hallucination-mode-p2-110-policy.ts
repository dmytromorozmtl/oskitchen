/**
 * Blueprint P2-110 — AI no hallucination mode (tenant data only, source-backed, no unsupported claims).
 *
 * @see docs/ai-no-hallucination-mode.md
 * @see app/dashboard/ai/no-hallucination-mode/page.tsx
 */

export const AI_NO_HALLUCINATION_MODE_P2_110_POLICY_ID =
  "ai-no-hallucination-mode-p2-110-v1" as const;

export const AI_NO_HALLUCINATION_MODE_P2_110_DOC = "docs/ai-no-hallucination-mode.md" as const;

export const AI_NO_HALLUCINATION_MODE_P2_110_LEGACY_HONESTY =
  "lib/ai/ai-honesty-labels.ts" as const;

export const AI_NO_HALLUCINATION_MODE_P2_110_LEGACY_GUARDRAILS =
  "lib/ai/copilot-guardrails.ts" as const;

export const AI_NO_HALLUCINATION_MODE_P2_110_LEGACY_COPILOT =
  "services/ai/copilot-service.ts" as const;

export const AI_NO_HALLUCINATION_MODE_P2_110_LEGACY_CONFIDENCE =
  "lib/ai/ai-confidence-labels-p2-107-operations.ts" as const;

export const AI_NO_HALLUCINATION_MODE_P2_110_CONTENT_PATH =
  "lib/ai/ai-no-hallucination-mode-p2-110-content.ts" as const;

export const AI_NO_HALLUCINATION_MODE_P2_110_OPERATIONS_PATH =
  "lib/ai/ai-no-hallucination-mode-p2-110-operations.ts" as const;

export const AI_NO_HALLUCINATION_MODE_P2_110_SERVICE_PATH =
  "services/ai/ai-no-hallucination-mode-p2-110-service.ts" as const;

export const AI_NO_HALLUCINATION_MODE_P2_110_COMPONENT =
  "components/ai/ai-no-hallucination-mode-panel.tsx" as const;

export const AI_NO_HALLUCINATION_MODE_P2_110_PAGE =
  "app/dashboard/ai/no-hallucination-mode/page.tsx" as const;

export const AI_NO_HALLUCINATION_MODE_P2_110_ROUTE =
  "/dashboard/ai/no-hallucination-mode" as const;

export const AI_NO_HALLUCINATION_MODE_P2_110_APPROVAL_ROUTE =
  "/dashboard/ai/approval-workflow" as const;

export const AI_NO_HALLUCINATION_MODE_P2_110_CAPABILITY_COUNT = 3 as const;

export const AI_NO_HALLUCINATION_MODE_P2_110_TEST_IDS = [
  "ai-no-hallucination-mode",
  "ai-no-hallucination-tenant-data",
  "ai-no-hallucination-source-backed",
  "ai-no-hallucination-unsupported-claims",
] as const;

export const AI_NO_HALLUCINATION_MODE_P2_110_HONESTY_MARKERS = [
  "BETA",
  "verify",
  "typical",
  "not certified",
  "directional",
] as const;

export const AI_NO_HALLUCINATION_MODE_P2_110_AUDIT_SCRIPT =
  "scripts/audit-ai-no-hallucination-mode-p2-110.ts" as const;

export const AI_NO_HALLUCINATION_MODE_P2_110_NPM_SCRIPT =
  "audit:ai-no-hallucination-mode-p2-110" as const;

export const AI_NO_HALLUCINATION_MODE_P2_110_UNIT_TEST =
  "tests/unit/ai-no-hallucination-mode-p2-110.test.ts" as const;

export const AI_NO_HALLUCINATION_MODE_P2_110_CI_WORKFLOW =
  ".github/workflows/deploy-prod-gate.yml" as const;

export const AI_NO_HALLUCINATION_MODE_P2_110_WIRING_PATHS = [
  AI_NO_HALLUCINATION_MODE_P2_110_DOC,
  AI_NO_HALLUCINATION_MODE_P2_110_CONTENT_PATH,
  AI_NO_HALLUCINATION_MODE_P2_110_OPERATIONS_PATH,
  AI_NO_HALLUCINATION_MODE_P2_110_SERVICE_PATH,
  AI_NO_HALLUCINATION_MODE_P2_110_COMPONENT,
  AI_NO_HALLUCINATION_MODE_P2_110_PAGE,
  "lib/ai/ai-no-hallucination-mode-p2-110-policy.ts",
  "lib/ai/ai-no-hallucination-mode-p2-110-audit.ts",
  AI_NO_HALLUCINATION_MODE_P2_110_UNIT_TEST,
  AI_NO_HALLUCINATION_MODE_P2_110_LEGACY_HONESTY,
  AI_NO_HALLUCINATION_MODE_P2_110_LEGACY_GUARDRAILS,
  AI_NO_HALLUCINATION_MODE_P2_110_LEGACY_COPILOT,
  AI_NO_HALLUCINATION_MODE_P2_110_LEGACY_CONFIDENCE,
] as const;
