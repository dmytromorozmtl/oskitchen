import { beforeEach, describe, expect, it, vi } from "vitest";

const { prismaMock } = vi.hoisted(() => ({
  prismaMock: {
    marketplacePurchaseOrder: {
      findMany: vi.fn(),
    },
    notificationLog: {
      create: vi.fn(),
    },
  },
}));

vi.mock("@/lib/prisma", () => ({ prisma: prismaMock }));
vi.mock("@/lib/email", () => ({
  isEmailConfigured: vi.fn(() => true),
  sendRawEmail: vi.fn().mockResolvedValue(undefined),
}));

import { sendRawEmail } from "@/lib/email";
import { notifyVendorsOfNewMarketplaceOrders } from "@/services/marketplace/vendor-order-notification-service";

describe("vendor-order-notification-service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("emails vendor contact and writes in-app notification on checkout", async () => {
    prismaMock.marketplacePurchaseOrder.findMany.mockResolvedValue([
      {
        id: "order-1",
        poNumber: "MPO-ABC",
        total: { toString: () => "125.50" },
        currency: "USD",
        status: "SUBMITTED",
        vendorId: "vendor-1",
        vendor: {
          id: "vendor-1",
          companyName: "Fresh Supply Co",
          workspaceId: "vendor-ws-1",
          documents: [
            {
              kind: "registration",
              contactEmail: "orders@freshsupply.test",
            },
            {
              kind: "cabinet_settings",
              notifications: { newOrderEmail: true },
              team: [{ id: "t1", email: "ops@freshsupply.test", role: "MANAGER", status: "active", invitedAt: "" }],
            },
          ],
          workspace: { ownerUserId: "owner-vendor-1" },
        },
        workspace: { name: "Ghost Kitchen Alpha" },
        _count: { items: 3 },
      },
    ]);
    prismaMock.notificationLog.create.mockResolvedValue({ id: "n1" });

    const result = await notifyVendorsOfNewMarketplaceOrders({
      orderIds: ["order-1"],
      buyerWorkspaceId: "buyer-ws-1",
      requiresApproval: false,
    });

    expect(result.emailed).toBe(2);
    expect(result.inApp).toBe(1);
    expect(sendRawEmail).toHaveBeenCalledTimes(2);
    expect(prismaMock.notificationLog.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          dedupeKey: "marketplace-vendor-new-order:order-1",
          templateKey: "marketplace_vendor_new_order",
          userId: "owner-vendor-1",
        }),
      }),
    );
  });

  it("skips email when vendor disabled new order notifications", async () => {
    prismaMock.marketplacePurchaseOrder.findMany.mockResolvedValue([
      {
        id: "order-2",
        poNumber: null,
        total: 40,
        currency: "USD",
        status: "SUBMITTED",
        vendorId: "vendor-2",
        vendor: {
          id: "vendor-2",
          companyName: "Quiet Vendor",
          workspaceId: null,
          documents: [
            { kind: "registration", contactEmail: "quiet@vendor.test" },
            { kind: "cabinet_settings", notifications: { newOrderEmail: false }, team: [] },
          ],
          workspace: null,
        },
        workspace: { name: "Buyer WS" },
        _count: { items: 1 },
      },
    ]);

    const result = await notifyVendorsOfNewMarketplaceOrders({
      orderIds: ["order-2"],
      buyerWorkspaceId: "buyer-ws-1",
      requiresApproval: false,
    });

    expect(result.skipped).toBe(1);
    expect(result.emailed).toBe(0);
    expect(sendRawEmail).not.toHaveBeenCalled();
  });
});
