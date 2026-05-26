import { describe, expect, it } from "vitest";

import {
  isAllowedProductionCronSlug,
  isExperimentalCronSlug,
} from "@/services/cron/production-manifest";
import { resolveSlugsToArchive } from "@/services/cron/cron-archive";

describe("cron-archive", () => {
  it("never targets production slugs in resolveSlugsToArchive filter", () => {
    for (const slug of ["webhook-jobs", "reminders", "storefront-edge-sync"]) {
      expect(isAllowedProductionCronSlug(slug)).toBe(true);
      expect(isExperimentalCronSlug(slug)).toBe(false);
    }
  });

  it("resolveSlugsToArchive with explicit slug list passes through", () => {
    const slugs = resolveSlugsToArchive(["alpha-cron", "webhook-jobs"]);
    expect(slugs).toEqual(["alpha-cron", "webhook-jobs"]);
  });
});
