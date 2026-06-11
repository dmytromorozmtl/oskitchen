import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  DASHBOARD_ERROR_BOUNDARIES_AUDIT_SCRIPT,
  DASHBOARD_ERROR_BOUNDARIES_BLUEPRINT_POLICY_ID,
  DASHBOARD_ERROR_BOUNDARIES_CI_NPM_SCRIPT,
  DASHBOARD_ERROR_BOUNDARIES_SCAFFOLD_SCRIPT,
  DASHBOARD_ERROR_BOUNDARIES_UNIT_TEST,
  DASHBOARD_ERROR_BOUNDARY_SOURCE_MARKER,
  DASHBOARD_ERROR_BOUNDARY_TEMPLATE,
} from "@/lib/qa/dashboard-error-boundaries-policy";
import {
  assertDashboardErrorBoundariesAuditPasses,
  auditDashboardErrorBoundaries,
} from "@/lib/qa/dashboard-error-boundaries-audit";

const ROOT = process.cwd();

describe("dashboard error boundaries blueprint (P1-22)", () => {
  it("locks policy id and template component", () => {
    expect(DASHBOARD_ERROR_BOUNDARIES_BLUEPRINT_POLICY_ID).toBe(
      "dashboard-error-boundaries-blueprint-v1",
    );
    expect(existsSync(join(ROOT, DASHBOARD_ERROR_BOUNDARY_TEMPLATE))).toBe(true);
    expect(existsSync(join(ROOT, DASHBOARD_ERROR_BOUNDARIES_SCAFFOLD_SCRIPT))).toBe(true);
    expect(existsSync(join(ROOT, DASHBOARD_ERROR_BOUNDARIES_AUDIT_SCRIPT))).toBe(true);
    expect(DASHBOARD_ERROR_BOUNDARIES_UNIT_TEST).toBe(
      "tests/unit/dashboard-error-boundaries-blueprint.test.ts",
    );
  });

  it("has error.tsx on every dashboard page route using ErrorBoundaryTemplate", () => {
    const report = auditDashboardErrorBoundaries(ROOT);
    expect(report.pageRoutes).toBeGreaterThanOrEqual(650);
    expect(report.missing).toEqual([]);
    assertDashboardErrorBoundariesAuditPasses(report);
  });

  it("scaffolded error.tsx files import ErrorBoundaryTemplate", () => {
    const samplePaths = [
      "app/dashboard/marketplace/orders/error.tsx",
      "app/dashboard/accounting/invoices/error.tsx",
      "app/dashboard/integrations/doordash/error.tsx",
    ];
    for (const path of samplePaths) {
      expect(existsSync(join(ROOT, path)), path).toBe(true);
      const source = readFileSync(join(ROOT, path), "utf8");
      expect(source, path).toContain(DASHBOARD_ERROR_BOUNDARY_SOURCE_MARKER);
      expect(source, path).toContain("reset");
    }
  });

  it("registers npm audit and cert scripts", () => {
    const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
      scripts?: Record<string, string>;
    };
    expect(pkg.scripts?.["audit:dashboard-error-boundaries"]).toContain(
      "audit-dashboard-error-boundaries.ts",
    );
    expect(pkg.scripts?.[DASHBOARD_ERROR_BOUNDARIES_CI_NPM_SCRIPT]).toContain(
      "dashboard-error-boundaries-blueprint.test.ts",
    );
  });
});
