import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    pOSRegister: {
      findMany: vi.fn(),
      create: vi.fn(),
      count: vi.fn(),
    },
  },
}));

vi.mock("@/lib/scope/resolve-owner-workspace-id", () => ({
  resolveOwnerWorkspaceId: vi.fn(),
}));

vi.mock("@/lib/scope/workspace-resource-scope", () => ({
  ownerScopedAnd: vi.fn(),
  posRegisterListWhereForOwner: vi.fn(),
}));

import { prisma } from "@/lib/prisma";
import { resolveOwnerWorkspaceId } from "@/lib/scope/resolve-owner-workspace-id";
import { ownerScopedAnd, posRegisterListWhereForOwner } from "@/lib/scope/workspace-resource-scope";
import { createPosRegister, listPosRegisters } from "@/services/pos/pos-register-service";

describe("pos-register-service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(resolveOwnerWorkspaceId).mockResolvedValue("ws-1");
    vi.mocked(ownerScopedAnd).mockResolvedValue({
      AND: [{ userId: "u1" }, { status: "ACTIVE" }],
    } as never);
    vi.mocked(posRegisterListWhereForOwner).mockResolvedValue({ userId: "u1" } as never);
  });

  it("listPosRegisters uses ownerScopedAnd", async () => {
    vi.mocked(prisma.pOSRegister.findMany).mockResolvedValue([]);
    await listPosRegisters("u1");
    expect(ownerScopedAnd).toHaveBeenCalledWith("u1", { status: "ACTIVE" });
  });

  it("createPosRegister sets workspaceId", async () => {
    vi.mocked(prisma.pOSRegister.create).mockResolvedValue({ id: "r1" } as never);
    await createPosRegister("u1", { name: "Front" });
    expect(prisma.pOSRegister.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ userId: "u1", workspaceId: "ws-1", name: "Front" }),
    });
  });
});
