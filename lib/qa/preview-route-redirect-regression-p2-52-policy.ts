/**
 * P2-52 — Preview route redirect regression: blocked preview URLs preserve deep links.
 *
 * Canonical routes: /dashboard/ai/co-pilot, /dashboard/enterprise/multi-location,
 * /dashboard/quick-start → /dashboard/today?preview=blocked&redirect=…
 *
 * @see docs/preview-route-redirect-regression-p2-52.md
 * @see tests/unit/preview-route-redirect-regression-p2-52.test.ts
 */

export const PREVIEW_ROUTE_REDIRECT_REGRESSION_P2_52_POLICY_ID =
  "preview-route-redirect-regression-p2-52-v1" as const;

export const PREVIEW_ROUTE_REDIRECT_REGRESSION_P2_52_DOC =
  "docs/preview-route-redirect-regression-p2-52.md" as const;

export const PREVIEW_ROUTE_REDIRECT_REGRESSION_P2_52_ARTIFACT =
  "artifacts/preview-route-redirect-regression-p2-52.json" as const;

export const PREVIEW_ROUTE_REDIRECT_REGRESSION_P2_52_AUDIT_MODULE =
  "lib/qa/preview-route-redirect-regression-p2-52-audit.ts" as const;

export const PREVIEW_ROUTE_REDIRECT_REGRESSION_P2_52_FLOW_MODULE =
  "lib/qa/preview-route-redirect-regression-flow.ts" as const;

export const PREVIEW_ROUTE_REDIRECT_REGRESSION_P2_52_CHECK_NPM_SCRIPT =
  "check:preview-route-redirect-regression-p2-52" as const;

export const PREVIEW_ROUTE_REDIRECT_REGRESSION_P2_52_CI_NPM_SCRIPT =
  "test:ci:preview-route-redirect-regression-p2-52" as const;

export const PREVIEW_ROUTE_REDIRECT_REGRESSION_P2_52_UNIT_TEST =
  "tests/unit/preview-route-redirect-regression-p2-52.test.ts" as const;

export const PREVIEW_ROUTE_REDIRECT_REGRESSION_P2_52_LEGACY_UNIT_TEST =
  "tests/unit/preview-blocked-redirect.test.ts" as const;

export const PREVIEW_ROUTE_REDIRECT_REGRESSION_P2_52_CI_WORKFLOW =
  ".github/workflows/ci.yml" as const;

export const PREVIEW_ROUTE_REDIRECT_REGRESSION_P2_52_E2E_SPEC =
  "e2e/preview-route-redirect-regression.spec.ts" as const;

export const PREVIEW_ROUTE_REDIRECT_REGRESSION_P2_52_E2E_FLOW_HELPER =
  "e2e/helpers/preview-route-redirect-regression-flow.ts" as const;

/** Gap P2-52 canonical preview routes (decision tree shorthand paths). */
export const PREVIEW_ROUTE_REDIRECT_REGRESSION_P2_52_ROUTES = [
  "/dashboard/ai/co-pilot",
  "/dashboard/enterprise/multi-location",
  "/dashboard/quick-start",
] as const;

export type PreviewRouteRedirectRegressionP252Route =
  (typeof PREVIEW_ROUTE_REDIRECT_REGRESSION_P2_52_ROUTES)[number];

export const PREVIEW_ROUTE_REDIRECT_REGRESSION_P2_52_FLOW_STEPS = [
  "blocked_route",
  "preview_redirect",
  "redirect_param",
  "login_return_path",
] as const;

export type PreviewRouteRedirectRegressionP252FlowStep =
  (typeof PREVIEW_ROUTE_REDIRECT_REGRESSION_P2_52_FLOW_STEPS)[number];

export const PREVIEW_ROUTE_REDIRECT_REGRESSION_P2_52_WIRING_PATHS = [
  PREVIEW_ROUTE_REDIRECT_REGRESSION_P2_52_DOC,
  PREVIEW_ROUTE_REDIRECT_REGRESSION_P2_52_ARTIFACT,
  PREVIEW_ROUTE_REDIRECT_REGRESSION_P2_52_AUDIT_MODULE,
  PREVIEW_ROUTE_REDIRECT_REGRESSION_P2_52_FLOW_MODULE,
  PREVIEW_ROUTE_REDIRECT_REGRESSION_P2_52_UNIT_TEST,
  PREVIEW_ROUTE_REDIRECT_REGRESSION_P2_52_LEGACY_UNIT_TEST,
  PREVIEW_ROUTE_REDIRECT_REGRESSION_P2_52_CI_WORKFLOW,
  PREVIEW_ROUTE_REDIRECT_REGRESSION_P2_52_E2E_SPEC,
  PREVIEW_ROUTE_REDIRECT_REGRESSION_P2_52_E2E_FLOW_HELPER,
  "lib/navigation/preview-route-guard.ts",
  "lib/auth/dashboard-login-return-path.ts",
  "middleware.ts",
] as const;

export function isPreviewRouteRedirectRegressionE2EEnabled(): boolean {
  return process.env.E2E_PREVIEW_ROUTE_REDIRECT?.trim() === "true";
}
