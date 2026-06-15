/**
 * Era 20 — Launch Wizard production-grade CTAs, pilot blockers, and setup guidance.
 */

import type { P0StagingProofUnblockSummary } from "@/lib/commercial/p0-staging-proof-unblock-summary";
import { INTEGRATION_HEALTH_RECOVERY_ANCHOR } from "@/lib/integrations/integration-health-recovery-era19-policy";
import type { LaunchWizardStep } from "@/lib/launch-wizard/launch-wizard-era19";
import {
  LAUNCH_WIZARD_ROUTE,
  LAUNCH_WIZARD_STEP_DEFINITIONS,
  launchWizardStepDefinition,
} from "@/lib/launch-wizard/launch-wizard-era19-policy";
import { LAUNCH_WIZARD_COMMERCIAL_BLOCKERS_ANCHOR } from "@/lib/launch-wizard/launch-wizard-commercial-setup-era19-policy";
import { LAUNCH_WIZARD_PRODUCTION_GRADE_ERA20_POLICY_ID } from "@/lib/launch-wizard/launch-wizard-production-grade-era20-policy";

const INTEGRATION_HEALTH_PATH = "/dashboard/integration-health";

export type LaunchWizardP0ProofChip = {
  label: string;
  detail: string;
  href: string;
  missingEnvVarCount: number;
};

export type LaunchWizardProductionGradeSnapshot = {
  policyId: typeof LAUNCH_WIZARD_PRODUCTION_GRADE_ERA20_POLICY_ID;
  auditedStepCount: number;
  operationalCtaCount: number;
  blockedStepCount: number;
  commercialBlockerCount: number;
  p0ProofStatus: P0StagingProofUnblockSummary["p0ProofStatus"] | "unknown";
  p0MissingEnvVarCount: number;
  headline: string;
  showP0Chip: boolean;
  p0ProofChip: LaunchWizardP0ProofChip | null;
};

export function normalizeLaunchWizardHref(href: string): string {
  const withoutHash = href.split("#")[0] ?? href;
  const withoutQuery = withoutHash.split("?")[0] ?? withoutHash;
  if (withoutQuery.startsWith("http")) {
    try {
      return new URL(withoutQuery).pathname;
    } catch {
      return withoutQuery;
    }
  }
  return withoutQuery;
}

export function isOperationalDashboardHref(href: string): boolean {
  const path = normalizeLaunchWizardHref(href);
  return path.startsWith("/dashboard/");
}

/** Every policy step must link to a real dashboard module — no dead CTAs. */
export function auditLaunchWizardStepDefinitionHrefs(): {
  valid: boolean;
  invalidStepIds: string[];
} {
  const invalidStepIds = LAUNCH_WIZARD_STEP_DEFINITIONS.filter(
    (row) => !isOperationalDashboardHref(row.workflowHref),
  ).map((row) => row.id);
  return { valid: invalidStepIds.length === 0, invalidStepIds };
}

function buildStepSetupGuidance(step: LaunchWizardStep): string | undefined {
  if (step.status !== "blocked" && step.status !== "in_progress") return undefined;
  const firstMissing = step.missingItems[0];
  if (!firstMissing) return undefined;
  return `Next setup action: ${firstMissing}`;
}

export function finalizeLaunchWizardStepForProductionGrade(step: LaunchWizardStep): LaunchWizardStep {
  let href = step.href;
  let ctaLabel = step.ctaLabel;
  const def = launchWizardStepDefinition(step.id);

  if (step.id === "pilot-readiness") {
    const commercialGatesOpen =
      step.status === "blocked" ||
      step.missingItems.some(
        (item) =>
          item.includes("GO/NO-GO") ||
          item.includes("P0 staging") ||
          item.includes("customer") ||
          item.includes("SSO") ||
          item.includes("Woo/Shopify"),
      );
    if (commercialGatesOpen) {
      href = `${LAUNCH_WIZARD_ROUTE}${LAUNCH_WIZARD_COMMERCIAL_BLOCKERS_ANCHOR}`;
      if (step.status === "blocked") {
        ctaLabel = "Review commercial blockers";
      }
    }
  }

  if (step.id === "integrations" && (step.status === "blocked" || step.status === "in_progress")) {
    if (step.missingItems.some((item) => item.includes("integration error"))) {
      href = `${INTEGRATION_HEALTH_PATH}${INTEGRATION_HEALTH_RECOVERY_ANCHOR}`;
      ctaLabel = "Open integration health";
    } else if (step.status === "in_progress" && step.missingItems.length > 0) {
      href = INTEGRATION_HEALTH_PATH;
      ctaLabel = "Continue channel setup";
    }
  }

  if (!isOperationalDashboardHref(href)) {
    href = def.workflowHref;
  }

  const setupGuidance = step.setupGuidance ?? buildStepSetupGuidance(step);

  return {
    ...step,
    href,
    ctaLabel,
    setupGuidance,
  };
}

export function finalizeLaunchWizardStepsForProductionGrade(
  steps: readonly LaunchWizardStep[],
): LaunchWizardStep[] {
  return steps.map((row) => finalizeLaunchWizardStepForProductionGrade(row));
}

export function buildLaunchWizardP0ProofChip(
  p0: P0StagingProofUnblockSummary | null | undefined,
): LaunchWizardP0ProofChip | null {
  if (!p0 || p0.p0ProofStatus === "proof_passed") return null;
  const count = p0.allMissingEnvVars.length;
  if (p0.p0ProofStatus === "awaiting_ops_credentials") {
    return {
      label: count > 0 ? `P0 staging blocked · ${count} env vars` : "P0 staging blocked",
      detail:
        "Configure ops vault credentials, then run npm run smoke:p0-staging-proof-unblock — never mark live without proof.",
      href: `${LAUNCH_WIZARD_ROUTE}${LAUNCH_WIZARD_COMMERCIAL_BLOCKERS_ANCHOR}`,
      missingEnvVarCount: count,
    };
  }
  return {
    label: "P0 staging proof failed",
    detail: "Inspect artifacts/p0-staging-proof-unblock-summary.json and fix bounded failures.",
    href: `${LAUNCH_WIZARD_ROUTE}${LAUNCH_WIZARD_COMMERCIAL_BLOCKERS_ANCHOR}`,
    missingEnvVarCount: count,
  };
}

export function buildLaunchWizardProductionGradeSnapshot(input: {
  steps: readonly LaunchWizardStep[];
  commercialBlockerCount: number;
  p0: P0StagingProofUnblockSummary | null | undefined;
}): LaunchWizardProductionGradeSnapshot {
  const finalized = finalizeLaunchWizardStepsForProductionGrade(input.steps);
  const operationalCtaCount = finalized.filter((row) =>
    isOperationalDashboardHref(row.href),
  ).length;
  const blockedStepCount = finalized.filter((row) => row.status === "blocked").length;
  const p0ProofStatus = input.p0?.p0ProofStatus ?? "unknown";
  const p0MissingEnvVarCount = input.p0?.allMissingEnvVars.length ?? 0;
  const p0ProofChip = buildLaunchWizardP0ProofChip(input.p0);
  const showP0Chip = p0ProofChip !== null;

  let headline = "Launch wizard links every setup step to a real dashboard module.";
  if (blockedStepCount > 0 && input.commercialBlockerCount > 0) {
    headline = `${blockedStepCount} setup step(s) blocked · ${input.commercialBlockerCount} commercial gate(s) open — resolve before paid pilot traffic.`;
  } else if (blockedStepCount > 0) {
    headline = `${blockedStepCount} setup step(s) blocked — complete missing items before go-live.`;
  } else if (input.commercialBlockerCount > 0) {
    headline = `${input.commercialBlockerCount} commercial gate(s) open — review blockers before customer cutover.`;
  } else if (showP0Chip) {
    headline = "Setup modules ready — finish P0 staging proof for engineering gates.";
  }

  return {
    policyId: LAUNCH_WIZARD_PRODUCTION_GRADE_ERA20_POLICY_ID,
    auditedStepCount: finalized.length,
    operationalCtaCount,
    blockedStepCount,
    commercialBlockerCount: input.commercialBlockerCount,
    p0ProofStatus,
    p0MissingEnvVarCount,
    headline,
    showP0Chip,
    p0ProofChip,
  };
}
