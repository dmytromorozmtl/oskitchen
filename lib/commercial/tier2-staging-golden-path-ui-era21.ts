/**
 * Tier 2 golden path UI slice — Integration Health, Owner Briefing, Launch Wizard, Platform ops.
 */
import {
  resolveTier2GoldenPathMilestoneFromPhaseStatuses,
  type Tier2GoldenPathMilestone,
} from "@/lib/commercial/tier2-golden-path-post-p0-orchestrator-era21";
import { TIER2_STAGING_GOLDEN_PATH_ERA20_PLAYBOOK_DOC } from "@/lib/commercial/tier2-staging-golden-path-era20-policy";
import type { Tier2StagingGoldenPathSummary } from "@/lib/commercial/tier2-staging-golden-path-summary";
import {
  buildTier2GoldenPathPhaseStatuses,
  formatTier2GoldenPathPhaseBlockerDetail,
  resolveNextIncompleteTier2GoldenPathPhase,
  type Tier2GoldenPathPhaseStatus,
} from "@/lib/commercial/tier2-staging-golden-path-phases-era21";
import { LAUNCH_WIZARD_ROUTE } from "@/lib/launch-wizard/launch-wizard-era19-policy";
import { LAUNCH_WIZARD_COMMERCIAL_BLOCKERS_ANCHOR } from "@/lib/launch-wizard/launch-wizard-commercial-setup-era19-policy";

export const TIER2_GOLDEN_PATH_UI_ERA21_POLICY_ID = "era21-tier2-golden-path-ui-v1" as const;

export const TIER2_GOLDEN_PATH_INTEGRATION_HEALTH_ANCHOR =
  "#integration-health-tier2-golden-path" as const;

export type Tier2GoldenPathUiSlice = {
  policyId: typeof TIER2_GOLDEN_PATH_UI_ERA21_POLICY_ID;
  visible: boolean;
  blocked: boolean;
  tier2ProofStatus: string;
  overall: string | null;
  p0ProofStatus: string | null;
  phases: readonly Tier2GoldenPathPhaseStatus[];
  completedPhaseCount: number;
  missingManualEnvVars: readonly string[];
  playbookDoc: typeof TIER2_STAGING_GOLDEN_PATH_ERA20_PLAYBOOK_DOC;
  validateCommand: string;
  integrityValidateCommand: string;
  syncIntegrityBaselineCommand: string;
  exportTemplateCommand: string;
  orchestratorCommand: string;
  syncProgressReportCommand: string;
  postP0OrchestratorCommand: string;
  tier2ExecutionCommand: string;
  tier2ExecutionArtifact: string;
  exportReadinessChecklistCommand: string;
  validateP0GateCommand: string;
  tier2Milestone: Tier2GoldenPathMilestone;
  integrationHealthHref: string;
  launchWizardHref: string;
  nextPhase: Tier2GoldenPathPhaseStatus | null;
  nextPhaseDetail: string | null;
};

export function buildTier2GoldenPathUiSlice(input: {
  p0ProofStatus: string | null;
  tier2Summary: Tier2StagingGoldenPathSummary | null;
}): Tier2GoldenPathUiSlice | null {
  if (input.p0ProofStatus !== "proof_passed") return null;

  const tier2ProofStatus =
    input.tier2Summary?.tier2ProofStatus ?? "awaiting_p0_proof_passed";
  const blocked = tier2ProofStatus !== "proof_passed";
  if (!blocked) return null;

  const phases = buildTier2GoldenPathPhaseStatuses({
    tier2Summary: input.tier2Summary,
  });
  const completedPhaseCount = phases.filter((p) => p.complete).length;
  const nextPhase = resolveNextIncompleteTier2GoldenPathPhase(phases);
  const nextPhaseDetail = nextPhase ? formatTier2GoldenPathPhaseBlockerDetail(nextPhase) : null;
  const tier2Milestone = resolveTier2GoldenPathMilestoneFromPhaseStatuses(phases, {
    p0GatePassed: true,
    tier2GatePassed: false,
  });

  return {
    policyId: TIER2_GOLDEN_PATH_UI_ERA21_POLICY_ID,
    visible: true,
    blocked,
    tier2ProofStatus,
    overall: input.tier2Summary?.overall ?? null,
    p0ProofStatus: input.p0ProofStatus,
    phases,
    completedPhaseCount,
    missingManualEnvVars: input.tier2Summary?.missingManualEnvVars ?? [],
    playbookDoc: TIER2_STAGING_GOLDEN_PATH_ERA20_PLAYBOOK_DOC,
    validateCommand: "npm run ops:validate-tier2-golden-path-env",
    integrityValidateCommand:
      "npm run ops:validate-tier2-staging-golden-path-integrity -- --json",
    syncIntegrityBaselineCommand:
      "npm run ops:sync-tier2-staging-golden-path-integrity-baseline -- --write",
    exportTemplateCommand: "npm run ops:export-tier2-golden-path-env-template -- --write",
    orchestratorCommand: "npm run smoke:tier2-staging-golden-path",
    syncProgressReportCommand: "npm run ops:sync-tier2-golden-path-progress-report -- --write",
    postP0OrchestratorCommand: "npm run ops:run-tier2-golden-path-post-p0-orchestrator -- --write",
    tier2ExecutionCommand: "npm run ops:run-tier2-staging-proof-execution -- --write",
    tier2ExecutionArtifact: "artifacts/tier2-staging-proof-execution-summary.json",
    exportReadinessChecklistCommand:
      "npm run ops:export-tier2-golden-path-readiness-checklist -- --write",
    validateP0GateCommand: "npm run ops:validate-p0-vault-env -- --json",
    tier2Milestone,
    integrationHealthHref: `/dashboard/integration-health${TIER2_GOLDEN_PATH_INTEGRATION_HEALTH_ANCHOR}`,
    launchWizardHref: `${LAUNCH_WIZARD_ROUTE}${LAUNCH_WIZARD_COMMERCIAL_BLOCKERS_ANCHOR}`,
    nextPhase,
    nextPhaseDetail,
  };
}

export function formatTier2GoldenPathProgressLabel(slice: Tier2GoldenPathUiSlice): string {
  return `Tier 2 ${slice.completedPhaseCount}/${slice.phases.length} phases · ${slice.tier2Milestone.replaceAll("_", " ")} · ${slice.tier2ProofStatus.replaceAll("_", " ")}`;
}
