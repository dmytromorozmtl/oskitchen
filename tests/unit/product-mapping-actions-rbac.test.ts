import { beforeEach, describe, expect, it, vi } from "vitest";

const requireMutationPermission = vi.hoisted(() => vi.fn());
const logProductMappingPermissionDenied = vi.hoisted(() => vi.fn());
const requireUserProfile = vi.hoisted(() => vi.fn());
const approveMapping = vi.hoisted(() => vi.fn());

vi.mock("@/lib/permissions/mutation-access", () => ({
  requireMutationPermission,
}));
vi.mock("@/services/product-mapping/product-mapping-permission-audit", () => ({
  logProductMappingPermissionDenied,
}));
vi.mock("@/lib/auth", () => ({
  requireUserProfile,
}));
vi.mock("@/services/product-mapping/product-mapping-service", () => ({
  approveMapping,
  bulkApproveSafe: vi.fn(),
  bulkArchive: vi.fn(),
  bulkIgnore: vi.fn(),
  changeMappingStatus: vi.fn(),
  createAlias: vi.fn(),
  createOrUpdateMapping: vi.fn(),
  rejectMapping: vi.fn(),
  upsertModifierMapping: vi.fn(),
}));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

import { approveMappingAction } from "@/actions/product-mapping";

const deniedActor = {
  userId: "owner-1",
  sessionUserId: "session-1",
  workspaceId: "ws-1",
  workspaceRole: "STAFF" as const,
  staffRoleType: "PACKER" as const,
  email: "packer@example.com",
  granted: new Set(["workspace.view"]),
};

describe("product-mapping actions RBAC", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    logProductMappingPermissionDenied.mockResolvedValue(undefined);
    requireUserProfile.mockResolvedValue({
      id: "profile-1",
      role: "packer",
      email: "packer@example.com",
    });
    approveMapping.mockResolvedValue({ ok: true });
  });

  it("denies mapping approve without integrations.manage", async () => {
    requireMutationPermission.mockResolvedValue({
      ok: false,
      error: "You do not have permission to perform this action.",
      actor: deniedActor,
    });

    const fd = new FormData();
    fd.set("mappingId", "00000000-0000-4000-8000-000000000001");
    fd.set("confirm", "true");

    await expect(approveMappingAction(fd)).rejects.toThrow("You do not have permission");
    expect(requireMutationPermission).toHaveBeenCalledWith("integrations.manage");
    expect(approveMapping).not.toHaveBeenCalled();
    expect(logProductMappingPermissionDenied).toHaveBeenCalled();
  });
});
