import type { LaunchWizardStep } from "@/lib/launch-wizard/launch-wizard-era19";
import type { LaunchWizardSignals } from "@/lib/launch-wizard/launch-wizard-era19";
import {
  LAUNCH_WIZARD_KDS_PRIORITY_LANE_HREF,
  LAUNCH_WIZARD_KDS_PRODUCTION_ERA19_POLICY_ID,
  LAUNCH_WIZARD_KDS_PRODUCTION_OPERATOR_LINKS_ANCHOR,
  LAUNCH_WIZARD_POS_MANAGER_OVERRIDE_HREF,
  LAUNCH_WIZARD_PRODUCTION_BOARD_ROUTE,
  LAUNCH_WIZARD_PRODUCTION_CALENDAR_ROUTE,
} from "@/lib/launch-wizard/launch-wizard-kds-production-era19-policy";
import { POS_CASHIER_SPEED_MODE_ROUTE } from "@/lib/pos/pos-cashier-speed-mode-era19-policy";

export const LAUNCH_WIZARD_KDS_PRODUCTION_AGGREGATOR_ERA19_POLICY_ID =
  "era19-launch-wizard-kds-production-aggregator-v1" as const;

export type LaunchWizardOperatorLink = {
  id: string;
  label: string;
  detail: string;
  href: string;
  blocked: boolean;
  blockedReason: string | null;
};

export type LaunchWizardKdsProductionEnrichmentInput = {
  posFirstUse: boolean;
  productionPlanCount: number;
  firstProductionCompleted: boolean;
};

function productionComplete(input: LaunchWizardKdsProductionEnrichmentInput): boolean {
  return input.firstProductionCompleted || input.productionPlanCount > 0;
}

export function buildLaunchWizardKdsProductionMissingItems(
  input: LaunchWizardKdsProductionEnrichmentInput,
): string[] {
  if (productionComplete(input)) return [];

  const missing: string[] = [];
  if (!input.posFirstUse) {
    missing.push("Run first POS checkout to feed kitchen tickets");
  }
  if (input.productionPlanCount === 0 && !input.firstProductionCompleted) {
    missing.push("Complete a production task or schedule batches on the calendar");
  }
  return missing;
}

export function buildLaunchWizardKdsProductionSetupGuidance(
  input: LaunchWizardKdsProductionEnrichmentInput,
): string {
  if (productionComplete(input)) {
    return "Production is active — verify KDS priority lane sorting and manager override paths during pilot service.";
  }
  if (!input.posFirstUse) {
    return "Start with one POS checkout so kitchen tickets appear before tuning KDS priority lanes.";
  }
  if (input.productionPlanCount === 0) {
    return "Schedule production batches or complete a kitchen task, then confirm allergen/overdue sorting on the priority lane.";
  }
  return "Finish remaining production setup tasks before go-live simulation.";
}

export function buildLaunchWizardKdsProductionOperatorLinks(
  input: LaunchWizardKdsProductionEnrichmentInput,
): LaunchWizardOperatorLink[] {
  const kdsBlocked = !input.posFirstUse;
  const managerOverrideBlocked = !input.posFirstUse;

  return [
    {
      id: "kds-priority-lane",
      label: "KDS priority lane",
      detail: "Allergen and overdue ticket sorting for prep and expo columns.",
      href: LAUNCH_WIZARD_KDS_PRIORITY_LANE_HREF,
      blocked: kdsBlocked,
      blockedReason: kdsBlocked
        ? "Complete at least one POS checkout to populate kitchen tickets."
        : null,
    },
    {
      id: "production-calendar",
      label: "Production calendar",
      detail: "Schedule batches and review due-today or overdue prep work.",
      href: LAUNCH_WIZARD_PRODUCTION_CALENDAR_ROUTE,
      blocked: false,
      blockedReason: null,
    },
    {
      id: "production-board",
      label: "Production board",
      detail: "Track prep tasks and mark production work complete.",
      href: LAUNCH_WIZARD_PRODUCTION_BOARD_ROUTE,
      blocked: false,
      blockedReason: null,
    },
    {
      id: "pos-manager-override",
      label: "POS manager override",
      detail: "Review manager discount/comp checklist before rush-hour pilot service.",
      href: LAUNCH_WIZARD_POS_MANAGER_OVERRIDE_HREF,
      blocked: managerOverrideBlocked,
      blockedReason: managerOverrideBlocked
        ? "Run POS checkout first — override checklist applies after register use."
        : null,
    },
  ];
}

export function resolveLaunchWizardKdsProductionPrimaryHref(
  input: LaunchWizardKdsProductionEnrichmentInput,
): string {
  if (productionComplete(input)) {
    return input.posFirstUse
      ? LAUNCH_WIZARD_KDS_PRIORITY_LANE_HREF
      : LAUNCH_WIZARD_PRODUCTION_BOARD_ROUTE;
  }
  if (!input.posFirstUse) {
    return POS_CASHIER_SPEED_MODE_ROUTE;
  }
  if (input.productionPlanCount > 0) {
    return LAUNCH_WIZARD_PRODUCTION_CALENDAR_ROUTE;
  }
  return LAUNCH_WIZARD_PRODUCTION_BOARD_ROUTE;
}

export function resolveLaunchWizardKdsProductionCtaLabel(
  input: LaunchWizardKdsProductionEnrichmentInput,
): string {
  if (productionComplete(input)) {
    return input.posFirstUse ? "Open KDS priority lane" : "Open production";
  }
  if (!input.posFirstUse) {
    return "Run POS checkout";
  }
  if (input.productionPlanCount > 0) {
    return "Open production calendar";
  }
  return "Set up production";
}

export function enrichLaunchWizardKdsProductionStep(
  step: LaunchWizardStep,
  pos: LaunchWizardSignals["pos"],
  production: LaunchWizardSignals["production"],
): LaunchWizardStep {
  const input: LaunchWizardKdsProductionEnrichmentInput = {
    posFirstUse: pos.firstUse,
    productionPlanCount: production.productionPlanCount,
    firstProductionCompleted: production.firstProductionCompleted,
  };

  const complete = productionComplete(input);
  const inProgress = !complete && (input.productionPlanCount > 0 || input.posFirstUse);

  return {
    ...step,
    status: complete ? "complete" : inProgress ? "in_progress" : step.status,
    missingItems: buildLaunchWizardKdsProductionMissingItems(input),
    ctaLabel: resolveLaunchWizardKdsProductionCtaLabel(input),
    href: resolveLaunchWizardKdsProductionPrimaryHref(input),
    setupGuidance: buildLaunchWizardKdsProductionSetupGuidance(input),
    operatorLinks: buildLaunchWizardKdsProductionOperatorLinks(input),
    policyId: LAUNCH_WIZARD_KDS_PRODUCTION_ERA19_POLICY_ID,
    operatorLinksAnchor: LAUNCH_WIZARD_KDS_PRODUCTION_OPERATOR_LINKS_ANCHOR,
  };
}

export function launchWizardKdsProductionOperatorLinksHref(stepId: string): string {
  return `/dashboard/launch-wizard#launch-wizard-step-${stepId}`;
}
