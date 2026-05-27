import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  assertCronRouteInventory,
  validateCronRouteInventory,
} from "@/services/cron/cron-route-inventory-validation";
import {
  assertProductionCronReconciliation,
  reconcileProductionCronState,
} from "@/services/cron/cron-reconciliation";
import { ALLOWED_PRODUCTION_CRON_SLUGS } from "@/services/cron/production-manifest";

const CRON_ROOT = join(process.cwd(), "app/api/cron");

function listCronRouteFiles(): string[] {
  if (!statSync(CRON_ROOT, { throwIfNoEntry: false })) return [];
  return readdirSync(CRON_ROOT, { withFileTypes: true })
    .filter((d) => d.isDirectory() && !d.name.startsWith("_"))
    .map((d) => join(CRON_ROOT, d.name, "route.ts"))
    .filter((path) => statSync(path, { throwIfNoEntry: false }));
}

describe("cron hygiene certification (live repo)", () => {
  it("reconciles production manifest, vercel.json, and on-disk routes", () => {
    const report = reconcileProductionCronState();
    expect(() => assertProductionCronReconciliation(report)).not.toThrow();
    expect(report.ok).toBe(true);
  });

  it("keeps production allowlist aligned with disk and caps experimental surface", () => {
    const report = validateCronRouteInventory();
    expect(() => assertCronRouteInventory(report)).not.toThrow();
    expect(report.ok).toBe(true);
    expect(report.productionAllowlist).toBe(ALLOWED_PRODUCTION_CRON_SLUGS.length);
    expect(report.productionOnDisk).toBe(report.productionAllowlist);
    expect(report.missingProductionRoutes).toEqual([]);
    expect(report.experimentalOnDisk).toBeLessThanOrEqual(report.maxExperimental);
    expect(report.totalRoutes).toBe(report.productionOnDisk + report.experimentalOnDisk);
  });

  it("requires every cron route handler to use runCronRoute", () => {
    const routeFiles = listCronRouteFiles();
    expect(routeFiles.length).toBeGreaterThan(0);

    const missingRunCronRoute = routeFiles.filter((path) => {
      const source = readFileSync(path, "utf8");
      return !source.includes("runCronRoute");
    });

    expect(missingRunCronRoute).toEqual([]);
  });
});
