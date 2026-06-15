/**
 * Launch Wizard — era25 owner daily briefing breakthrough integrity convergence.
 */
import type { OwnerDailyBriefingBreakthroughEra25UiSlice } from "@/lib/commercial/owner-daily-briefing-breakthrough-ui-era25";

export const LAUNCH_WIZARD_ERA25_OWNER_DAILY_BRIEFING_BREAKTHROUGH_ERA46_POLICY_ID =
  "era46-launch-wizard-era25-owner-daily-briefing-breakthrough-v1" as const;

export const LAUNCH_WIZARD_ERA25_OWNER_DAILY_BRIEFING_BREAKTHROUGH_ANCHOR =
  "#launch-wizard-era25-owner-daily-briefing-breakthrough" as const;

export type LaunchWizardEra25OwnerDailyBriefingBreakthroughSlice = {
  policyId: typeof LAUNCH_WIZARD_ERA25_OWNER_DAILY_BRIEFING_BREAKTHROUGH_ERA46_POLICY_ID;
  visible: boolean;
  goDecision: string;
  customerName: string | null;
  ownerDailyBriefingBreakthroughIntegrityFailed: boolean;
  era25FirstProductSliceBlueprintIntegrityFailed: boolean;
  sliceBlocked: boolean;
  wiredBriefingTileCount: number;
  briefingSchemeCount: number;
  progressLabel: string;
  launchWizardHref: string;
  todayHref: string;
  platformOpsHref: string;
  integrityValidateCommand: string;
  postGatesOrchestratorCommand: string;
};

export function buildLaunchWizardEra25OwnerDailyBriefingBreakthroughSlice(
  slice: OwnerDailyBriefingBreakthroughEra25UiSlice | null,
  customerName?: string | null,
): LaunchWizardEra25OwnerDailyBriefingBreakthroughSlice | null {
  if (!slice) return null;

  const attentionNeeded =
    slice.ownerDailyBriefingBreakthroughEra25Milestone !==
      "owner_daily_briefing_breakthrough_era25_ready" || slice.sliceBlocked;

  return {
    policyId: LAUNCH_WIZARD_ERA25_OWNER_DAILY_BRIEFING_BREAKTHROUGH_ERA46_POLICY_ID,
    visible: true,
    goDecision: slice.goDecision ?? "GO",
    customerName: customerName ?? null,
    ownerDailyBriefingBreakthroughIntegrityFailed: !slice.ownerDailyBriefingBreakthroughIntegrityPassed,
    era25FirstProductSliceBlueprintIntegrityFailed: !slice.era25FirstProductSliceBlueprintIntegrityPassed,
    sliceBlocked: slice.sliceBlocked,
    wiredBriefingTileCount: slice.wiredBriefingTileCount,
    briefingSchemeCount: slice.briefingSchemeCount,
    progressLabel: attentionNeeded
      ? `${slice.ownerDailyBriefingBreakthroughEra25Milestone.replaceAll("_", " ")} · ${slice.wiredBriefingTileCount}/${slice.briefingSchemeCount} B tiles`
      : `B0–B4 wired · ${slice.wiredBriefingTileCount} tiles · breakthrough ready`,
    launchWizardHref: slice.launchWizardHref,
    todayHref: slice.todayHref,
    platformOpsHref: slice.platformOpsHref,
    integrityValidateCommand: slice.integrityValidateCommand,
    postGatesOrchestratorCommand: slice.postGatesOrchestratorCommand,
  };
}

export function launchWizardEra25OwnerDailyBriefingBreakthroughHref(): string {
  return `/dashboard/launch-wizard${LAUNCH_WIZARD_ERA25_OWNER_DAILY_BRIEFING_BREAKTHROUGH_ANCHOR}`;
}
