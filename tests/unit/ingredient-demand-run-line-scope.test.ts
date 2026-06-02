import { describe, expect, it, vi } from "vitest";

import { ingredientDemandRunLineListWhereForOwner } from "@/lib/scope/workspace-resource-scope";

vi.mock("@/lib/scope/resolve-owner-workspace-id", () => ({
  resolveOwnerWorkspaceId: vi.fn(async () => "ws-test"),
}));

describe("ingredientDemandRunLineListWhereForOwner", () => {
  it("scopes run lines through demandRun, not workspaceId on the line model", async () => {
    const where = await ingredientDemandRunLineListWhereForOwner("user-1");
    expect(where).toEqual({
      demandRun: {
        OR: [{ workspaceId: "ws-test" }, { userId: "user-1", workspaceId: null }],
      },
    });
  });
});
