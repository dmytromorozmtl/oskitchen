import { describe, expect, it } from "vitest";

import {
  mapUberEatsLiveOrderPreview,
  signUberEatsOAuthState,
  verifyUberEatsOAuthState,
  verifyUberEatsWebhookSignature,
} from "@/services/integrations/uber-eats-live-service";

describe("uber-eats-live-service", () => {
  it("round-trips OAuth state", () => {
    const state = signUberEatsOAuthState({
      userId: "00000000-0000-4000-8000-000000000001",
      connectionId: "00000000-0000-4000-8000-000000000002",
    });
    const verified = verifyUberEatsOAuthState(state);
    expect(verified?.userId).toBe("00000000-0000-4000-8000-000000000001");
    expect(verified?.connectionId).toBe("00000000-0000-4000-8000-000000000002");
  });

  it("maps webhook payload to live order preview", () => {
    const preview = mapUberEatsLiveOrderPreview({
      id: "ue-order-1",
      display_id: "1042",
      state: "CONFIRMED",
      cart: { items: [{ title: "Burger", quantity: 1, price: { unit_price: 1200 } }] },
      payment: { total: 1500 },
    });
    expect(preview.externalOrderId).toBe("ue-order-1");
    expect(preview.displayId).toBe("1042");
  });

  it("re-exports webhook signature verifier", () => {
    const body = '{"event":"order.placed"}';
    const secret = "test-secret";
    const crypto = require("crypto") as typeof import("crypto");
    const sig = crypto.createHmac("sha256", secret).update(body).digest("hex");
    expect(verifyUberEatsWebhookSignature(body, sig, secret)).toBe(true);
  });
});
