import type { UserRole } from "@prisma/client";

import {
  buildOwnerDailyBriefingAlerts,
  buildOwnerDailyBriefingTiles,
  pickOwnerDailyBriefingHeroTiles,
  pickOwnerDailyBriefingNextAction,
  pickOwnerDailyBriefingTopActions,
  type OwnerDailyBriefingAlert,
  type OwnerDailyBriefingNextAction,
  type OwnerDailyBriefingRankedAction,
  type OwnerDailyBriefingTile,
} from "@/lib/briefing/owner-daily-briefing-era19";
import {
  buildOwnerDailyBriefingIntegrationHealthSlice,
  type OwnerDailyBriefingIntegrationHealthSlice,
} from "@/lib/briefing/owner-daily-briefing-integration-health-era19";
import {
  buildOwnerDailyBriefingPilotReadinessSlice,
  type OwnerDailyBriefingPilotReadinessSlice,
} from "@/lib/briefing/owner-daily-briefing-pilot-readiness-era19";
import {
  buildOwnerDailyBriefingProductionCalendarSlice,
  mapProductionPlanTasksToFocusTasks,
  productionCalendarActionsForBriefing,
  productionCalendarAlertsForBriefing,
  type OwnerDailyBriefingProductionCalendarSlice,
} from "@/lib/briefing/owner-daily-briefing-production-calendar-era19";
import {
  buildOwnerDailyBriefingSupportAdminActions,
  buildOwnerDailyBriefingSupportAdminAlerts,
  buildOwnerDailyBriefingSupportAdminTiles,
} from "@/lib/briefing/owner-daily-briefing-support-admin-era19";
import {
  buildOwnerDailyBriefingCashierActions,
  enrichBriefingCashierPackTiles,
  mergeBriefingCashierTopActions,
} from "@/lib/briefing/owner-daily-briefing-cashier-era19";
import {
  buildOwnerDailyBriefingCashierManagerOverrideActions,
  enrichBriefingCashierManagerOverridePackTiles,
  mergeBriefingCashierManagerOverrideActions,
} from "@/lib/briefing/owner-daily-briefing-cashier-manager-override-era19";
import {
  buildOwnerDailyBriefingKitchenActions,
  enrichBriefingKitchenPackTiles,
  mergeBriefingKitchenTopActions,
} from "@/lib/briefing/owner-daily-briefing-kitchen-era19";
import {
  buildOwnerDailyBriefingKitchenPackingQcActions,
  enrichBriefingKitchenPackingQcPackTiles,
  mergeBriefingKitchenPackingQcActions,
} from "@/lib/briefing/owner-daily-briefing-kitchen-packing-qc-era19";
import {
  buildOwnerDailyBriefingManagerKdsActions,
  enrichBriefingManagerPackTiles,
  mergeBriefingManagerKdsTopActions,
} from "@/lib/briefing/owner-daily-briefing-manager-kds-era19";
import {
  buildOwnerDailyBriefingManagerOverrideActions,
  enrichBriefingManagerOverridePackTiles,
  mergeBriefingManagerOverrideActions,
} from "@/lib/briefing/owner-daily-briefing-manager-override-era19";
import {
  buildOwnerDailyBriefingManagerPackingQcActions,
  enrichBriefingManagerPackingQcPackTiles,
  mergeBriefingManagerPackingQcActions,
} from "@/lib/briefing/owner-daily-briefing-manager-packing-qc-era19";
import {
  buildOwnerDailyBriefingOwnerKdsActions,
  enrichBriefingOwnerPackTiles,
  mergeBriefingOwnerKdsTopActions,
} from "@/lib/briefing/owner-daily-briefing-owner-kds-era19";
import {
  buildOwnerDailyBriefingLaunchWizardCommercialAction,
  mergeBriefingLaunchWizardTopActions,
} from "@/lib/briefing/owner-daily-briefing-launch-wizard-era19";
import {
  buildBriefingSmokeNextActionRankedAction,
  mergeBriefingSmokeNextTopActions,
} from "@/lib/briefing/owner-daily-briefing-smoke-action-era19";
import type { LaunchWizardCommercialBlockersSlice } from "@/lib/launch-wizard/launch-wizard-commercial-blockers-era19";
import type { LaunchWizardCommercialSetupSlice } from "@/lib/launch-wizard/launch-wizard-commercial-setup-era19";
import {
  buildOwnerDailyBriefingRiskRadarSlice,
  summarizeOwnerDailyBriefingRiskRadar,
  type OwnerDailyBriefingRiskRadarSlice,
} from "@/lib/briefing/owner-daily-briefing-risk-radar-era19";
import {
  BRIEFING_ROLE_PACK_HEADLINE,
  BRIEFING_ROLE_PACK_LABEL,
  filterBriefingActionsForRolePack,
  filterBriefingAlertsForRolePack,
  filterBriefingRiskSignalsForRolePack,
  filterBriefingTilesForRolePack,
  pickBriefingHeroTilesForRolePack,
  resolveBriefingRolePack,
  shouldShowBriefingForPersona,
  shouldShowBriefingIntegrationHealthLane,
  shouldShowBriefingPilotReadinessLane,
  shouldShowBriefingProductionCalendarLane,
  shouldShowBriefingRiskRadarLane,
  type BriefingRolePack,
} from "@/lib/briefing/owner-daily-briefing-role-packs-era19";
import { shouldShowPilotIntegrationHealthStrip } from "@/lib/integrations/pilot-integration-health-strip-era18";
import type { OperatorHomePersona } from "@/lib/navigation/operator-home-era18";
import type { PermissionKey } from "@/lib/permissions/permissions";
import { hasPermission } from "@/lib/permissions/guards";
import { prisma } from "@/lib/prisma";
import { ownerScopedAnd } from "@/lib/scope/workspace-resource-scope";
import {
  ingredientListWhereForOwner,
  staffShiftListWhereForOwner,
} from "@/lib/scope/workspace-resource-scope";
import {
  pickImplementationPilotReadinessAttentionItems,
  summarizeImplementationPilotReadiness,
} from "@/lib/implementation/implementation-pilot-readiness-focus-era18";
import { loadImplementationPilotReadinessModel } from "@/services/implementation/implementation-pilot-readiness-service";
import { getProductionCalendarOpenThroughToday } from "@/services/production/production-calendar-service";
import { loadPilotIntegrationHealthStripModelForWorkspace } from "@/lib/integrations/pilot-integration-health-strip-era18";
import { getLaborRealtimeData } from "@/services/labor/labor-realtime-service";
import { loadCommercialPilotOpsStatusModel } from "@/services/commercial/commercial-pilot-ops-status-service";
import { loadIntegrationHealthSmokeArtifactsModel } from "@/services/integrations/integration-health-smoke-artifacts-service";
import { loadTodayCommandCenter } from "@/services/today/today-command-center-service";
import { getDailyKdsOrders } from "@/services/kitchen-screen/daily-kds-service";

export type OwnerDailyBriefingPayload = {
  loadedAt: string;
  rolePack: BriefingRolePack;
  rolePackLabel: string;
  rolePackHeadline: string;
  showProductionCalendarLane: boolean;
  showPilotReadinessLane: boolean;
  showIntegrationHealthLane: boolean;
  tiles: OwnerDailyBriefingTile[];
  heroTiles: OwnerDailyBriefingTile[];
  alerts: OwnerDailyBriefingAlert[];
  topActions: OwnerDailyBriefingRankedAction[];
  nextAction: OwnerDailyBriefingNextAction;
  productionCalendar: OwnerDailyBriefingProductionCalendarSlice | null;
  pilotReadiness: OwnerDailyBriefingPilotReadinessSlice | null;
  integrationHealth: OwnerDailyBriefingIntegrationHealthSlice | null;
  showRiskRadarLane: boolean;
  riskRadar: OwnerDailyBriefingRiskRadarSlice | null;
  summary: {
    attentionTileCount: number;
    alertCount: number;
    riskSignalCount: number;
    readinessOverall: number;
  };
};

async function countLowStockIngredients(userId: string): Promise<{
  lowStockCount: number;
  ingredientParConfigured: boolean;
}> {
  const ingredientScope = await ingredientListWhereForOwner(userId);
  const parConfiguredCount = await prisma.ingredient.count({
    where: { AND: [ingredientScope, { active: true, parLevel: { gt: 0 } }] },
  });

  if (parConfiguredCount === 0) {
    return { lowStockCount: 0, ingredientParConfigured: false };
  }

  const ingredients = await prisma.ingredient.findMany({
    where: { AND: [ingredientScope, { active: true, parLevel: { gt: 0 } }] },
    select: { currentStock: true, parLevel: true },
    take: 500,
  });

  const lowStockCount = ingredients.filter(
    (row) => Number(row.currentStock) < Number(row.parLevel),
  ).length;

  return { lowStockCount, ingredientParConfigured: true };
}

async function countOpenPosShifts(userId: string): Promise<number> {
  const where = await ownerScopedAnd(userId, { status: "OPEN" });
  return prisma.pOSShift.count({ where });
}

async function loadLaborBriefingSlice(userId: string) {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const shiftScope = await staffShiftListWhereForOwner(userId);
    const [labor, scheduledShiftsToday] = await Promise.all([
      getLaborRealtimeData(userId),
      prisma.staffShift.count({
        where: { AND: [shiftScope, { shiftDate: { gte: today, lt: tomorrow } }] },
      }),
    ]);

    return {
      available: true,
      activeStaff: labor.activeStaff,
      scheduledShiftsToday,
      laborPercent: labor.laborPercent,
      status: labor.status,
    };
  } catch {
    return {
      available: false,
      activeStaff: 0,
      scheduledShiftsToday: 0,
      laborPercent: 0,
      status: null as const,
    };
  }
}

export function shouldShowOwnerDailyBriefing(input: {
  workspaceRole: UserRole;
  persona: OperatorHomePersona;
}): boolean {
  return shouldShowBriefingForPersona(input);
}

export async function loadOwnerDailyBriefing(
  userId: string,
  options?: {
    showIntegrationHealth?: boolean;
    today?: Awaited<ReturnType<typeof loadTodayCommandCenter>>;
    rolePack?: BriefingRolePack;
    persona?: OperatorHomePersona;
    workspaceRole?: UserRole;
    supportAdmin?: boolean;
    launchWizard?: {
      commercialBlockers: LaunchWizardCommercialBlockersSlice;
      commercialSetup: LaunchWizardCommercialSetupSlice;
    };
    granted?: ReadonlySet<PermissionKey>;
  },
): Promise<OwnerDailyBriefingPayload> {
  const showIntegrationHealth = options?.showIntegrationHealth ?? true;
  const rolePack =
    options?.rolePack ??
    resolveBriefingRolePack({
      workspaceRole: options?.workspaceRole ?? "STAFF",
      persona: options?.persona ?? "manager",
      supportAdmin: options?.supportAdmin ?? false,
    });

  const needsCommercialOps = rolePack === "owner" || rolePack === "support_admin";

  const needsBriefingKdsQueue =
    rolePack === "kitchen" || rolePack === "manager" || rolePack === "owner";

  const [today, pilotReadiness, lowStock, labor, calendarRows, openPosShifts, commercialOps, smokeArtifacts, kdsOrders] =
    await Promise.all([
    options?.today ?? loadTodayCommandCenter(userId),
    loadImplementationPilotReadinessModel(userId),
    countLowStockIngredients(userId),
    loadLaborBriefingSlice(userId),
    getProductionCalendarOpenThroughToday(userId),
    countOpenPosShifts(userId),
    needsCommercialOps
      ? loadCommercialPilotOpsStatusModel().catch(() => null)
      : Promise.resolve(null),
    needsCommercialOps
      ? loadIntegrationHealthSmokeArtifactsModel().catch(() => null)
      : Promise.resolve(null),
    needsBriefingKdsQueue ? getDailyKdsOrders(userId).catch(() => []) : Promise.resolve([]),
  ]);

  const smokeNextAction = smokeArtifacts?.depth.nextSmokeAction ?? null;

  const productionCalendarSlice = buildOwnerDailyBriefingProductionCalendarSlice({
    tasks: mapProductionPlanTasksToFocusTasks(calendarRows),
  });
  const productionCalendarAlerts = productionCalendarAlertsForBriefing(productionCalendarSlice);
  const productionCalendarActions = productionCalendarActionsForBriefing(productionCalendarSlice);
  const productionCalendarInput = {
    summary: productionCalendarSlice.summary,
    hasPlanTasks: productionCalendarSlice.hasPlanTasks,
    calendarHref: productionCalendarSlice.calendarHref,
    primaryHref:
      productionCalendarSlice.attentionItems[0]?.href ?? productionCalendarSlice.calendarHref,
  };

  const integrationHealth = showIntegrationHealth
    ? await loadPilotIntegrationHealthStripModelForWorkspace(userId).catch(() => null)
    : null;

  const pilotAttentionItems = pickImplementationPilotReadinessAttentionItems(pilotReadiness);
  const pilotSummary = summarizeImplementationPilotReadiness(pilotAttentionItems);

  const pilotAlerts: OwnerDailyBriefingAlert[] = pilotAttentionItems.slice(0, 3).map((item) => ({
    id: item.id,
    title: item.title,
    detail: item.detail,
    href: item.href,
    priority: item.priority,
    tone: item.tone,
  }));

  const briefingInput = {
    kpis: today.kpis,
    blockers: today.blockers,
    readinessOverall: today.readiness.overall,
    integrationOverall: integrationHealth?.overall ?? ("unknown" as const),
    integrationHeadline:
      integrationHealth?.headline ??
      "Integration health unavailable — open sales channel health for details.",
    pilotAttentionCount: pilotSummary.totalSignals,
    pilotHasUrgent: pilotSummary.hasUrgent,
    ssoEntitlementEnabled: pilotReadiness.pilotSso.entitlementEnabled,
    ssoActive: pilotReadiness.pilotSso.active,
    ssoConfigured: pilotReadiness.pilotSso.configured,
    lowStockCount: lowStock.lowStockCount,
    ingredientParConfigured: lowStock.ingredientParConfigured,
    labor,
    productionCalendar: productionCalendarInput,
    posShift: { openCount: openPosShifts },
  };

  const cashierInput = {
    openShiftCount: openPosShifts,
    posTransactionsToday: today.kpis.posTransactionsToday,
    blockedOrdersApprox: today.kpis.blockedOrdersApprox,
    canApplyPosDiscount: options?.granted
      ? hasPermission(options.granted, "pos.discount.apply")
      : false,
  };

  const cashierManagerOverrideInput = {
    ...cashierInput,
    canApplyPosDiscount: cashierInput.canApplyPosDiscount ?? false,
  };

  const managerOverrideInput = {
    openShiftCount: openPosShifts,
    canApplyPosDiscount: cashierInput.canApplyPosDiscount ?? false,
    posTransactionsToday: today.kpis.posTransactionsToday,
  };

  const kdsBriefingInput = {
    kdsOrders,
    productionCalendarOverdue: productionCalendarSlice.summary.overdue,
    productionCalendarDueToday: productionCalendarSlice.summary.dueToday,
    packingQueueOpen: today.kpis.packingQueueOpen,
    productionWorkOpen: today.kpis.productionWorkOpen,
  };

  const baseTiles =
    rolePack === "support_admin"
      ? buildOwnerDailyBriefingSupportAdminTiles({
          blockers: today.blockers,
          openSupportTickets: today.kpis.openSupportTickets,
          errorIntegrations: today.kpis.errorIntegrations,
          commercialOps,
        })
      : buildOwnerDailyBriefingTiles(briefingInput);
  const allTiles =
    rolePack === "cashier"
      ? enrichBriefingCashierManagerOverridePackTiles(
          enrichBriefingCashierPackTiles(baseTiles, cashierInput),
          cashierManagerOverrideInput,
        )
      : rolePack === "kitchen"
        ? enrichBriefingKitchenPackingQcPackTiles(
            enrichBriefingKitchenPackTiles(baseTiles, kdsBriefingInput),
            kdsBriefingInput,
          )
        : rolePack === "manager"
          ? enrichBriefingManagerPackingQcPackTiles(
              enrichBriefingManagerOverridePackTiles(
                enrichBriefingManagerPackTiles(baseTiles, kdsBriefingInput),
                managerOverrideInput,
              ),
              kdsBriefingInput,
            )
          : rolePack === "owner"
            ? enrichBriefingOwnerPackTiles(baseTiles, kdsBriefingInput)
            : baseTiles;
  const allAlerts =
    rolePack === "support_admin"
      ? buildOwnerDailyBriefingSupportAdminAlerts({
          blockers: today.blockers,
          openSupportTickets: today.kpis.openSupportTickets,
          commercialOps,
        })
      : buildOwnerDailyBriefingAlerts({
          blockers: today.blockers,
          pilotAlerts,
          productionCalendarAlerts,
          kpis: today.kpis,
        });
  const allTopActionsBase =
    rolePack === "support_admin"
      ? buildOwnerDailyBriefingSupportAdminActions({
          blockers: today.blockers,
          openSupportTickets: today.kpis.openSupportTickets,
          commercialOps,
        })
      : rolePack === "cashier"
        ? mergeBriefingCashierTopActions(
            mergeBriefingCashierManagerOverrideActions(
              buildOwnerDailyBriefingCashierActions(cashierInput),
              buildOwnerDailyBriefingCashierManagerOverrideActions(cashierManagerOverrideInput),
            ),
            pickOwnerDailyBriefingTopActions({
              blockers: today.blockers,
              alerts: allAlerts,
              readinessOverall: today.readiness.overall,
              kpis: today.kpis,
              pilotAttentionCount: pilotSummary.totalSignals,
              integrationOverall: briefingInput.integrationOverall,
              lowStockCount: lowStock.lowStockCount,
              productionCalendarActions,
            }),
          )
        : rolePack === "kitchen"
          ? mergeBriefingKitchenTopActions(
              mergeBriefingKitchenPackingQcActions(
                buildOwnerDailyBriefingKitchenActions(kdsBriefingInput),
                buildOwnerDailyBriefingKitchenPackingQcActions(kdsBriefingInput),
              ),
              pickOwnerDailyBriefingTopActions({
                blockers: today.blockers,
                alerts: allAlerts,
                readinessOverall: today.readiness.overall,
                kpis: today.kpis,
                pilotAttentionCount: pilotSummary.totalSignals,
                integrationOverall: briefingInput.integrationOverall,
                lowStockCount: lowStock.lowStockCount,
                productionCalendarActions,
              }),
            )
          : rolePack === "manager"
            ? mergeBriefingManagerKdsTopActions(
                mergeBriefingManagerPackingQcActions(
                  mergeBriefingManagerOverrideActions(
                    buildOwnerDailyBriefingManagerKdsActions(kdsBriefingInput),
                    buildOwnerDailyBriefingManagerOverrideActions(managerOverrideInput),
                  ),
                  buildOwnerDailyBriefingManagerPackingQcActions(kdsBriefingInput),
                ),
                pickOwnerDailyBriefingTopActions({
                  blockers: today.blockers,
                  alerts: allAlerts,
                  readinessOverall: today.readiness.overall,
                  kpis: today.kpis,
                  pilotAttentionCount: pilotSummary.totalSignals,
                  integrationOverall: briefingInput.integrationOverall,
                  lowStockCount: lowStock.lowStockCount,
                  productionCalendarActions,
                }),
              )
          : pickOwnerDailyBriefingTopActions({
            blockers: today.blockers,
            alerts: allAlerts,
            readinessOverall: today.readiness.overall,
            kpis: today.kpis,
            pilotAttentionCount: pilotSummary.totalSignals,
            integrationOverall: briefingInput.integrationOverall,
            lowStockCount: lowStock.lowStockCount,
            productionCalendarActions,
          });

  const launchWizardCommercialAction =
    rolePack === "owner" && options?.launchWizard
      ? buildOwnerDailyBriefingLaunchWizardCommercialAction({
          commercialBlockers: options.launchWizard.commercialBlockers,
          nextUnblock: options.launchWizard.commercialSetup.nextUnblock,
        })
      : null;

  const smokeNextActionRanked =
    needsCommercialOps && smokeNextAction
      ? buildBriefingSmokeNextActionRankedAction(smokeNextAction)
      : null;

  let allTopActions = allTopActionsBase;
  if (rolePack === "owner" && launchWizardCommercialAction) {
    allTopActions = mergeBriefingLaunchWizardTopActions(launchWizardCommercialAction, allTopActions);
  }
  if (needsCommercialOps && smokeNextActionRanked) {
    allTopActions = mergeBriefingSmokeNextTopActions(smokeNextActionRanked, allTopActions);
  }
  if (rolePack === "owner") {
    allTopActions = mergeBriefingOwnerKdsTopActions(
      buildOwnerDailyBriefingOwnerKdsActions(kdsBriefingInput),
      allTopActions,
    );
  }

  const tiles = filterBriefingTilesForRolePack(allTiles, rolePack);
  const alerts = filterBriefingAlertsForRolePack(allAlerts, rolePack);
  const topActions = filterBriefingActionsForRolePack(allTopActions, rolePack).slice(0, 3);
  const heroTiles = pickBriefingHeroTilesForRolePack(tiles, rolePack, pickOwnerDailyBriefingHeroTiles);
  const showProductionCalendarLane =
    shouldShowBriefingProductionCalendarLane(rolePack) && productionCalendarSlice.hasPlanTasks;
  const showPilotReadinessLane = shouldShowBriefingPilotReadinessLane(rolePack);
  const showIntegrationHealthLane = shouldShowBriefingIntegrationHealthLane(rolePack);

  const pilotReadinessSlice = showPilotReadinessLane
    ? buildOwnerDailyBriefingPilotReadinessSlice({
        model: pilotReadiness,
        attentionItems: pilotAttentionItems,
        commercialOps,
      })
    : null;

  const integrationHealthSlice =
    showIntegrationHealthLane && integrationHealth
      ? buildOwnerDailyBriefingIntegrationHealthSlice({
          model: integrationHealth,
          p0Summary: commercialOps?.p0Staging.summary ?? null,
        })
      : null;

  const showRiskRadarLane = shouldShowBriefingRiskRadarLane(rolePack);
  const riskRadar: OwnerDailyBriefingRiskRadarSlice | null = showRiskRadarLane
    ? (() => {
        const base = buildOwnerDailyBriefingRiskRadarSlice({
          kpis: today.kpis,
          blockers: today.blockers,
          integrationOverall: briefingInput.integrationOverall,
          integrationHealth: integrationHealthSlice,
          productionCalendarSummary: productionCalendarSlice.summary,
          commercialOps,
          ssoEntitlementEnabled: pilotReadiness.pilotSso.entitlementEnabled,
          ssoActive: pilotReadiness.pilotSso.active,
          ssoConfigured: pilotReadiness.pilotSso.configured,
          lowStockCount: lowStock.lowStockCount,
          ingredientParConfigured: lowStock.ingredientParConfigured,
          smokeNextAction,
        });
        const filteredSignals = filterBriefingRiskSignalsForRolePack(base.signals, rolePack);
        const summary = summarizeOwnerDailyBriefingRiskRadar(filteredSignals);
        return {
          ...base,
          ...summary,
          signals: filteredSignals,
        };
      })()
    : null;

  const nextAction = topActions[0]
    ? {
        title: topActions[0].title,
        detail: topActions[0].reason,
        href: topActions[0].href,
        ctaLabel: topActions[0].ctaLabel,
        tone: topActions[0].tone,
      }
    : pickOwnerDailyBriefingNextAction({
        blockers: today.blockers,
        alerts,
        readinessOverall: today.readiness.overall,
        kpis: today.kpis,
        pilotAttentionCount: pilotSummary.totalSignals,
        integrationOverall: briefingInput.integrationOverall,
        lowStockCount: lowStock.lowStockCount,
      });

  return {
    loadedAt: new Date().toISOString(),
    rolePack,
    rolePackLabel: BRIEFING_ROLE_PACK_LABEL[rolePack],
    rolePackHeadline: BRIEFING_ROLE_PACK_HEADLINE[rolePack],
    showProductionCalendarLane,
    showPilotReadinessLane,
    showIntegrationHealthLane,
    tiles,
    heroTiles,
    alerts,
    topActions,
    nextAction,
    productionCalendar: showProductionCalendarLane ? productionCalendarSlice : null,
    pilotReadiness: pilotReadinessSlice,
    integrationHealth: integrationHealthSlice,
    showRiskRadarLane,
    riskRadar,
    summary: {
      attentionTileCount: tiles.filter((tile) => tile.tone === "attention").length,
      alertCount: alerts.length,
      riskSignalCount: riskRadar?.totalSignals ?? 0,
      readinessOverall: today.readiness.overall,
    },
  };
}

export function resolveOwnerDailyBriefingVisibility(input: {
  workspaceRole: UserRole;
  persona: OperatorHomePersona;
  granted: ReadonlySet<PermissionKey>;
  supportAdmin?: boolean;
}): boolean {
  if (input.supportAdmin) return true;
  if (!shouldShowBriefingForPersona(input)) return false;
  if (input.workspaceRole === "OWNER") return true;
  if (input.persona === "kitchen" || input.persona === "cashier") return true;
  return shouldShowPilotIntegrationHealthStrip(input);
}
