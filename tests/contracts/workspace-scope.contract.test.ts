import { describe, expect, it } from "vitest";

import { buildOwnerScopedWhere } from "@/lib/scope/workspace-resource-scope";

describe("workspace scope contract", () => {
  it("with workspace: filters by workspaceId only (post-NOT NULL)", () => {
    expect(buildOwnerScopedWhere("owner-a", "ws-99")).toEqual({ workspaceId: "ws-99" });
  });

  it("without workspace: falls back to userId only", () => {
    expect(buildOwnerScopedWhere("owner-a", null)).toEqual({ userId: "owner-a" });
  });

  it("does not leak other owners in workspace-only mode", () => {
    const where = buildOwnerScopedWhere("owner-a", "ws-99");
    expect(where).not.toHaveProperty("userId", "owner-b");
    expect(where).toEqual({ workspaceId: "ws-99" });
  });
});
