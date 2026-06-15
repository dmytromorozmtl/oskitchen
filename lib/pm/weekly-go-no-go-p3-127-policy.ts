/**
 * Blueprint P3-127 — Weekly GO/NO-GO log (Sentry, authed RSC, maintenance, pipeline).
 *
 * @see docs/weekly-go-no-go-log.md
 */

export const WEEKLY_GO_NO_GO_POLICY_ID = "weekly-go-no-go-p3-127-v1" as const;

export const WEEKLY_GO_NO_GO_DOC = "docs/weekly-go-no-go-log.md" as const;

export const WEEKLY_GO_NO_GO_LOG_ARTIFACT = "artifacts/weekly-go-no-go-log.json" as const;

export const WEEKLY_GO_NO_GO_AUDIT_SCRIPT =
  "scripts/audit-weekly-go-no-go-p3-127.ts" as const;

export const WEEKLY_GO_NO_GO_NPM_SCRIPT = "audit:weekly-go-no-go-p3-127" as const;

export const WEEKLY_GO_NO_GO_UNIT_TEST = "tests/unit/weekly-go-no-go-p3-127.test.ts" as const;

export const WEEKLY_GO_NO_GO_CI_WORKFLOW = ".github/workflows/deploy-prod-gate.yml" as const;

export const WEEKLY_GO_NO_GO_DECISIONS = ["GO", "NO-GO", "PARTIAL"] as const;

export type WeeklyGoNoGoDecision = (typeof WEEKLY_GO_NO_GO_DECISIONS)[number];

export const WEEKLY_GO_NO_GO_GATE_STATUSES = ["pass", "fail", "skipped", "unknown"] as const;

export type WeeklyGoNoGoGateStatus = (typeof WEEKLY_GO_NO_GO_GATE_STATUSES)[number];

export const WEEKLY_GO_NO_GO_GATES = [
  {
    id: "sentry",
    label: "Sentry production observability",
    verifyScript: "scripts/verify-sentry-production-health.ts",
    npmScript: "sentry:production:verify",
    healthEndpoint: "https://os-kitchen.com/api/health",
    healthCheckKey: "sentryServer",
  },
  {
    id: "authed_rsc",
    label: "Authed dashboard RSC smoke",
    probeScript: "scripts/probe-authed-dashboard.ts",
    npmScript: "smoke:rsc-authed-dashboard",
    workflow: ".github/workflows/rsc-smoke.yml",
    routeCount: 46,
  },
  {
    id: "maintenance",
    label: "Maintenance mode integrity",
    validateScript: "scripts/ops/validate-maintenance-mode.ts",
    npmScript: "ops:validate-maintenance-mode",
  },
  {
    id: "pipeline",
    label: "LOI + pilot GO/NO-GO pipeline",
    loiPipelineDoc: "docs/loi-pipeline.md",
    shortlistArtifact: "artifacts/loi-pipeline-shortlist.json",
    gonoGoArtifact: "artifacts/pilot-gono-go-summary.json",
  },
] as const;

export type WeeklyGoNoGoGateId = (typeof WEEKLY_GO_NO_GO_GATES)[number]["id"];

export const WEEKLY_GO_NO_GO_RELATED_PATHS = [
  "scripts/verify-sentry-production-health.ts",
  "scripts/probe-authed-dashboard.ts",
  ".github/workflows/rsc-smoke.yml",
  "scripts/ops/validate-maintenance-mode.ts",
  "docs/loi-pipeline.md",
  "artifacts/loi-pipeline-shortlist.json",
  "artifacts/pilot-gono-go-summary.json",
] as const;

export const WEEKLY_GO_NO_GO_HONESTY_MARKERS = [
  "NO-GO",
  "BETA",
  "0 signed LOIs",
  "weekly review",
  "not production-ready",
] as const;

export const WEEKLY_GO_NO_GO_WIRING_PATHS = [
  WEEKLY_GO_NO_GO_DOC,
  "lib/pm/weekly-go-no-go-p3-127-policy.ts",
  "lib/pm/weekly-go-no-go-p3-127-operations.ts",
  "lib/pm/weekly-go-no-go-p3-127-audit.ts",
  WEEKLY_GO_NO_GO_LOG_ARTIFACT,
  WEEKLY_GO_NO_GO_UNIT_TEST,
] as const;
