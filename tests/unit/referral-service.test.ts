import { describe, expect, it } from "vitest";

import {
  buildReferralPublicUrl,
  REFERRAL_FREE_MONTH_DAYS,
} from "@/services/referral/referral-service";

describe("referral-service", () => {
  it("builds public short link at /r/{code}", () => {
    const link = buildReferralPublicUrl("R-ABCD1234");
    expect(link).toMatch(/\/r\/R-ABCD1234$/);
  });

  it("exposes 30-day free month constant", () => {
    expect(REFERRAL_FREE_MONTH_DAYS).toBe(30);
  });
});
