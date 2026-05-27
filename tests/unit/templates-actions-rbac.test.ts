import { beforeEach, describe, expect, it, vi } from "vitest";

const requireMutationPermission = vi.hoisted(() => vi.fn());
const logTemplatePermissionDenied = vi.hoisted(() => vi.fn());
const requireUserProfile = vi.hoisted(() => vi.fn());
const applyTemplate = vi.hoisted(() => vi.fn());

vi.mock("@/lib/permissions/mutation-access", () => ({
  requireMutationPermission,
}));
vi.mock("@/services/templates/template-permission-audit", () => ({
  logTemplatePermissionDenied,
}));
vi.mock("@/lib/auth", () => ({
  requireUserProfile,
}));
vi.mock("@/services/templates/template-service", () => ({
  applyTemplate,
  previewTemplate: vi.fn(),
  rollbackApplication: vi.fn(),
}));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

import { applyTemplateAction } from "@/actions/templates";

const deniedActor = {
  userId: "owner-1",
  sessionUserId: "session-1",
  workspaceId: "ws-1",
  workspaceRole: "STAFF" as const,
  staffRoleType: "PACKER" as const,
  email: "packer@example.com",
  granted: new Set(["workspace.view"]),
};

describe("templates actions RBAC", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    logTemplatePermissionDenied.mockResolvedValue(undefined);
    requireUserProfile.mockResolvedValue({
      id: "profile-1",
      role: "packer",
      email: "packer@example.com",
    });
    applyTemplate.mockResolvedValue({
      applicationId: "app-1",
      status: "APPLIED",
      errors: [],
    });
  });

  it("denies template apply without templates.manage", async () => {
    requireMutationPermission.mockResolvedValue({
      ok: false,
      error: "You do not have permission to perform this action.",
      actor: deniedActor,
    });

    const result = await applyTemplateAction({
      templateKey: "meal-prep-starter",
      applyMode: "APPLY_CONFIGURATION_ONLY",
      selectedSections: ["business_mode"],
    });

    expect(result).toEqual({ ok: false, error: "You do not have permission to perform this action." });
    expect(requireMutationPermission).toHaveBeenCalledWith("templates.manage");
    expect(applyTemplate).not.toHaveBeenCalled();
    expect(logTemplatePermissionDenied).toHaveBeenCalled();
  });
});
