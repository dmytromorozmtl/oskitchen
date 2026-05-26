import { beforeEach, describe, expect, it, vi } from "vitest";

const revalidatePath = vi.hoisted(() => vi.fn());
const createOrderViaCenter = vi.hoisted(() => vi.fn());
const requireMutationPermission = vi.hoisted(() => vi.fn());
const menuListWhereForOwnerAnd = vi.hoisted(() => vi.fn());
const prismaMock = vi.hoisted(() => ({
  menu: { findFirst: vi.fn() },
  product: { findMany: vi.fn() },
  kitchenSettings: { findUnique: vi.fn() },
}));

vi.mock("next/cache", () => ({ revalidatePath }));
vi.mock("@/services/orders/order-creation-service", () => ({
  createOrderViaCenter,
}));
vi.mock("@/lib/permissions/mutation-access", () => ({
  requireMutationPermission,
}));
vi.mock("@/lib/scope/workspace-resource-scope", () => ({
  menuByIdWhereForOwner: vi.fn(),
  menuListWhereForOwnerAnd,
}));
vi.mock("@/lib/prisma", () => ({ prisma: prismaMock }));
vi.mock("@/lib/email", () => ({
  sendDeliveryReminder: vi.fn(),
  sendOrderConfirmation: vi.fn(),
  sendOrderReady: vi.fn(),
  sendPickupReminder: vi.fn(),
  sendPreorderReminder: vi.fn(),
}));
vi.mock("@/services/notifications/order-lifecycle-push", () => ({
  notifyNewOrderPush: vi.fn(),
  notifyOrderReadyPush: vi.fn(),
}));
vi.mock("@/services/crm/customer-metrics-service", () => ({
  recomputeMetricsForOrderEmail: vi.fn(),
}));
vi.mock("@/services/audit/audit-service", () => ({ auditLog: vi.fn() }));
vi.mock("@/services/workflows/order-lifecycle-service", () => ({
  auditOrderDbStatusChange: vi.fn(),
}));
vi.mock("@/lib/scope/require-tenant-actor", () => ({
  requireTenantActor: vi.fn(),
}));
vi.mock("@/lib/scope/owned-order-guard", () => ({
  whereOwnedOrderForOwner: vi.fn(),
}));
vi.mock("@/lib/scope/workspace-order-scope", () => ({
  orderListWhereForOwner: vi.fn(),
}));

import { createOrder } from "@/actions/orders";

describe("createOrder action", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    requireMutationPermission.mockResolvedValue({
      ok: true,
      actor: {
        userId: "owner-1",
        workspaceId: "ws-1",
        sessionUser: { id: "session-user", email: "owner@example.com" },
      },
    });
    menuListWhereForOwnerAnd.mockResolvedValue({});
    prismaMock.menu.findFirst.mockResolvedValue({ id: "menu-1" });
    prismaMock.product.findMany.mockResolvedValue([
      {
        id: "11111111-1111-4111-8111-111111111111",
        menuId: "menu-1",
        active: true,
        title: "Meal",
        price: 12,
      },
    ]);
    prismaMock.kitchenSettings.findUnique.mockResolvedValue({
      notifyOrderConfirmation: false,
    });
  });

  it("routes manual order creation through the canonical order service", async () => {
    createOrderViaCenter.mockResolvedValue({
      ok: false,
      error: "canonical stop",
    });

    const formData = new FormData();
    formData.set("customerName", "Jane Doe");
    formData.set("customerEmail", "jane@example.com");
    formData.set("customerPhone", "+123456789");
    formData.set("fulfillmentType", "PICKUP");
    formData.append("productId", "11111111-1111-4111-8111-111111111111");
    formData.append("qty", "1");

    const result = await createOrder(formData);

    expect(result).toEqual({ error: "canonical stop" });
    expect(createOrderViaCenter).toHaveBeenCalledWith(
      {
        userId: "owner-1",
        performedById: "session-user",
        workspaceId: "ws-1",
      },
      expect.objectContaining({
        orderType: "PREORDER",
        persistedOrderType: "MANUAL",
        customerName: "Jane Doe",
        customerEmail: "jane@example.com",
        customerPhone: "+123456789",
      }),
    );
  });
});
