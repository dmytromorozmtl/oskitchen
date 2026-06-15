import { beforeEach, describe, expect, it, vi } from "vitest";

const requireMutationPermission = vi.hoisted(() => vi.fn());
const requireTenantActor = vi.hoisted(() => vi.fn());
const recordAuditLog = vi.hoisted(() => vi.fn());
const deleteMany = vi.hoisted(() => vi.fn());
const listWhereForOwner = vi.hoisted(() => vi.fn());

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

vi.mock("@/lib/scope/workspace-resource-scope", () => ({
  kitchenModulePreferenceListWhereForOwner: listWhereForOwner,
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    kitchenModulePreference: {
      deleteMany,
    },
  },
}));

import { clearKitchenModulePreferences, saveKitchenModulePreferences } from "@/actions/module-preferences";

const deniedActor = {
  sessionUserId: "staff-1",
  dataUserId: "owner-1",
  workspaceId: "ws-1",
  workspaceRole: "STAFF" as const,
  staffRoleType: "LINE_COOK" as const,
  email: "cook@example.com",
  granted: new Set<string>(),
};

describe("module preferences actions RBAC", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    requireTenantActor.mockResolvedValue({ userId: "owner-1" });
    listWhereForOwner.mockResolvedValue({ userId: "owner-1" });
    deleteMany.mockResolvedValue({ count: 2 });
    recordAuditLog.mockResolvedValue(undefined);
  });

  it("denies saveKitchenModulePreferences without workspace.settings and audits", async () => {
    requireMutationPermission.mockResolvedValue({
      ok: false,
      error: "Forbidden",
      actor: deniedActor,
    });

    const result = await saveKitchenModulePreferences({
      modules: [{ key: "pos", enabled: false }],
    });

    expect(result).toEqual({ error: "Forbidden" });
    expect(requireMutationPermission).toHaveBeenCalledWith("workspace.settings");
    expect(requireTenantActor).not.toHaveBeenCalled();
    expect(recordAuditLog).toHaveBeenCalledWith(
      expect.objectContaining({
        action: "module_preferences.permission_denied",
        metadata: expect.objectContaining({
          operation: "module_preferences.save",
          requiredPermission: "workspace.settings",
        }),
      }),
    );
  });

  it("denies clearKitchenModulePreferences without workspace.settings and audits", async () => {
    requireMutationPermission.mockResolvedValue({
      ok: false,
      error: "Forbidden",
      actor: deniedActor,
    });

    const result = await clearKitchenModulePreferences();

    expect(result).toEqual({ error: "Forbidden" });
    expect(deleteMany).not.toHaveBeenCalled();
    expect(recordAuditLog).toHaveBeenCalledWith(
      expect.objectContaining({
        metadata: expect.objectContaining({ operation: "module_preferences.clear" }),
      }),
    );
  });

  it("allows clearKitchenModulePreferences when workspace.settings is granted", async () => {
    requireMutationPermission.mockResolvedValue({ ok: true, actor: deniedActor });

    const result = await clearKitchenModulePreferences();

    expect(result).toEqual({ ok: true });
    expect(requireTenantActor).toHaveBeenCalled();
    expect(deleteMany).toHaveBeenCalled();
  });
});
