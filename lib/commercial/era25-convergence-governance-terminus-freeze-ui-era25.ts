/**
 * Era25 convergence governance terminus freeze UI slice.
 */
import type { CompetitorFeatureGapMatrixSummary } from "@/lib/commercial/competitor-feature-gap-matrix-summary";
import { evaluateEra25ConvergenceGovernanceTerminusFreezeIntegrity } from "@/lib/commercial/era25-convergence-governance-terminus-freeze-integrity-era60";
import {
  ERA25_CONVERGENCE_GOVERNANCE_TERMINUS_FREEZE_DOC,
  ERA25_CONVERGENCE_GOVERNANCE_TERMINUS_FREEZE_FOREVER_COMMANDS,
  ERA25_CONVERGENCE_GOVERNANCE_TERMINUS_FREEZE_GUARDRAILS,
  ERA25_CONVERGENCE_GOVERNANCE_TERMINUS_FREEZE_BACKLOG_ID,
  ERA25_CONVERGENCE_GOVERNANCE_TERMINUS_FREEZE_PLATFORM_ANCHOR,
  detectEra25ConvergenceGovernanceTerminusFreezeStarted,
} from "@/lib/commercial/era25-convergence-governance-terminus-freeze-phases-era60";
import type { InvestorNarrativeOnepagerSummary } from "@/lib/commercial/investor-narrative-onepager-summary";
import type { P0StagingProofUnblockSummary } from "@/lib/commercial/p0-staging-proof-unblock-summary";
import type { PilotCaseStudyDraftSummary } from "@/lib/commercial/pilot-case-study-draft-summary";
import type { PilotGoNoGoSummary } from "@/lib/commercial/pilot-gono-go-summary";
import type { PilotMetricsBaselineSummary } from "@/lib/commercial/pilot-metrics-baseline-summary";
import type { PilotRollbackDrillSummary } from "@/lib/commercial/pilot-rollback-drill-summary";
import type { Tier2StagingGoldenPathSummary } from "@/lib/commercial/tier2-staging-golden-path-summary";
import { SERIES_A_PLATFORM_OPS_ROUTE } from "@/lib/commercial/sustained-operational-excellence-phases-era21";
import { LAUNCH_WIZARD_ROUTE } from "@/lib/launch-wizard/launch-wizard-era19-policy";
import {
  buildEra25BandAMarketProofExecutionSolePathEra25UiSlice,
  type Era25BandAMarketProofExecutionSolePathEra25UiSlice,
} from "@/lib/commercial/era25-band-a-market-proof-execution-sole-path-ui-era25";
import { LAUNCH_WIZARD_ERA25_CONVERGENCE_GOVERNANCE_TERMINUS_FREEZE_ANCHOR } from "@/lib/launch-wizard/launch-wizard-era25-convergence-governance-terminus-freeze-era60";

export const ERA25_CONVERGENCE_GOVERNANCE_TERMINUS_FREEZE_ERA25_UI_POLICY_ID =
  "era25-convergence-governance-terminus-freeze-ui-v1" as const;

export type Era25ConvergenceGovernanceTerminusFreezeEra25UiSlice = {
  policyId: typeof ERA25_CONVERGENCE_GOVERNANCE_TERMINUS_FREEZE_ERA25_UI_POLICY_ID;
  visible: boolean;
  trainCapstoneComplete: boolean;
  terminusFreezeBlocked: boolean;
  terminusFreezeComplete: boolean;
  era25ProductConvergenceSurfacesSuppressed: boolean;
  p0ProofStatus: string | null;
  p0ArtifactPresent: boolean;
  marketProofReferencedInTerminusFreeze: boolean;
  frozenEnvMutationDetected: boolean;
  goDecision: string | null;
  convergenceDoc: typeof ERA25_CONVERGENCE_GOVERNANCE_TERMINUS_FREEZE_DOC;
  backlogId: typeof ERA25_CONVERGENCE_GOVERNANCE_TERMINUS_FREEZE_BACKLOG_ID;
  guardrails: typeof ERA25_CONVERGENCE_GOVERNANCE_TERMINUS_FREEZE_GUARDRAILS;
  foreverCommands: typeof ERA25_CONVERGENCE_GOVERNANCE_TERMINUS_FREEZE_FOREVER_COMMANDS;
  integrityValidateCommand: string;
  syncIntegrityBaselineCommand: string;
  validateTrainCapstoneIntegrityCommand: string;
  validateP0StagingProofIntegrityCommand: string;
  p0StagingProofSmokeCommand: string;
  governanceBundlesCertCommand: string;
  commercialPilotRunbookCertCommand: string;
  era25ConvergenceGovernanceTerminusFreezeIntegrityPassed: boolean;
  era25CommercialPilotConvergenceTrainCapstoneIntegrityPassed: boolean;
  launchWizardHref: string;
  platformOpsHref: string;
  p0OpsVaultHref: string;
  improvementLoopHref: string;
  todayHref: string;
  headline: string;
  era25BandAMarketProofExecutionSolePath: Era25BandAMarketProofExecutionSolePathEra25UiSlice | null;
};

export function buildEra25ConvergenceGovernanceTerminusFreezeEra25UiSlice(input: {
  era25CommercialPilotConvergenceTrainCapstoneVisible: boolean;
  trainCapstoneComplete: boolean;
  env?: NodeJS.ProcessEnv;
  goNoGoSummary?: PilotGoNoGoSummary | null;
  p0Staging?: P0StagingProofUnblockSummary | null;
  tier2Summary?: Tier2StagingGoldenPathSummary | null;
  metricsBaseline?: PilotMetricsBaselineSummary | null;
  caseStudyDraft?: PilotCaseStudyDraftSummary | null;
  investorOnepager?: InvestorNarrativeOnepagerSummary | null;
  rollbackDrill?: PilotRollbackDrillSummary | null;
  competitorMatrix?: CompetitorFeatureGapMatrixSummary | null;
  p0ProofStatus?: string | null;
  tier2ProofStatus?: string | null;
}): Era25ConvergenceGovernanceTerminusFreezeEra25UiSlice | null {
  const env = input.env ?? process.env;
  const terminusFreezeStarted = detectEra25ConvergenceGovernanceTerminusFreezeStarted(env);

  if (!input.era25CommercialPilotConvergenceTrainCapstoneVisible && !terminusFreezeStarted) {
    return null;
  }

  const p0ProofStatus = input.p0ProofStatus ?? input.p0Staging?.p0ProofStatus ?? null;
  const tier2ProofStatus = input.tier2ProofStatus ?? input.tier2Summary?.tier2ProofStatus ?? null;

  const terminusIntegrity = evaluateEra25ConvergenceGovernanceTerminusFreezeIntegrity(
    process.cwd(),
    {
      env,
      goNoGoOverride: input.goNoGoSummary ?? null,
      p0StagingOverride: input.p0Staging ?? null,
      tier2SummaryOverride: input.tier2Summary ?? null,
      metricsBaselineOverride: input.metricsBaseline ?? null,
      caseStudyDraftOverride: input.caseStudyDraft ?? null,
      investorOnepagerOverride: input.investorOnepager ?? null,
      rollbackDrillOverride: input.rollbackDrill ?? null,
      competitorMatrixOverride: input.competitorMatrix ?? null,
      p0ProofStatusOverride: p0ProofStatus,
      tier2ProofStatusOverride: tier2ProofStatus,
    },
  );

  const terminusFreezeComplete = terminusIntegrity.era25ConvergenceGovernanceTerminusFreezeComplete;
  const terminusFreezeBlocked = !terminusFreezeComplete;

  const era25BandAMarketProofExecutionSolePath = buildEra25BandAMarketProofExecutionSolePathEra25UiSlice({
    era25ConvergenceGovernanceTerminusFreezeVisible: true,
    terminusFreezeComplete,
    env,
    goNoGoSummary: input.goNoGoSummary,
    p0Staging: input.p0Staging,
    tier2Summary: input.tier2Summary,
    metricsBaseline: input.metricsBaseline,
    caseStudyDraft: input.caseStudyDraft,
    investorOnepager: input.investorOnepager,
    rollbackDrill: input.rollbackDrill,
    competitorMatrix: input.competitorMatrix,
    p0ProofStatus,
    tier2ProofStatus,
    terminusIntegritySummary: terminusIntegrity,
  });

  const headline = terminusFreezeComplete
    ? `Governance terminus frozen · era25 convergence UI suppressed · P0 ${terminusIntegrity.p0ProofStatus ?? "Band A"}`
    : input.trainCapstoneComplete
      ? terminusIntegrity.frozenEnvMutationDetected
        ? "Terminus freeze blocked · clear frozen era25 governance env keys"
        : terminusIntegrity.marketProofReferencedInTerminusFreeze &&
            terminusIntegrity.p0ProofStatus !== "proof_passed"
          ? "Terminus freeze blocked · market proof referenced without honest P0 artifact"
          : "Awaiting convergence governance terminus freeze after train capstone"
      : "Awaiting commercial pilot convergence train capstone before governance terminus freeze";

  return {
    policyId: ERA25_CONVERGENCE_GOVERNANCE_TERMINUS_FREEZE_ERA25_UI_POLICY_ID,
    visible: true,
    trainCapstoneComplete: input.trainCapstoneComplete,
    terminusFreezeBlocked,
    terminusFreezeComplete,
    era25ProductConvergenceSurfacesSuppressed:
      terminusIntegrity.era25ProductConvergenceSurfacesSuppressed,
    p0ProofStatus: terminusIntegrity.p0ProofStatus,
    p0ArtifactPresent: terminusIntegrity.p0ArtifactPresent,
    marketProofReferencedInTerminusFreeze:
      terminusIntegrity.marketProofReferencedInTerminusFreeze,
    frozenEnvMutationDetected: terminusIntegrity.frozenEnvMutationDetected,
    goDecision: terminusIntegrity.goDecision,
    convergenceDoc: ERA25_CONVERGENCE_GOVERNANCE_TERMINUS_FREEZE_DOC,
    backlogId: ERA25_CONVERGENCE_GOVERNANCE_TERMINUS_FREEZE_BACKLOG_ID,
    guardrails: ERA25_CONVERGENCE_GOVERNANCE_TERMINUS_FREEZE_GUARDRAILS,
    foreverCommands: ERA25_CONVERGENCE_GOVERNANCE_TERMINUS_FREEZE_FOREVER_COMMANDS,
    integrityValidateCommand:
      "npm run ops:validate-era25-convergence-governance-terminus-freeze-integrity -- --json",
    syncIntegrityBaselineCommand:
      "npm run ops:sync-era25-convergence-governance-terminus-freeze-integrity-baseline -- --write",
    validateTrainCapstoneIntegrityCommand:
      "npm run ops:validate-era25-commercial-pilot-convergence-train-capstone-integrity -- --json",
    validateP0StagingProofIntegrityCommand:
      "npm run ops:validate-p0-staging-proof-integrity -- --json",
    p0StagingProofSmokeCommand: "npm run smoke:p0-staging-proof-unblock",
    governanceBundlesCertCommand: "npm run test:ci:governance-bundles",
    commercialPilotRunbookCertCommand: "npm run test:ci:commercial-pilot-runbook:cert",
    era25ConvergenceGovernanceTerminusFreezeIntegrityPassed: terminusIntegrity.integrityPassed,
    era25CommercialPilotConvergenceTrainCapstoneIntegrityPassed:
      terminusIntegrity.era25CommercialPilotConvergenceTrainCapstoneIntegrityPassed,
    launchWizardHref: `${LAUNCH_WIZARD_ROUTE}${LAUNCH_WIZARD_ERA25_CONVERGENCE_GOVERNANCE_TERMINUS_FREEZE_ANCHOR}`,
    platformOpsHref: `${SERIES_A_PLATFORM_OPS_ROUTE}${ERA25_CONVERGENCE_GOVERNANCE_TERMINUS_FREEZE_PLATFORM_ANCHOR}`,
    p0OpsVaultHref: `${SERIES_A_PLATFORM_OPS_ROUTE}#p0-ops-vault`,
    improvementLoopHref: `${SERIES_A_PLATFORM_OPS_ROUTE}#continuous-improvement-loop`,
    todayHref: "/dashboard/today",
    headline,
    era25BandAMarketProofExecutionSolePath,
  };
}

export function formatEra25ConvergenceGovernanceTerminusFreezeEra25Label(
  slice: Era25ConvergenceGovernanceTerminusFreezeEra25UiSlice,
): string {
  const status = slice.terminusFreezeBlocked ? "BLOCKED" : "FROZEN";
  const suppressed = slice.era25ProductConvergenceSurfacesSuppressed
    ? "convergence suppressed"
    : "convergence visible";
  return `era25 governance terminus freeze · ${status} · ${suppressed}`;
}
