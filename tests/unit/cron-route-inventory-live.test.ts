import { describe, expect, it } from "vitest";

import {
  assertCronRouteInventory,
  validateCronRouteInventory,
} from "@/services/cron/cron-route-inventory-validation";

describe("cron route inventory (live repo)", () => {
  it("has all production routes, consistent archive state, and experimental count within cap", () => {
    const report = validateCronRouteInventory();
    expect(() => assertCronRouteInventory(report)).not.toThrow();
    expect(report.ok).toBe(true);
    expect(report.missingProductionRoutes).toEqual([]);
    expect(report.archivedProductionSlugs).toEqual([]);
    expect(report.manifestMissingOnDisk).toEqual([]);
    expect(report.diskMissingFromManifest).toEqual([]);
    expect(report.experimentalOnDisk).toBeLessThanOrEqual(report.maxExperimental);
  });
});
