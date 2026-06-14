import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  auditDashboardErrorTsxP242,
  formatDashboardErrorTsxP242AuditLines,
} from "@/lib/frontend/dashboard-error-tsx-p2-42-audit";
import {
  DASHBOARD_ERROR_TSX_P2_42_ARTIFACT,
  DASHBOARD_ERROR_TSX_P2_42_CHECK_NPM_SCRIPT,
  DASHBOARD_ERROR_TSX_P2_42_CI_NPM_SCRIPT,
  DASHBOARD_ERROR_TSX_P2_42_CI_WORKFLOW,
  DASHBOARD_ERROR_TSX_P2_42_DOC,
  DASHBOARD_ERROR_TSX_P2_42_POLICY_ID,
  DASHBOARD_ERROR_TSX_P2_42_ROUTE_COUNT,
  DASHBOARD_ERROR_TSX_P2_42_ROUTES,
  DASHBOARD_ERROR_TSX_P2_42_TEMPLATE,
  DASHBOARD_ERROR_TSX_P2_42_TEMPLATE_MARKER,
  DASHBOARD_ERROR_TSX_P2_42_WIRING_PATHS,
  errorUsesBoundaryTemplate,
} from "@/lib/frontend/dashboard-error-tsx-p2-42-policy";

const ROOT = process.cwd();

function readSource(relativePath: string): string {
  return readFileSync(join(ROOT, relativePath), "utf8");
}

describe("Dashboard error.tsx on 45 operator routes (P2-42)", () => {
  it("locks P2-42 policy with 45 operator routes", () => {
    expect(DASHBOARD_ERROR_TSX_P2_42_POLICY_ID).toBe("dashboard-error-tsx-p2-42-v1");
    expect(DASHBOARD_ERROR_TSX_P2_42_ROUTE_COUNT).toBe(45);
    expect(DASHBOARD_ERROR_TSX_P2_42_ROUTES).toHaveLength(45);
  });

  it.each(DASHBOARD_ERROR_TSX_P2_42_ROUTES)(
    "$id has templated error.tsx with ErrorBoundaryTemplate",
    (route) => {
      expect(existsSync(join(ROOT, route.pagePath)), `missing page: ${route.pagePath}`).toBe(
        true,
      );
      const errorSource = readSource(route.errorPath);
      expect(errorUsesBoundaryTemplate(errorSource)).toBe(true);
      expect(errorSource).toContain(DASHBOARD_ERROR_TSX_P2_42_TEMPLATE_MARKER);
      expect(errorSource).toContain("reset");
    },
  );

  it("passes full P2-42 audit — 45/45 ErrorBoundaryTemplate", () => {
    const summary = auditDashboardErrorTsxP242(ROOT);
    expect(summary.errorPresentCount).toBe(45);
    expect(summary.templateCount).toBe(45);
    expect(summary.missing).toEqual([]);
    expect(summary.nonTemplate).toEqual([]);
    expect(summary.passed).toBe(true);
  });

  it("P2-42 wiring paths exist including doc, artifact, scaffold, and CI gate", () => {
    for (const path of DASHBOARD_ERROR_TSX_P2_42_WIRING_PATHS) {
      expect(existsSync(join(ROOT, path)), `missing: ${path}`).toBe(true);
    }

    const pkg = readSource("package.json");
    expect(pkg).toContain(`"${DASHBOARD_ERROR_TSX_P2_42_CHECK_NPM_SCRIPT}"`);
    expect(pkg).toContain(`"${DASHBOARD_ERROR_TSX_P2_42_CI_NPM_SCRIPT}"`);

    const ci = readSource(DASHBOARD_ERROR_TSX_P2_42_CI_WORKFLOW);
    expect(ci).toContain(DASHBOARD_ERROR_TSX_P2_42_CHECK_NPM_SCRIPT);

    const doc = readSource(DASHBOARD_ERROR_TSX_P2_42_DOC);
    expect(doc).toContain(DASHBOARD_ERROR_TSX_P2_42_POLICY_ID);

    const template = readSource(DASHBOARD_ERROR_TSX_P2_42_TEMPLATE);
    expect(template).toContain(DASHBOARD_ERROR_TSX_P2_42_TEMPLATE_MARKER);

    const artifact = JSON.parse(readSource(DASHBOARD_ERROR_TSX_P2_42_ARTIFACT));
    expect(artifact.policyId).toBe(DASHBOARD_ERROR_TSX_P2_42_POLICY_ID);
    expect(artifact.routeCount).toBe(45);
  });

  it("formats audit lines", () => {
    const summary = auditDashboardErrorTsxP242(ROOT);
    const lines = formatDashboardErrorTsxP242AuditLines(summary);
    expect(lines.some((line) => line.includes(DASHBOARD_ERROR_TSX_P2_42_POLICY_ID))).toBe(true);
    expect(lines.some((line) => line.includes("Passed: YES"))).toBe(true);
  });
});
