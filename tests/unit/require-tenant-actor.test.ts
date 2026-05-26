import { beforeEach, describe, expect, it, vi } from "vitest";

const authMock = vi.hoisted(() => ({
  requireSessionUser: vi.fn(),
}));
const resolveMock = vi.hoisted(() => ({
  resolveTenantDataUserId: vi.fn(),
}));
const workspaceMock = vi.hoisted(() => ({
  resolveOwnerWorkspaceId: vi.fn(),
}));

vi.mock("@/lib/auth", () => authMock);
vi.mock("@/lib/scope/resolve-tenant-data-user-id", () => resolveMock);
vi.mock("@/lib/scope/resolve-owner-workspace-id", () => workspaceMock);

import { requireTenantActor } from "@/lib/scope/require-tenant-actor";

describe("requireTenantActor", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    authMock.requireSessionUser.mockResolvedValue({ id: "staff-1", email: "staff@test.com" });
    resolveMock.resolveTenantDataUserId.mockResolvedValue("owner-9");
    workspaceMock.resolveOwnerWorkspaceId.mockResolvedValue("ws-1");
  });

  it("returns session user, owner id, and workspace", async () => {
    const ctx = await requireTenantActor();
    expect(ctx.sessionUser.id).toBe("staff-1");
    expect(ctx.sessionUserId).toBe("staff-1");
    expect(ctx.userId).toBe("owner-9");
    expect(ctx.dataUserId).toBe("owner-9");
    expect(ctx.workspaceId).toBe("ws-1");
    expect(resolveMock.resolveTenantDataUserId).toHaveBeenCalledWith("staff-1");
    expect(workspaceMock.resolveOwnerWorkspaceId).toHaveBeenCalledWith("owner-9");
  });
});
