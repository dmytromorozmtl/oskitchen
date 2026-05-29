/**
 * Launch Wizard — commercial inflection convergence (market vs governance).
 */
import {
  buildCommercialInflectionReadinessUiSlice,
  formatCommercialInflectionMilestoneLabel,
  formatCommercialInflectionScorecardLabel,
  type CommercialInflectionReadinessUiSlice,
} from "@/lib/commercial/commercial-inflection-readiness-ui-era28";
import type { CommercialPilotOpsStatusModel } from "@/lib/commercial/commercial-pilot-ops-status-era18";
import { evaluateCommercialInflectionReadiness } from "@/lib/commercial/commercial-inflection-readiness-era28";
import { LAUNCH_WIZARD_COMMERCIAL_BLOCKERS_ANCHOR } from "@/lib/launch-wizard/launch-wizard-commercial-setup-era19-policy";

export const LAUNCH_WIZARD_COMMERCIAL_INFLECTION_ERA28_POLICY_ID =
  "era28-launch-wizard-commercial-inflection-v1" as const;

export const LAUNCH_WIZARD_COMMERCIAL_INFLECTION_ANCHOR = "#launch-wizard-commercial-inflection" as const;

export type LaunchWizardCommercialInflectionSlice = {
  policyId: typeof LAUNCH_WIZARD_COMMERCIAL_INFLECTION_ERA28_POLICY_ID;
  visible: boolean;
  milestoneLabel: string;
  scorecardLabel: string;
  topBlockerTitle: string;
  p0VaultMissingCount: number;
  integrationRegistryLiveCount: number;
  platformOpsHref: string;
  integrationHealthHref: string;
  validateCommand: string;
  integrityValidateCommand: string;
  tier2IntegrityValidateCommand: string;
  goIntegrityValidateCommand: string;
};

export function buildLaunchWizardCommercialInflectionSlice(
  uiSlice: CommercialInflectionReadinessUiSlice | null = buildCommercialInflectionReadinessUiSlice(
    evaluateCommercialInflectionReadiness(),
  ),
): LaunchWizardCommercialInflectionSlice | null {
  if (!uiSlice) return null;

  return {
    policyId: LAUNCH_WIZARD_COMMERCIAL_INFLECTION_ERA28_POLICY_ID,
    visible: true,
    milestoneLabel: formatCommercialInflectionMilestoneLabel(uiSlice.milestone),
    scorecardLabel: formatCommercialInflectionScorecardLabel(uiSlice),
    topBlockerTitle: uiSlice.topBlockerTitle,
    p0VaultMissingCount: uiSlice.p0VaultMissingCount,
    integrationRegistryLiveCount: uiSlice.integrationRegistryLiveCount,
    platformOpsHref: uiSlice.platformOpsHref,
    integrationHealthHref: uiSlice.integrationHealthHref,
    validateCommand: uiSlice.validateCommand,
    integrityValidateCommand: "npm run ops:validate-p0-staging-proof-integrity -- --json",
    tier2IntegrityValidateCommand:
      "npm run ops:validate-tier2-staging-golden-path-integrity -- --json",
    goIntegrityValidateCommand: "npm run ops:validate-pilot-gono-go-integrity -- --json",
  };
}

export function buildLaunchWizardCommercialInflectionSliceFromCommercialOps(
  commercialOps: CommercialPilotOpsStatusModel | null,
): LaunchWizardCommercialInflectionSlice | null {
  const vaultReport = commercialOps?.vaultReadiness.report ?? null;
  const p0Staging = commercialOps?.p0Staging.summary ?? null;
  const summary = evaluateCommercialInflectionReadiness(process.env, process.cwd(), {
    p0Staging,
    tier2Staging: commercialOps?.tier2Staging.summary ?? null,
    goNoGo: commercialOps?.goNoGo.summary ?? null,
    vaultReport,
  });
  const uiSlice = buildCommercialInflectionReadinessUiSlice(summary, {
    vaultReport,
    p0Staging,
  });
  return buildLaunchWizardCommercialInflectionSlice(uiSlice);
}

export function launchWizardCommercialInflectionHref(): string {
  return `/dashboard/launch-wizard${LAUNCH_WIZARD_COMMERCIAL_INFLECTION_ANCHOR}`;
}
