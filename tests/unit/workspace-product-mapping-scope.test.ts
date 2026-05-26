import { beforeEach, describe, expect, it, vi } from "vitest";

import { buildOwnerScopedWhere } from "@/lib/scope/workspace-resource-scope";
import {
  productMappingAliasListWhereForOwner,
  productMappingListWhereForOwner,
} from "@/lib/scope/workspace-product-mapping-scope";

vi.mock("@/lib/scope/resolve-owner-workspace-id", () => ({
  resolveOwnerWorkspaceId: vi.fn(),
}));

import { resolveOwnerWorkspaceId } from "@/lib/scope/resolve-owner-workspace-id";

describe("workspace-product-mapping-scope", () => {
  beforeEach(() => {
    vi.mocked(resolveOwnerWorkspaceId).mockReset();
  });

  it("productMappingListWhereForOwner uses workspace OR", async () => {
    vi.mocked(resolveOwnerWorkspaceId).mockResolvedValue("ws-1");
    await expect(productMappingListWhereForOwner("owner-1")).resolves.toEqual(
      buildOwnerScopedWhere("owner-1", "ws-1"),
    );
  });

  it("falls back to userId when workspace is null", async () => {
    vi.mocked(resolveOwnerWorkspaceId).mockResolvedValue(null);
    await expect(productMappingListWhereForOwner("owner-1")).resolves.toEqual({ userId: "owner-1" });
  });

  it("productMappingAliasListWhereForOwner uses workspace OR", async () => {
    vi.mocked(resolveOwnerWorkspaceId).mockResolvedValue("ws-1");
    await expect(productMappingAliasListWhereForOwner("owner-1")).resolves.toEqual(
      buildOwnerScopedWhere("owner-1", "ws-1"),
    );
  });
});
