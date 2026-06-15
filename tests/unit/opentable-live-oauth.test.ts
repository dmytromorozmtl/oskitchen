import { createHmac } from "crypto";

import { describe, expect, it } from "vitest";

import {
  signOpenTableOAuthState,
  verifyOpenTableOAuthState,
  verifyOpenTableWebhookSignature,
} from "@/services/integrations/opentable/opentable-live-service";

describe("opentable oauth state", () => {
  it("round-trips signed state", () => {
    const state = signOpenTableOAuthState({ userId: "user-1", connectionId: "conn-1" });
    const verified = verifyOpenTableOAuthState(state);
    expect(verified).toEqual({ userId: "user-1", connectionId: "conn-1" });
  });

  it("rejects tampered state", () => {
    const state = signOpenTableOAuthState({ userId: "user-1", connectionId: "conn-1" });
    expect(verifyOpenTableOAuthState(`${state}x`)).toBeNull();
  });
});

describe("opentable webhook signature", () => {
  it("verifies HMAC sha256 signature", () => {
    const body = JSON.stringify({ event: "reservation.created" });
    const secret = "test-secret";
    const sig = createHmac("sha256", secret).update(body).digest("hex");
    expect(verifyOpenTableWebhookSignature(body, sig, secret)).toBe(true);
    expect(verifyOpenTableWebhookSignature(body, "bad", secret)).toBe(false);
  });
});
