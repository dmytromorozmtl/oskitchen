import { describe, expect, it } from "vitest";

import {
  buildKlaviyoProfileRow,
  hasMarketingEmailConsent,
} from "@/services/integrations/klaviyo-sync-service";

describe("klaviyo sync", () => {
  it("requires latest EMAIL_MARKETING consent to be true", () => {
    expect(
      hasMarketingEmailConsent([
        { consentType: "EMAIL_MARKETING", value: true, createdAt: new Date("2026-06-01") },
      ]),
    ).toBe(true);
    expect(
      hasMarketingEmailConsent([
        { consentType: "EMAIL_MARKETING", value: false, createdAt: new Date("2026-06-02") },
        { consentType: "EMAIL_MARKETING", value: true, createdAt: new Date("2026-06-01") },
      ]),
    ).toBe(false);
    expect(hasMarketingEmailConsent([])).toBe(false);
  });

  it("builds profile row with order stats properties", () => {
    const row = buildKlaviyoProfileRow({
      id: "cust-1",
      email: "Guest@Example.com",
      firstName: "Alex",
      lastName: "Kim",
      displayName: "Alex K",
      phone: "+15551234567",
      consentEvents: [],
      orderCount: 12,
      lifetimeSpend: 480.5,
    });
    expect(row?.email).toBe("guest@example.com");
    expect(row?.externalId).toBe("cust-1");
    expect(row?.properties.order_count).toBe(12);
    expect(row?.properties.lifetime_spend).toBe(480.5);
    expect(row?.properties.source).toBe("os_kitchen");
  });

  it("returns null for invalid email", () => {
    expect(
      buildKlaviyoProfileRow({
        id: "cust-2",
        email: "not-an-email",
        consentEvents: [],
      }),
    ).toBeNull();
  });
});
