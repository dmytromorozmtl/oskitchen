/**
 * P0-12 — Authenticated dashboard RSC probe: login → 46 routes → 200 + no RSC error → CI.
 *
 * @see docs/authed-rsc-probe-p0-12.md
 */

import {
  AUTHED_DASHBOARD_RSC_SMOKE_POLICY_ID,
  AUTHED_DASHBOARD_RSC_SMOKE_ROUTES,
} from "@/lib/smoke/authed-dashboard-rsc-routes";

export const AUTHED_RSC_PROBE_P0_12_POLICY_ID = "p0-12-authed-rsc-probe-v1" as const;

export const AUTHED_RSC_PROBE_P0_12_DOC = "docs/authed-rsc-probe-p0-12.md" as const;

export const AUTHED_RSC_PROBE_P0_12_ARTIFACT = "artifacts/authed-rsc-probe-p0-12.json" as const;

export const AUTHED_RSC_PROBE_P0_12_ROUTE_COUNT = 46 as const;

export const AUTHED_RSC_PROBE_P0_12_PROBE_MODES = ["document", "rsc"] as const;

export const AUTHED_RSC_PROBE_P0_12_TOTAL_PROBES =
  AUTHED_RSC_PROBE_P0_12_ROUTE_COUNT * AUTHED_RSC_PROBE_P0_12_PROBE_MODES.length;

export const AUTHED_RSC_PROBE_P0_12_NPM_SCRIPT = "smoke:rsc-authed-dashboard" as const;

export const AUTHED_RSC_PROBE_P0_12_CHECK_NPM_SCRIPT = "check:authed-rsc-probe-p0-12" as const;

export const AUTHED_RSC_PROBE_P0_12_CI_NPM_SCRIPT = "test:ci:authed-rsc-probe-p0-12" as const;

export const AUTHED_RSC_PROBE_P0_12_PROBE_SCRIPT = "scripts/probe-authed-dashboard.ts" as const;

export const AUTHED_RSC_PROBE_P0_12_WORKFLOW_PATHS = [
  ".github/workflows/rsc-smoke.yml",
  ".github/workflows/ci.yml",
] as const;

export const AUTHED_RSC_PROBE_P0_12_ROUTES = AUTHED_DASHBOARD_RSC_SMOKE_ROUTES;

export const AUTHED_RSC_PROBE_P0_12_EXTENDS_POLICY_ID = AUTHED_DASHBOARD_RSC_SMOKE_POLICY_ID;

export const AUTHED_RSC_PROBE_P0_12_WIRING_PATHS = [
  AUTHED_RSC_PROBE_P0_12_DOC,
  AUTHED_RSC_PROBE_P0_12_PROBE_SCRIPT,
  "lib/smoke/probe-authed-dashboard-rsc.ts",
  "lib/smoke/authed-dashboard-rsc-routes.ts",
  "tests/unit/authed-rsc-probe-p0-12.test.ts",
  "tests/unit/authed-rsc-smoke-policy.test.ts",
  AUTHED_RSC_PROBE_P0_12_ARTIFACT,
  ...AUTHED_RSC_PROBE_P0_12_WORKFLOW_PATHS,
] as const;
