import { describe, expect, it } from "vitest";

import {
  ALLOWED_PRODUCTION_CRON_SLUGS,
  PRODUCTION_CRON_SCHEDULES,
  isAllowedProductionCronSlug,
} from "@/services/cron/production-manifest";

describe("Tier 1 production crons", () => {
  it("includes meal-plan-auto-renew on allowlist", () => {
    expect(ALLOWED_PRODUCTION_CRON_SLUGS).toContain("meal-plan-auto-renew");
    expect(isAllowedProductionCronSlug("meal-plan-auto-renew")).toBe(true);
    expect(PRODUCTION_CRON_SCHEDULES["meal-plan-auto-renew"]).toBe("0 6 * * *");
  });
});
