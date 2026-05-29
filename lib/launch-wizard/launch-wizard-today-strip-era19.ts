import type { CommercialPilotOpsDecision } from "@/lib/commercial/commercial-pilot-ops-status-era18";
import { launchWizardTodayStripHref } from "@/lib/launch-wizard/launch-wizard-commercial-blockers-era19";
import type { LaunchWizardCommercialBlockersSlice } from "@/lib/launch-wizard/launch-wizard-commercial-blockers-era19";
import type { LaunchWizardCommercialSetupSlice } from "@/lib/launch-wizard/launch-wizard-commercial-setup-era19";
import { LAUNCH_WIZARD_COMMERCIAL_BLOCKERS_ANCHOR } from "@/lib/launch-wizard/launch-wizard-commercial-setup-era19-policy";
import { LAUNCH_WIZARD_TODAY_STRIP_ERA19_POLICY_ID } from "@/lib/launch-wizard/launch-wizard-today-strip-era19-policy";
import { LAUNCH_WIZARD_ROUTE } from "@/lib/launch-wizard/launch-wizard-era19-policy";
import type { LaunchWizardCommercialInflectionSlice } from "@/lib/launch-wizard/launch-wizard-commercial-inflection-era28";
import type { LaunchWizardStep } from "@/lib/launch-wizard/launch-wizard-era19";

export const LAUNCH_WIZARD_TODAY_STRIP_AGGREGATOR_ERA19_POLICY_ID =
  "era19-launch-wizard-today-strip-aggregator-v1" as const;

export type LaunchWizardTodayStripMode = "commercial_unblock" | "setup_next" | "setup_complete";

export type LaunchWizardTodayStripDisplayMode = "full" | "setup_only";

export type LaunchWizardTodayStripDecisionTone = "urgent" | "success" | "neutral";

export type LaunchWizardTodayStripViewModel = {
  policyId: typeof LAUNCH_WIZARD_TODAY_STRIP_ERA19_POLICY_ID;
  mode: LaunchWizardTodayStripMode;
  displayMode: LaunchWizardTodayStripDisplayMode;
  headline: string;
  subline: string;
  href: string;
  ctaLabel: string;
  decisionLabel: string;
  decisionTone: LaunchWizardTodayStripDecisionTone;
  blockerCount: number;
  progressPercent: number;
  progressLabel: string;
  commercialInflection: LaunchWizardCommercialInflectionSlice | null;
};

export function resolveLaunchWizardTodayStripDecisionTone(
  decision: CommercialPilotOpsDecision,
  blockerCount: number,
): LaunchWizardTodayStripDecisionTone {
  if (decision === "GO" && blockerCount === 0) return "success";
  if (decision === "NO-GO" || blockerCount > 0) return "urgent";
  return "neutral";
}

export function resolveLaunchWizardTodayStripDisplayMode(input: {
  briefingActive: boolean;
  rolePack: "owner" | "manager" | "kitchen" | "cashier" | "support_admin" | null;
  commercialBlockerCount: number;
}): LaunchWizardTodayStripDisplayMode {
  if (input.briefingActive && input.rolePack === "owner" && input.commercialBlockerCount > 0) {
    return "setup_only";
  }
  return "full";
}

export function resolveLaunchWizardTodayStripHref(input: {
  nextUnblockHref?: string | null;
  nextStepId?: string | null;
  mode: LaunchWizardTodayStripMode;
}): string {
  if (input.mode === "commercial_unblock" && input.nextUnblockHref) {
    return input.nextUnblockHref;
  }
  if (input.mode === "setup_complete") {
    return `${LAUNCH_WIZARD_ROUTE}${LAUNCH_WIZARD_COMMERCIAL_BLOCKERS_ANCHOR}`;
  }
  return launchWizardTodayStripHref(input.nextStepId ?? null);
}

export function buildLaunchWizardTodayStripViewModel(input: {
  commercialBlockers: LaunchWizardCommercialBlockersSlice;
  commercialSetup: LaunchWizardCommercialSetupSlice;
  commercialInflection?: LaunchWizardCommercialInflectionSlice | null;
  nextStep: LaunchWizardStep | null;
  progress: { completedCount: number; totalCount: number; percent: number };
  displayMode?: LaunchWizardTodayStripDisplayMode;
}): LaunchWizardTodayStripViewModel {
  const commercialInflection = input.commercialInflection ?? null;
  const inflectionSubline = commercialInflection
    ? `${commercialInflection.scorecardLabel} · registry LIVE ${commercialInflection.integrationRegistryLiveCount}`
    : null;
  const displayMode = input.displayMode ?? "full";
  const nextUnblock = input.commercialSetup.nextUnblock;
  const blockerCount = input.commercialBlockers.blockers.length;
  const decisionTone = resolveLaunchWizardTodayStripDecisionTone(
    input.commercialBlockers.decision,
    blockerCount,
  );
  const progressLabel = `${input.progress.completedCount}/${input.progress.totalCount} setup steps`;

  if (displayMode === "full" && nextUnblock) {
    return {
      policyId: LAUNCH_WIZARD_TODAY_STRIP_ERA19_POLICY_ID,
      mode: "commercial_unblock",
      displayMode,
      headline: nextUnblock.label,
      subline: nextUnblock.detail,
      href: resolveLaunchWizardTodayStripHref({
        nextUnblockHref: nextUnblock.href,
        mode: "commercial_unblock",
      }),
      ctaLabel: "Unblock pilot",
      decisionLabel: input.commercialBlockers.decisionLabel,
      decisionTone,
      blockerCount,
      progressPercent: input.progress.percent,
      progressLabel,
      commercialInflection,
    };
  }

  if (input.nextStep) {
    return {
      policyId: LAUNCH_WIZARD_TODAY_STRIP_ERA19_POLICY_ID,
      mode: "setup_next",
      displayMode,
      headline: input.nextStep.title,
      subline:
        displayMode === "setup_only" && blockerCount > 0
          ? `${progressLabel} — commercial blockers are in your briefing above.`
          : `Next setup step · ${progressLabel}`,
      href: resolveLaunchWizardTodayStripHref({
        nextStepId: input.nextStep.id,
        mode: "setup_next",
      }),
      ctaLabel: input.nextStep.ctaLabel,
      decisionLabel: input.commercialBlockers.decisionLabel,
      decisionTone,
      blockerCount: displayMode === "setup_only" ? 0 : blockerCount,
      progressPercent: input.progress.percent,
      progressLabel,
      commercialInflection,
    };
  }

  return {
    policyId: LAUNCH_WIZARD_TODAY_STRIP_ERA19_POLICY_ID,
    mode: "setup_complete",
    displayMode,
    headline: "Setup steps complete",
    subline:
      blockerCount > 0
        ? inflectionSubline
          ? `${input.commercialBlockers.headline} · ${inflectionSubline}`
          : input.commercialBlockers.headline
        : inflectionSubline ?? "Confirm commercial GO/NO-GO before pilot cutover.",
    href: resolveLaunchWizardTodayStripHref({ mode: "setup_complete" }),
    ctaLabel: "Review commercial proof",
    decisionLabel: input.commercialBlockers.decisionLabel,
    decisionTone,
    blockerCount: displayMode === "setup_only" ? 0 : blockerCount,
    progressPercent: input.progress.percent,
    progressLabel,
    commercialInflection,
  };
}
