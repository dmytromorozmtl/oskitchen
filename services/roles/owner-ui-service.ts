import { defaultFilters } from "@/lib/analytics/filters";
import {
  buildOwnerRoleKpisFromExecutive,
  buildOwnerRoleUiSnapshot,
} from "@/lib/roles/owner-ui-builders";
import type { OwnerRoleUiSnapshot } from "@/lib/roles/owner-ui-types";
import type { PermissionKey } from "@/lib/permissions/permissions";
import { prisma } from "@/lib/prisma";
import { loadExecutiveOverview } from "@/services/analytics/analytics-service";
import { loadOwnerDailyBriefing } from "@/services/briefing/owner-daily-briefing-service";

export type { OwnerRoleUiSnapshot } from "@/lib/roles/owner-ui-types";

export async function loadOwnerRoleUiSnapshot(input: {
  userId: string;
  workspaceRole?: "OWNER" | "STAFF";
  granted?: ReadonlySet<PermissionKey>;
  workspaceId?: string | null;
}): Promise<OwnerRoleUiSnapshot> {
  const filters = defaultFilters();

  const [briefing, executive, workspace, profile] = await Promise.all([
    loadOwnerDailyBriefing(input.userId, {
      rolePack: "owner",
      workspaceRole: input.workspaceRole ?? "OWNER",
      granted: input.granted,
      workspaceId: input.workspaceId,
      showIntegrationHealth: true,
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

  const kpis = buildOwnerRoleKpisFromExecutive({
    grossRevenue: executive.grossRevenue,
    orderCount: executive.orderCount,
    activeCustomerCount: executive.activeCustomerCount,
    productionCompletionRate: executive.productionCompletionRate,
  });

  return buildOwnerRoleUiSnapshot({
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
