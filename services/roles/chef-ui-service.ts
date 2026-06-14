import { defaultFilters } from "@/lib/analytics/filters";
import {
  buildChefRoleKpisFromProduction,
  buildChefRoleUiSnapshot,
} from "@/lib/roles/chef-ui-builders";
import type { ChefRoleUiSnapshot } from "@/lib/roles/chef-ui-types";
import type { PermissionKey } from "@/lib/permissions/permissions";
import { prisma } from "@/lib/prisma";
import {
  loadExecutiveOverview,
  loadProductionAnalytics,
} from "@/services/analytics/analytics-service";
import { loadOwnerDailyBriefing } from "@/services/briefing/owner-daily-briefing-service";

export type { ChefRoleUiSnapshot } from "@/lib/roles/chef-ui-types";

export async function loadChefRoleUiSnapshot(input: {
  userId: string;
  workspaceRole?: "OWNER" | "STAFF";
  granted?: ReadonlySet<PermissionKey>;
  workspaceId?: string | null;
}): Promise<ChefRoleUiSnapshot> {
  const filters = defaultFilters();
  const scope = { userId: input.userId };

  const [briefing, production, executive, workspace, profile] = await Promise.all([
    loadOwnerDailyBriefing(input.userId, {
      rolePack: "kitchen",
      workspaceRole: input.workspaceRole ?? "STAFF",
      persona: "kitchen",
      granted: input.granted,
      workspaceId: input.workspaceId,
      showIntegrationHealth: false,
    }),
    loadProductionAnalytics(scope, filters),
    loadExecutiveOverview(scope, filters),
    prisma.workspace.findFirst({
      where: { ownerUserId: input.userId },
      select: { name: true },
    }),
    prisma.userProfile.findUnique({
      where: { id: input.userId },
      select: { companyName: true },
    }),
  ]);

  const kpis = buildChefRoleKpisFromProduction({
    completionRate: production.completionRate,
    delayedBatches: production.delayed,
    completedItems: production.completedItems,
    totalItems: production.totalItems,
    packingCompletionRate: executive.packingCompletionRate,
  });

  return buildChefRoleUiSnapshot({
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
