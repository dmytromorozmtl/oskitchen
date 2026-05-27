import { describe, expect, it } from "vitest";

import {
  assertProductionCronReconciliation,
  formatProductionCronReconciliationFailures,
  reconcileProductionCronState,
} from "@/services/cron/cron-reconciliation";
import {
  ALLOWED_PRODUCTION_CRON_SLUGS,
  buildProductionCronEntries,
} from "@/services/cron/production-manifest";

describe("cron reconciliation", () => {
  it("passes when manifest, routes, archive state, and scheduled profiles align", () => {
    const expected = buildProductionCronEntries();

    const report = reconcileProductionCronState({
      expectedEntries: expected,
      activeRouteSlugs: [...ALLOWED_PRODUCTION_CRON_SLUGS, "experimental-cron-sync"],
      archivedRouteSlugs: ["archived-experimental-cron"],
      archiveManifestSlugs: ["archived-experimental-cron"],
      vercelEntries: expected,
      productionProfileEntries: expected,
    });

    expect(report.ok).toBe(true);
    expect(report.routes.missingProductionRoutes).toEqual([]);
    expect(report.vercelJson.scheduleMismatches).toEqual([]);
    expect(report.productionProfile.extraPaths).toEqual([]);
  });

  it("fails when an allowlisted route is missing on disk", () => {
    const expected = buildProductionCronEntries();
    const activeRouteSlugs = ALLOWED_PRODUCTION_CRON_SLUGS.filter((slug) => slug !== "webhook-jobs");

    const report = reconcileProductionCronState({
      expectedEntries: expected,
      activeRouteSlugs,
      archivedRouteSlugs: [],
      archiveManifestSlugs: [],
      vercelEntries: expected,
      productionProfileEntries: expected,
    });

    expect(report.ok).toBe(false);
    expect(report.routes.missingProductionRoutes).toEqual(["webhook-jobs"]);
  });

  it("fails when vercel or generated production profile drift from the manifest", () => {
    const expected = buildProductionCronEntries();
    const badVercel = expected.map((entry) =>
      entry.path === "/api/cron/webhook-jobs"
        ? { ...entry, schedule: "0 * * * *" }
        : entry,
    );
    const badProfile = expected.filter((entry) => entry.path !== "/api/cron/reminders");

    const report = reconcileProductionCronState({
      expectedEntries: expected,
      activeRouteSlugs: [...ALLOWED_PRODUCTION_CRON_SLUGS],
      archivedRouteSlugs: [],
      archiveManifestSlugs: [],
      vercelEntries: badVercel,
      productionProfileEntries: badProfile,
    });

    expect(report.ok).toBe(false);
    expect(report.vercelJson.scheduleMismatches).toEqual([
      {
        path: "/api/cron/webhook-jobs",
        expected: "*/5 * * * *",
        actual: "0 * * * *",
      },
    ]);
    expect(report.productionProfile.missingPaths).toEqual(["/api/cron/reminders"]);
  });

  it("fails when archive manifest or archived disk state contains production drift", () => {
    const expected = buildProductionCronEntries();

    const report = reconcileProductionCronState({
      expectedEntries: expected,
      activeRouteSlugs: [...ALLOWED_PRODUCTION_CRON_SLUGS],
      archivedRouteSlugs: ["webhook-jobs", "old-experiment"],
      archiveManifestSlugs: ["missing-experiment"],
      vercelEntries: expected,
      productionProfileEntries: expected,
    });

    expect(report.ok).toBe(false);
    expect(report.archive.archivedProductionSlugs).toEqual(["webhook-jobs"]);
    expect(report.archive.manifestMissingOnDisk).toEqual(["missing-experiment"]);
    expect(report.archive.diskMissingFromManifest).toEqual(["old-experiment", "webhook-jobs"]);
  });

  it("formats reconciliation failures for CI output", () => {
    const expected = buildProductionCronEntries();
    const report = reconcileProductionCronState({
      expectedEntries: expected,
      activeRouteSlugs: ALLOWED_PRODUCTION_CRON_SLUGS.filter((slug) => slug !== "webhook-jobs"),
      archivedRouteSlugs: [],
      archiveManifestSlugs: [],
      vercelEntries: expected,
      productionProfileEntries: expected,
    });

    const lines = formatProductionCronReconciliationFailures(report);
    expect(lines).toContain("missing production routes on disk: webhook-jobs");
    expect(() => assertProductionCronReconciliation(report)).toThrow(/webhook-jobs/);
  });
});
