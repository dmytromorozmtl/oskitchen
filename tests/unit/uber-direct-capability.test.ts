import { afterEach, describe, expect, it } from "vitest";

import {
  getUberDirectCapabilitySnapshot,
  getUberDirectWebhookPlaceholderMessage,
} from "@/services/delivery/uber-direct";

const ORIGINAL_ENV = { ...process.env };

afterEach(() => {
  process.env = { ...ORIGINAL_ENV };
});

describe("uber direct capability snapshot", () => {
  it("reports placeholder mode even when credentials are missing", () => {
    delete process.env.UBER_DIRECT_CLIENT_ID;
    delete process.env.UBER_DIRECT_CLIENT_SECRET;
    delete process.env.UBER_DIRECT_WEBHOOK_SECRET;

    expect(getUberDirectCapabilitySnapshot()).toEqual({
      hasClientCredentials: false,
      hasWebhookSecret: false,
      liveQuoteCreateReady: false,
      liveWebhookReady: false,
      placeholderMode: true,
    });
  });

  it("surfaces credential and webhook-secret presence without claiming live readiness", () => {
    process.env.UBER_DIRECT_CLIENT_ID = "client-id";
    process.env.UBER_DIRECT_CLIENT_SECRET = "client-secret";
    process.env.UBER_DIRECT_WEBHOOK_SECRET = "webhook-secret";

    expect(getUberDirectCapabilitySnapshot()).toEqual({
      hasClientCredentials: true,
      hasWebhookSecret: true,
      liveQuoteCreateReady: false,
      liveWebhookReady: false,
      placeholderMode: true,
    });
  });

  it("uses an explicit placeholder message for webhook ingress", () => {
    expect(getUberDirectWebhookPlaceholderMessage()).toContain("not implemented yet");
    expect(getUberDirectWebhookPlaceholderMessage()).toContain("placeholder mode");
  });
});
