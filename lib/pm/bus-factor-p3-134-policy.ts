/**
 * Blueprint P3-134 — Bus factor mitigation (10 ADR videos + emergency access).
 *
 * @see docs/bus-factor-mitigation-pm.md
 */

export const BUS_FACTOR_P3_134_POLICY_ID = "bus-factor-p3-134-v1" as const;

export const BUS_FACTOR_P3_134_DOC = "docs/bus-factor-mitigation-pm.md" as const;

export const BUS_FACTOR_P3_134_VIDEO_CATALOG_DOC = "docs/adr-video-catalog.md" as const;

export const BUS_FACTOR_P3_134_REGISTRY_ARTIFACT =
  "artifacts/bus-factor-p3-134-registry.json" as const;

export const BUS_FACTOR_P3_134_EMERGENCY_ARTIFACT =
  "artifacts/emergency-access-checklist.json" as const;

export const BUS_FACTOR_P3_134_AUDIT_SCRIPT = "scripts/audit-bus-factor-p3-134.ts" as const;

export const BUS_FACTOR_P3_134_NPM_SCRIPT = "audit:bus-factor-p3-134" as const;

export const BUS_FACTOR_P3_134_UNIT_TEST = "tests/unit/bus-factor-p3-134.test.ts" as const;

export const BUS_FACTOR_P3_134_CI_WORKFLOW = ".github/workflows/deploy-prod-gate.yml" as const;

export const BUS_FACTOR_P3_134_ADR_TARGET = 10 as const;

export const BUS_FACTOR_P3_134_VIDEO_TARGET = 10 as const;

export const BUS_FACTOR_P3_134_ADR_FILES = [
  "docs/adr/0001-monolith-nextjs-server-actions.md",
  "docs/adr/0002-tenant-workspace-scoping.md",
  "docs/adr/0003-inline-webhook-queue.md",
  "docs/adr/0004-supabase-postgres-stack.md",
  "docs/adr/0005-production-cron-allowlist.md",
  "docs/adr/0006-engineering-knowledge-transfer.md",
  "docs/adr/0007-rbac-permission-denied-guard.md",
  "docs/adr/0008-integration-registry-live-gates.md",
  "docs/adr/0009-pos-in-browser-pilot-scope.md",
  "docs/adr/0010-emergency-access-break-glass.md",
] as const;

export const BUS_FACTOR_P3_134_EMERGENCY_SYSTEM_IDS = [
  "github_org_admin",
  "vercel_team_member",
  "supabase_owner",
  "stripe_admin",
  "dns_registrar",
  "sentry_member",
  "password_manager_vault",
  "emergency_customer_contact",
  "break_glass_runbook",
] as const;

export const BUS_FACTOR_P3_134_RELATED_DOCS = [
  "docs/bus-factor-mitigation.md",
  "docs/engineering-onboarding.md",
  "docs/engineering-video-walkthrough.md",
  "docs/adr/README.md",
  "docs/INCIDENT_RESPONSE_RUNBOOK.md",
] as const;

export const BUS_FACTOR_P3_134_HONESTY_MARKERS = [
  "bus factor 1",
  "script_ready",
  "0 recorded",
  "pending",
  "baseline",
] as const;

export const BUS_FACTOR_P3_134_WIRING_PATHS = [
  BUS_FACTOR_P3_134_DOC,
  BUS_FACTOR_P3_134_VIDEO_CATALOG_DOC,
  "lib/pm/bus-factor-p3-134-policy.ts",
  "lib/pm/bus-factor-p3-134-operations.ts",
  "lib/pm/bus-factor-p3-134-audit.ts",
  BUS_FACTOR_P3_134_REGISTRY_ARTIFACT,
  BUS_FACTOR_P3_134_EMERGENCY_ARTIFACT,
  BUS_FACTOR_P3_134_UNIT_TEST,
  ...BUS_FACTOR_P3_134_ADR_FILES,
] as const;
