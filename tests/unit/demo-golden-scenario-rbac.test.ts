import { beforeEach, describe, expect, it, vi } from "vitest";

const requireDemoWorkspaceMutation = vi.hoisted(() => vi.fn());
const seedGoldenDemoScenario = vi.hoisted(() => vi.fn());

vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

vi.mock("@/lib/demo/require-demo-mutation", () => ({
  requireDemoWorkspaceMutation,
}));

vi.mock("@/services/demo/demo-seed-service", () => ({
  seedGoldenDemoScenario,
  resetGoldenDemoScenario: vi.fn(),
}));

import { seedGoldenScenarioAction } from "@/actions/demo-golden-scenario";

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

describe("demo golden scenario RBAC", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    seedGoldenDemoScenario.mockResolvedValue({ ok: true });
  });

  it("denies seed without templates.manage and production guard", async () => {
    requireDemoWorkspaceMutation.mockResolvedValue({
      ok: false,
      error: "Demo workspace import and reset are disabled in production. Enable DEMO_MODE_ENABLED for supervised beta demos, or use staging.",
    });

    const result = await seedGoldenScenarioAction("meal-prep-week");

    expect(result).toEqual({
      error:
        "Demo workspace import and reset are disabled in production. Enable DEMO_MODE_ENABLED for supervised beta demos, or use staging.",
    });
    expect(requireDemoWorkspaceMutation).toHaveBeenCalledWith({ operation: "demo.seed_golden_scenario" });
    expect(seedGoldenDemoScenario).not.toHaveBeenCalled();
  });

  it("allows seed when demo gate passes", async () => {
    requireDemoWorkspaceMutation.mockResolvedValue({ ok: true, actor: ownerActor });

    const result = await seedGoldenScenarioAction("meal-prep-week");

    expect(result).toEqual({ ok: true });
    expect(seedGoldenDemoScenario).toHaveBeenCalledWith("owner-1", "meal-prep-week");
  });
});
