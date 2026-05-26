import { describe, expect, it } from "vitest";

import {
  ALLOWED_PRODUCTION_CRON_SLUGS,
  isExperimentalCronSlug,
} from "@/services/cron/production-manifest";
import { partitionCronRouteSlugs } from "@/services/cron/cron-route-inventory";

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
});
