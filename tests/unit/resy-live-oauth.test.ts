import { createHmac } from "crypto";

import { describe, expect, it } from "vitest";

import {
  signResyOAuthState,
  verifyResyOAuthState,
  verifyResyWebhookSignature,
} from "@/services/integrations/resy/resy-live-service";

describe("resy oauth state", () => {
  it("round-trips signed state", () => {
    const state = signResyOAuthState({ userId: "user-1", connectionId: "conn-1" });
    const verified = verifyResyOAuthState(state);
    expect(verified).toEqual({ userId: "user-1", connectionId: "conn-1" });
  });

  it("rejects tampered state", () => {
    const state = signResyOAuthState({ userId: "user-1", connectionId: "conn-1" });
    expect(verifyResyOAuthState(`${state}x`)).toBeNull();
  });
});

describe("resy webhook signature", () => {
  it("verifies HMAC sha256 signature", () => {
    const body = JSON.stringify({ event: "reservation.created" });
    const secret = "test-secret";
    const sig = createHmac("sha256", secret).update(body).digest("hex");
    expect(verifyResyWebhookSignature(body, sig, secret)).toBe(true);
    expect(verifyResyWebhookSignature(body, "bad", secret)).toBe(false);
  });
});
