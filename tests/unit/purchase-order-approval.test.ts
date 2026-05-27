import { beforeEach, describe, expect, it, vi } from "vitest";

const PO_ID = "00000000-0000-4000-8000-000000000001";

const prismaMock = vi.hoisted(() => ({
  $transaction: vi.fn(),
  purchaseOrder: { findFirst: vi.fn(), update: vi.fn() },
  purchaseApprovalEvent: { create: vi.fn() },
}));

vi.mock("@/lib/scope/require-tenant-actor", () => ({
  requireTenantActor: vi.fn().mockResolvedValue({
    sessionUser: { id: "actor-1", email: "chef@example.com" },
    dataUserId: "user-1",
  }),
}));

vi.mock("@/lib/permissions/mutation-access", () => ({
  requireMutationPermission: vi.fn().mockResolvedValue({
    ok: true,
    actor: {
      sessionUserId: "actor-1",
      dataUserId: "user-1",
      workspaceId: "ws-1",
      workspaceRole: "OWNER",
      email: "chef@example.com",
      granted: new Set(["production.manage"]),
    },
  }),
}));

vi.mock("@/lib/prisma", () => ({ prisma: prismaMock }));

vi.mock("@/services/purchasing/purchase-order-approval-service", () => ({
  notifyPurchaseOrderApprovalRequest: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

import { submitPurchaseOrderForApproval } from "@/actions/purchasing";
import { notifyPurchaseOrderApprovalRequest } from "@/services/purchasing/purchase-order-approval-service";

describe("submitPurchaseOrderForApproval", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    prismaMock.$transaction.mockResolvedValue([]);
    prismaMock.purchaseOrder.findFirst.mockResolvedValue({
      id: PO_ID,
      status: "DRAFT",
      orderNumber: "PO-100",
      total: 42.5,
      supplier: { name: "Fresh Farms" },
    });
  });

  it("rejects empty form data", async () => {
    const result = await submitPurchaseOrderForApproval(new FormData());
    expect(result).toHaveProperty("error");
  });

  it("rejects invalid purchase order id", async () => {
    const formData = new FormData();
    formData.append("purchaseOrderId", "not-a-uuid");
    const result = await submitPurchaseOrderForApproval(formData);
    expect(result).toHaveProperty("error", "Invalid purchase order.");
  });

  it("accepts valid draft PO", async () => {
    const formData = new FormData();
    formData.append("purchaseOrderId", PO_ID);
    const result = await submitPurchaseOrderForApproval(formData);
    expect(result).toEqual({ ok: true });
    expect(prismaMock.$transaction).toHaveBeenCalled();
    expect(notifyPurchaseOrderApprovalRequest).toHaveBeenCalledWith(
      expect.objectContaining({ purchaseOrderId: PO_ID, orderNumber: "PO-100" }),
    );
  });
});
