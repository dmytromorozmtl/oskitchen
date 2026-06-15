import { beforeEach, describe, expect, it, vi } from "vitest";

const requireMutationPermission = vi.hoisted(() => vi.fn());
const requireTenantActor = vi.hoisted(() => vi.fn());
const recordAuditLog = vi.hoisted(() => vi.fn());
const brandUpdate = vi.hoisted(() => vi.fn());
const brandFindFirst = vi.hoisted(() => vi.fn());

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
    brand: {
      findFirst: brandFindFirst,
      update: brandUpdate,
    },
  },
}));

import { updateBrandLifecycle } from "@/actions/brands";

const BRAND_ID = "11111111-1111-4111-8111-111111111111";

const deniedActor = {
  sessionUserId: "staff-1",
  dataUserId: "owner-1",
  workspaceId: "ws-1",
  workspaceRole: "STAFF" as const,
  staffRoleType: "LINE_COOK" as const,
  email: "cook@example.com",
  granted: new Set<string>(),
};

describe("brands actions RBAC", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    requireTenantActor.mockResolvedValue({
      sessionUser: { id: "owner-1" },
      dataUserId: "owner-1",
    });
    brandFindFirst.mockResolvedValue({
      id: BRAND_ID,
      workspaceId: "ws-1",
    });
    brandUpdate.mockResolvedValue({ id: BRAND_ID });
    recordAuditLog.mockResolvedValue(undefined);
  });

  it("denies updateBrandLifecycle without workspace.settings and audits", async () => {
    requireMutationPermission.mockResolvedValue({
      ok: false,
      error: "Forbidden",
      actor: deniedActor,
    });

    const formData = new FormData();
    formData.set("brandId", BRAND_ID);
    formData.set("lifecycleStatus", "PAUSED");

    const result = await updateBrandLifecycle(formData);

    expect(result).toEqual({ error: "Forbidden" });
    expect(requireMutationPermission).toHaveBeenCalledWith("workspace.settings");
    expect(requireTenantActor).not.toHaveBeenCalled();
    expect(brandUpdate).not.toHaveBeenCalled();
    expect(recordAuditLog).toHaveBeenCalledWith(
      expect.objectContaining({
        action: "brands.permission_denied",
        metadata: expect.objectContaining({
          operation: "brands.update_lifecycle",
          requiredPermission: "workspace.settings",
        }),
      }),
    );
  });

  it("allows updateBrandLifecycle when workspace.settings is granted", async () => {
    requireMutationPermission.mockResolvedValue({ ok: true, actor: deniedActor });

    const formData = new FormData();
    formData.set("brandId", BRAND_ID);
    formData.set("lifecycleStatus", "PAUSED");

    const result = await updateBrandLifecycle(formData);

    expect(result).toEqual({ ok: true });
    expect(requireTenantActor).toHaveBeenCalled();
    expect(brandUpdate).toHaveBeenCalledWith({
      where: { id: BRAND_ID },
      data: { lifecycleStatus: "PAUSED" },
    });
  });
});
