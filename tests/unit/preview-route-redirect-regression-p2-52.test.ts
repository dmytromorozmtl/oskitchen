import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { NextRequest } from "next/server";
import { describe, expect, it } from "vitest";

import { resolveDashboardLoginReturnPath } from "@/lib/auth/dashboard-login-return-path";
import {
  auditPreviewRouteRedirectRegressionP252,
  formatPreviewRouteRedirectRegressionP252AuditLines,
} from "@/lib/qa/preview-route-redirect-regression-p2-52-audit";
import {
  PREVIEW_ROUTE_REDIRECT_REGRESSION_P2_52_ARTIFACT,
  PREVIEW_ROUTE_REDIRECT_REGRESSION_P2_52_CHECK_NPM_SCRIPT,
  PREVIEW_ROUTE_REDIRECT_REGRESSION_P2_52_CI_NPM_SCRIPT,
  PREVIEW_ROUTE_REDIRECT_REGRESSION_P2_52_CI_WORKFLOW,
  PREVIEW_ROUTE_REDIRECT_REGRESSION_P2_52_DOC,
  PREVIEW_ROUTE_REDIRECT_REGRESSION_P2_52_E2E_SPEC,
  PREVIEW_ROUTE_REDIRECT_REGRESSION_P2_52_FLOW_STEPS,
  PREVIEW_ROUTE_REDIRECT_REGRESSION_P2_52_POLICY_ID,
  PREVIEW_ROUTE_REDIRECT_REGRESSION_P2_52_ROUTES,
  PREVIEW_ROUTE_REDIRECT_REGRESSION_P2_52_WIRING_PATHS,
  isPreviewRouteRedirectRegressionE2EEnabled,
} from "@/lib/qa/preview-route-redirect-regression-p2-52-policy";
import {
  assertPreviewRouteRedirectRegression,
  runPreviewRouteRedirectRegression,
} from "@/lib/qa/preview-route-redirect-regression-flow";
import { isBlockedPreviewDashboardRoute } from "@/lib/navigation/preview-route-guard";
import { PREVIEW_ROUTE_GUARD_REDIRECT_PATH } from "@/lib/navigation/preview-route-guard-policy";

const ROOT = process.cwd();

function readSource(relativePath: string): string {
  return readFileSync(join(ROOT, relativePath), "utf8");
}

describe("Preview route redirect regression (P2-52)", () => {
  it("locks P2-52 policy, routes, and four-step redirect chain", () => {
    expect(PREVIEW_ROUTE_REDIRECT_REGRESSION_P2_52_POLICY_ID).toBe(
      "preview-route-redirect-regression-p2-52-v1",
    );
    expect(PREVIEW_ROUTE_REDIRECT_REGRESSION_P2_52_ROUTES).toEqual([
      "/dashboard/ai/co-pilot",
      "/dashboard/enterprise/multi-location",
      "/dashboard/quick-start",
    ]);
    expect(PREVIEW_ROUTE_REDIRECT_REGRESSION_P2_52_FLOW_STEPS).toEqual([
      "blocked_route",
      "preview_redirect",
      "redirect_param",
      "login_return_path",
    ]);
  });

  it("marks all canonical routes as blocked preview dashboard routes", () => {
    for (const route of PREVIEW_ROUTE_REDIRECT_REGRESSION_P2_52_ROUTES) {
      expect(isBlockedPreviewDashboardRoute(route)).toBe(true);
    }
  });

  it("preserves deep link through preview=blocked redirect for each canonical route", () => {
    const results = runPreviewRouteRedirectRegression([
      ...PREVIEW_ROUTE_REDIRECT_REGRESSION_P2_52_ROUTES,
    ]);
    expect(results).toHaveLength(3);
    for (const row of results) {
      expect(row.passed, `failed: ${row.sourcePath}`).toBe(true);
      expect(row.redirectPathname).toBe(PREVIEW_ROUTE_GUARD_REDIRECT_PATH);
      expect(row.previewParam).toBe("blocked");
      expect(row.redirectParam).toBe(row.sourcePath);
      expect(row.loginReturnPath).toBe(row.sourcePath);
    }
  });

  it("preserves query string on quick-start deep link", () => {
    const result = assertPreviewRouteRedirectRegression(
      "/dashboard/quick-start?phase=2&source=email",
    );
    expect(result.passed).toBe(true);
    expect(result.redirectParam).toBe("/dashboard/quick-start?phase=2&source=email");
    expect(result.loginReturnPath).toBe("/dashboard/quick-start?phase=2&source=email");
  });

  it("passes embedded redirect through dashboard login gate for co-pilot", () => {
    const returnPath = resolveDashboardLoginReturnPath(
      new NextRequest(
        new URL(
          `${PREVIEW_ROUTE_GUARD_REDIRECT_PATH}?preview=blocked&redirect=${encodeURIComponent("/dashboard/ai/co-pilot")}`,
          "http://localhost:3000",
        ),
      ),
    );
    expect(returnPath).toBe("/dashboard/ai/co-pilot");
  });

  it("passes full P2-52 audit — flow, middleware, regression, artifact", () => {
    const summary = auditPreviewRouteRedirectRegressionP252(ROOT);
    expect(summary.flowModulePresent).toBe(true);
    expect(summary.unitTestPresent).toBe(true);
    expect(summary.e2eSpecPresent).toBe(true);
    expect(summary.middlewareWired).toBe(true);
    expect(summary.routesHiddenInNavRegistry).toBe(true);
    expect(summary.regressionWired).toBe(true);
    expect(summary.artifactPresent).toBe(true);
    expect(summary.passed).toBe(true);
  });

  it("P2-52 wiring paths exist including doc, artifact, E2E spec, and CI gate", () => {
    for (const path of PREVIEW_ROUTE_REDIRECT_REGRESSION_P2_52_WIRING_PATHS) {
      expect(existsSync(join(ROOT, path)), `missing: ${path}`).toBe(true);
    }

    const pkg = readSource("package.json");
    expect(pkg).toContain(`"${PREVIEW_ROUTE_REDIRECT_REGRESSION_P2_52_CHECK_NPM_SCRIPT}"`);
    expect(pkg).toContain(`"${PREVIEW_ROUTE_REDIRECT_REGRESSION_P2_52_CI_NPM_SCRIPT}"`);
    expect(pkg).toContain("test:e2e:preview-route-redirect-regression");

    const ci = readSource(PREVIEW_ROUTE_REDIRECT_REGRESSION_P2_52_CI_WORKFLOW);
    expect(ci).toContain(PREVIEW_ROUTE_REDIRECT_REGRESSION_P2_52_CHECK_NPM_SCRIPT);

    const doc = readSource(PREVIEW_ROUTE_REDIRECT_REGRESSION_P2_52_DOC);
    expect(doc).toContain(PREVIEW_ROUTE_REDIRECT_REGRESSION_P2_52_POLICY_ID);

    const spec = readSource(PREVIEW_ROUTE_REDIRECT_REGRESSION_P2_52_E2E_SPEC);
    expect(spec).toContain(PREVIEW_ROUTE_REDIRECT_REGRESSION_P2_52_POLICY_ID);

    const artifact = JSON.parse(readSource(PREVIEW_ROUTE_REDIRECT_REGRESSION_P2_52_ARTIFACT));
    expect(artifact.policyId).toBe(PREVIEW_ROUTE_REDIRECT_REGRESSION_P2_52_POLICY_ID);
    expect(artifact.routes).toEqual([...PREVIEW_ROUTE_REDIRECT_REGRESSION_P2_52_ROUTES]);
  });

  it("E2E gate requires E2E_PREVIEW_ROUTE_REDIRECT flag", () => {
    const original = process.env.E2E_PREVIEW_ROUTE_REDIRECT;
    delete process.env.E2E_PREVIEW_ROUTE_REDIRECT;
    expect(isPreviewRouteRedirectRegressionE2EEnabled()).toBe(false);
    process.env.E2E_PREVIEW_ROUTE_REDIRECT = "true";
    expect(isPreviewRouteRedirectRegressionE2EEnabled()).toBe(true);
    if (original !== undefined) process.env.E2E_PREVIEW_ROUTE_REDIRECT = original;
    else delete process.env.E2E_PREVIEW_ROUTE_REDIRECT;
  });

  it("formats audit lines", () => {
    const summary = auditPreviewRouteRedirectRegressionP252(ROOT);
    const lines = formatPreviewRouteRedirectRegressionP252AuditLines(summary);
    expect(lines.some((line) => line.includes(PREVIEW_ROUTE_REDIRECT_REGRESSION_P2_52_POLICY_ID))).toBe(
      true,
    );
    expect(lines.some((line) => line.includes("Passed: YES"))).toBe(true);
  });
});
