import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    product: { findMany: vi.fn() },
    $transaction: vi.fn(),
  },
}));

vi.mock("@/lib/audit-log", () => ({
  recordAuditLog: vi.fn(),
}));

vi.mock("@/lib/scope/resolve-owner-workspace-id", () => ({
  resolveOwnerWorkspaceId: vi.fn(),
}));

vi.mock("@/lib/scope/workspace-resource-scope", () => ({
  productListWhereForOwnerAnd: vi.fn(),
  ownerScopedAnd: vi.fn(),
}));

vi.mock("@/services/production/batch-yield", () => ({
  summarizeBatchYield: vi.fn(),
}));

import { prisma } from "@/lib/prisma";
import { resolveOwnerWorkspaceId } from "@/lib/scope/resolve-owner-workspace-id";
import {
  ownerScopedAnd,
  productListWhereForOwnerAnd,
} from "@/lib/scope/workspace-resource-scope";
import { generateProductionFromMenuProducts } from "@/services/production/generate-production";

describe("generateProductionFromMenuProducts", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(resolveOwnerWorkspaceId).mockResolvedValue("ws-1");
    vi.mocked(productListWhereForOwnerAnd).mockResolvedValue({ active: true });
    vi.mocked(ownerScopedAnd).mockResolvedValue({
      AND: [{ OR: [{ workspaceId: "ws-1" }] }, { sourceType: "MENU" }],
    });
  });

  it("returns early when no products match the day", async () => {
    vi.mocked(prisma.product.findMany).mockResolvedValue([]);
    const result = await generateProductionFromMenuProducts({
      userId: "owner-1",
      productionDate: new Date("2026-05-24T12:00:00Z"),
    });
    expect(result).toEqual({ created: 0, skipped: 0, batchId: "", yieldSummary: null });
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });

  it("scopes product lookup via productListWhereForOwnerAnd", async () => {
    vi.mocked(prisma.product.findMany).mockResolvedValue([]);
    await generateProductionFromMenuProducts({
      userId: "owner-1",
      productionDate: new Date("2026-05-24T12:00:00Z"),
    });
    expect(productListWhereForOwnerAnd).toHaveBeenCalledWith(
      "owner-1",
      expect.objectContaining({ active: true, preparedDate: expect.any(Object) }),
    );
  });
});
