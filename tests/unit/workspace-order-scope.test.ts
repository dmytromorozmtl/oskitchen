import { describe, expect, it, vi, beforeEach } from "vitest";

import { orderListWhereForOwner, orderByIdWhereForOwner } from "@/lib/scope/workspace-order-scope";

vi.mock("@/lib/scope/resolve-owner-workspace-id", () => ({
  resolveOwnerWorkspaceId: vi.fn(),
}));

import { resolveOwnerWorkspaceId } from "@/lib/scope/resolve-owner-workspace-id";

describe("workspace order scope", () => {
  beforeEach(() => {
    vi.mocked(resolveOwnerWorkspaceId).mockReset();
  });

  it("uses workspaceId when workspace exists", async () => {
    vi.mocked(resolveOwnerWorkspaceId).mockResolvedValue("ws-1");
    await expect(orderListWhereForOwner("user-1")).resolves.toEqual({
      workspaceId: "ws-1",
    });
    await expect(orderByIdWhereForOwner("user-1", "order-1")).resolves.toEqual({
      AND: [{ workspaceId: "ws-1" }, { id: "order-1" }],
    });
  });

  it("falls back to userId when no workspace", async () => {
    vi.mocked(resolveOwnerWorkspaceId).mockResolvedValue(null);
    await expect(orderListWhereForOwner("user-1")).resolves.toEqual({ userId: "user-1" });
    await expect(orderByIdWhereForOwner("user-1", "order-1")).resolves.toEqual({
      AND: [{ userId: "user-1" }, { id: "order-1" }],
    });
  });
});
