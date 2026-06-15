import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  CRITICAL_DASHBOARD_ERROR_ROUTES,
  DASHBOARD_ERROR_BOUNDARY_POLICY_ID,
  DASHBOARD_ERROR_BOUNDARY_UNIT_TESTS,
} from "@/lib/testing/dashboard-error-boundary-policy";

const ROOT = join(__dirname, "../..");

const ROUTE_ERROR_PATTERN = /RouteError|PilotRouteError/;

describe("critical dashboard error boundaries (P0 top-20)", () => {
  it("locks policy id and render test suite", () => {
    expect(DASHBOARD_ERROR_BOUNDARY_POLICY_ID).toBe(
      "absolute-final-dashboard-error-boundary-v1",
    );
    expect(DASHBOARD_ERROR_BOUNDARY_UNIT_TESTS).toContain(
      "tests/unit/dashboard-error-boundary-render.test.ts",
    );
  });

  it("has error.tsx on all 20 pilot-critical routes", () => {
    for (const route of CRITICAL_DASHBOARD_ERROR_ROUTES) {
      expect(existsSync(join(ROOT, route)), route).toBe(true);
    }
    expect(CRITICAL_DASHBOARD_ERROR_ROUTES).toHaveLength(20);
  });

  it("uses RouteError or PilotRouteError with retry reset", () => {
    for (const route of CRITICAL_DASHBOARD_ERROR_ROUTES) {
      const source = readFileSync(join(ROOT, route), "utf8");
      expect(source, route).toMatch(ROUTE_ERROR_PATTERN);
      expect(source, route).toMatch(/reset/);
    }
  });
});
