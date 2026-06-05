import { defaultFilters } from "@/lib/analytics/filters";
import {
  buildManagerRoleKpisFromExecutive,
  buildManagerRoleUiSnapshot,
} from "@/lib/roles/manager-ui-builders";
import type { ManagerRoleUiSnapshot } from "@/lib/roles/manager-ui-types";
import type { PermissionKey } from "@/lib/permissions/permissions";
import { prisma } from "@/lib/prisma";
import { loadExecutiveOverview } from "@/services/analytics/analytics-service";
import { loadOwnerDailyBriefing } from "@/services/briefing/owner-daily-briefing-service";

export type { ManagerRoleUiSnapshot } from "@/lib/roles/manager-ui-types";

export async function loadManagerRoleUiSnapshot(input: {
  userId: string;
  workspaceRole?: "OWNER" | "STAFF";
  granted?: ReadonlySet<PermissionKey>;
  workspaceId?: string | null;
}): Promise<ManagerRoleUiSnapshot> {
  const filters = defaultFilters();

  const [briefing, executive, workspace, profile] = await Promise.all([
    loadOwnerDailyBriefing(input.userId, {
      rolePack: "manager",
      workspaceRole: input.workspaceRole ?? "STAFF",
      persona: "manager",
      granted: input.granted,
      workspaceId: input.workspaceId,
      showIntegrationHealth: false,
    }),
    loadExecutiveOverview({ userId: input.userId }, filters),
    prisma.workspace.findFirst({
      where: { ownerUserId: input.userId },
      select: { name: true },
    }),
    prisma.userProfile.findUnique({
      where: { id: input.userId },
      select: { companyName: true },
    }),
  ]);

  const kpis = buildManagerRoleKpisFromExecutive({
    orderCount: executive.orderCount,
    lateOrderCount: executive.lateOrderCount,
    productionCompletionRate: executive.productionCompletionRate,
    packingCompletionRate: executive.packingCompletionRate,
    deliveryCompletionRate: executive.deliveryCompletionRate,
  });

  return buildManagerRoleUiSnapshot({
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
