import { beforeEach, describe, expect, it, vi } from "vitest";

const requireMutationPermission = vi.hoisted(() => vi.fn());
const requireTenantActor = vi.hoisted(() => vi.fn());
const recordAuditLog = vi.hoisted(() => vi.fn());
const prismaCreate = vi.hoisted(() => vi.fn());
const prismaFindUnique = vi.hoisted(() => vi.fn());

vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

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
    kitchenSettings: { findUnique: prismaFindUnique },
    holidayPackage: { create: prismaCreate },
  },
}));

import { createHolidayPackageAction } from "@/actions/marketing/holiday-packages";

const deniedActor = {
  sessionUserId: "staff-1",
  dataUserId: "owner-1",
  workspaceId: "ws-1",
  workspaceRole: "STAFF" as const,
  staffRoleType: "VIEWER" as const,
  email: "viewer@example.com",
  granted: new Set<string>(),
};

describe("holiday packages RBAC", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    requireTenantActor.mockResolvedValue({ dataUserId: "owner-1" });
    prismaFindUnique.mockResolvedValue({ currency: "USD" });
    prismaCreate.mockResolvedValue({});
  });

  it("denies create without growth.manage and audits", async () => {
    requireMutationPermission.mockResolvedValue({
      ok: false,
      error: "Forbidden",
      actor: deniedActor,
    });

    const formData = new FormData();
    formData.set("name", "Thanksgiving");
    formData.set("price", "99");
    formData.set("maxOrders", "50");
    formData.set("startDate", "2026-11-20");
    formData.set("endDate", "2026-11-27");

    const result = await createHolidayPackageAction(formData);

    expect(result.ok).toBe(false);
    expect(recordAuditLog).toHaveBeenCalledWith(
      expect.objectContaining({
        action: "holiday_packages.permission_denied",
        metadata: expect.objectContaining({
          operation: "holiday_packages.create",
          requiredPermission: "growth.manage",
        }),
      }),
    );
    expect(prismaCreate).not.toHaveBeenCalled();
  });

  it("allows create when growth.manage passes", async () => {
    requireMutationPermission.mockResolvedValue({ ok: true, actor: deniedActor });

    const formData = new FormData();
    formData.set("name", "Thanksgiving");
    formData.set("price", "99");
    formData.set("maxOrders", "50");
    formData.set("startDate", "2026-11-20");
    formData.set("endDate", "2026-11-27");

    const result = await createHolidayPackageAction(formData);

    expect(result.ok).toBe(true);
    expect(prismaCreate).toHaveBeenCalled();
  });
});
