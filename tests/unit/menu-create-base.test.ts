import { describe, expect, it, vi, beforeEach } from "vitest";

vi.mock("@/lib/scope/resolve-owner-workspace-id", () => ({
  resolveOwnerWorkspaceId: vi.fn(),
}));

import { resolveOwnerWorkspaceId } from "@/lib/scope/resolve-owner-workspace-id";
import { menuCreateBaseForOwner } from "@/lib/products/menu-create-base";

describe("menuCreateBaseForOwner", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns userId and workspaceId when workspace exists", async () => {
    vi.mocked(resolveOwnerWorkspaceId).mockResolvedValue("ws-1");
    await expect(menuCreateBaseForOwner("owner-1")).resolves.toEqual({
      userId: "owner-1",
      workspaceId: "ws-1",
    });
  });

  it("throws when workspace is missing", async () => {
    vi.mocked(resolveOwnerWorkspaceId).mockResolvedValue(null);
    await expect(menuCreateBaseForOwner("owner-1")).rejects.toThrow(/no workspace/);
  });
});
