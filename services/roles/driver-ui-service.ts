import { defaultFilters } from "@/lib/analytics/filters";
import { buildDriverRoleUiSnapshot } from "@/lib/roles/driver-ui-builders";
import type { DriverRoleUiSnapshot } from "@/lib/roles/driver-ui-types";
import { prisma } from "@/lib/prisma";
import { loadPackingDeliveryAnalytics } from "@/services/analytics/analytics-service";
import { loadRouteOverviewKpis } from "@/services/routes/route-overview";

export type { DriverRoleUiSnapshot } from "@/lib/roles/driver-ui-types";

export async function loadDriverRoleUiSnapshot(userId: string): Promise<DriverRoleUiSnapshot> {
  const filters = defaultFilters();

  const [routeKpis, packingDelivery, workspace, profile] = await Promise.all([
    loadRouteOverviewKpis(userId),
    loadPackingDeliveryAnalytics({ userId }, filters),
    prisma.workspace.findFirst({
      where: { ownerUserId: userId },
      select: { name: true },
    }),
    prisma.userProfile.findUnique({
      where: { id: userId },
      select: { companyName: true },
    }),
  ]);

  return buildDriverRoleUiSnapshot({
    workspaceLabel: workspace?.name ?? profile?.companyName ?? "Workspace",
    routeKpis,
    onTimeRate: packingDelivery.onTimeRate,
  });
}
