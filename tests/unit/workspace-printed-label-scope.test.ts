import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/scope/workspace-resource-scope", () => ({
  productListWhereForOwner: vi.fn().mockResolvedValue({ workspaceId: "ws-1" }),
  orderListWhereForOwner: vi.fn().mockResolvedValue({ workspaceId: "ws-1" }),
}));

import {
  printedLabelByIdWhereForOwner,
  printedLabelListWhereForOwner,
  printedLabelListWhereForOwnerAnd,
} from "@/lib/scope/workspace-printed-label-scope";

describe("workspace-printed-label-scope", () => {
  it("builds OR across product, order, and legacy owner rows", async () => {
    const where = await printedLabelListWhereForOwner("owner-1");
    expect(where.OR).toHaveLength(3);
    expect(where).toMatchObject({
      OR: [
        { product: { workspaceId: "ws-1" } },
        { order: { workspaceId: "ws-1" } },
        { productId: null, orderId: null, userId: "owner-1" },
      ],
    });
  });

  it("merges extra filters with AND", async () => {
    const where = await printedLabelListWhereForOwnerAnd("owner-1", { status: "QUEUED" });
    expect(where).toMatchObject({
      AND: [expect.objectContaining({ OR: expect.any(Array) }), { status: "QUEUED" }],
    });
  });

  it("scopes by id within tenant boundary", async () => {
    const where = await printedLabelByIdWhereForOwner("owner-1", "label-1");
    expect(where).toMatchObject({
      AND: [expect.objectContaining({ OR: expect.any(Array) }), { id: "label-1" }],
    });
  });
});
