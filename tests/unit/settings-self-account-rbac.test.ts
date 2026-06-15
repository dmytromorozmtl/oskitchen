import { beforeEach, describe, expect, it, vi } from "vitest";

const requireMutationPermission = vi.hoisted(() => vi.fn());
const requireTenantActor = vi.hoisted(() => vi.fn());
const recordAuditLog = vi.hoisted(() => vi.fn());
const userProfileUpdate = vi.hoisted(() => vi.fn());
const supabaseUpdateUser = vi.hoisted(() => vi.fn());

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
    userProfile: { update: userProfileUpdate },
  },
}));

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn().mockResolvedValue({
    auth: {
      updateUser: supabaseUpdateUser,
      signInWithPassword: vi.fn(),
    },
  }),
}));

import { updateProfileAction } from "@/actions/settings/profile";
import { changePasswordAction } from "@/actions/settings/password";

const deniedActor = {
  sessionUserId: "staff-1",
  dataUserId: "owner-1",
  workspaceId: "ws-1",
  workspaceRole: "STAFF" as const,
  staffRoleType: "LINE_COOK" as const,
  email: "cook@example.com",
  granted: new Set<string>(),
};

describe("settings self-account RBAC", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    requireTenantActor.mockResolvedValue({
      sessionUser: { id: "staff-1", email: "cook@example.com" },
      dataUserId: "owner-1",
      workspaceId: "ws-1",
    });
    userProfileUpdate.mockResolvedValue({});
    supabaseUpdateUser.mockResolvedValue({ error: null });
    recordAuditLog.mockResolvedValue(undefined);
  });

  it("denies owner company name update without workspace.settings and audits", async () => {
    requireMutationPermission.mockResolvedValue({
      ok: false,
      error: "Forbidden",
      actor: deniedActor,
    });

    const formData = new FormData();
    formData.set("fullName", "Cook User");
    formData.set("companyName", "Acme Kitchen");

    const result = await updateProfileAction(formData);

    expect(result).toEqual({ ok: false, error: "Forbidden" });
    expect(requireMutationPermission).toHaveBeenCalledWith("workspace.settings");
    expect(userProfileUpdate).not.toHaveBeenCalled();
    expect(recordAuditLog).toHaveBeenCalledWith(
      expect.objectContaining({
        action: "settings_profile.permission_denied",
        metadata: expect.objectContaining({ operation: "settings_profile.update_company" }),
      }),
    );
  });

  it("denies staff setting company name on owner workspace profile", async () => {
    requireMutationPermission.mockResolvedValue({
      ok: true,
      actor: deniedActor,
    });

    const formData = new FormData();
    formData.set("fullName", "Cook User");
    formData.set("companyName", "Acme Kitchen");

    const result = await updateProfileAction(formData);

    expect(result).toEqual({ ok: false, error: "You do not have permission to perform this action." });
    expect(userProfileUpdate).not.toHaveBeenCalled();
    expect(recordAuditLog).toHaveBeenCalledWith(
      expect.objectContaining({
        metadata: expect.objectContaining({ reason: "owner_profile_only" }),
      }),
    );
  });

  it("allows self-service password change without workspace.settings", async () => {
    const signInWithPassword = vi.fn().mockResolvedValue({ error: null });
    const { createClient } = await import("@/lib/supabase/server");
    vi.mocked(createClient).mockResolvedValue({
      auth: {
        updateUser: supabaseUpdateUser,
        signInWithPassword,
      },
    } as never);

    const formData = new FormData();
    formData.set("currentPassword", "old-password");
    formData.set("newPassword", "new-password-12");

    const result = await changePasswordAction(formData);

    expect(result).toEqual({ ok: true, value: undefined });
    expect(requireMutationPermission).not.toHaveBeenCalled();
    expect(signInWithPassword).toHaveBeenCalled();
  });
});
