import { describe, expect, it } from "vitest";

import {
  mapGrubhubLiveOrderPreview,
  signGrubhubOAuthState,
  verifyGrubhubOAuthState,
  verifyGrubhubWebhookSignature,
} from "@/services/integrations/grubhub-live-service";

describe("grubhub-live-service", () => {
  it("round-trips OAuth state", () => {
    const state = signGrubhubOAuthState({
      userId: "00000000-0000-4000-8000-000000000001",
      connectionId: "00000000-0000-4000-8000-000000000002",
    });
    const verified = verifyGrubhubOAuthState(state);
    expect(verified?.userId).toBe("00000000-0000-4000-8000-000000000001");
    expect(verified?.connectionId).toBe("00000000-0000-4000-8000-000000000002");
  });

  it("maps webhook payload to live order preview", () => {
    const preview = mapGrubhubLiveOrderPreview({
      id: "gh-order-1",
      total: 2550,
      customer: { name: "Guest" },
      items: [{ name: "Bowl", quantity: 1, price: 2550 }],
    });
    expect(preview.externalOrderId).toBe("gh-order-1");
    expect(preview.total).toBe(25.5);
  });

  it("re-exports webhook signature verifier", () => {
    const body = '{"event":"order.created"}';
    const secret = "test-secret";
    const crypto = require("crypto") as typeof import("crypto");
    const sig = crypto.createHmac("sha256", secret).update(body).digest("hex");
    expect(verifyGrubhubWebhookSignature(body, sig, secret)).toBe(true);
  });
});
