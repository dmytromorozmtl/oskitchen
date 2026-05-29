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
  enrichBriefingProductionCalendarPackTiles,
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
  buildOwnerDailyBriefingCommercialGoClosureAction,
  mergeBriefingCommercialGoClosureTopActions,
} from "@/lib/briefing/owner-daily-briefing-commercial-go-closure-era21";
import {
  buildOwnerDailyBriefingPilotWeek1Action,
  mergeBriefingPilotWeek1TopActions,
} from "@/lib/briefing/owner-daily-briefing-pilot-week1-era21";
import {
  mergeBriefingPaidPilotGoConvergenceTopActions,
} from "@/lib/briefing/paid-pilot-go-convergence-briefing-era25";
import {
  mergeBriefingPilotWeek1ExecutionConvergenceEra25TopActions,
} from "@/lib/briefing/pilot-week1-execution-convergence-briefing-era25";
import { buildPaidPilotGoConvergenceEra25UiSlice } from "@/lib/commercial/paid-pilot-go-convergence-ui-era25";
import { buildPilotWeek1ExecutionConvergenceEra25UiSlice } from "@/lib/commercial/pilot-week1-execution-convergence-ui-era25";
import { buildMonth2MarketReadinessConvergenceEra25UiSlice } from "@/lib/commercial/month2-market-readiness-convergence-ui-era25";
import {
  mergeBriefingMonth2MarketReadinessConvergenceEra25TopActions,
} from "@/lib/briefing/month2-market-readiness-convergence-briefing-era25";
import { buildScaleReadinessConvergenceEra25UiSlice } from "@/lib/commercial/scale-readiness-convergence-ui-era25";
import {
  mergeBriefingScaleReadinessConvergenceEra25TopActions,
} from "@/lib/briefing/scale-readiness-convergence-briefing-era25";
import { buildSeriesAPartnerExpansionConvergenceEra25UiSlice } from "@/lib/commercial/series-a-partner-expansion-convergence-ui-era25";
import {
  mergeBriefingSeriesAPartnerExpansionConvergenceEra25TopActions,
} from "@/lib/briefing/series-a-partner-expansion-convergence-briefing-era25";
import { buildMarketLeaderPositioningConvergenceEra25UiSlice } from "@/lib/commercial/market-leader-positioning-convergence-ui-era25";
import {
  mergeBriefingMarketLeaderPositioningConvergenceEra25TopActions,
} from "@/lib/briefing/market-leader-positioning-convergence-briefing-era25";
import { buildSustainedOperationalExcellenceConvergenceEra25UiSlice } from "@/lib/commercial/sustained-operational-excellence-convergence-ui-era25";
import {
  shouldSuppressEra25ProductConvergenceSurfaces,
  type PureOperationalModeTerminusEra25UiSlice,
} from "@/lib/commercial/pure-operational-mode-terminus-ui-era25";
import {
  mergeBriefingSustainedOperationalExcellenceConvergenceEra25TopActions,
} from "@/lib/briefing/sustained-operational-excellence-convergence-briefing-era25";
import {
  buildOwnerDailyBriefingMonth2MarketReadinessAction,
  mergeBriefingMonth2MarketReadinessTopActions,
} from "@/lib/briefing/owner-daily-briefing-month2-market-readiness-era21";
import {
  buildOwnerDailyBriefingScaleReadinessAction,
  mergeBriefingScaleReadinessTopActions,
} from "@/lib/briefing/owner-daily-briefing-scale-readiness-era21";
import {
  buildOwnerDailyBriefingSeriesAPartnerExpansionAction,
  mergeBriefingSeriesAPartnerExpansionTopActions,
} from "@/lib/briefing/owner-daily-briefing-series-a-partner-expansion-era21";
import {
  buildOwnerDailyBriefingMarketLeaderPositioningAction,
  mergeBriefingMarketLeaderPositioningTopActions,
} from "@/lib/briefing/owner-daily-briefing-market-leader-positioning-era21";
import {
  buildOwnerDailyBriefingSustainedOperationalExcellenceAction,
  mergeBriefingSustainedOperationalExcellenceTopActions,
} from "@/lib/briefing/owner-daily-briefing-sustained-operational-excellence-era21";
import {
  buildOwnerDailyBriefingContinuousImprovementLoopAction,
  mergeBriefingContinuousImprovementLoopTopActions,
} from "@/lib/briefing/owner-daily-briefing-continuous-improvement-loop-era34";
import {
  buildOwnerDailyBriefingSustainedProductEvolutionAction,
  mergeBriefingSustainedProductEvolutionTopActions,
} from "@/lib/briefing/owner-daily-briefing-sustained-product-evolution-era35";
import {
  buildOwnerDailyBriefingMaintenanceModeAction,
  mergeBriefingMaintenanceModeTopActions,
} from "@/lib/briefing/owner-daily-briefing-maintenance-mode-era36";
import {
  buildOwnerDailyBriefingEngineeringPathTerminusAction,
  mergeBriefingEngineeringPathTerminusTopActions,
} from "@/lib/briefing/owner-daily-briefing-engineering-path-terminus-era37";
import {
  buildOwnerDailyBriefingPostTerminusSteadyStateAction,
  mergeBriefingPostTerminusSteadyStateTopActions,
} from "@/lib/briefing/owner-daily-briefing-post-terminus-steady-state-era38";
import {
  buildCommercialGoClosureUiSlice,
  type CommercialGoClosureUiSlice,
} from "@/lib/commercial/commercial-go-closure-ui-era21";
import {
  buildPilotWeek1ExecutionUiSlice,
  type PilotWeek1ExecutionUiSlice,
} from "@/lib/commercial/pilot-week1-execution-ui-era21";
import {
  buildMonth2MarketReadinessUiSlice,
  type Month2MarketReadinessUiSlice,
} from "@/lib/commercial/month2-market-readiness-ui-era21";
import {
  buildScaleReadinessUiSlice,
  type ScaleReadinessUiSlice,
} from "@/lib/commercial/scale-readiness-ui-era21";
import {
  buildSeriesAPartnerExpansionUiSlice,
  type SeriesAPartnerExpansionUiSlice,
} from "@/lib/commercial/series-a-partner-expansion-ui-era21";
import {
  buildMarketLeaderPositioningUiSlice,
  type MarketLeaderPositioningUiSlice,
} from "@/lib/commercial/market-leader-positioning-ui-era21";
import {
  buildSustainedOperationalExcellenceUiSlice,
  type SustainedOperationalExcellenceUiSlice,
} from "@/lib/commercial/sustained-operational-excellence-ui-era21";
import {
  buildContinuousImprovementLoopUiSlice,
  type ContinuousImprovementLoopUiSlice,
} from "@/lib/commercial/continuous-improvement-loop-ui-era22";
import {
  buildSustainedProductEvolutionUiSlice,
  type SustainedProductEvolutionUiSlice,
} from "@/lib/commercial/sustained-product-evolution-ui-era23";
import {
  buildMaintenanceModeUiSlice,
  type MaintenanceModeUiSlice,
} from "@/lib/commercial/maintenance-mode-ui-era24";
import { readMonth2MarketReadinessArtifacts } from "@/scripts/ops/validate-month2-market-readiness-env";
import { readScaleReadinessArtifacts } from "@/scripts/ops/validate-scale-readiness-env";
import { readSeriesAPartnerExpansionArtifacts } from "@/scripts/ops/validate-series-a-partner-expansion-env";
import { readMarketLeaderPositioningArtifacts } from "@/scripts/ops/validate-market-leader-positioning-env";
import { readSustainedOperationalExcellenceArtifacts } from "@/scripts/ops/validate-sustained-operational-excellence-env";
import { readContinuousImprovementLoopArtifacts } from "@/scripts/ops/validate-continuous-improvement-loop";
import { readPilotWeek1ExecutionArtifacts } from "@/scripts/ops/validate-pilot-week1-env";
import {
  buildOwnerDailyBriefingP0OpsVaultAction,
  mergeBriefingP0OpsVaultTopActions,
} from "@/lib/briefing/owner-daily-briefing-p0-ops-vault-era21";
import {
  buildOwnerDailyBriefingTier2GoldenPathAction,
  mergeBriefingTier2GoldenPathTopActions,
} from "@/lib/briefing/owner-daily-briefing-tier2-golden-path-era21";
import {
  buildOwnerDailyBriefingCommercialInflectionAction,
  mergeBriefingCommercialInflectionTopActions,
} from "@/lib/briefing/owner-daily-briefing-commercial-inflection-era28";
import {
  buildCommercialInflectionReadinessUiSlice,
  type CommercialInflectionReadinessUiSlice,
} from "@/lib/commercial/commercial-inflection-readiness-ui-era28";
import {
  buildOwnerDailyBriefingLaunchWizardSetupAction,
  enrichBriefingLaunchWizardPackTiles,
} from "@/lib/launch-wizard/launch-wizard-onboarding-convergence-era19";
import {
  buildOwnerDailyBriefingFulfillmentCommandFlowActions,
  enrichBriefingFulfillmentCommandFlowPackTiles,
  mergeBriefingFulfillmentCommandFlowTopActions,
  type FulfillmentCommandFlowBriefingInput,
} from "@/lib/briefing/owner-daily-briefing-fulfillment-command-flow-era19";
import {
  buildBriefingIntegrationRecoveryConvergedAction,
  enrichBriefingIntegrationRecoveryPackTiles,
  mergeBriefingIntegrationRecoveryTopActions,
  type BriefingIntegrationRecoveryInput,
} from "@/lib/briefing/owner-daily-briefing-integration-recovery-convergence-era19";
import {
  buildBriefingSmokeNextActionRankedAction,
  mergeBriefingSmokeNextTopActions,
} from "@/lib/briefing/owner-daily-briefing-smoke-action-era19";
import type { LaunchWizardCommercialBlockersSlice } from "@/lib/launch-wizard/launch-wizard-commercial-blockers-era19";
import type { LaunchWizardCommercialSetupSlice } from "@/lib/launch-wizard/launch-wizard-commercial-setup-era19";
import type {
  LaunchWizardProgress,
  LaunchWizardStep,
} from "@/lib/launch-wizard/launch-wizard-era19";
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
import {
  buildP0OpsVaultUiSlice,
  type P0OpsVaultUiSlice,
} from "@/lib/commercial/p0-ops-vault-ui-era21";
import {
  buildTier2GoldenPathUiSlice,
  type Tier2GoldenPathUiSlice,
} from "@/lib/commercial/tier2-staging-golden-path-ui-era21";
import { loadIntegrationHealthSmokeArtifactsModel } from "@/services/integrations/integration-health-smoke-artifacts-service";
import { loadTodayCommandCenter } from "@/services/today/today-command-center-service";
import { getDailyKdsOrders } from "@/services/kitchen-screen/daily-kds-service";
import {
  buildOwnerDailyBriefingOperationalEmptyState,
  dedupeOwnerDailyBriefingHeroTilesByCategory,
  finalizeOwnerDailyBriefingTopActions,
  resolveBriefingP0ProofBlockedLabel,
} from "@/lib/briefing/owner-daily-briefing-production-grade-era20";
import { OWNER_DAILY_BRIEFING_PRODUCTION_GRADE_ERA20_POLICY_ID } from "@/lib/briefing/owner-daily-briefing-production-grade-era20-policy";

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
  productionGradePolicyId: typeof OWNER_DAILY_BRIEFING_PRODUCTION_GRADE_ERA20_POLICY_ID;
  p0ProofBlockedLabel: string | null;
  p0OpsVault: P0OpsVaultUiSlice | null;
  tier2GoldenPath: Tier2GoldenPathUiSlice | null;
  commercialGoClosure: CommercialGoClosureUiSlice | null;
  pilotWeek1: PilotWeek1ExecutionUiSlice | null;
  month2MarketReadiness: Month2MarketReadinessUiSlice | null;
  scaleReadiness: ScaleReadinessUiSlice | null;
  seriesAPartnerExpansion: SeriesAPartnerExpansionUiSlice | null;
  marketLeaderPositioning: MarketLeaderPositioningUiSlice | null;
  sustainedOperationalExcellence: SustainedOperationalExcellenceUiSlice | null;
  continuousImprovementLoop: ContinuousImprovementLoopUiSlice | null;
  sustainedProductEvolution: SustainedProductEvolutionUiSlice | null;
  maintenanceMode: MaintenanceModeUiSlice | null;
  operationalEmptyState: ReturnType<typeof buildOwnerDailyBriefingOperationalEmptyState>;
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
      nextStep: LaunchWizardStep | null;
      progress: LaunchWizardProgress;
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
  const p0OpsVault = buildP0OpsVaultUiSlice(commercialOps?.p0Staging?.summary ?? null);
  const tier2GoldenPath = buildTier2GoldenPathUiSlice({
    p0ProofStatus: commercialOps?.p0Staging.summary?.p0ProofStatus ?? null,
    tier2Summary: commercialOps?.tier2Staging.summary ?? null,
  });
  const p0OpsVaultRankedAction =
    rolePack === "owner" ? buildOwnerDailyBriefingP0OpsVaultAction(p0OpsVault) : null;
  const tier2GoldenPathRankedAction =
    rolePack === "owner" ? buildOwnerDailyBriefingTier2GoldenPathAction(tier2GoldenPath) : null;
  const commercialInflection =
    rolePack === "owner" && needsCommercialOps
      ? buildCommercialInflectionReadinessUiSlice()
      : null;
  const commercialInflectionRankedAction = buildOwnerDailyBriefingCommercialInflectionAction(
    commercialInflection,
  );
  const commercialGoClosure = buildCommercialGoClosureUiSlice({
    p0ProofStatus: commercialOps?.p0Staging.summary?.p0ProofStatus ?? null,
    tier2ProofStatus: commercialOps?.tier2Staging.summary?.tier2ProofStatus ?? null,
    goNoGoSummary: commercialOps?.goNoGo.summary ?? null,
  });
  const commercialGoClosureRankedAction =
    rolePack === "owner"
      ? buildOwnerDailyBriefingCommercialGoClosureAction(commercialGoClosure)
      : null;
  const pilotArtifacts = needsCommercialOps ? readPilotWeek1ExecutionArtifacts() : null;
  const month2Artifacts = needsCommercialOps ? readMonth2MarketReadinessArtifacts() : null;
  const pilotWeek1 = buildPilotWeek1ExecutionUiSlice({
    goNoGoSummary: commercialOps?.goNoGo.summary ?? null,
    p0ProofStatus: commercialOps?.p0Staging.summary?.p0ProofStatus ?? null,
    tier2ProofStatus: commercialOps?.tier2Staging.summary?.tier2ProofStatus ?? null,
    metricsBaseline: pilotArtifacts?.metricsBaseline ?? null,
    caseStudyDraft: pilotArtifacts?.caseStudyDraft ?? null,
  });
  const paidPilotGoConvergenceEra25 = buildPaidPilotGoConvergenceEra25UiSlice({
    breakthroughVisible: true,
  });
  const paidPilotGoConvergenceEra25RankedAction =
    rolePack === "owner" ? paidPilotGoConvergenceEra25?.briefingAction ?? null : null;
  const pilotWeek1ConvergenceEra25 = buildPilotWeek1ExecutionConvergenceEra25UiSlice({
    goConvergenceVisible: true,
  });
  const pilotWeek1ConvergenceEra25RankedAction =
    rolePack === "owner" ? pilotWeek1ConvergenceEra25?.briefingAction ?? null : null;
  const month2ConvergenceEra25 = buildMonth2MarketReadinessConvergenceEra25UiSlice({
    week1ConvergenceVisible: true,
  });
  const month2ConvergenceEra25RankedAction =
    rolePack === "owner" ? month2ConvergenceEra25?.briefingAction ?? null : null;
  const scaleConvergenceEra25 = buildScaleReadinessConvergenceEra25UiSlice({
    month2ConvergenceVisible: true,
  });
  const scaleConvergenceEra25RankedAction =
    rolePack === "owner" ? scaleConvergenceEra25?.briefingAction ?? null : null;
  const seriesAConvergenceEra25 = buildSeriesAPartnerExpansionConvergenceEra25UiSlice({
    scaleConvergenceVisible: true,
  });
  const seriesAConvergenceEra25RankedAction =
    rolePack === "owner" ? seriesAConvergenceEra25?.briefingAction ?? null : null;
  const marketLeaderConvergenceEra25 = buildMarketLeaderPositioningConvergenceEra25UiSlice({
    seriesAConvergenceVisible: true,
  });
  const marketLeaderConvergenceEra25RankedAction =
    rolePack === "owner" ? marketLeaderConvergenceEra25?.briefingAction ?? null : null;
  const sustainedOpsConvergenceEra25 = buildSustainedOperationalExcellenceConvergenceEra25UiSlice({
    marketLeaderConvergenceVisible: true,
  });
  const sustainedOpsConvergenceEra25RankedAction =
    rolePack === "owner" ? sustainedOpsConvergenceEra25?.briefingAction ?? null : null;
  const pureOperationalModeEra25Active =
    sustainedOpsConvergenceEra25?.pureOperationalModeTerminus?.pureOperationalModeEra25Active ??
    false;
  const suppressEra25ConvergenceBriefing = shouldSuppressEra25ProductConvergenceSurfaces({
    pureOperationalModeEra25Active,
  });
  const pilotWeek1RankedAction =
    rolePack === "owner" && !pilotWeek1ConvergenceEra25
      ? buildOwnerDailyBriefingPilotWeek1Action(pilotWeek1)
      : null;
  const month2MarketReadiness = buildMonth2MarketReadinessUiSlice({
    goNoGoSummary: commercialOps?.goNoGo.summary ?? null,
    p0ProofStatus: commercialOps?.p0Staging.summary?.p0ProofStatus ?? null,
    tier2ProofStatus: commercialOps?.tier2Staging.summary?.tier2ProofStatus ?? null,
    metricsBaseline: month2Artifacts?.metricsBaseline ?? null,
    caseStudyDraft: month2Artifacts?.caseStudyDraft ?? null,
    investorOnepager: month2Artifacts?.investorOnepager ?? null,
  });
  const month2MarketReadinessRankedAction =
    rolePack === "owner" && !month2ConvergenceEra25
      ? buildOwnerDailyBriefingMonth2MarketReadinessAction(month2MarketReadiness)
      : null;
  const scaleArtifacts = needsCommercialOps ? readScaleReadinessArtifacts() : null;
  const scaleReadiness = buildScaleReadinessUiSlice({
    goNoGoSummary: commercialOps?.goNoGo.summary ?? null,
    p0ProofStatus: commercialOps?.p0Staging.summary?.p0ProofStatus ?? null,
    tier2ProofStatus: commercialOps?.tier2Staging.summary?.tier2ProofStatus ?? null,
    p0Staging: scaleArtifacts?.p0Staging ?? commercialOps?.p0Staging.summary ?? null,
    tier2Summary: scaleArtifacts?.tier2Summary ?? commercialOps?.tier2Staging.summary ?? null,
    metricsBaseline: scaleArtifacts?.metricsBaseline ?? month2Artifacts?.metricsBaseline ?? null,
    caseStudyDraft: scaleArtifacts?.caseStudyDraft ?? month2Artifacts?.caseStudyDraft ?? null,
    investorOnepager: scaleArtifacts?.investorOnepager ?? month2Artifacts?.investorOnepager ?? null,
    rollbackDrill: scaleArtifacts?.rollbackDrill ?? null,
  });
  const scaleReadinessRankedAction =
    rolePack === "owner" && !scaleConvergenceEra25
      ? buildOwnerDailyBriefingScaleReadinessAction(scaleReadiness)
      : null;
  const seriesAArtifacts = needsCommercialOps ? readSeriesAPartnerExpansionArtifacts() : null;
  const seriesAPartnerExpansion = buildSeriesAPartnerExpansionUiSlice({
    goNoGoSummary: commercialOps?.goNoGo.summary ?? null,
    p0ProofStatus: commercialOps?.p0Staging.summary?.p0ProofStatus ?? null,
    tier2ProofStatus: commercialOps?.tier2Staging.summary?.tier2ProofStatus ?? null,
    p0Staging: seriesAArtifacts?.p0Staging ?? scaleArtifacts?.p0Staging ?? commercialOps?.p0Staging.summary ?? null,
    tier2Summary:
      seriesAArtifacts?.tier2Summary ?? scaleArtifacts?.tier2Summary ?? commercialOps?.tier2Staging.summary ?? null,
    metricsBaseline:
      seriesAArtifacts?.metricsBaseline ?? scaleArtifacts?.metricsBaseline ?? month2Artifacts?.metricsBaseline ?? null,
    caseStudyDraft:
      seriesAArtifacts?.caseStudyDraft ?? scaleArtifacts?.caseStudyDraft ?? month2Artifacts?.caseStudyDraft ?? null,
    investorOnepager:
      seriesAArtifacts?.investorOnepager ??
      scaleArtifacts?.investorOnepager ??
      month2Artifacts?.investorOnepager ??
      null,
    rollbackDrill: seriesAArtifacts?.rollbackDrill ?? scaleArtifacts?.rollbackDrill ?? null,
    competitorMatrix: seriesAArtifacts?.competitorMatrix ?? null,
  });
  const seriesAPartnerExpansionRankedAction =
    rolePack === "owner" && !seriesAConvergenceEra25
      ? buildOwnerDailyBriefingSeriesAPartnerExpansionAction(seriesAPartnerExpansion)
      : null;
  const marketLeaderArtifacts = needsCommercialOps ? readMarketLeaderPositioningArtifacts() : null;
  const marketLeaderPositioning = buildMarketLeaderPositioningUiSlice({
    goNoGoSummary: commercialOps?.goNoGo.summary ?? null,
    p0ProofStatus: commercialOps?.p0Staging.summary?.p0ProofStatus ?? null,
    tier2ProofStatus: commercialOps?.tier2Staging.summary?.tier2ProofStatus ?? null,
    p0Staging:
      marketLeaderArtifacts?.p0Staging ??
      seriesAArtifacts?.p0Staging ??
      scaleArtifacts?.p0Staging ??
      commercialOps?.p0Staging.summary ??
      null,
    tier2Summary:
      marketLeaderArtifacts?.tier2Summary ??
      seriesAArtifacts?.tier2Summary ??
      scaleArtifacts?.tier2Summary ??
      commercialOps?.tier2Staging.summary ??
      null,
    metricsBaseline:
      marketLeaderArtifacts?.metricsBaseline ??
      seriesAArtifacts?.metricsBaseline ??
      scaleArtifacts?.metricsBaseline ??
      month2Artifacts?.metricsBaseline ??
      null,
    caseStudyDraft:
      marketLeaderArtifacts?.caseStudyDraft ??
      seriesAArtifacts?.caseStudyDraft ??
      scaleArtifacts?.caseStudyDraft ??
      month2Artifacts?.caseStudyDraft ??
      null,
    investorOnepager:
      marketLeaderArtifacts?.investorOnepager ??
      seriesAArtifacts?.investorOnepager ??
      scaleArtifacts?.investorOnepager ??
      month2Artifacts?.investorOnepager ??
      null,
    rollbackDrill:
      marketLeaderArtifacts?.rollbackDrill ??
      seriesAArtifacts?.rollbackDrill ??
      scaleArtifacts?.rollbackDrill ??
      null,
    competitorMatrix:
      marketLeaderArtifacts?.competitorMatrix ?? seriesAArtifacts?.competitorMatrix ?? null,
  });
  const marketLeaderPositioningRankedAction =
    rolePack === "owner" && !marketLeaderConvergenceEra25
      ? buildOwnerDailyBriefingMarketLeaderPositioningAction(marketLeaderPositioning)
      : null;
  const sustainedOpsArtifacts = needsCommercialOps
    ? readSustainedOperationalExcellenceArtifacts()
    : null;
  const sustainedOperationalExcellence = buildSustainedOperationalExcellenceUiSlice({
    goNoGoSummary: commercialOps?.goNoGo.summary ?? null,
    p0ProofStatus: commercialOps?.p0Staging.summary?.p0ProofStatus ?? null,
    tier2ProofStatus: commercialOps?.tier2Staging.summary?.tier2ProofStatus ?? null,
    p0Staging:
      sustainedOpsArtifacts?.p0Staging ??
      marketLeaderArtifacts?.p0Staging ??
      seriesAArtifacts?.p0Staging ??
      scaleArtifacts?.p0Staging ??
      commercialOps?.p0Staging.summary ??
      null,
    tier2Summary:
      sustainedOpsArtifacts?.tier2Summary ??
      marketLeaderArtifacts?.tier2Summary ??
      seriesAArtifacts?.tier2Summary ??
      scaleArtifacts?.tier2Summary ??
      commercialOps?.tier2Staging.summary ??
      null,
    metricsBaseline:
      sustainedOpsArtifacts?.metricsBaseline ??
      marketLeaderArtifacts?.metricsBaseline ??
      seriesAArtifacts?.metricsBaseline ??
      scaleArtifacts?.metricsBaseline ??
      month2Artifacts?.metricsBaseline ??
      null,
    caseStudyDraft:
      sustainedOpsArtifacts?.caseStudyDraft ??
      marketLeaderArtifacts?.caseStudyDraft ??
      seriesAArtifacts?.caseStudyDraft ??
      scaleArtifacts?.caseStudyDraft ??
      month2Artifacts?.caseStudyDraft ??
      null,
    investorOnepager:
      sustainedOpsArtifacts?.investorOnepager ??
      marketLeaderArtifacts?.investorOnepager ??
      seriesAArtifacts?.investorOnepager ??
      scaleArtifacts?.investorOnepager ??
      month2Artifacts?.investorOnepager ??
      null,
    rollbackDrill:
      sustainedOpsArtifacts?.rollbackDrill ??
      marketLeaderArtifacts?.rollbackDrill ??
      seriesAArtifacts?.rollbackDrill ??
      scaleArtifacts?.rollbackDrill ??
      null,
    competitorMatrix:
      sustainedOpsArtifacts?.competitorMatrix ??
      marketLeaderArtifacts?.competitorMatrix ??
      seriesAArtifacts?.competitorMatrix ??
      null,
  });
  const sustainedOperationalExcellenceRankedAction =
    rolePack === "owner" && !sustainedOpsConvergenceEra25
      ? buildOwnerDailyBriefingSustainedOperationalExcellenceAction(sustainedOperationalExcellence)
      : null;
  const loopArtifacts = needsCommercialOps ? readContinuousImprovementLoopArtifacts() : null;
  const continuousImprovementLoop = buildContinuousImprovementLoopUiSlice({
    goNoGoSummary: commercialOps?.goNoGo.summary ?? null,
    p0ProofStatus: commercialOps?.p0Staging.summary?.p0ProofStatus ?? null,
    tier2ProofStatus: commercialOps?.tier2Staging.summary?.tier2ProofStatus ?? null,
    p0Staging:
      loopArtifacts?.p0Staging ??
      sustainedOpsArtifacts?.p0Staging ??
      marketLeaderArtifacts?.p0Staging ??
      seriesAArtifacts?.p0Staging ??
      scaleArtifacts?.p0Staging ??
      commercialOps?.p0Staging.summary ??
      null,
    tier2Summary:
      loopArtifacts?.tier2Summary ??
      sustainedOpsArtifacts?.tier2Summary ??
      marketLeaderArtifacts?.tier2Summary ??
      seriesAArtifacts?.tier2Summary ??
      scaleArtifacts?.tier2Summary ??
      commercialOps?.tier2Staging.summary ??
      null,
    metricsBaseline:
      loopArtifacts?.metricsBaseline ??
      sustainedOpsArtifacts?.metricsBaseline ??
      marketLeaderArtifacts?.metricsBaseline ??
      seriesAArtifacts?.metricsBaseline ??
      scaleArtifacts?.metricsBaseline ??
      month2Artifacts?.metricsBaseline ??
      null,
    caseStudyDraft:
      loopArtifacts?.caseStudyDraft ??
      sustainedOpsArtifacts?.caseStudyDraft ??
      marketLeaderArtifacts?.caseStudyDraft ??
      seriesAArtifacts?.caseStudyDraft ??
      scaleArtifacts?.caseStudyDraft ??
      month2Artifacts?.caseStudyDraft ??
      null,
    investorOnepager:
      loopArtifacts?.investorOnepager ??
      sustainedOpsArtifacts?.investorOnepager ??
      marketLeaderArtifacts?.investorOnepager ??
      seriesAArtifacts?.investorOnepager ??
      scaleArtifacts?.investorOnepager ??
      month2Artifacts?.investorOnepager ??
      null,
    rollbackDrill:
      loopArtifacts?.rollbackDrill ??
      sustainedOpsArtifacts?.rollbackDrill ??
      marketLeaderArtifacts?.rollbackDrill ??
      seriesAArtifacts?.rollbackDrill ??
      scaleArtifacts?.rollbackDrill ??
      null,
    competitorMatrix:
      loopArtifacts?.competitorMatrix ??
      sustainedOpsArtifacts?.competitorMatrix ??
      marketLeaderArtifacts?.competitorMatrix ??
      seriesAArtifacts?.competitorMatrix ??
      null,
  });
  const continuousImprovementLoopRankedAction =
    rolePack === "owner"
      ? buildOwnerDailyBriefingContinuousImprovementLoopAction(continuousImprovementLoop)
      : null;
  const sustainedProductEvolution = buildSustainedProductEvolutionUiSlice({
    goNoGoSummary: commercialOps?.goNoGo.summary ?? null,
    p0ProofStatus: commercialOps?.p0Staging.summary?.p0ProofStatus ?? null,
    tier2ProofStatus: commercialOps?.tier2Staging.summary?.tier2ProofStatus ?? null,
    p0Staging:
      loopArtifacts?.p0Staging ??
      sustainedOpsArtifacts?.p0Staging ??
      marketLeaderArtifacts?.p0Staging ??
      seriesAArtifacts?.p0Staging ??
      scaleArtifacts?.p0Staging ??
      commercialOps?.p0Staging.summary ??
      null,
    tier2Summary:
      loopArtifacts?.tier2Summary ??
      sustainedOpsArtifacts?.tier2Summary ??
      marketLeaderArtifacts?.tier2Summary ??
      seriesAArtifacts?.tier2Summary ??
      scaleArtifacts?.tier2Summary ??
      commercialOps?.tier2Staging.summary ??
      null,
    metricsBaseline:
      loopArtifacts?.metricsBaseline ??
      sustainedOpsArtifacts?.metricsBaseline ??
      marketLeaderArtifacts?.metricsBaseline ??
      seriesAArtifacts?.metricsBaseline ??
      scaleArtifacts?.metricsBaseline ??
      month2Artifacts?.metricsBaseline ??
      null,
    caseStudyDraft:
      loopArtifacts?.caseStudyDraft ??
      sustainedOpsArtifacts?.caseStudyDraft ??
      marketLeaderArtifacts?.caseStudyDraft ??
      seriesAArtifacts?.caseStudyDraft ??
      scaleArtifacts?.caseStudyDraft ??
      month2Artifacts?.caseStudyDraft ??
      null,
    investorOnepager:
      loopArtifacts?.investorOnepager ??
      sustainedOpsArtifacts?.investorOnepager ??
      marketLeaderArtifacts?.investorOnepager ??
      seriesAArtifacts?.investorOnepager ??
      scaleArtifacts?.investorOnepager ??
      month2Artifacts?.investorOnepager ??
      null,
    rollbackDrill:
      loopArtifacts?.rollbackDrill ??
      sustainedOpsArtifacts?.rollbackDrill ??
      marketLeaderArtifacts?.rollbackDrill ??
      seriesAArtifacts?.rollbackDrill ??
      scaleArtifacts?.rollbackDrill ??
      null,
    competitorMatrix:
      loopArtifacts?.competitorMatrix ??
      sustainedOpsArtifacts?.competitorMatrix ??
      marketLeaderArtifacts?.competitorMatrix ??
      seriesAArtifacts?.competitorMatrix ??
      null,
  });
  const sustainedProductEvolutionRankedAction =
    rolePack === "owner"
      ? buildOwnerDailyBriefingSustainedProductEvolutionAction(sustainedProductEvolution)
      : null;
  const maintenanceMode = buildMaintenanceModeUiSlice({
    goNoGoSummary: commercialOps?.goNoGo.summary ?? null,
    p0ProofStatus: commercialOps?.p0Staging.summary?.p0ProofStatus ?? null,
    tier2ProofStatus: commercialOps?.tier2Staging.summary?.tier2ProofStatus ?? null,
    p0Staging:
      loopArtifacts?.p0Staging ??
      sustainedOpsArtifacts?.p0Staging ??
      marketLeaderArtifacts?.p0Staging ??
      seriesAArtifacts?.p0Staging ??
      scaleArtifacts?.p0Staging ??
      commercialOps?.p0Staging.summary ??
      null,
    tier2Summary:
      loopArtifacts?.tier2Summary ??
      sustainedOpsArtifacts?.tier2Summary ??
      marketLeaderArtifacts?.tier2Summary ??
      seriesAArtifacts?.tier2Summary ??
      scaleArtifacts?.tier2Summary ??
      commercialOps?.tier2Staging.summary ??
      null,
    metricsBaseline:
      loopArtifacts?.metricsBaseline ??
      sustainedOpsArtifacts?.metricsBaseline ??
      marketLeaderArtifacts?.metricsBaseline ??
      seriesAArtifacts?.metricsBaseline ??
      scaleArtifacts?.metricsBaseline ??
      month2Artifacts?.metricsBaseline ??
      null,
    caseStudyDraft:
      loopArtifacts?.caseStudyDraft ??
      sustainedOpsArtifacts?.caseStudyDraft ??
      marketLeaderArtifacts?.caseStudyDraft ??
      seriesAArtifacts?.caseStudyDraft ??
      scaleArtifacts?.caseStudyDraft ??
      month2Artifacts?.caseStudyDraft ??
      null,
    investorOnepager:
      loopArtifacts?.investorOnepager ??
      sustainedOpsArtifacts?.investorOnepager ??
      marketLeaderArtifacts?.investorOnepager ??
      seriesAArtifacts?.investorOnepager ??
      scaleArtifacts?.investorOnepager ??
      month2Artifacts?.investorOnepager ??
      null,
    rollbackDrill:
      loopArtifacts?.rollbackDrill ??
      sustainedOpsArtifacts?.rollbackDrill ??
      marketLeaderArtifacts?.rollbackDrill ??
      seriesAArtifacts?.rollbackDrill ??
      scaleArtifacts?.rollbackDrill ??
      null,
    competitorMatrix:
      loopArtifacts?.competitorMatrix ??
      sustainedOpsArtifacts?.competitorMatrix ??
      marketLeaderArtifacts?.competitorMatrix ??
      seriesAArtifacts?.competitorMatrix ??
      null,
  });
  const maintenanceModeRankedAction =
    rolePack === "owner"
      ? buildOwnerDailyBriefingMaintenanceModeAction(maintenanceMode)
      : null;
  const engineeringPathTerminusRankedAction =
    rolePack === "owner"
      ? buildOwnerDailyBriefingEngineeringPathTerminusAction(
          maintenanceMode?.engineeringPathTerminus ?? null,
        )
      : null;
  const postTerminusSteadyStateRankedAction =
    rolePack === "owner"
      ? buildOwnerDailyBriefingPostTerminusSteadyStateAction(
          maintenanceMode?.engineeringPathTerminus?.postTerminusSteadyState ?? null,
        )
      : null;

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

  const integrationHealthSlice = integrationHealth
    ? buildOwnerDailyBriefingIntegrationHealthSlice({
        model: integrationHealth,
        p0Summary: commercialOps?.p0Staging.summary ?? null,
      })
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

  const fulfillmentCommandFlowInput: FulfillmentCommandFlowBriefingInput = {
    ...kdsBriefingInput,
    activeOrders: today.kpis.activeOrders,
    ordersToday: today.kpis.ordersToday,
    blockedOrdersApprox: today.kpis.blockedOrdersApprox,
    posKitchenQueueToday: today.kpis.posKitchenQueueToday,
  };

  const integrationRecoveryInput: BriefingIntegrationRecoveryInput = {
    integrationOverall: briefingInput.integrationOverall,
    integrationHealth: integrationHealthSlice,
    smokeNextAction,
    errorIntegrations: today.kpis.errorIntegrations,
    webhooksNeedingAttention: today.kpis.webhooksNeedingAttention,
  };

  const baseTiles =
    rolePack === "support_admin"
      ? buildOwnerDailyBriefingSupportAdminTiles({
          blockers: today.blockers,
          openSupportTickets: today.kpis.openSupportTickets,
          errorIntegrations: today.kpis.errorIntegrations,
          commercialOps,
        })
      : enrichBriefingProductionCalendarPackTiles(
          buildOwnerDailyBriefingTiles(briefingInput),
          productionCalendarSlice,
        );
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
          ? enrichBriefingFulfillmentCommandFlowPackTiles(
              enrichBriefingManagerPackingQcPackTiles(
                enrichBriefingManagerOverridePackTiles(
                  enrichBriefingManagerPackTiles(baseTiles, kdsBriefingInput),
                  managerOverrideInput,
                ),
                kdsBriefingInput,
              ),
              fulfillmentCommandFlowInput,
            )
          : rolePack === "owner"
            ? enrichBriefingIntegrationRecoveryPackTiles(
                enrichBriefingFulfillmentCommandFlowPackTiles(
                  options?.launchWizard
                    ? enrichBriefingLaunchWizardPackTiles({
                        tiles: enrichBriefingOwnerPackTiles(baseTiles, kdsBriefingInput),
                        nextStep: options.launchWizard.nextStep,
                        progress: options.launchWizard.progress,
                      })
                    : enrichBriefingOwnerPackTiles(baseTiles, kdsBriefingInput),
                  fulfillmentCommandFlowInput,
                ),
                integrationRecoveryInput,
              )
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

  const launchWizardSetupAction =
    rolePack === "owner" && options?.launchWizard
      ? buildOwnerDailyBriefingLaunchWizardSetupAction({
          nextStep: options.launchWizard.nextStep,
          progress: options.launchWizard.progress,
          hasCommercialUnblock: Boolean(options.launchWizard.commercialSetup.nextUnblock),
        })
      : null;

  const smokeNextActionRanked =
    needsCommercialOps && smokeNextAction
      ? buildBriefingSmokeNextActionRankedAction(smokeNextAction)
      : null;

  let allTopActions = allTopActionsBase;
  if (rolePack === "owner" && p0OpsVaultRankedAction) {
    allTopActions = mergeBriefingP0OpsVaultTopActions(p0OpsVaultRankedAction, allTopActions);
  }
  if (rolePack === "owner" && tier2GoldenPathRankedAction) {
    allTopActions = mergeBriefingTier2GoldenPathTopActions(tier2GoldenPathRankedAction, allTopActions);
  }
  if (rolePack === "owner" && commercialGoClosureRankedAction) {
    allTopActions = mergeBriefingCommercialGoClosureTopActions(
      commercialGoClosureRankedAction,
      allTopActions,
    );
  }
  if (rolePack === "owner" && !suppressEra25ConvergenceBriefing && paidPilotGoConvergenceEra25RankedAction) {
    allTopActions = mergeBriefingPaidPilotGoConvergenceTopActions(
      paidPilotGoConvergenceEra25RankedAction,
      allTopActions,
    );
  }
  if (rolePack === "owner" && !suppressEra25ConvergenceBriefing && pilotWeek1ConvergenceEra25RankedAction) {
    allTopActions = mergeBriefingPilotWeek1ExecutionConvergenceEra25TopActions(
      pilotWeek1ConvergenceEra25RankedAction,
      allTopActions,
    );
  }
  if (rolePack === "owner" && !suppressEra25ConvergenceBriefing && month2ConvergenceEra25RankedAction) {
    allTopActions = mergeBriefingMonth2MarketReadinessConvergenceEra25TopActions(
      month2ConvergenceEra25RankedAction,
      allTopActions,
    );
  }
  if (rolePack === "owner" && !suppressEra25ConvergenceBriefing && scaleConvergenceEra25RankedAction) {
    allTopActions = mergeBriefingScaleReadinessConvergenceEra25TopActions(
      scaleConvergenceEra25RankedAction,
      allTopActions,
    );
  }
  if (rolePack === "owner" && !suppressEra25ConvergenceBriefing && seriesAConvergenceEra25RankedAction) {
    allTopActions = mergeBriefingSeriesAPartnerExpansionConvergenceEra25TopActions(
      seriesAConvergenceEra25RankedAction,
      allTopActions,
    );
  }
  if (rolePack === "owner" && !suppressEra25ConvergenceBriefing && marketLeaderConvergenceEra25RankedAction) {
    allTopActions = mergeBriefingMarketLeaderPositioningConvergenceEra25TopActions(
      marketLeaderConvergenceEra25RankedAction,
      allTopActions,
    );
  }
  if (rolePack === "owner" && !suppressEra25ConvergenceBriefing && sustainedOpsConvergenceEra25RankedAction) {
    allTopActions = mergeBriefingSustainedOperationalExcellenceConvergenceEra25TopActions(
      sustainedOpsConvergenceEra25RankedAction,
      allTopActions,
    );
  }
  if (rolePack === "owner" && pilotWeek1RankedAction) {
    allTopActions = mergeBriefingPilotWeek1TopActions(pilotWeek1RankedAction, allTopActions);
  }
  if (rolePack === "owner" && month2MarketReadinessRankedAction) {
    allTopActions = mergeBriefingMonth2MarketReadinessTopActions(
      month2MarketReadinessRankedAction,
      allTopActions,
    );
  }
  if (rolePack === "owner" && scaleReadinessRankedAction) {
    allTopActions = mergeBriefingScaleReadinessTopActions(scaleReadinessRankedAction, allTopActions);
  }
  if (rolePack === "owner" && seriesAPartnerExpansionRankedAction) {
    allTopActions = mergeBriefingSeriesAPartnerExpansionTopActions(
      seriesAPartnerExpansionRankedAction,
      allTopActions,
    );
  }
  if (rolePack === "owner" && marketLeaderPositioningRankedAction) {
    allTopActions = mergeBriefingMarketLeaderPositioningTopActions(
      marketLeaderPositioningRankedAction,
      allTopActions,
    );
  }
  if (rolePack === "owner" && sustainedOperationalExcellenceRankedAction) {
    allTopActions = mergeBriefingSustainedOperationalExcellenceTopActions(
      sustainedOperationalExcellenceRankedAction,
      allTopActions,
    );
  }
  if (rolePack === "owner" && continuousImprovementLoopRankedAction) {
    allTopActions = mergeBriefingContinuousImprovementLoopTopActions(
      continuousImprovementLoopRankedAction,
      allTopActions,
    );
  }
  if (rolePack === "owner" && sustainedProductEvolutionRankedAction) {
    allTopActions = mergeBriefingSustainedProductEvolutionTopActions(
      sustainedProductEvolutionRankedAction,
      allTopActions,
    );
  }
  if (rolePack === "owner" && maintenanceModeRankedAction) {
    allTopActions = mergeBriefingMaintenanceModeTopActions(
      maintenanceModeRankedAction,
      allTopActions,
    );
  }
  if (rolePack === "owner" && engineeringPathTerminusRankedAction) {
    allTopActions = mergeBriefingEngineeringPathTerminusTopActions(
      engineeringPathTerminusRankedAction,
      allTopActions,
    );
  }
  if (rolePack === "owner" && postTerminusSteadyStateRankedAction) {
    allTopActions = mergeBriefingPostTerminusSteadyStateTopActions(
      postTerminusSteadyStateRankedAction,
      allTopActions,
    );
  }
  if (rolePack === "owner" && launchWizardCommercialAction) {
    allTopActions = mergeBriefingLaunchWizardTopActions(launchWizardCommercialAction, allTopActions);
  } else if (rolePack === "owner" && launchWizardSetupAction) {
    allTopActions = mergeBriefingLaunchWizardTopActions(launchWizardSetupAction, allTopActions);
  }
  if (needsCommercialOps && smokeNextActionRanked && rolePack === "support_admin") {
    allTopActions = mergeBriefingSmokeNextTopActions(smokeNextActionRanked, allTopActions);
  }
  if (rolePack === "owner") {
    const integrationRecoveryAction =
      buildBriefingIntegrationRecoveryConvergedAction(integrationRecoveryInput);
    if (integrationRecoveryAction) {
      allTopActions = mergeBriefingIntegrationRecoveryTopActions(allTopActions, [
        integrationRecoveryAction,
      ]);
    }
  }
  if (rolePack === "owner") {
    allTopActions = mergeBriefingFulfillmentCommandFlowTopActions(
      mergeBriefingOwnerKdsTopActions(
        buildOwnerDailyBriefingOwnerKdsActions(kdsBriefingInput),
        allTopActions,
      ),
      buildOwnerDailyBriefingFulfillmentCommandFlowActions(
        fulfillmentCommandFlowInput,
        "owner",
      ),
    );
  } else if (rolePack === "manager") {
    allTopActions = mergeBriefingFulfillmentCommandFlowTopActions(
      allTopActions,
      buildOwnerDailyBriefingFulfillmentCommandFlowActions(
        fulfillmentCommandFlowInput,
        "manager",
      ),
    );
  }

  const tiles = filterBriefingTilesForRolePack(allTiles, rolePack);
  const alerts = filterBriefingAlertsForRolePack(allAlerts, rolePack);
  const topActions = finalizeOwnerDailyBriefingTopActions(
    filterBriefingActionsForRolePack(allTopActions, rolePack),
  );
  const heroTiles = dedupeOwnerDailyBriefingHeroTilesByCategory(
    pickBriefingHeroTilesForRolePack(tiles, rolePack, pickOwnerDailyBriefingHeroTiles),
  );
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

  const integrationHealthSliceForPayload =
    showIntegrationHealthLane && integrationHealthSlice ? integrationHealthSlice : null;

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

  const operationalEmptyState = buildOwnerDailyBriefingOperationalEmptyState({
    topActionsCount: topActions.length,
    activeOrders: today.kpis.activeOrders,
    readinessOverall: today.readiness.overall,
    riskAllClear: riskRadar?.allClear ?? true,
    pureOperationalMode:
      pureOperationalModeEra25Active || (continuousImprovementLoop?.pureOperationalMode ?? false),
    continuousImprovementHref: continuousImprovementLoop?.platformOpsHref,
    maintenanceModeActive: maintenanceMode?.maintenanceModeActive ?? false,
    maintenanceModeHref: maintenanceMode?.platformOpsHref,
  });

  const p0ProofBlockedLabel = resolveBriefingP0ProofBlockedLabel(
    commercialOps?.p0Staging?.summary?.p0ProofStatus,
  );

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
    integrationHealth: integrationHealthSliceForPayload,
    showRiskRadarLane,
    riskRadar,
    summary: {
      attentionTileCount: tiles.filter((tile) => tile.tone === "attention").length,
      alertCount: alerts.length,
      riskSignalCount: riskRadar?.totalSignals ?? 0,
      readinessOverall: today.readiness.overall,
    },
    productionGradePolicyId: OWNER_DAILY_BRIEFING_PRODUCTION_GRADE_ERA20_POLICY_ID,
    p0ProofBlockedLabel,
    p0OpsVault,
    commercialInflection,
    tier2GoldenPath,
    commercialGoClosure,
    pilotWeek1,
    month2MarketReadiness,
    scaleReadiness,
    seriesAPartnerExpansion,
    marketLeaderPositioning,
    sustainedOperationalExcellence,
    continuousImprovementLoop,
    sustainedProductEvolution,
    maintenanceMode,
    pureOperationalModeEra25Active,
    pureOperationalModeTerminus:
      sustainedOpsConvergenceEra25?.pureOperationalModeTerminus ?? null,
    operationalEmptyState,
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
