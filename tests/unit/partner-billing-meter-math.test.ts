import { describe, expect, it } from "vitest";

import {
  computePartnerPublisherShareCents,
  partnerBillingMeterKindLabel,
  sumMeterEventsPublisherShareCents,
} from "@/lib/platform/partner-billing-meter-math";
import {
  loadPartnerBillingConfig,
  resetPartnerBillingConfigCache,
  resolvePartnerBillingRates,
} from "@/lib/platform/partner-billing-config";
import {
  buildCapitalOAuthState,
  parseCapitalOAuthState,
} from "@/lib/commercial/capital-lender-oauth";

describe("partner-billing-meter-math", () => {
  it("computes publisher share from gross and bps", () => {
    expect(
      computePartnerPublisherShareCents({ grossCents: 10_000, revenueShareBps: 1500 }),
    ).toBe(1500);
    expect(computePartnerPublisherShareCents({ grossCents: 0, revenueShareBps: 1500 })).toBe(0);
  });

  it("sums meter events into publisher share", () => {
    const share = sumMeterEventsPublisherShareCents(
      [
        { unitAmountCents: 500, quantity: 2 },
        { unitAmountCents: 1, quantity: 100 },
      ],
      2000,
    );
    expect(share).toBe(220);
  });

  it("labels meter kinds for statements", () => {
    expect(partnerBillingMeterKindLabel("API_REQUEST")).toBe("Partner API requests");
    expect(partnerBillingMeterKindLabel("WEBHOOK_DELIVERY")).toBe("Webhook deliveries");
  });
});

describe("partner-billing config phase 7 rates", () => {
  it("loads API and webhook unit fees", () => {
    resetPartnerBillingConfigCache();
    const config = loadPartnerBillingConfig();
    expect(config.defaultApiRequestFeeCentsPerCall).toBeGreaterThan(0);
    expect(config.defaultWebhookDeliveryFeeCentsPerDelivery).toBeGreaterThan(0);
  });

  it("resolves per-app usage meter rates", () => {
    resetPartnerBillingConfigCache();
    const rates = resolvePartnerBillingRates({
      clientId: "sandbox-opsbridge-connector",
      publisher: "KitchenOS Certified SI — OpsBridge",
    });
    expect(rates.apiRequestFeeCentsPerCall).toBe(1);
    expect(rates.webhookDeliveryFeeCentsPerDelivery).toBe(2);
    expect(rates.revenueShareBps).toBe(2000);
  });
});

describe("capital oauth state (regression guard)", () => {
  it("still parses capital oauth state", () => {
    const id = "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa";
    expect(parseCapitalOAuthState(buildCapitalOAuthState(id))).toBe(id);
  });
});
