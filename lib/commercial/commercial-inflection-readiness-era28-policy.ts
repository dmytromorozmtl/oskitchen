/**
 * Commercial inflection readiness — policy wiring (market vs governance split).
 */

import {
  COMMERCIAL_INFLECTION_MASTER_MATRIX_DOC,
  COMMERCIAL_INFLECTION_READINESS_POLICY_ID,
  COMMERCIAL_INFLECTION_READINESS_REPORT_PATH,
} from "@/lib/commercial/commercial-inflection-readiness-era28";

export { COMMERCIAL_INFLECTION_MASTER_MATRIX_DOC, COMMERCIAL_INFLECTION_READINESS_REPORT_PATH };

export const COMMERCIAL_INFLECTION_READINESS_ERA28_BACKLOG_ID = "KOS-INFLECTION-001" as const;

export const COMMERCIAL_INFLECTION_READINESS_ERA28_EXTENDS_POLICIES = [
  "era21-p0-ops-vault-v1",
  "era17-p0-staging-proof-unblock-v1",
  "era20-tier2-staging-golden-path-v1",
  "era17-pilot-gono-go-v1",
  "commercial-inflection-readiness-post-linear-closure-orchestrator-v1",
] as const;

export const COMMERCIAL_INFLECTION_READINESS_ERA28_OPS_SCRIPTS = [
  "ops:validate-commercial-inflection-readiness",
  "ops:run-commercial-inflection-readiness-orchestrator",
  "ops:sync-commercial-inflection-readiness-report",
] as const;

export const COMMERCIAL_INFLECTION_READINESS_ERA28_CI_SCRIPTS = [
  "test:ci:commercial-inflection-readiness",
  "test:ci:commercial-inflection-readiness:cert",
] as const;

export const COMMERCIAL_INFLECTION_READINESS_ERA28_UNIT_TESTS = [
  "tests/unit/commercial-inflection-readiness-era28.test.ts",
  "tests/unit/commercial-inflection-readiness-orchestrator-era28.test.ts",
  "tests/unit/run-commercial-inflection-readiness-orchestrator.test.ts",
  "tests/unit/validate-commercial-inflection-readiness.test.ts",
  "tests/unit/commercial-inflection-readiness-ui-era28.test.ts",
  "tests/unit/owner-daily-briefing-commercial-inflection-era28.test.ts",
  "tests/unit/integration-health-commercial-inflection-era28.test.ts",
  "tests/unit/pilot-integration-health-commercial-inflection-era28.test.ts",
  "tests/unit/commercial-inflection-readiness-era28-cert-live.test.ts",
] as const;

export const COMMERCIAL_INFLECTION_READINESS_ERA28_PRODUCT_SURFACES = [
  "components/platform/commercial-inflection-readiness-panel.tsx",
  "components/platform/commercial-pilot-ops-status-panel.tsx",
  "components/dashboard/commercial-inflection-today-strip.tsx",
  "components/dashboard/integration-health-commercial-inflection-banner.tsx",
  "components/dashboard/owner-daily-briefing-hero.tsx",
  "components/dashboard/pilot-integration-health-strip.tsx",
  "app/dashboard/today/page.tsx",
  "app/dashboard/integration-health/page.tsx",
  "docs/commercial-inflection-master-blocker-matrix-2026-05-28.md",
  "docs/next-step-commercial-inflection-execution-2026-05-28.md",
  "docs/p0-ops-vault-execution-playbook-2026-05-28.md",
  "docs/next-step-p0-ops-vault-phase-a-product-2026-05-28.md",
] as const;

export { COMMERCIAL_INFLECTION_READINESS_POLICY_ID };
