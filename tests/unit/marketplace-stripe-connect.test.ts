import { describe, expect, it } from "vitest";

import {
  isMarketplaceVendorStripeConnectEnabled,
  resolveVendorConnectStatus,
  vendorConnectStatusLabel,
} from "@/lib/marketplace/stripe-connect-config";

describe("marketplace stripe connect config", () => {
  it("reports disabled when feature flag off", () => {
    expect(isMarketplaceVendorStripeConnectEnabled()).toBe(false);
    expect(resolveVendorConnectStatus({ stripeAccountId: "acct_123" })).toBe("disabled");
  });

  it("labels connect statuses", () => {
    expect(vendorConnectStatusLabel("not_connected")).toContain("not linked");
    expect(vendorConnectStatusLabel("ready")).toContain("ready");
  });
});
