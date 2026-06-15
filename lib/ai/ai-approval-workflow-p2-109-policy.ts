/**
 * Blueprint P2-109 — AI approval workflow (suggest → approve → execute → audit log).
 *
 * @see docs/ai-approval-workflow.md
 * @see app/dashboard/ai/approval-workflow/page.tsx
 */

export const AI_APPROVAL_WORKFLOW_P2_109_POLICY_ID = "ai-approval-workflow-p2-109-v1" as const;

export const AI_APPROVAL_WORKFLOW_P2_109_DOC = "docs/ai-approval-workflow.md" as const;

export const AI_APPROVAL_WORKFLOW_P2_109_LEGACY_COPILOT =
  "services/ai/copilot-service.ts" as const;

export const AI_APPROVAL_WORKFLOW_P2_109_LEGACY_CO_PILOT =
  "services/ai/co-pilot-service.ts" as const;

export const AI_APPROVAL_WORKFLOW_P2_109_LEGACY_ACTIONS =
  "actions/copilot.ts" as const;

export const AI_APPROVAL_WORKFLOW_P2_109_LEGACY_DRAFTS =
  "lib/ai/ai-action-drafts-p2-106-operations.ts" as const;

export const AI_APPROVAL_WORKFLOW_P2_109_CONTENT_PATH =
  "lib/ai/ai-approval-workflow-p2-109-content.ts" as const;

export const AI_APPROVAL_WORKFLOW_P2_109_OPERATIONS_PATH =
  "lib/ai/ai-approval-workflow-p2-109-operations.ts" as const;

export const AI_APPROVAL_WORKFLOW_P2_109_SERVICE_PATH =
  "services/ai/ai-approval-workflow-p2-109-service.ts" as const;

export const AI_APPROVAL_WORKFLOW_P2_109_COMPONENT =
  "components/ai/ai-approval-workflow-panel.tsx" as const;

export const AI_APPROVAL_WORKFLOW_P2_109_PAGE =
  "app/dashboard/ai/approval-workflow/page.tsx" as const;

export const AI_APPROVAL_WORKFLOW_P2_109_ROUTE = "/dashboard/ai/approval-workflow" as const;

export const AI_APPROVAL_WORKFLOW_P2_109_ACTION_DRAFTS_ROUTE =
  "/dashboard/ai/action-drafts" as const;

export const AI_APPROVAL_WORKFLOW_P2_109_COPILOT_DRAFTS_ROUTE =
  "/dashboard/copilot/drafts" as const;

export const AI_APPROVAL_WORKFLOW_P2_109_STAGE_COUNT = 4 as const;

export const AI_APPROVAL_WORKFLOW_P2_109_TEST_IDS = [
  "ai-approval-workflow",
  "ai-approval-suggest",
  "ai-approval-approve",
  "ai-approval-execute",
  "ai-approval-audit-log",
] as const;

export const AI_APPROVAL_WORKFLOW_P2_109_HONESTY_MARKERS = [
  "BETA",
  "verify",
  "typical",
  "not certified",
  "directional",
] as const;

export const AI_APPROVAL_WORKFLOW_P2_109_AUDIT_SCRIPT =
  "scripts/audit-ai-approval-workflow-p2-109.ts" as const;

export const AI_APPROVAL_WORKFLOW_P2_109_NPM_SCRIPT = "audit:ai-approval-workflow-p2-109" as const;

export const AI_APPROVAL_WORKFLOW_P2_109_UNIT_TEST =
  "tests/unit/ai-approval-workflow-p2-109.test.ts" as const;

export const AI_APPROVAL_WORKFLOW_P2_109_CI_WORKFLOW =
  ".github/workflows/deploy-prod-gate.yml" as const;

export const AI_APPROVAL_WORKFLOW_P2_109_WIRING_PATHS = [
  AI_APPROVAL_WORKFLOW_P2_109_DOC,
  AI_APPROVAL_WORKFLOW_P2_109_CONTENT_PATH,
  AI_APPROVAL_WORKFLOW_P2_109_OPERATIONS_PATH,
  AI_APPROVAL_WORKFLOW_P2_109_SERVICE_PATH,
  AI_APPROVAL_WORKFLOW_P2_109_COMPONENT,
  AI_APPROVAL_WORKFLOW_P2_109_PAGE,
  "lib/ai/ai-approval-workflow-p2-109-policy.ts",
  "lib/ai/ai-approval-workflow-p2-109-audit.ts",
  AI_APPROVAL_WORKFLOW_P2_109_UNIT_TEST,
  AI_APPROVAL_WORKFLOW_P2_109_LEGACY_COPILOT,
  AI_APPROVAL_WORKFLOW_P2_109_LEGACY_CO_PILOT,
  AI_APPROVAL_WORKFLOW_P2_109_LEGACY_ACTIONS,
  AI_APPROVAL_WORKFLOW_P2_109_LEGACY_DRAFTS,
] as const;
