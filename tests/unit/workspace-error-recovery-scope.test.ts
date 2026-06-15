import { beforeEach, describe, expect, it, vi } from "vitest";

import { buildOwnerScopedWhere } from "@/lib/scope/workspace-resource-scope";
import { errorRecoveryItemListWhereForOwner } from "@/lib/scope/workspace-error-recovery-scope";

vi.mock("@/lib/scope/resolve-owner-workspace-id", () => ({
  resolveOwnerWorkspaceId: vi.fn(),
}));

import { resolveOwnerWorkspaceId } from "@/lib/scope/resolve-owner-workspace-id";

describe("workspace-error-recovery-scope", () => {
  beforeEach(() => {
    vi.mocked(resolveOwnerWorkspaceId).mockReset();
  });

  it("errorRecoveryItemListWhereForOwner uses workspace OR", async () => {
    vi.mocked(resolveOwnerWorkspaceId).mockResolvedValue("ws-1");
    await expect(errorRecoveryItemListWhereForOwner("owner-1")).resolves.toEqual(
      buildOwnerScopedWhere("owner-1", "ws-1"),
    );
  });

  it("falls back to userId when workspace is null", async () => {
    vi.mocked(resolveOwnerWorkspaceId).mockResolvedValue(null);
    await expect(errorRecoveryItemListWhereForOwner("owner-1")).resolves.toEqual({ userId: "owner-1" });
  });
});
