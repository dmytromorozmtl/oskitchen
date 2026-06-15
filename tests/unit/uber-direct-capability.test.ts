import { afterEach, describe, expect, it } from "vitest";

import {
  getUberDirectBetaMessage,
  getUberDirectCapabilitySnapshot,
  isUberDirectLiveReady,
} from "@/services/delivery/uber-direct";

const ORIGINAL_ENV = { ...process.env };

afterEach(() => {
  process.env = { ...ORIGINAL_ENV };
});

describe("uber direct capability snapshot", () => {
  it("reports placeholder mode when credentials are missing", () => {
    delete process.env.UBER_DIRECT_CLIENT_ID;
    delete process.env.UBER_DIRECT_CLIENT_SECRET;
    delete process.env.UBER_DIRECT_CUSTOMER_ID;
    delete process.env.UBER_DIRECT_WEBHOOK_SECRET;

    expect(getUberDirectCapabilitySnapshot()).toEqual({
      hasClientCredentials: false,
      hasCustomerId: false,
      hasWebhookSecret: false,
      liveQuoteCreateReady: false,
      liveWebhookReady: false,
      placeholderMode: true,
    });
  });

  it("enables BETA readiness when customer id and OAuth creds are present", () => {
    process.env.UBER_DIRECT_CLIENT_ID = "client-id";
    process.env.UBER_DIRECT_CLIENT_SECRET = "client-secret";
    process.env.UBER_DIRECT_CUSTOMER_ID = "customer-1";
    process.env.UBER_DIRECT_WEBHOOK_SECRET = "webhook-secret";

    expect(getUberDirectCapabilitySnapshot()).toEqual({
      hasClientCredentials: true,
      hasCustomerId: true,
      hasWebhookSecret: true,
      liveQuoteCreateReady: true,
      liveWebhookReady: true,
      placeholderMode: false,
    });
    expect(isUberDirectLiveReady()).toBe(true);
  });

  it("uses honest BETA messaging", () => {
    expect(getUberDirectBetaMessage(false)).toContain("Configure UBER_DIRECT");
    expect(getUberDirectBetaMessage(true)).toContain("BETA");
  });
});
