/**
 * Era25 Band A market proof execution sole-path UI slice.
 */
import type { CompetitorFeatureGapMatrixSummary } from "@/lib/commercial/competitor-feature-gap-matrix-summary";
import { evaluateEra25BandAMarketProofExecutionSolePathIntegrity } from "@/lib/commercial/era25-band-a-market-proof-execution-sole-path-integrity-era61";
import type { Era25ConvergenceGovernanceTerminusFreezeIntegritySummary } from "@/lib/commercial/era25-convergence-governance-terminus-freeze-integrity-era60";
import {
  buildEra25P0MarketProofHonestClosureCapstoneEra25UiSlice,
  type Era25P0MarketProofHonestClosureCapstoneEra25UiSlice,
} from "@/lib/commercial/era25-p0-market-proof-honest-closure-capstone-ui-era25";
import {
  ERA25_BAND_A_MARKET_PROOF_EXECUTION_SOLE_PATH_DOC,
  ERA25_BAND_A_MARKET_PROOF_EXECUTION_SOLE_PATH_FOREVER_COMMANDS,
  ERA25_BAND_A_MARKET_PROOF_EXECUTION_SOLE_PATH_GUARDRAILS,
  ERA25_BAND_A_MARKET_PROOF_EXECUTION_SOLE_PATH_BACKLOG_ID,
  ERA25_BAND_A_MARKET_PROOF_EXECUTION_SOLE_PATH_PLATFORM_ANCHOR,
  detectEra25BandAMarketProofExecutionSolePathStarted,
} from "@/lib/commercial/era25-band-a-market-proof-execution-sole-path-phases-era61";
import type { InvestorNarrativeOnepagerSummary } from "@/lib/commercial/investor-narrative-onepager-summary";
import type { P0StagingProofUnblockSummary } from "@/lib/commercial/p0-staging-proof-unblock-summary";
import type { PilotCaseStudyDraftSummary } from "@/lib/commercial/pilot-case-study-draft-summary";
import type { PilotGoNoGoSummary } from "@/lib/commercial/pilot-gono-go-summary";
import type { PilotMetricsBaselineSummary } from "@/lib/commercial/pilot-metrics-baseline-summary";
import type { PilotRollbackDrillSummary } from "@/lib/commercial/pilot-rollback-drill-summary";
import type { Tier2StagingGoldenPathSummary } from "@/lib/commercial/tier2-staging-golden-path-summary";
import { SERIES_A_PLATFORM_OPS_ROUTE } from "@/lib/commercial/sustained-operational-excellence-phases-era21";
import { LAUNCH_WIZARD_ROUTE } from "@/lib/launch-wizard/launch-wizard-era19-policy";
import { LAUNCH_WIZARD_ERA25_BAND_A_MARKET_PROOF_EXECUTION_SOLE_PATH_ANCHOR } from "@/lib/launch-wizard/launch-wizard-era25-band-a-market-proof-execution-sole-path-era61";

export const ERA25_BAND_A_MARKET_PROOF_EXECUTION_SOLE_PATH_ERA25_UI_POLICY_ID =
  "era25-band-a-market-proof-execution-sole-path-ui-v1" as const;

export type Era25BandAMarketProofExecutionSolePathEra25UiSlice = {
  policyId: typeof ERA25_BAND_A_MARKET_PROOF_EXECUTION_SOLE_PATH_ERA25_UI_POLICY_ID;
  visible: boolean;
  terminusFreezeComplete: boolean;
  solePathBlocked: boolean;
  solePathComplete: boolean;
  bandAExecutionSolePathLocked: boolean;
  p0ProofStatus: string | null;
  p0ArtifactPresent: boolean;
  p0ProofReferencedInSolePath: boolean;
  frozenEnvMutationDetected: boolean;
  goDecision: string | null;
  convergenceDoc: typeof ERA25_BAND_A_MARKET_PROOF_EXECUTION_SOLE_PATH_DOC;
  backlogId: typeof ERA25_BAND_A_MARKET_PROOF_EXECUTION_SOLE_PATH_BACKLOG_ID;
  guardrails: typeof ERA25_BAND_A_MARKET_PROOF_EXECUTION_SOLE_PATH_GUARDRAILS;
  foreverCommands: typeof ERA25_BAND_A_MARKET_PROOF_EXECUTION_SOLE_PATH_FOREVER_COMMANDS;
  integrityValidateCommand: string;
  syncIntegrityBaselineCommand: string;
  validateTerminusFreezeIntegrityCommand: string;
  validateP0StagingProofIntegrityCommand: string;
  p0StagingProofSmokeCommand: string;
  governanceBundlesCertCommand: string;
  commercialPilotRunbookCertCommand: string;
  era25BandAMarketProofExecutionSolePathIntegrityPassed: boolean;
  era25ConvergenceGovernanceTerminusFreezeIntegrityPassed: boolean;
  launchWizardHref: string;
  platformOpsHref: string;
  p0OpsVaultHref: string;
  improvementLoopHref: string;
  todayHref: string;
  headline: string;
  era25P0MarketProofHonestClosureCapstone: Era25P0MarketProofHonestClosureCapstoneEra25UiSlice | null;
};

export function buildEra25BandAMarketProofExecutionSolePathEra25UiSlice(input: {
  era25ConvergenceGovernanceTerminusFreezeVisible: boolean;
  terminusFreezeComplete: boolean;
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
  terminusIntegritySummary?: Era25ConvergenceGovernanceTerminusFreezeIntegritySummary | null;
}): Era25BandAMarketProofExecutionSolePathEra25UiSlice | null {
  const env = input.env ?? process.env;
  const solePathStarted = detectEra25BandAMarketProofExecutionSolePathStarted(env);

  if (!input.era25ConvergenceGovernanceTerminusFreezeVisible && !solePathStarted) {
    return null;
  }

  const p0ProofStatus = input.p0ProofStatus ?? input.p0Staging?.p0ProofStatus ?? null;
  const tier2ProofStatus = input.tier2ProofStatus ?? input.tier2Summary?.tier2ProofStatus ?? null;

  const solePathIntegrity = evaluateEra25BandAMarketProofExecutionSolePathIntegrity(process.cwd(), {
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
    terminusIntegrityOverride: input.terminusIntegritySummary ?? null,
  });

  const solePathComplete = solePathIntegrity.era25BandAMarketProofExecutionSolePathComplete;
  const solePathBlocked = !solePathComplete;

  const era25P0MarketProofHonestClosureCapstone = buildEra25P0MarketProofHonestClosureCapstoneEra25UiSlice({
    era25BandAMarketProofExecutionSolePathVisible: true,
    bandAExecutionSolePathLocked: solePathIntegrity.bandAExecutionSolePathLocked,
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
    solePathIntegritySummary: solePathIntegrity,
  });

  const headline = solePathComplete
    ? `Band A sole-path locked · execute P0 ops vault until proof_passed (${solePathIntegrity.p0ProofStatus ?? "awaiting"})`
    : input.terminusFreezeComplete
      ? solePathIntegrity.frozenEnvMutationDetected
        ? "Sole-path blocked · clear frozen era25 governance env keys"
        : solePathIntegrity.p0ProofReferencedInSolePath &&
            solePathIntegrity.p0ProofStatus !== "proof_passed"
          ? "Sole-path blocked · P0 proof_passed referenced without honest artifact"
          : "Awaiting Band A market proof sole-path attestation after governance terminus freeze"
      : "Awaiting governance terminus freeze before Band A market proof sole-path";

  return {
    policyId: ERA25_BAND_A_MARKET_PROOF_EXECUTION_SOLE_PATH_ERA25_UI_POLICY_ID,
    visible: true,
    terminusFreezeComplete: input.terminusFreezeComplete,
    solePathBlocked,
    solePathComplete,
    bandAExecutionSolePathLocked: solePathIntegrity.bandAExecutionSolePathLocked,
    p0ProofStatus: solePathIntegrity.p0ProofStatus,
    p0ArtifactPresent: solePathIntegrity.p0ArtifactPresent,
    p0ProofReferencedInSolePath: solePathIntegrity.p0ProofReferencedInSolePath,
    frozenEnvMutationDetected: solePathIntegrity.frozenEnvMutationDetected,
    goDecision: solePathIntegrity.goDecision,
    convergenceDoc: ERA25_BAND_A_MARKET_PROOF_EXECUTION_SOLE_PATH_DOC,
    backlogId: ERA25_BAND_A_MARKET_PROOF_EXECUTION_SOLE_PATH_BACKLOG_ID,
    guardrails: ERA25_BAND_A_MARKET_PROOF_EXECUTION_SOLE_PATH_GUARDRAILS,
    foreverCommands: ERA25_BAND_A_MARKET_PROOF_EXECUTION_SOLE_PATH_FOREVER_COMMANDS,
    integrityValidateCommand:
      "npm run ops:validate-era25-band-a-market-proof-execution-sole-path-integrity -- --json",
    syncIntegrityBaselineCommand:
      "npm run ops:sync-era25-band-a-market-proof-execution-sole-path-integrity-baseline -- --write",
    validateTerminusFreezeIntegrityCommand:
      "npm run ops:validate-era25-convergence-governance-terminus-freeze-integrity -- --json",
    validateP0StagingProofIntegrityCommand:
      "npm run ops:validate-p0-staging-proof-integrity -- --json",
    p0StagingProofSmokeCommand: "npm run smoke:p0-staging-proof-unblock",
    governanceBundlesCertCommand: "npm run test:ci:governance-bundles",
    commercialPilotRunbookCertCommand: "npm run test:ci:commercial-pilot-runbook:cert",
    era25BandAMarketProofExecutionSolePathIntegrityPassed: solePathIntegrity.integrityPassed,
    era25ConvergenceGovernanceTerminusFreezeIntegrityPassed:
      solePathIntegrity.era25ConvergenceGovernanceTerminusFreezeIntegrityPassed,
    launchWizardHref: `${LAUNCH_WIZARD_ROUTE}${LAUNCH_WIZARD_ERA25_BAND_A_MARKET_PROOF_EXECUTION_SOLE_PATH_ANCHOR}`,
    platformOpsHref: `${SERIES_A_PLATFORM_OPS_ROUTE}${ERA25_BAND_A_MARKET_PROOF_EXECUTION_SOLE_PATH_PLATFORM_ANCHOR}`,
    p0OpsVaultHref: `${SERIES_A_PLATFORM_OPS_ROUTE}#p0-ops-vault`,
    improvementLoopHref: `${SERIES_A_PLATFORM_OPS_ROUTE}#continuous-improvement-loop`,
    todayHref: "/dashboard/today",
    headline,
    era25P0MarketProofHonestClosureCapstone,
  };
}

export function formatEra25BandAMarketProofExecutionSolePathEra25Label(
  slice: Era25BandAMarketProofExecutionSolePathEra25UiSlice,
): string {
  const status = slice.solePathBlocked ? "BLOCKED" : "SOLE-PATH";
  const locked = slice.bandAExecutionSolePathLocked ? "Band A locked" : "Band A open";
  return `era25 Band A market proof · ${status} · ${locked}`;
}
