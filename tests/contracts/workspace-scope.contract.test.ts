import { describe, expect, it } from "vitest";

import { buildOwnerScopedWhere } from "@/lib/scope/workspace-resource-scope";
import { legacyAwareOwnerScope } from "@/tests/helpers/owner-scoped-where";

describe("workspace scope contract", () => {
  it("with workspace: includes legacy null workspace_id rows by default", () => {
    expect(buildOwnerScopedWhere("owner-a", "ws-99")).toEqual(
      legacyAwareOwnerScope("owner-a", "ws-99"),
    );
  });

  it("with workspace: strict mode filters workspaceId only when env set", () => {
    process.env.WORKSPACE_SCOPE_STRICT = "1";
    expect(buildOwnerScopedWhere("owner-a", "ws-99")).toEqual({ workspaceId: "ws-99" });
    delete process.env.WORKSPACE_SCOPE_STRICT;
  });

  it("without workspace: falls back to userId only", () => {
    expect(buildOwnerScopedWhere("owner-a", null)).toEqual({ userId: "owner-a" });
  });

  it("does not leak other owners in workspace-only mode", () => {
    const where = buildOwnerScopedWhere("owner-a", "ws-99");
    expect(where).not.toHaveProperty("userId", "owner-b");
    expect(where).toEqual(legacyAwareOwnerScope("owner-a", "ws-99"));
  });
});
