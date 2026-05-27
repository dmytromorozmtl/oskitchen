import { describe, expect, it } from "vitest";

import {
  ALLOWED_PRODUCTION_CRON_SLUGS,
  isExperimentalCronSlug,
} from "@/services/cron/production-manifest";
import { partitionCronRouteSlugs } from "@/services/cron/cron-route-inventory";
import {
  assertCronRouteInventory,
  formatCronRouteInventoryFailures,
  validateCronRouteInventory,
} from "@/services/cron/cron-route-inventory-validation";

describe("cron-route-inventory", () => {
  it("classifies production vs experimental slugs", () => {
    const partition = partitionCronRouteSlugs([
      "webhook-jobs",
      "reminders",
      "nist-ai-rmf-seed",
    ]);
    expect(partition.production).toEqual(["webhook-jobs", "reminders"]);
    expect(partition.experimental).toEqual(["nist-ai-rmf-seed"]);
    expect(partition.missingRoutes).toEqual(
      ALLOWED_PRODUCTION_CRON_SLUGS.filter((s) => s !== "webhook-jobs" && s !== "reminders"),
    );
  });

  it("isExperimentalCronSlug matches manifest", () => {
    expect(isExperimentalCronSlug("webhook-jobs")).toBe(false);
    expect(isExperimentalCronSlug("compliance-novelty-cron")).toBe(true);
  });

  it("formats inventory failures when production routes are missing", () => {
    const report = validateCronRouteInventory({
      activeRouteSlugs: ["webhook-jobs"],
      maxExperimental: 200,
    });
    expect(report.ok).toBe(false);
    const lines = formatCronRouteInventoryFailures(report);
    expect(lines.some((line) => line.includes("webhook-jobs") || line.includes("reminders"))).toBe(
      true,
    );
    expect(() => assertCronRouteInventory(report)).toThrow(/missing production routes/i);
  });

  it("fails when experimental cron count exceeds cap", () => {
    const report = validateCronRouteInventory({
      activeRouteSlugs: [...ALLOWED_PRODUCTION_CRON_SLUGS, "experimental-a", "experimental-b"],
      maxExperimental: 1,
    });
    expect(report.ok).toBe(false);
    expect(formatCronRouteInventoryFailures(report)).toEqual([
      "experimental cron count 2 exceeds CRON_EXPERIMENTAL_MAX=1",
    ]);
  });
});
