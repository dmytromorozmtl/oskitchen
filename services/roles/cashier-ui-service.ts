import {
  buildCashierRoleKpisFromToday,
  buildCashierRoleUiSnapshot,
} from "@/lib/roles/cashier-ui-builders";
import type { CashierRoleUiSnapshot } from "@/lib/roles/cashier-ui-types";
import type { PermissionKey } from "@/lib/permissions/permissions";
import { prisma } from "@/lib/prisma";
import { posShiftListWhereForOwner } from "@/lib/scope/workspace-resource-scope";
import { loadOwnerDailyBriefing } from "@/services/briefing/owner-daily-briefing-service";
import { loadTodayCommandCenter } from "@/services/today/today-command-center-service";

export type { CashierRoleUiSnapshot } from "@/lib/roles/cashier-ui-types";

async function countOpenPosShifts(userId: string): Promise<number> {
  const where = await posShiftListWhereForOwner(userId);
  return prisma.pOSShift.count({
    where: { AND: [where, { status: "OPEN" }] },
  });
}

export async function loadCashierRoleUiSnapshot(input: {
  userId: string;
  workspaceRole?: "OWNER" | "STAFF";
  granted?: ReadonlySet<PermissionKey>;
  workspaceId?: string | null;
}): Promise<CashierRoleUiSnapshot> {
  const [briefing, today, openPosShifts, workspace, profile] = await Promise.all([
    loadOwnerDailyBriefing(input.userId, {
      rolePack: "cashier",
      workspaceRole: input.workspaceRole ?? "STAFF",
      persona: "cashier",
      granted: input.granted,
      workspaceId: input.workspaceId,
      showIntegrationHealth: false,
    }),
    loadTodayCommandCenter(input.userId),
    countOpenPosShifts(input.userId),
    prisma.workspace.findFirst({
      where: { ownerUserId: input.userId },
      select: { name: true },
    }),
    prisma.userProfile.findUnique({
      where: { id: input.userId },
      select: { companyName: true },
    }),
  ]);

  const kpis = buildCashierRoleKpisFromToday({
    posTransactionsToday: today.kpis.posTransactionsToday,
    ordersToday: today.kpis.ordersToday,
    openPosShifts,
    revenueToday: today.kpis.revenueToday,
  });

  return buildCashierRoleUiSnapshot({
    workspaceLabel: workspace?.name ?? profile?.companyName ?? "Workspace",
    kpis,
    heroTiles: briefing.heroTiles,
    topActions: briefing.topActions,
    nextAction: briefing.nextAction,
    summary: {
      attentionTileCount: briefing.summary.attentionTileCount,
      alertCount: briefing.summary.alertCount,
      readinessOverall: briefing.summary.readinessOverall,
    },
  });
}
