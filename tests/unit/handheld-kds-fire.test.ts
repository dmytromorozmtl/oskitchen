import { beforeEach, describe, expect, it, vi } from "vitest";

const canUseFeature = vi.hoisted(() => vi.fn());
const createOrderViaCenter = vi.hoisted(() => vi.fn());
const enqueueKitchenRoutingForPosOrder = vi.hoisted(() => vi.fn());
const auditLog = vi.hoisted(() => vi.fn());
const addItemToTab = vi.hoisted(() => vi.fn());

const state = vi.hoisted(() => ({
  register: {
    id: "22222222-2222-4222-8222-222222222222",
    userId: "owner-1",
    locationId: "33333333-3333-4333-8333-333333333333",
  },
  workItemCount: 2,
}));

vi.mock("@/lib/plans/feature-registry", () => ({ canUseFeature }));
vi.mock("@/services/orders/order-creation-service", () => ({ createOrderViaCenter }));
vi.mock("@/services/pos/pos-kitchen-routing-service", () => ({
  enqueueKitchenRoutingForPosOrder,
}));
vi.mock("@/services/audit/audit-service", () => ({ auditLog }));
vi.mock("@/services/pos/tab-service", () => ({ addItemToTab }));
vi.mock("@/lib/scope/workspace-resource-scope", () => ({
  ownerScopedAnd: vi.fn(async () => ({ orderId: "order-1" })),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    pOSRegister: {
      findFirst: vi.fn(async ({ where }: { where: { id: string; userId: string } }) => {
        if (where.id !== state.register.id || where.userId !== state.register.userId) {
          return null;
        }
        return state.register;
      }),
    },
    productionWorkItem: {
      count: vi.fn(async () => state.workItemCount),
    },
  },
}));

import { fireHandheldOrderToKds } from "@/services/pos/handheld-kds-fire-service";
import { HANDHELD_KDS_ROUTE } from "@/lib/pos/handheld-ordering";

describe("handheld KDS fire", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    canUseFeature.mockResolvedValue({ allowed: true });
    createOrderViaCenter.mockResolvedValue({ ok: true, orderId: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa" });
    enqueueKitchenRoutingForPosOrder.mockResolvedValue(undefined);
    auditLog.mockResolvedValue(undefined);
    addItemToTab.mockResolvedValue({ id: "tab-1" });
    state.workItemCount = 2;
  });

  it("exposes kitchen display route", () => {
    expect(HANDHELD_KDS_ROUTE).toBe("/dashboard/kitchen");
  });

  it("rejects when POS feature gate is closed", async () => {
    canUseFeature.mockResolvedValue({ allowed: false, reason: "plan" });
    const result = await fireHandheldOrderToKds("owner-1", "actor-1", {
      registerId: state.register.id,
      shiftId: null,
      staffMemberId: null,
      locationId: null,
      tableId: null,
      tableName: null,
      tabId: null,
      lines: [],
    });
    expect(result).toEqual({ ok: false, error: "POS unavailable (plan)." });
  });

  it("creates order, routes to kitchen, and syncs tab items", async () => {
    const result = await fireHandheldOrderToKds("owner-1", "actor-1", {
      registerId: state.register.id,
      shiftId: null,
      staffMemberId: null,
      locationId: state.register.locationId,
      tableId: "44444444-4444-4444-8444-444444444444",
      tableName: "4",
      tabId: "55555555-5555-4555-8555-555555555555",
      lines: [
        {
          productId: "66666666-6666-4666-8666-666666666666",
          title: "Burger",
          quantity: 2,
          unitPrice: 12,
        },
      ],
    });

    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(result.orderId).toBe("aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa");
    expect(result.workItemsCreated).toBe(2);
    expect(result.lineCount).toBe(1);
    expect(createOrderViaCenter).toHaveBeenCalledOnce();
    expect(enqueueKitchenRoutingForPosOrder).toHaveBeenCalledWith(
      "owner-1",
      "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
    );
    expect(addItemToTab).toHaveBeenCalledWith(
      "55555555-5555-4555-8555-555555555555",
      "owner-1",
      { productName: "Burger", quantity: 2, unitPrice: 12 },
    );
    expect(auditLog).toHaveBeenCalled();
  });
});
