import { beforeEach, describe, expect, it, vi } from "vitest";

const guardPublicApiV1Resource = vi.hoisted(() => vi.fn());
const guardPublicApi = vi.hoisted(() => vi.fn());
const createOrderViaCenter = vi.hoisted(() => vi.fn());

vi.mock("@/lib/api-public/guard", () => ({
  guardPublicApiV1Resource,
  guardPublicApi,
  isGuardError: (value: unknown) =>
    Boolean(value && typeof value === "object" && "response" in value),
}));
vi.mock("@/services/orders/order-creation-service", () => ({
  createOrderViaCenter,
}));
vi.mock("@/lib/prisma", () => ({
  prisma: { order: { findMany: vi.fn(), findFirst: vi.fn() } },
}));

import { POST } from "@/app/api/public/v1/orders/route";

describe("public API orders route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    guardPublicApiV1Resource.mockResolvedValue({ userId: "owner-1" });
  });

  it("routes order creation through the canonical order service", async () => {
    createOrderViaCenter.mockResolvedValue({
      ok: false,
      error: "canonical stop",
    });

    const request = new Request("http://localhost/api/public/v1/orders", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        customerName: "API Customer",
        customerEmail: "api@example.com",
        customerPhone: "+15551234567",
        fulfillmentType: "PICKUP",
        total: 25,
      }),
    });

    const response = await POST(request);
    const json = await response.json();

    expect(response.status).toBe(400);
    expect(json).toEqual({ error: "canonical stop" });
    expect(createOrderViaCenter).toHaveBeenCalledWith(
      { userId: "owner-1" },
      expect.objectContaining({
        orderType: "CUSTOM_ORDER",
        creationSourceOverride: "PUBLIC_API",
        customerName: "API Customer",
        customerEmail: "api@example.com",
      }),
    );
  });
});
