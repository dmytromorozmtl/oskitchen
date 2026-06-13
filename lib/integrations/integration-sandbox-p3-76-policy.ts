/**
 * Blueprint P3-76 — Integration sandbox mode (test credentials 18 LIVE).
 *
 * @see docs/integration-sandbox-p3-76.md
 */

import {
  INTEGRATION_SANDBOX_CHECK_SCRIPT,
  INTEGRATION_SANDBOX_EXAMPLE_FILE,
  INTEGRATION_SANDBOX_EXPECTED_COUNT,
  INTEGRATION_SANDBOX_POLICY_ID,
} from "@/lib/integrations/integration-sandbox-policy";

export const INTEGRATION_SANDBOX_P3_76_POLICY_ID = "integration-sandbox-p3-76-v1" as const;

export const INTEGRATION_SANDBOX_P3_76_DOC = "docs/integration-sandbox-p3-76.md" as const;

export const INTEGRATION_SANDBOX_P3_76_ARTIFACT =
  "artifacts/integration-sandbox-p3-76-registry.json" as const;

export const INTEGRATION_SANDBOX_P3_76_AUDIT_SCRIPT =
  "scripts/audit-integration-sandbox-p3-76.ts" as const;

export const INTEGRATION_SANDBOX_P3_76_NPM_SCRIPT = "audit:integration-sandbox-p3-76" as const;

export const INTEGRATION_SANDBOX_P3_76_CHECK_NPM_SCRIPT =
  "check:integration-sandbox-p3-76" as const;

export const INTEGRATION_SANDBOX_P3_76_UNIT_TEST =
  "tests/unit/integration-sandbox-p3-76.test.ts" as const;

export const INTEGRATION_SANDBOX_P3_76_UPSTREAM_POLICY_ID = INTEGRATION_SANDBOX_POLICY_ID;

export const INTEGRATION_SANDBOX_P3_76_UPSTREAM_TEST = "tests/unit/integration-sandbox.test.ts" as const;

export const INTEGRATION_SANDBOX_P3_76_MODE_PANEL =
  "components/integrations/integration-sandbox-mode-panel.tsx" as const;

export const INTEGRATION_SANDBOX_P3_76_SNAPSHOT =
  "lib/integrations/integration-sandbox-mode-snapshot.ts" as const;

export const INTEGRATION_SANDBOX_P3_76_HEALTH_PAGE =
  "app/dashboard/integrations/health/page.tsx" as const;

export const INTEGRATION_SANDBOX_P3_76_NPM_SCRIPTS = [
  "test:ci:integration-sandbox",
  "test:ci:integration-sandbox-p3-76:cert",
  "check:integration-sandbox",
] as const;

export const INTEGRATION_SANDBOX_P3_76_WIRING_PATHS = [
  INTEGRATION_SANDBOX_P3_76_DOC,
  INTEGRATION_SANDBOX_EXAMPLE_FILE,
  INTEGRATION_SANDBOX_CHECK_SCRIPT,
  "lib/integrations/integration-sandbox-service.ts",
  "lib/integrations/integration-sandbox-policy.ts",
  INTEGRATION_SANDBOX_P3_76_SNAPSHOT,
  INTEGRATION_SANDBOX_P3_76_MODE_PANEL,
  INTEGRATION_SANDBOX_P3_76_HEALTH_PAGE,
  "lib/integrations/integration-sandbox-p3-76-measurement.ts",
  "lib/integrations/integration-sandbox-p3-76-audit.ts",
  INTEGRATION_SANDBOX_P3_76_UNIT_TEST,
  INTEGRATION_SANDBOX_P3_76_UPSTREAM_TEST,
  INTEGRATION_SANDBOX_P3_76_ARTIFACT,
] as const;

export const INTEGRATION_SANDBOX_P3_76_LIVE_COUNT = INTEGRATION_SANDBOX_EXPECTED_COUNT;
