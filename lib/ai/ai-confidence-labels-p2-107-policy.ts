/**
 * Blueprint P2-107 — AI confidence labels (high/medium/low, Needs approval, source references).
 *
 * @see docs/ai-confidence-labels.md
 * @see app/dashboard/ai/confidence-labels/page.tsx
 */

export const AI_CONFIDENCE_LABELS_P2_107_POLICY_ID =
  "ai-confidence-labels-p2-107-v1" as const;

export const AI_CONFIDENCE_LABELS_P2_107_DOC = "docs/ai-confidence-labels.md" as const;

export const AI_CONFIDENCE_LABELS_P2_107_LEGACY_SCANNER =
  "lib/inventory/invoice-scanner-types.ts" as const;

export const AI_CONFIDENCE_LABELS_P2_107_LEGACY_HONESTY =
  "lib/ai/ai-honesty-labels.ts" as const;

export const AI_CONFIDENCE_LABELS_P2_107_LEGACY_COPILOT =
  "services/ai/copilot-service.ts" as const;

export const AI_CONFIDENCE_LABELS_P2_107_CONTENT_PATH =
  "lib/ai/ai-confidence-labels-p2-107-content.ts" as const;

export const AI_CONFIDENCE_LABELS_P2_107_OPERATIONS_PATH =
  "lib/ai/ai-confidence-labels-p2-107-operations.ts" as const;

export const AI_CONFIDENCE_LABELS_P2_107_SERVICE_PATH =
  "services/ai/ai-confidence-labels-p2-107-service.ts" as const;

export const AI_CONFIDENCE_LABELS_P2_107_COMPONENT =
  "components/ai/ai-confidence-labels-panel.tsx" as const;

export const AI_CONFIDENCE_LABELS_P2_107_PAGE =
  "app/dashboard/ai/confidence-labels/page.tsx" as const;

export const AI_CONFIDENCE_LABELS_P2_107_ROUTE = "/dashboard/ai/confidence-labels" as const;

export const AI_CONFIDENCE_LABELS_P2_107_ACTION_DRAFTS_ROUTE =
  "/dashboard/ai/action-drafts" as const;

export const AI_CONFIDENCE_LABELS_P2_107_CAPABILITY_COUNT = 3 as const;

export const AI_CONFIDENCE_LABELS_P2_107_TEST_IDS = [
  "ai-confidence-labels",
  "ai-confidence-tier",
  "ai-confidence-needs-approval",
  "ai-confidence-source-refs",
] as const;

export const AI_CONFIDENCE_LABELS_P2_107_HONESTY_MARKERS = [
  "BETA",
  "verify",
  "typical",
  "not certified",
  "directional",
] as const;

export const AI_CONFIDENCE_LABELS_P2_107_AUDIT_SCRIPT =
  "scripts/audit-ai-confidence-labels-p2-107.ts" as const;

export const AI_CONFIDENCE_LABELS_P2_107_NPM_SCRIPT = "audit:ai-confidence-labels-p2-107" as const;

export const AI_CONFIDENCE_LABELS_P2_107_UNIT_TEST =
  "tests/unit/ai-confidence-labels-p2-107.test.ts" as const;

export const AI_CONFIDENCE_LABELS_P2_107_CI_WORKFLOW =
  ".github/workflows/deploy-prod-gate.yml" as const;

export const AI_CONFIDENCE_LABELS_P2_107_WIRING_PATHS = [
  AI_CONFIDENCE_LABELS_P2_107_DOC,
  AI_CONFIDENCE_LABELS_P2_107_CONTENT_PATH,
  AI_CONFIDENCE_LABELS_P2_107_OPERATIONS_PATH,
  AI_CONFIDENCE_LABELS_P2_107_SERVICE_PATH,
  AI_CONFIDENCE_LABELS_P2_107_COMPONENT,
  AI_CONFIDENCE_LABELS_P2_107_PAGE,
  "lib/ai/ai-confidence-labels-p2-107-policy.ts",
  "lib/ai/ai-confidence-labels-p2-107-audit.ts",
  AI_CONFIDENCE_LABELS_P2_107_UNIT_TEST,
  AI_CONFIDENCE_LABELS_P2_107_LEGACY_SCANNER,
  AI_CONFIDENCE_LABELS_P2_107_LEGACY_HONESTY,
  AI_CONFIDENCE_LABELS_P2_107_LEGACY_COPILOT,
] as const;
