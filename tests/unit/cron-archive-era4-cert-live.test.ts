import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  CRON_ACTIVE_PRODUCTION_ROUTE_COUNT,
  CRON_ARCHIVED_EXPERIMENTAL_MIN_COUNT,
  CRON_SURFACE_POLICY_ID,
} from "@/lib/cron/cron-surface-policy";
import { readCronArchiveManifest } from "@/services/cron/cron-archive";
import { validateCronRouteInventory } from "@/services/cron/cron-route-inventory-validation";
import { ALLOWED_PRODUCTION_CRON_SLUGS } from "@/services/cron/production-manifest";

const ROOT = process.cwd();

describe("cron archive Era 4 certification (live repo)", () => {
  it("locks era4 active-production-only surface policy", () => {
    expect(CRON_SURFACE_POLICY_ID).toBe("era4-active-production-only-v1");
    expect(CRON_ACTIVE_PRODUCTION_ROUTE_COUNT).toBe(ALLOWED_PRODUCTION_CRON_SLUGS.length);
    expect(CRON_ARCHIVED_EXPERIMENTAL_MIN_COUNT).toBeGreaterThanOrEqual(121);
  });

  it("has zero active experimental routes and archived experimental inventory", () => {
    const report = validateCronRouteInventory();
    expect(report.ok).toBe(true);
    expect(report.productionOnDisk).toBe(CRON_ACTIVE_PRODUCTION_ROUTE_COUNT);
    expect(report.experimentalOnDisk).toBe(0);
    expect(report.archivedRoutes).toBeGreaterThanOrEqual(CRON_ARCHIVED_EXPERIMENTAL_MIN_COUNT);
    expect(report.archivedProductionSlugs).toEqual([]);

    const manifest = readCronArchiveManifest();
    expect(manifest.slugs.length).toBeGreaterThanOrEqual(CRON_ARCHIVED_EXPERIMENTAL_MIN_COUNT);
    expect(existsSync(join(ROOT, "config/cron-archive-manifest.json"))).toBe(true);
  });

  it("documents archive policy in canonical CI tier matrix", () => {
    const matrix = readFileSync(join(ROOT, "docs/ci-e2e-tier-matrix.md"), "utf8");
    expect(matrix).toContain("era4-active-production-only-v1");
    expect(matrix).toContain("archive/cron-routes");
    expect(matrix).toMatch(/0 active experimental/i);
  });
});
