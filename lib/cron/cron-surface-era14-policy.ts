/**
 * Cron surface Era 14 recertification — Evolution Era 14 Cycle 4.
 *
 * Re-validates Era 4 archive + Era 9 recert after Era 13/14 operator work.
 * Does not add cron routes or weaken cron auth.
 */

import {
  CRON_SURFACE_ERA9_ACTIVE_ROUTE_COUNT,
  CRON_SURFACE_ERA9_EXPERIMENTAL_ON_DISK_MAX,
  CRON_SURFACE_ERA9_POLICY_ID,
} from "@/lib/cron/cron-surface-era9-policy";
import { CRON_SURFACE_POLICY_ID } from "@/lib/cron/cron-surface-policy";

export const CRON_SURFACE_ERA14_POLICY_ID = "era14-cron-surface-recert-v1" as const;

export const CRON_SURFACE_ERA14_EXTENDS_POLICIES = [
  CRON_SURFACE_POLICY_ID,
  CRON_SURFACE_ERA9_POLICY_ID,
] as const;

export const CRON_SURFACE_ERA14_ACTIVE_ROUTE_COUNT = CRON_SURFACE_ERA9_ACTIVE_ROUTE_COUNT;

export const CRON_SURFACE_ERA14_EXPERIMENTAL_ON_DISK_MAX =
  CRON_SURFACE_ERA9_EXPERIMENTAL_ON_DISK_MAX;

export const CRON_SURFACE_ERA14_ARCHIVED_EXPERIMENTAL_MIN = 121 as const;

export const CRON_SURFACE_ERA14_VALIDATION_SCRIPTS = [
  "validate:production-crons",
  "validate:cron-inventory",
  "cron:archive:status",
] as const;

export const CRON_SURFACE_ERA14_CI_SCRIPTS = [
  "test:ci:cron-hygiene-era14",
  "test:ci:cron-hygiene-era14:cert",
] as const;

export const CRON_SURFACE_ERA14_PILOT_PREFLIGHT_SCRIPT =
  "scripts/ops/pilot-preflight.sh" as const;

export const CRON_SURFACE_ERA14_PILOT_FORBIDDEN_ENV = "ENABLE_EXPERIMENTAL_CRONS" as const;

export const CRON_SURFACE_ERA14_OPS_DOC = "docs/cron-surface-honesty-checklist.md" as const;

export const CRON_SURFACE_ERA14_SMOKE_SCRIPT = "scripts/smoke-cron-surface.ts" as const;

export const CRON_SURFACE_ERA14_SMOKE_NPM_SCRIPT = "smoke:cron-surface" as const;

export const CRON_SURFACE_ERA14_AUDIT_CHECKLIST = [
  "Confirm only 21 production routes exist under app/api/cron/ (no new experimental folders).",
  "Do not set ENABLE_EXPERIMENTAL_CRONS=true in pilot or production.",
  "Run npm run validate:production-crons and validate:cron-inventory before cron-related releases.",
  "Experimental handlers stay in archive/cron-routes/ — do not restore to App Router without era sign-off.",
  "Every active cron route must use runCronRoute (auth + production gate).",
] as const;

export const CRON_SURFACE_ERA14_CANONICAL_DOC_PATHS = [
  CRON_SURFACE_ERA14_OPS_DOC,
  "docs/devops-release-enterprise-readiness.md",
  "docs/ci-e2e-tier-matrix.md",
  "docs/commercial-pilot-runbook.md",
  "docs/CRON_INVENTORY.md",
  "docs/implementation-backlog.md",
] as const;

export const CRON_SURFACE_ERA14_CANONICAL_MARKERS = [
  CRON_SURFACE_ERA14_POLICY_ID,
  CRON_SURFACE_POLICY_ID,
  CRON_SURFACE_ERA9_POLICY_ID,
  "21 production",
  "archive/cron-routes",
  "ENABLE_EXPERIMENTAL_CRONS",
] as const;

export const CRON_SURFACE_ERA14_UNIT_TESTS = [
  "tests/unit/cron-surface-era14-policy.test.ts",
  "tests/unit/cron-surface-era14-cert-live.test.ts",
] as const;
