import { beforeEach, describe, expect, it, vi } from "vitest";

const requireMutationPermission = vi.hoisted(() => vi.fn());
const recordAuditLog = vi.hoisted(() => vi.fn());
const kitchenCustomerFindFirst = vi.hoisted(() => vi.fn());
const transaction = vi.hoisted(() => vi.fn());

vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

vi.mock("@/lib/permissions/mutation-access", () => ({
  requireMutationPermission,
}));

vi.mock("@/lib/audit-log", () => ({
  recordAuditLog,
}));

vi.mock("@/lib/auth", () => ({
  requireUserProfile: vi.fn().mockResolvedValue({ role: "OWNER", companyName: "Test Co" }),
}));

vi.mock("@/lib/scope/workspace-customer-scope", () => ({
  kitchenCustomerByIdWhereForOwner: vi.fn().mockResolvedValue({ userId: "owner-1" }),
  kitchenCustomerListWhereForOwner: vi.fn().mockResolvedValue({ userId: "owner-1" }),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    kitchenCustomer: {
      findFirst: kitchenCustomerFindFirst,
      findMany: vi.fn(),
      deleteMany: vi.fn(),
    },
    customerSubscription: { updateMany: vi.fn() },
    customerMergeEvent: { create: vi.fn() },
    $transaction: transaction,
  },
}));

import { mergeCustomers, runGoLiveTestRun } from "@/actions/implementation";

const PRIMARY_ID = "11111111-1111-4111-8111-111111111111";
const DUPLICATE_ID = "22222222-2222-4222-8222-222222222222";

const deniedActor = {
  sessionUserId: "staff-1",
  sessionUser: { id: "staff-1", email: "cook@example.com" },
  dataUserId: "owner-1",
  userId: "owner-1",
  workspaceId: "ws-1",
  workspaceRole: "STAFF" as const,
  staffRoleType: "LINE_COOK" as const,
  email: "cook@example.com",
  granted: new Set<string>(),
  platformBypass: false,
};

describe("legacy implementation actions RBAC", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    recordAuditLog.mockResolvedValue(undefined);
    kitchenCustomerFindFirst.mockResolvedValue({ id: PRIMARY_ID });
    transaction.mockImplementation(async (ops: unknown[]) => ops);
  });

  it("denies mergeCustomers without customers.manage and audits", async () => {
    requireMutationPermission.mockResolvedValue({
      ok: false,
      error: "Forbidden",
      actor: deniedActor,
    });

    const formData = new FormData();
    formData.set("primaryCustomerId", PRIMARY_ID);
    formData.set("mergedCustomerIds", DUPLICATE_ID);

    const result = await mergeCustomers(formData);

    expect(result).toEqual({ error: "Forbidden" });
    expect(requireMutationPermission).toHaveBeenCalledWith("customers.manage");
    expect(transaction).not.toHaveBeenCalled();
    expect(recordAuditLog).toHaveBeenCalledWith(
      expect.objectContaining({
        action: "implementation.permission_denied",
        metadata: expect.objectContaining({
          operation: "implementation.merge_customers",
          requiredPermission: "customers.manage",
        }),
      }),
    );
  });

  it("denies runGoLiveTestRun without go-live.manage and audits", async () => {
    requireMutationPermission.mockResolvedValue({
      ok: false,
      error: "Forbidden",
      actor: deniedActor,
    });

    const formData = new FormData();
    formData.set("selectedOrders", "current open orders");

    const result = await runGoLiveTestRun(formData);

    expect(result).toEqual({ error: "Forbidden" });
    expect(requireMutationPermission).toHaveBeenCalledWith("go-live.manage");
    expect(recordAuditLog).toHaveBeenCalledWith(
      expect.objectContaining({
        metadata: expect.objectContaining({
          operation: "implementation.run_go_live_test",
        }),
      }),
    );
  });
});
