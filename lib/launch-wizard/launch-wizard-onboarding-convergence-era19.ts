import type { OwnerDailyBriefingRankedAction } from "@/lib/briefing/owner-daily-briefing-era19";
import type { OwnerDailyBriefingTile } from "@/lib/briefing/owner-daily-briefing-era19";
import { launchWizardTodayStripHref } from "@/lib/launch-wizard/launch-wizard-commercial-blockers-era19";
import { LAUNCH_WIZARD_COMMERCIAL_BLOCKERS_ANCHOR } from "@/lib/launch-wizard/launch-wizard-commercial-setup-era19-policy";
import type {
  LaunchWizardProgress,
  LaunchWizardStep,
} from "@/lib/launch-wizard/launch-wizard-era19";
import { LAUNCH_WIZARD_ROUTE } from "@/lib/launch-wizard/launch-wizard-era19-policy";
import { launchWizardStepAnchorHref } from "@/lib/launch-wizard/launch-wizard-ux-era19";
import { LAUNCH_WIZARD_ONBOARDING_CONVERGENCE_ERA19_POLICY_ID } from "@/lib/launch-wizard/launch-wizard-onboarding-convergence-era19-policy";

export { LAUNCH_WIZARD_ONBOARDING_CONVERGENCE_ERA19_POLICY_ID };

export type LaunchWizardOnboardingHeroModel = {
  policyId: typeof LAUNCH_WIZARD_ONBOARDING_CONVERGENCE_ERA19_POLICY_ID;
  headline: string;
  subline: string;
  remainingStepCount: number;
  nextStepTitle: string;
  stepAnchorHref: string;
  workflowHref: string;
  ctaLabel: string;
};

export function resolveLaunchWizardBriefingHref(nextStepId?: string | null): string {
  return launchWizardTodayStripHref(nextStepId ?? null);
}

export function resolveLaunchWizardPilotStatusBriefingHref(input: {
  nextStepId?: string | null;
  setupComplete: boolean;
}): string {
  if (input.setupComplete) {
    return `${LAUNCH_WIZARD_ROUTE}${LAUNCH_WIZARD_COMMERCIAL_BLOCKERS_ANCHOR}`;
  }
  if (input.nextStepId === "pilot-readiness") {
    return launchWizardStepAnchorHref("pilot-readiness", true);
  }
  return resolveLaunchWizardBriefingHref(input.nextStepId ?? null);
}

export function buildLaunchWizardOnboardingHeroModel(input: {
  progress: LaunchWizardProgress;
  nextStep: LaunchWizardStep | null;
  compact?: boolean;
}): LaunchWizardOnboardingHeroModel | null {
  if (!input.nextStep) return null;

  const remainingStepCount = input.progress.totalCount - input.progress.completedCount;
  const stepWord = remainingStepCount === 1 ? "step" : "steps";

  return {
    policyId: LAUNCH_WIZARD_ONBOARDING_CONVERGENCE_ERA19_POLICY_ID,
    headline: `${remainingStepCount} ${stepWord} left — finish setup to reach first order faster`,
    subline: `Next: ${input.nextStep.title}. Each step connects menu, sales, kitchen, and integrations without guesswork.`,
    remainingStepCount,
    nextStepTitle: input.nextStep.title,
    stepAnchorHref: launchWizardStepAnchorHref(input.nextStep.id, input.compact ?? false),
    workflowHref: input.nextStep.href,
    ctaLabel: input.nextStep.ctaLabel,
  };
}

function setupActionSeverity(
  status: LaunchWizardStep["status"],
): OwnerDailyBriefingRankedAction["severity"] {
  if (status === "blocked") return "high";
  return "normal";
}

export function buildOwnerDailyBriefingLaunchWizardSetupAction(input: {
  nextStep: LaunchWizardStep | null;
  progress: LaunchWizardProgress;
  hasCommercialUnblock: boolean;
}): OwnerDailyBriefingRankedAction | null {
  if (input.hasCommercialUnblock || !input.nextStep) return null;

  const severity = setupActionSeverity(input.nextStep.status);

  return {
    id: `launch-wizard-setup-${input.nextStep.id}`,
    title: input.nextStep.title,
    reason: `${input.progress.completedCount}/${input.progress.totalCount} setup steps complete — continue onboarding in launch wizard.`,
    severity,
    ownerRole: "owner",
    href: resolveLaunchWizardBriefingHref(input.nextStep.id),
    status: input.nextStep.status === "blocked" ? "open" : "monitor",
    unblockCondition: "Complete the next launch wizard step and refresh Today briefing.",
    priority: input.nextStep.status === "blocked" ? 7 : 9,
    ctaLabel: input.nextStep.ctaLabel,
    tone: severity === "high" ? "urgent" : "normal",
  };
}

export function enrichBriefingLaunchWizardPackTiles(input: {
  tiles: readonly OwnerDailyBriefingTile[];
  nextStep: LaunchWizardStep | null;
  progress: LaunchWizardProgress;
}): OwnerDailyBriefingTile[] {
  if (!input.nextStep) {
    return input.tiles.map((tile) => {
      if (tile.id !== "pilot-status" && tile.id !== "go-live-readiness") return tile;
      return {
        ...tile,
        href: `${LAUNCH_WIZARD_ROUTE}${LAUNCH_WIZARD_COMMERCIAL_BLOCKERS_ANCHOR}`,
        detail:
          tile.id === "pilot-status"
            ? "Setup complete — confirm commercial GO/NO-GO before paid pilot cutover."
            : tile.detail,
      };
    });
  }

  const setupHref = resolveLaunchWizardBriefingHref(input.nextStep.id);
  const pilotHref = resolveLaunchWizardPilotStatusBriefingHref({
    nextStepId: input.nextStep.id,
    setupComplete: false,
  });

  return input.tiles.map((tile) => {
    if (tile.id === "go-live-readiness") {
      return {
        ...tile,
        href: setupHref,
        detail: `Next setup: ${input.nextStep!.title} · ${input.progress.completedCount}/${input.progress.totalCount} complete`,
      };
    }
    if (tile.id === "pilot-status") {
      return {
        ...tile,
        href: pilotHref,
        detail:
          input.nextStep!.id === "pilot-readiness"
            ? "Commercial and channel proof gaps block pilot GO — review blockers in launch wizard."
            : tile.detail,
      };
    }
    return tile;
  });
}
