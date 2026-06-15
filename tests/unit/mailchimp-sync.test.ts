import { describe, expect, it } from "vitest";

import {
  buildMailchimpMemberRow,
  mailchimpSubscriberHash,
  parseMailchimpDatacenter,
} from "@/services/integrations/mailchimp-sync-service";
import { hasMarketingEmailConsent } from "@/lib/marketing/marketing-email-consent";

describe("mailchimp sync", () => {
  it("parses datacenter suffix from API key", () => {
    expect(parseMailchimpDatacenter("abc123-us21")).toBe("us21");
    expect(parseMailchimpDatacenter("invalid")).toBeNull();
  });

  it("hashes subscriber email for member upsert path", () => {
    expect(mailchimpSubscriberHash("Guest@Example.com")).toBe(
      mailchimpSubscriberHash("guest@example.com"),
    );
    expect(mailchimpSubscriberHash("guest@example.com")).toMatch(/^[a-f0-9]{32}$/);
  });

  it("requires latest EMAIL_MARKETING consent", () => {
    expect(
      hasMarketingEmailConsent([
        { consentType: "EMAIL_MARKETING", value: true, createdAt: new Date("2026-06-01") },
      ]),
    ).toBe(true);
  });

  it("builds member row with normalized email", () => {
    const row = buildMailchimpMemberRow({
      id: "cust-1",
      email: "Guest@Example.com",
      firstName: "Alex",
      lastName: "Kim",
      consentEvents: [],
      orderCount: 5,
      lifetimeSpend: 120,
    });
    expect(row?.email).toBe("guest@example.com");
    expect(row?.externalId).toBe("cust-1");
    expect(row?.orderCount).toBe(5);
  });
});
