import { beforeEach, describe, expect, it, vi } from "vitest";

const requireMutationPermission = vi.hoisted(() => vi.fn());
const requireTenantActor = vi.hoisted(() => vi.fn());
const recordAuditLog = vi.hoisted(() => vi.fn());
const userProfileUpdate = vi.hoisted(() => vi.fn());
const kitchenSettingsUpdate = vi.hoisted(() => vi.fn());

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
    kitchenSettings: { update: kitchenSettingsUpdate },
  },
}));

import { reopenOnboardingWizard, onboardingSaveStep1 } from "@/actions/onboarding";

const deniedActor = {
  sessionUserId: "staff-1",
  dataUserId: "owner-1",
  workspaceId: "ws-1",
  workspaceRole: "STAFF" as const,
  staffRoleType: "LINE_COOK" as const,
  email: "cook@example.com",
  granted: new Set<string>(),
};

describe("onboarding actions RBAC", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    requireTenantActor.mockResolvedValue({
      sessionUser: { id: "owner-1", email: "owner@example.com" },
      dataUserId: "owner-1",
    });
    userProfileUpdate.mockResolvedValue({});
    kitchenSettingsUpdate.mockResolvedValue({});
    recordAuditLog.mockResolvedValue(undefined);
  });

  it("denies reopenOnboardingWizard without workspace.settings and audits", async () => {
    requireMutationPermission.mockResolvedValue({
      ok: false,
      error: "Forbidden",
      actor: deniedActor,
    });

    const result = await reopenOnboardingWizard();

    expect(result).toEqual({ error: "Forbidden" });
    expect(requireMutationPermission).toHaveBeenCalledWith("workspace.settings");
    expect(requireTenantActor).not.toHaveBeenCalled();
    expect(userProfileUpdate).not.toHaveBeenCalled();
    expect(recordAuditLog).toHaveBeenCalledWith(
      expect.objectContaining({
        action: "onboarding.permission_denied",
        metadata: expect.objectContaining({
          operation: "onboarding.reopen_wizard",
          requiredPermission: "workspace.settings",
        }),
      }),
    );
  });

  it("denies onboardingSaveStep1 without workspace.settings and audits", async () => {
    requireMutationPermission.mockResolvedValue({
      ok: false,
      error: "Forbidden",
      actor: deniedActor,
    });

    const formData = new FormData();
    formData.set("businessName", "Test Kitchen");

    const result = await onboardingSaveStep1(formData);

    expect(result).toEqual({ error: "Forbidden" });
    expect(requireTenantActor).not.toHaveBeenCalled();
    expect(recordAuditLog).toHaveBeenCalledWith(
      expect.objectContaining({
        metadata: expect.objectContaining({ operation: "onboarding.save_step1" }),
      }),
    );
  });
});
