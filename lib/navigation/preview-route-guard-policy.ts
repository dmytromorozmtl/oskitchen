/**
 * P1-40 — hide preview routes: return 404/redirect unless operator opted into advanced nav.
 */

import { NAV_SCOPE_STORAGE_KEY } from "@/services/navigation/navigation-preference-service";

export const PREVIEW_ROUTE_GUARD_POLICY_ID = "preview-route-guard-p1-40-v1" as const;

/** Minimum non-default dashboard routes guarded (nav maturity hide target). */
export const PREVIEW_ROUTE_GUARD_EXPECTED_MIN = 280 as const;

export const PREVIEW_ROUTE_GUARD_BYPASS_COOKIE = NAV_SCOPE_STORAGE_KEY;

export const PREVIEW_ROUTE_GUARD_BYPASS_VALUE = "all" as const;

export const PREVIEW_ROUTE_GUARD_REDIRECT_PATH = "/dashboard/today" as const;

export const PREVIEW_ROUTE_GUARD_AUDIT_SCRIPT = "scripts/audit-preview-routes-hidden.ts" as const;

export const PREVIEW_ROUTE_GUARD_NPM_SCRIPT = "audit:preview-routes-hidden" as const;

export const PREVIEW_ROUTE_GUARD_UNIT_TEST = "tests/unit/preview-route-guard.test.ts" as const;

/** Exposures blocked from direct URL access in focused pilot mode. */
export const PREVIEW_ROUTE_BLOCK_EXPOSURES = [
  "preview",
  "placeholder",
  "hidden_default",
  "internal",
] as const;

export type PreviewRouteBlockExposure = (typeof PREVIEW_ROUTE_BLOCK_EXPOSURES)[number];

export const PREVIEW_ROUTE_GUARD_CI_SCRIPTS = [
  "test:ci:preview-route-guard",
  PREVIEW_ROUTE_GUARD_NPM_SCRIPT,
] as const;

export const PREVIEW_ROUTE_GUARD_CI_WORKFLOW = ".github/workflows/deploy-prod-gate.yml" as const;
