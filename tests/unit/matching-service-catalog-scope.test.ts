import { beforeEach, describe, expect, it, vi } from "vitest";

import { buildProductOwnerScopedWhere } from "@/lib/scope/workspace-resource-scope";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    product: {
      findMany: vi.fn(),
    },
  },
}));

vi.mock("@/lib/scope/resolve-owner-workspace-id", () => ({
  resolveOwnerWorkspaceId: vi.fn(),
}));

import { prisma } from "@/lib/prisma";
import { resolveOwnerWorkspaceId } from "@/lib/scope/resolve-owner-workspace-id";
import { loadCandidates } from "@/services/product-mapping/matching-service";

describe("matching-service catalog scope", () => {
  beforeEach(() => {
    vi.mocked(resolveOwnerWorkspaceId).mockReset();
    vi.mocked(prisma.product.findMany).mockReset();
    vi.mocked(prisma.product.findMany).mockResolvedValue([]);
  });

  it("loadCandidates queries products with workspace OR scope", async () => {
    vi.mocked(resolveOwnerWorkspaceId).mockResolvedValue("ws-1");
    await loadCandidates("owner-1", "brand-abc");
    expect(prisma.product.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          AND: [buildProductOwnerScopedWhere("owner-1", "ws-1"), { brandId: "brand-abc" }],
        },
      }),
    );
  });

  it("loadCandidates without brand uses scope only", async () => {
    vi.mocked(resolveOwnerWorkspaceId).mockResolvedValue(null);
    await loadCandidates("owner-1");
    expect(prisma.product.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { menu: { userId: "owner-1" } },
      }),
    );
  });
});
