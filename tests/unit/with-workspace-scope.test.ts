import { describe, expect, it } from "vitest";

import { withOwnerWorkspaceAnd, withWorkspaceScope } from "@/lib/scope/with-workspace-scope";

describe("withWorkspaceScope", () => {
  it("AND-merges workspace scope when workspaceId is set", () => {
    const where = withWorkspaceScope(
      { userId: "owner-1", workspaceId: "ws-1" },
      { status: "CONFIRMED" },
    );
    expect(where).toEqual({
      AND: [{ workspaceId: "ws-1" }, { status: "CONFIRMED" }],
    });
  });

  it("falls back to userId-only scope without workspace", () => {
    const where = withOwnerWorkspaceAnd(
      { userId: "owner-1", workspaceId: null },
      { id: "order-1" },
    );
    expect(where).toEqual({
      AND: [{ userId: "owner-1" }, { id: "order-1" }],
    });
  });
});
