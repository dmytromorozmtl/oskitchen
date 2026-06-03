import { describe, expect, it, vi, beforeEach } from "vitest";

const findFirst = vi.fn();

vi.mock("@/lib/prisma", () => ({
  prisma: {
    workspace: { findFirst },
  },
}));

vi.mock("@/lib/scope/resolve-owner-workspace-id", () => ({
  resolveOwnerWorkspaceId: vi.fn(async (userId: string) => {
    await findFirst({ where: { ownerUserId: userId } });
    return "ws-1";
  }),
}));

import { resolveTodayWorkspaceScopes } from "@/services/today/today-workspace-scopes";

describe("today-workspace-scopes", () => {
  beforeEach(() => {
    findFirst.mockClear();
  });

  it("resolves all Today scopes from a single workspace lookup", async () => {
    const scopes = await resolveTodayWorkspaceScopes("owner-1");

    expect(findFirst).toHaveBeenCalledTimes(1);
    expect(scopes.workspaceId).toBe("ws-1");
    expect(scopes.orderWhere).toEqual({
      OR: [{ workspaceId: "ws-1" }, { userId: "owner-1", workspaceId: null }],
    });
    expect(scopes.menuWhere).toBe(scopes.productWhere);
    expect(scopes.webhookEventWhere).toBe(scopes.integrationWhere);
  });
});
