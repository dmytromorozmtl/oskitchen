import { beforeEach, describe, expect, it, vi } from "vitest";

const requireMutationPermission = vi.hoisted(() => vi.fn());
const requireTenantActor = vi.hoisted(() => vi.fn());
const recordAuditLog = vi.hoisted(() => vi.fn());

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

vi.mock("@/lib/permissions/mutation-access", () => ({
  requireMutationPermission,
}));

vi.mock("@/lib/scope/require-tenant-actor", () => ({
  requireTenantActor,
}));

vi.mock("@/lib/audit-log", () => ({
  recordAuditLog,
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    $transaction: vi.fn(),
    purchaseOrder: { findFirst: vi.fn(), update: vi.fn() },
    purchaseApprovalEvent: { create: vi.fn() },
  },
}));

vi.mock("@/services/purchasing/purchase-order-approval-service", () => ({
  notifyPurchaseOrderApprovalRequest: vi.fn(),
}));

import { prisma } from "@/lib/prisma";
import {
  approvePurchaseOrder,
  rejectPurchaseOrder,
  submitPurchaseOrderForApproval,
} from "@/actions/purchasing";

const PO_ID = "00000000-0000-4000-8000-000000000001";

const deniedActor = {
  sessionUserId: "user-1",
  dataUserId: "owner-1",
  workspaceId: "ws-1",
  workspaceRole: "STAFF" as const,
  staffRoleType: "LINE_COOK" as const,
  email: "cook@example.com",
  granted: new Set<string>(),
};

describe("purchasing actions RBAC", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    requireTenantActor.mockResolvedValue({
      sessionUser: { id: "actor-1", email: "owner@example.com" },
      dataUserId: "owner-1",
    });
  });

  it("denies submitPurchaseOrderForApproval without production.manage", async () => {
    requireMutationPermission.mockResolvedValue({
      ok: false,
      error: "Forbidden",
      actor: deniedActor,
    });

    const formData = new FormData();
    formData.set("purchaseOrderId", PO_ID);
    const result = await submitPurchaseOrderForApproval(formData);

    expect(result).toEqual({ ok: false, error: "Forbidden" });
    expect(requireMutationPermission).toHaveBeenCalledWith("production.manage");
    expect(requireTenantActor).not.toHaveBeenCalled();
    expect(recordAuditLog).toHaveBeenCalledWith(
      expect.objectContaining({
        action: "purchasing.permission_denied",
        metadata: expect.objectContaining({
          operation: "purchasing.submit_for_approval",
          requiredPermission: "production.manage",
        }),
      }),
    );
  });

  it("denies approvePurchaseOrder without reports.read.financial", async () => {
    requireMutationPermission.mockResolvedValue({
      ok: false,
      error: "Forbidden",
      actor: deniedActor,
    });

    const formData = new FormData();
    formData.set("purchaseOrderId", PO_ID);
    const result = await approvePurchaseOrder(formData);

    expect(result).toEqual({ ok: false, error: "Forbidden" });
    expect(requireMutationPermission).toHaveBeenCalledWith("reports.read.financial");
    expect(prisma.purchaseOrder.findFirst).not.toHaveBeenCalled();
  });

  it("denies rejectPurchaseOrder without reports.read.financial", async () => {
    requireMutationPermission.mockResolvedValue({
      ok: false,
      error: "Forbidden",
      actor: deniedActor,
    });

    const formData = new FormData();
    formData.set("purchaseOrderId", PO_ID);
    const result = await rejectPurchaseOrder(formData);

    expect(result).toEqual({ ok: false, error: "Forbidden" });
    expect(requireMutationPermission).toHaveBeenCalledWith("reports.read.financial");
    expect(prisma.purchaseOrder.findFirst).not.toHaveBeenCalled();
  });
});
