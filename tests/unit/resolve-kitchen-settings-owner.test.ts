import { beforeEach, describe, expect, it, vi } from "vitest";

const prismaMock = vi.hoisted(() => ({
  workspace: { findFirst: vi.fn(), findUnique: vi.fn() },
  workspaceMember: { findFirst: vi.fn() },
}));

vi.mock("@/lib/prisma", () => ({ prisma: prismaMock }));
vi.mock("@/lib/scope/assert-user-workspace-access", () => ({
  assertUserCanAccessWorkspace: vi.fn(),
  WorkspaceAccessDeniedError: class WorkspaceAccessDeniedError extends Error {},
}));

import { resolveKitchenSettingsDataUserId } from "@/lib/scope/resolve-kitchen-settings-owner";

describe("resolveKitchenSettingsDataUserId", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns session user when they own a workspace", async () => {
    prismaMock.workspace.findFirst.mockResolvedValue({ id: "ws-1", ownerUserId: "owner-a" });
    await expect(resolveKitchenSettingsDataUserId("owner-a")).resolves.toBe("owner-a");
  });

  it("returns workspace owner for members", async () => {
    prismaMock.workspace.findFirst.mockResolvedValue(null);
    prismaMock.workspaceMember.findFirst.mockResolvedValue({
      workspaceId: "ws-2",
      workspace: { ownerUserId: "owner-b" },
    });
    await expect(resolveKitchenSettingsDataUserId("staff-c")).resolves.toBe("owner-b");
  });

  it("falls back to session user when solo tenant", async () => {
    prismaMock.workspace.findFirst.mockResolvedValue(null);
    prismaMock.workspaceMember.findFirst.mockResolvedValue(null);
    await expect(resolveKitchenSettingsDataUserId("solo-d")).resolves.toBe("solo-d");
  });
});
