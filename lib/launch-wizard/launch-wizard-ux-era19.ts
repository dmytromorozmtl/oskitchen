import type { LaunchWizardProgress, LaunchWizardStep, LaunchWizardStepStatus } from "@/lib/launch-wizard/launch-wizard-era19";
import { LAUNCH_WIZARD_ROUTE } from "@/lib/launch-wizard/launch-wizard-era19-policy";

export const LAUNCH_WIZARD_UX_ERA19_POLICY_ID = "era19-launch-wizard-ux-v1" as const;

export type LaunchWizardViewMode = "compact" | "full";

export type LaunchWizardStepNavItem = {
  id: string;
  order: number;
  title: string;
  shortTitle: string;
  status: LaunchWizardStepStatus;
  href: string;
  isNext: boolean;
};

export function launchWizardViewModeHref(mode: LaunchWizardViewMode): string {
  return mode === "compact" ? `${LAUNCH_WIZARD_ROUTE}?mode=compact` : LAUNCH_WIZARD_ROUTE;
}

export function launchWizardToggleModeHref(currentCompact: boolean): string {
  return launchWizardViewModeHref(currentCompact ? "full" : "compact");
}

export function launchWizardStepAnchorHref(stepId: string, compact = false): string {
  const base = compact ? `${LAUNCH_WIZARD_ROUTE}?mode=compact` : LAUNCH_WIZARD_ROUTE;
  return `${base}#launch-wizard-step-${stepId}`;
}

export function launchWizardStepShortTitle(title: string): string {
  const firstWord = title.split(/\s+/)[0] ?? title;
  return firstWord.length > 12 ? `${firstWord.slice(0, 10)}…` : firstWord;
}

export function launchWizardProgressAriaLabel(progress: LaunchWizardProgress): string {
  return `Launch progress ${progress.percent} percent, ${progress.completedCount} of ${progress.totalCount} steps complete, ${progress.blockedCount} blocked`;
}

export function launchWizardStepStatusAriaLabel(status: LaunchWizardStepStatus): string {
  switch (status) {
    case "complete":
      return "Step complete";
    case "in_progress":
      return "Step in progress";
    case "blocked":
      return "Step blocked";
    default:
      return "Step not started";
  }
}

export function buildLaunchWizardStepNavItems(input: {
  steps: readonly LaunchWizardStep[];
  nextStepId?: string | null;
  compact?: boolean;
}): LaunchWizardStepNavItem[] {
  return input.steps.map((step) => ({
    id: step.id,
    order: step.order,
    title: step.title,
    shortTitle: launchWizardStepShortTitle(step.title),
    status: step.status,
    href: launchWizardStepAnchorHref(step.id, input.compact ?? false),
    isNext: step.id === input.nextStepId,
  }));
}

export function pickLaunchWizardStickyNextStepLabel(
  nextStep: LaunchWizardStep | null,
): string {
  if (!nextStep) {
    return "All setup steps complete — confirm commercial GO/NO-GO.";
  }
  return `Next: ${nextStep.title}`;
}
