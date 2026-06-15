import { describe, expect, it } from "vitest";

import {
  isMarketplacePartnerStripeConnectEnabled,
  marketplacePartnerStripeConnectClientId,
  partnerConnectStatusLabel,
  resolvePartnerConnectStatus,
} from "@/lib/platform/partner-stripe-connect";
import { loadPartnerBillingConfig, resetPartnerBillingConfigCache } from "@/lib/platform/partner-billing-config";

describe("partner-stripe-connect", () => {
  it("is disabled unless MARKETPLACE_PARTNER_STRIPE_CONNECT=1", () => {
    const prev = process.env.MARKETPLACE_PARTNER_STRIPE_CONNECT;
    delete process.env.MARKETPLACE_PARTNER_STRIPE_CONNECT;
    expect(isMarketplacePartnerStripeConnectEnabled()).toBe(false);
    process.env.MARKETPLACE_PARTNER_STRIPE_CONNECT = "1";
    expect(isMarketplacePartnerStripeConnectEnabled()).toBe(true);
    if (prev) process.env.MARKETPLACE_PARTNER_STRIPE_CONNECT = prev;
    else delete process.env.MARKETPLACE_PARTNER_STRIPE_CONNECT;
  });

  it("resolves connect status from billing account fields", () => {
    process.env.MARKETPLACE_PARTNER_STRIPE_CONNECT = "1";
    expect(
      resolvePartnerConnectStatus({
        stripeConnectAccountId: null,
        stripeConnectPayoutsEnabled: false,
        stripeConnectDetailsSubmitted: false,
      }),
    ).toBe("not_connected");

    expect(
      resolvePartnerConnectStatus({
        stripeConnectAccountId: "acct_123",
        stripeConnectPayoutsEnabled: false,
        stripeConnectDetailsSubmitted: true,
      }),
    ).toBe("pending_verification");

    expect(
      resolvePartnerConnectStatus({
        stripeConnectAccountId: "acct_123",
        stripeConnectPayoutsEnabled: true,
        stripeConnectDetailsSubmitted: true,
      }),
    ).toBe("ready");

    expect(partnerConnectStatusLabel("ready")).toBe("Payouts ready");
  });

  it("reads connect client id from env", () => {
    const prev = process.env.STRIPE_CONNECT_CLIENT_ID;
    process.env.STRIPE_CONNECT_CLIENT_ID = "ca_test_partner";
    expect(marketplacePartnerStripeConnectClientId()).toBe("ca_test_partner");
    if (prev) process.env.STRIPE_CONNECT_CLIENT_ID = prev;
    else delete process.env.STRIPE_CONNECT_CLIENT_ID;
  });
});

describe("partner-billing config phase 6", () => {
  it("documents stripe connect payout disclosure", () => {
    resetPartnerBillingConfigCache();
    const config = loadPartnerBillingConfig();
    expect(config.disclosure.toLowerCase()).toContain("stripe connect");
  });
});
