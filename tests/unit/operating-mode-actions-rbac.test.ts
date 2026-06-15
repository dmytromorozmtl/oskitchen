import { beforeEach, describe, expect, it, vi } from "vitest";

const requireMutationPermission = vi.hoisted(() => vi.fn());
const requireTenantActor = vi.hoisted(() => vi.fn());
const logSettingsPermissionDenied = vi.hoisted(() => vi.fn());
const kitchenSettingsUpdate = vi.hoisted(() => vi.fn());

vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

vi.mock("@/lib/permissions/mutation-access", () => ({
  requireMutationPermission,
}));

vi.mock("@/lib/scope/require-tenant-actor", () => ({
  requireTenantActor,
}));

vi.mock("@/services/settings/settings-permission-audit", () => ({
  logSettingsPermissionDenied,
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    kitchenSettings: {
      update: kitchenSettingsUpdate,
    },
  },
}));

import { updateKitchenOperatingMode } from "@/actions/operating-mode";

const deniedActor = {
  userId: "owner-1",
  sessionUserId: "staff-1",
  dataUserId: "owner-1",
  workspaceId: "ws-1",
  workspaceRole: "STAFF" as const,
  staffRoleType: "LINE_COOK" as const,
  email: "cook@example.com",
  granted: new Set<string>(),
};

describe("operating mode actions RBAC", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    logSettingsPermissionDenied.mockResolvedValue(undefined);
    requireTenantActor.mockResolvedValue({ userId: "owner-1" });
    kitchenSettingsUpdate.mockResolvedValue({});
  });

  it("denies updateKitchenOperatingMode without workspace.settings and audits", async () => {
    requireMutationPermission.mockResolvedValue({
      ok: false,
      error: "You do not have permission to perform this action.",
      actor: deniedActor,
    });

    const result = await updateKitchenOperatingMode("DAILY_SERVICE");

    expect(result).toEqual({ ok: false, error: "forbidden" });
    expect(requireMutationPermission).toHaveBeenCalledWith("workspace.settings");
    expect(requireTenantActor).not.toHaveBeenCalled();
    expect(kitchenSettingsUpdate).not.toHaveBeenCalled();
    expect(logSettingsPermissionDenied).toHaveBeenCalledWith(
      deniedActor,
      expect.objectContaining({
        requiredPermission: "workspace.settings",
        operation: "operating_mode.update",
        metadata: { settingsCapability: "manage_operations" },
      }),
    );
  });

  it("allows updateKitchenOperatingMode when workspace.settings is granted", async () => {
    requireMutationPermission.mockResolvedValue({ ok: true, actor: deniedActor });

    const result = await updateKitchenOperatingMode("DAILY_SERVICE");

    expect(result).toEqual({ ok: true });
    expect(requireTenantActor).toHaveBeenCalled();
    expect(kitchenSettingsUpdate).toHaveBeenCalledWith({
      where: { userId: "owner-1" },
      data: { operatingMode: "DAILY_SERVICE" },
    });
  });
});
