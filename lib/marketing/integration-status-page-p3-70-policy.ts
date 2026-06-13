/**
 * Blueprint P3-70 — Integration status page /status.
 *
 * @see app/status/page.tsx
 * @see docs/integration-status-page-p3-70.md
 */

import {
  INTEGRATION_STATUS_PAGE_META,
  INTEGRATION_STATUS_PAGE_PATH,
} from "@/lib/marketing/integration-status-page-content";

export const INTEGRATION_STATUS_PAGE_P3_70_POLICY_ID = "integration-status-page-p3-70-v1" as const;

export const INTEGRATION_STATUS_PAGE_P3_70_DOC = "docs/integration-status-page-p3-70.md" as const;

export const INTEGRATION_STATUS_PAGE_P3_70_ARTIFACT =
  "artifacts/integration-status-page-p3-70-registry.json" as const;

export const INTEGRATION_STATUS_PAGE_P3_70_AUDIT_SCRIPT =
  "scripts/audit-integration-status-page-p3-70.ts" as const;

export const INTEGRATION_STATUS_PAGE_P3_70_NPM_SCRIPT = "audit:integration-status-page-p3-70" as const;

export const INTEGRATION_STATUS_PAGE_P3_70_CHECK_NPM_SCRIPT =
  "check:integration-status-page-p3-70" as const;

export const INTEGRATION_STATUS_PAGE_P3_70_UNIT_TEST =
  "tests/unit/integration-status-page-p3-70.test.ts" as const;

export const INTEGRATION_STATUS_PAGE_P3_70_CANONICAL_PATH = INTEGRATION_STATUS_PAGE_PATH;

export const INTEGRATION_STATUS_PAGE_P3_70_PRIMARY_KEYWORD = "integration status" as const;

export const INTEGRATION_STATUS_PAGE_P3_70_NPM_SCRIPTS = [
  "test:ci:integration-status-page",
  "test:ci:integration-status-page:cert",
] as const;

export const INTEGRATION_STATUS_PAGE_P3_70_WIRING_PATHS = [
  INTEGRATION_STATUS_PAGE_P3_70_DOC,
  "app/status/page.tsx",
  "components/marketing/integration-status-fleet-panel.tsx",
  "lib/marketing/integration-status-page-content.ts",
  "lib/marketing/integration-status-page-data.ts",
  "lib/marketing/integration-status-page-audit.ts",
  "lib/marketing/integration-status-page-p3-70-measurement.ts",
  "lib/marketing/integration-status-page-p3-70-audit.ts",
  INTEGRATION_STATUS_PAGE_P3_70_UNIT_TEST,
  INTEGRATION_STATUS_PAGE_P3_70_ARTIFACT,
  "artifacts/live-integrations-staging-smoke-summary.json",
  "docs/INTEGRATION_LAUNCH_STATUS.md",
] as const;

export function integrationStatusPagePathsAligned(): boolean {
  return (
    INTEGRATION_STATUS_PAGE_PATH === INTEGRATION_STATUS_PAGE_P3_70_CANONICAL_PATH &&
    INTEGRATION_STATUS_PAGE_META.utmCampaign === "integration_status_seo"
  );
}
