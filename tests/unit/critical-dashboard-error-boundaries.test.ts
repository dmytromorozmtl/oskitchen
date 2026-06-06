import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

const ROOT = join(__dirname, "../..");

/** Top-20 pilot-critical dashboard routes (P0 audit). */
export const CRITICAL_DASHBOARD_ERROR_ROUTES = [
  "app/dashboard/today/error.tsx",
  "app/dashboard/marketplace/error.tsx",
  "app/dashboard/pos/terminal/error.tsx",
  "app/dashboard/kitchen/error.tsx",
  "app/dashboard/command-center/error.tsx",
  "app/dashboard/analytics/suite/error.tsx",
  "app/dashboard/ai/co-pilot/error.tsx",
  "app/dashboard/enterprise/multi-location/error.tsx",
  "app/dashboard/roles/owner/error.tsx",
  "app/dashboard/menus/error.tsx",
  "app/dashboard/quick-start/error.tsx",
  "app/dashboard/qr-codes/error.tsx",
  "app/dashboard/today/profit/error.tsx",
  "app/dashboard/enterprise/multi-brand/error.tsx",
  "app/dashboard/enterprise/commissary/error.tsx",
  "app/dashboard/catering/error.tsx",
  "app/dashboard/meal-prep/error.tsx",
  "app/dashboard/inventory/invoice-scanner/error.tsx",
  "app/dashboard/finance/bank-import/error.tsx",
  "app/dashboard/loyalty/program-builder/error.tsx",
] as const;

const ROUTE_ERROR_PATTERN = /RouteError|PilotRouteError/;

describe("critical dashboard error boundaries (P0 top-20)", () => {
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
