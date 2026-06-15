/**
 * Blueprint P2-91 — Bump/recall audit (who bumped, station time, late tickets, remake reason).
 *
 * @see docs/bump-recall-audit.md
 * @see app/dashboard/kitchen/bump-recall-audit/page.tsx
 */

export const BUMP_RECALL_AUDIT_POLICY_ID = "bump-recall-audit-p2-91-v1" as const;

export const BUMP_RECALL_AUDIT_DOC = "docs/bump-recall-audit.md" as const;

export const BUMP_RECALL_AUDIT_CONTENT_PATH =
  "lib/kitchen/bump-recall-audit-p2-91-content.ts" as const;

export const BUMP_RECALL_AUDIT_OPERATIONS_PATH =
  "lib/kitchen/bump-recall-audit-p2-91-operations.ts" as const;

export const BUMP_RECALL_AUDIT_SERVICE_PATH =
  "services/kitchen/bump-recall-audit-p2-91-service.ts" as const;

export const BUMP_RECALL_AUDIT_COMPONENT =
  "components/kitchen/bump-recall-audit-panel.tsx" as const;

export const BUMP_RECALL_AUDIT_PAGE = "app/dashboard/kitchen/bump-recall-audit/page.tsx" as const;

export const BUMP_RECALL_AUDIT_ROUTE = "/dashboard/kitchen/bump-recall-audit" as const;

export const BUMP_RECALL_AUDIT_DIMENSION_COUNT = 4 as const;

export const BUMP_RECALL_AUDIT_TEST_IDS = [
  "bump-recall-audit",
  "bump-recall-who-bumped",
  "bump-recall-station-time",
  "bump-recall-late-tickets",
  "bump-recall-remake-reason",
] as const;

export const BUMP_RECALL_AUDIT_HONESTY_MARKERS = [
  "BETA",
  "verify",
  "typical",
  "audit",
  "not certified",
] as const;

export const BUMP_RECALL_AUDIT_AUDIT_SCRIPT = "scripts/audit-bump-recall-audit.ts" as const;

export const BUMP_RECALL_AUDIT_NPM_SCRIPT = "audit:bump-recall-audit" as const;

export const BUMP_RECALL_AUDIT_UNIT_TEST = "tests/unit/bump-recall-audit.test.ts" as const;

export const BUMP_RECALL_AUDIT_CI_WORKFLOW = ".github/workflows/deploy-prod-gate.yml" as const;

export const BUMP_RECALL_AUDIT_WIRING_PATHS = [
  BUMP_RECALL_AUDIT_DOC,
  BUMP_RECALL_AUDIT_CONTENT_PATH,
  BUMP_RECALL_AUDIT_OPERATIONS_PATH,
  BUMP_RECALL_AUDIT_SERVICE_PATH,
  BUMP_RECALL_AUDIT_COMPONENT,
  BUMP_RECALL_AUDIT_PAGE,
  "lib/kitchen/bump-recall-audit-p2-91-policy.ts",
  "lib/kitchen/bump-recall-audit-p2-91-audit.ts",
  "actions/kitchen-daily-kds.ts",
  "services/kitchen/kitchen-permission-audit.ts",
  BUMP_RECALL_AUDIT_UNIT_TEST,
] as const;
