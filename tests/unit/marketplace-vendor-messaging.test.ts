import { describe, expect, it } from "vitest";

describe("vendor messaging module", () => {
  it("exports chat perspective helpers via service module", async () => {
    const mod = await import("@/services/marketplace/vendor-messaging-service");
    expect(typeof mod.loadOrderChatMessages).toBe("function");
    expect(typeof mod.sendOrderChatMessage).toBe("function");
    expect(typeof mod.assertBuyerOrderChatAccess).toBe("function");
  });
});
