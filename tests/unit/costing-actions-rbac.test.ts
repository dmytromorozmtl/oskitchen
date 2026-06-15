import { beforeEach, describe, expect, it, vi } from "vitest";

const requireMutationPermission = vi.hoisted(() => vi.fn());
const requireTenantActor = vi.hoisted(() => vi.fn());
const recordAuditLog = vi.hoisted(() => vi.fn());

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

vi.mock("@/lib/permissions/mutation-access", () => ({
  requireMutationPermission,
}));

vi.mock("@/lib/scope/require-tenant-actor", () => ({
  requireTenantActor,
}));

vi.mock("@/lib/audit-log", () => ({
  recordAuditLog,
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    kitchenSettings: { findUnique: vi.fn(), upsert: vi.fn() },
    channelFeeRule: { create: vi.fn() },
    marginRule: { create: vi.fn() },
    priceScenario: { create: vi.fn() },
  },
}));

vi.mock("@/services/costing/costing-service", () => ({
  runFullRecipeCosting: vi.fn(),
}));

import { prisma } from "@/lib/prisma";
import { runFullRecipeCosting } from "@/services/costing/costing-service";
import {
  createChannelFeeRuleAction,
  createMarginRuleAction,
  recalculateCostSnapshotsAction,
  saveCostingSettingsAction,
  savePriceScenarioAction,
} from "@/actions/costing";

const deniedActor = {
  sessionUserId: "user-1",
  dataUserId: "owner-1",
  workspaceId: "ws-1",
  workspaceRole: "STAFF" as const,
  staffRoleType: "LINE_COOK" as const,
  email: "cook@example.com",
  granted: new Set<string>(),
};

describe("costing actions RBAC", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    requireTenantActor.mockResolvedValue({
      sessionUser: { id: "owner-1" },
      dataUserId: "owner-1",
      userId: "owner-1",
      workspaceId: "ws-1",
    });
  });

  it("denies recalculateCostSnapshotsAction without reports.read.financial", async () => {
    requireMutationPermission.mockResolvedValue({
      ok: false,
      error: "Forbidden",
      actor: deniedActor,
    });

    const result = await recalculateCostSnapshotsAction();

    expect(result).toEqual({ error: "Forbidden" });
    expect(requireMutationPermission).toHaveBeenCalledWith("reports.read.financial");
    expect(requireTenantActor).not.toHaveBeenCalled();
    expect(recordAuditLog).toHaveBeenCalledWith(
      expect.objectContaining({
        action: "costing.permission_denied",
        metadata: expect.objectContaining({
          operation: "costing.recalculate_snapshots",
          requiredPermission: "reports.read.financial",
        }),
      }),
    );
  });

  it("allows recalculateCostSnapshotsAction with reports.read.financial", async () => {
    requireMutationPermission.mockResolvedValue({ ok: true, actor: deniedActor });
    vi.mocked(runFullRecipeCosting).mockResolvedValue({ ok: true, snapshotsWritten: 3 });

    const result = await recalculateCostSnapshotsAction();

    expect(result).toEqual({ ok: true, created: 3 });
    expect(requireTenantActor).toHaveBeenCalled();
  });

  it("denies saveCostingSettingsAction without workspace.settings", async () => {
    requireMutationPermission.mockResolvedValue({
      ok: false,
      error: "Forbidden",
      actor: deniedActor,
    });

    const formData = new FormData();
    formData.set("defaultLaborRatePerMinute", "0.5");
    await saveCostingSettingsAction(formData);

    expect(requireMutationPermission).toHaveBeenCalledWith("workspace.settings");
    expect(requireTenantActor).not.toHaveBeenCalled();
    expect(prisma.kitchenSettings.upsert).not.toHaveBeenCalled();
    expect(recordAuditLog).toHaveBeenCalled();
  });

  it("denies createChannelFeeRuleAction without reports.read.financial", async () => {
    requireMutationPermission.mockResolvedValue({
      ok: false,
      error: "Forbidden",
      actor: deniedActor,
    });

    const formData = new FormData();
    formData.set("channelProvider", "UBER_EATS");
    formData.set("feeType", "PERCENTAGE");
    formData.set("percentage", "15");
    await createChannelFeeRuleAction(formData);

    expect(requireMutationPermission).toHaveBeenCalledWith("reports.read.financial");
    expect(prisma.channelFeeRule.create).not.toHaveBeenCalled();
  });

  it("denies createMarginRuleAction without reports.read.financial", async () => {
    requireMutationPermission.mockResolvedValue({
      ok: false,
      error: "Forbidden",
      actor: deniedActor,
    });

    const formData = new FormData();
    formData.set("targetMarginPercent", "30");
    formData.set("warningMarginPercent", "20");
    await createMarginRuleAction(formData);

    expect(requireMutationPermission).toHaveBeenCalledWith("reports.read.financial");
    expect(prisma.marginRule.create).not.toHaveBeenCalled();
  });

  it("denies savePriceScenarioAction without reports.read.financial", async () => {
    requireMutationPermission.mockResolvedValue({
      ok: false,
      error: "Forbidden",
      actor: deniedActor,
    });

    const formData = new FormData();
    formData.set("title", "Holiday push");
    formData.set("salePrice", "12");
    await savePriceScenarioAction(formData);

    expect(requireMutationPermission).toHaveBeenCalledWith("reports.read.financial");
    expect(prisma.priceScenario.create).not.toHaveBeenCalled();
  });
});
