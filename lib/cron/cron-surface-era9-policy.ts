/**
 * Cron surface Era 9 recertification — Evolution Era 9 Cycle 3.
 *
 * Re-validates Era 4 archive posture: 16 production App Router crons only,
 * experimental handlers under archive/, production gate + pilot preflight honesty.
 * Does not add cron routes or weaken cron auth.
 */

export const CRON_SURFACE_ERA9_POLICY_ID = "era9-cron-surface-recert-v1" as const;

export const CRON_SURFACE_ERA9_EXTENDS_POLICY_ID = "era4-active-production-only-v1" as const;

export const CRON_SURFACE_ERA9_ACTIVE_ROUTE_COUNT = 16 as const;

export const CRON_SURFACE_ERA9_EXPERIMENTAL_ON_DISK_MAX = 0 as const;

export const CRON_SURFACE_ERA9_VALIDATION_SCRIPTS = [
  "validate:production-crons",
  "validate:cron-inventory",
  "cron:archive:status",
] as const;

export const CRON_SURFACE_ERA9_CI_SCRIPTS = [
  "test:ci:cron-hygiene",
  "test:ci:cron-hygiene:cert",
] as const;

export const CRON_SURFACE_ERA9_PILOT_PREFLIGHT_SCRIPT =
  "scripts/ops/pilot-preflight.sh" as const;

export const CRON_SURFACE_ERA9_PILOT_FORBIDDEN_ENV = "ENABLE_EXPERIMENTAL_CRONS" as const;

export const CRON_SURFACE_ERA9_CANONICAL_DOC_PATHS = [
  "docs/devops-release-enterprise-readiness.md",
  "docs/ci-e2e-tier-matrix.md",
  "docs/commercial-pilot-runbook.md",
  "docs/CRON_INVENTORY.md",
] as const;

export const CRON_SURFACE_ERA9_CANONICAL_MARKERS = [
  CRON_SURFACE_ERA9_POLICY_ID,
  CRON_SURFACE_ERA9_EXTENDS_POLICY_ID,
  "16 production",
  "archive/cron-routes",
] as const;

export const CRON_SURFACE_ERA9_UNIT_TESTS = [
  "tests/unit/cron-surface-era9-policy.test.ts",
  "tests/unit/cron-surface-era9-cert-live.test.ts",
] as const;
