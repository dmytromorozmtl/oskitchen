import { beforeEach, describe, expect, it, vi } from "vitest";

const requireMutationPermission = vi.hoisted(() => vi.fn());
const requireTenantActor = vi.hoisted(() => vi.fn());
const recordAuditLog = vi.hoisted(() => vi.fn());
const kitchenSettingsUpsert = vi.hoisted(() => vi.fn());
const userProfileUpdate = vi.hoisted(() => vi.fn());

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
    kitchenSettings: { upsert: kitchenSettingsUpsert },
    userProfile: { update: userProfileUpdate },
  },
}));

import { updateKitchenSettings } from "@/actions/settings";

const deniedActor = {
  sessionUserId: "staff-1",
  dataUserId: "owner-1",
  workspaceId: "ws-1",
  workspaceRole: "STAFF" as const,
  staffRoleType: "LINE_COOK" as const,
  email: "cook@example.com",
  granted: new Set<string>(),
};

describe("settings actions RBAC", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    requireTenantActor.mockResolvedValue({
      sessionUser: { id: "owner-1" },
      dataUserId: "owner-1",
    });
    kitchenSettingsUpsert.mockResolvedValue({});
    userProfileUpdate.mockResolvedValue({});
    recordAuditLog.mockResolvedValue(undefined);
  });

  it("denies updateKitchenSettings without workspace.settings and audits", async () => {
    requireMutationPermission.mockResolvedValue({
      ok: false,
      error: "Forbidden",
      actor: deniedActor,
    });

    const formData = new FormData();
    formData.set("businessName", "Main Kitchen");
    formData.set("timezone", "UTC");
    formData.set("locale", "en");

    const result = await updateKitchenSettings(formData);

    expect(result).toEqual({ error: "Forbidden" });
    expect(requireMutationPermission).toHaveBeenCalledWith("workspace.settings");
    expect(requireTenantActor).not.toHaveBeenCalled();
    expect(kitchenSettingsUpsert).not.toHaveBeenCalled();
    expect(recordAuditLog).toHaveBeenCalledWith(
      expect.objectContaining({
        action: "kitchen_settings.permission_denied",
        metadata: expect.objectContaining({
          operation: "kitchen_settings.update",
          requiredPermission: "workspace.settings",
        }),
      }),
    );
  });
});
