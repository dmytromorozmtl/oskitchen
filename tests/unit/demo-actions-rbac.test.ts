import { beforeEach, describe, expect, it, vi } from "vitest";

const requireDemoWorkspaceMutation = vi.hoisted(() => vi.fn());
const seedDemoWorkspace = vi.hoisted(() => vi.fn());

vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("@/lib/usage", () => ({ trackUsageEvent: vi.fn() }));

vi.mock("@/lib/demo/require-demo-mutation", () => ({
  requireDemoWorkspaceMutation,
}));

vi.mock("@/services/demo-data", () => ({
  seedDemoWorkspace,
  clearWorkspaceSampleData: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    userProfile: { update: vi.fn().mockResolvedValue({}) },
    kitchenSettings: { findUnique: vi.fn(), update: vi.fn() },
  },
}));

import { importDemoWorkspace } from "@/actions/demo";

const ownerActor = {
  sessionUserId: "owner-1",
  dataUserId: "owner-1",
  workspaceId: "ws-1",
  workspaceRole: "OWNER" as const,
  staffRoleType: "OWNER" as const,
  email: "owner@example.com",
  granted: new Set(["templates.manage"]),
  platformBypass: false,
  sessionUser: { id: "owner-1", email: "owner@example.com" },
  userId: "owner-1",
};

describe("demo workspace actions RBAC", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    seedDemoWorkspace.mockResolvedValue(undefined);
  });

  it("denies import without templates.manage", async () => {
    requireDemoWorkspaceMutation.mockResolvedValue({
      ok: false,
      error: "You do not have permission to perform this action.",
    });

    const result = await importDemoWorkspace();

    expect(result).toEqual({ error: "You do not have permission to perform this action." });
    expect(requireDemoWorkspaceMutation).toHaveBeenCalledWith({ operation: "demo.import_workspace" });
    expect(seedDemoWorkspace).not.toHaveBeenCalled();
  });

  it("allows import when demo mutation gate passes", async () => {
    requireDemoWorkspaceMutation.mockResolvedValue({ ok: true, actor: ownerActor });

    const result = await importDemoWorkspace();

    expect(result).toEqual({ ok: true });
    expect(seedDemoWorkspace).toHaveBeenCalledWith("owner-1", "meal-prep");
  });
});
