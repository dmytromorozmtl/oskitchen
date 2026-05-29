/**
 * Era25 P0 market proof honest closure capstone UI slice.
 */
import type { CompetitorFeatureGapMatrixSummary } from "@/lib/commercial/competitor-feature-gap-matrix-summary";
import { evaluateEra25P0MarketProofHonestClosureCapstoneIntegrity } from "@/lib/commercial/era25-p0-market-proof-honest-closure-capstone-integrity-era62";
import type { Era25BandAMarketProofExecutionSolePathIntegritySummary } from "@/lib/commercial/era25-band-a-market-proof-execution-sole-path-integrity-era61";
import {
  ERA25_P0_MARKET_PROOF_HONEST_CLOSURE_CAPSTONE_DOC,
  ERA25_P0_MARKET_PROOF_HONEST_CLOSURE_CAPSTONE_FOREVER_COMMANDS,
  ERA25_P0_MARKET_PROOF_HONEST_CLOSURE_CAPSTONE_GUARDRAILS,
  ERA25_P0_MARKET_PROOF_HONEST_CLOSURE_CAPSTONE_BACKLOG_ID,
  ERA25_P0_MARKET_PROOF_HONEST_CLOSURE_CAPSTONE_PLATFORM_ANCHOR,
  detectEra25P0MarketProofHonestClosureCapstoneStarted,
} from "@/lib/commercial/era25-p0-market-proof-honest-closure-capstone-phases-era62";
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
  buildEra25PostMarketProofSteadyOperationalWitnessEra25UiSlice,
  type Era25PostMarketProofSteadyOperationalWitnessEra25UiSlice,
} from "@/lib/commercial/era25-post-market-proof-steady-operational-witness-ui-era25";
import { LAUNCH_WIZARD_ERA25_P0_MARKET_PROOF_HONEST_CLOSURE_CAPSTONE_ANCHOR } from "@/lib/launch-wizard/launch-wizard-era25-p0-market-proof-honest-closure-capstone-era62";

export const ERA25_P0_MARKET_PROOF_HONEST_CLOSURE_CAPSTONE_ERA25_UI_POLICY_ID =
  "era25-p0-market-proof-honest-closure-capstone-ui-v1" as const;

export type Era25P0MarketProofHonestClosureCapstoneEra25UiSlice = {
  policyId: typeof ERA25_P0_MARKET_PROOF_HONEST_CLOSURE_CAPSTONE_ERA25_UI_POLICY_ID;
  visible: boolean;
  bandAExecutionSolePathLocked: boolean;
  closureCapstoneBlocked: boolean;
  closureCapstoneComplete: boolean;
  era25MarketProofGovernanceChainClosed: boolean;
  p0ProofStatus: string | null;
  p0ArtifactPresent: boolean;
  p0ArtifactProofPassed: boolean;
  frozenEnvMutationDetected: boolean;
  goDecision: string | null;
  convergenceDoc: typeof ERA25_P0_MARKET_PROOF_HONEST_CLOSURE_CAPSTONE_DOC;
  backlogId: typeof ERA25_P0_MARKET_PROOF_HONEST_CLOSURE_CAPSTONE_BACKLOG_ID;
  guardrails: typeof ERA25_P0_MARKET_PROOF_HONEST_CLOSURE_CAPSTONE_GUARDRAILS;
  foreverCommands: typeof ERA25_P0_MARKET_PROOF_HONEST_CLOSURE_CAPSTONE_FOREVER_COMMANDS;
  integrityValidateCommand: string;
  syncIntegrityBaselineCommand: string;
  validateSolePathIntegrityCommand: string;
  validateP0StagingProofIntegrityCommand: string;
  p0StagingProofSmokeCommand: string;
  governanceBundlesCertCommand: string;
  commercialPilotRunbookCertCommand: string;
  era25P0MarketProofHonestClosureCapstoneIntegrityPassed: boolean;
  era25BandAMarketProofExecutionSolePathIntegrityPassed: boolean;
  launchWizardHref: string;
  platformOpsHref: string;
  p0OpsVaultHref: string;
  improvementLoopHref: string;
  todayHref: string;
  headline: string;
  era25PostMarketProofSteadyOperationalWitness: Era25PostMarketProofSteadyOperationalWitnessEra25UiSlice | null;
};

export function buildEra25P0MarketProofHonestClosureCapstoneEra25UiSlice(input: {
  era25BandAMarketProofExecutionSolePathVisible: boolean;
  bandAExecutionSolePathLocked: boolean;
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
  solePathIntegritySummary?: Era25BandAMarketProofExecutionSolePathIntegritySummary | null;
}): Era25P0MarketProofHonestClosureCapstoneEra25UiSlice | null {
  const env = input.env ?? process.env;
  const closureStarted = detectEra25P0MarketProofHonestClosureCapstoneStarted(env);

  if (!input.era25BandAMarketProofExecutionSolePathVisible && !closureStarted) {
    return null;
  }

  const p0ProofStatus = input.p0ProofStatus ?? input.p0Staging?.p0ProofStatus ?? null;
  const tier2ProofStatus = input.tier2ProofStatus ?? input.tier2Summary?.tier2ProofStatus ?? null;

  const closureIntegrity = evaluateEra25P0MarketProofHonestClosureCapstoneIntegrity(process.cwd(), {
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
    solePathIntegrityOverride: input.solePathIntegritySummary ?? null,
  });

  const closureCapstoneComplete = closureIntegrity.era25P0MarketProofHonestClosureCapstoneComplete;
  const closureCapstoneBlocked = !closureCapstoneComplete;

  const era25PostMarketProofSteadyOperationalWitness =
    buildEra25PostMarketProofSteadyOperationalWitnessEra25UiSlice({
      era25P0MarketProofHonestClosureCapstoneVisible: true,
      era25MarketProofGovernanceChainClosed: closureIntegrity.era25MarketProofGovernanceChainClosed,
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
      closureCapstoneIntegritySummary: closureIntegrity,
    });

  const headline = closureCapstoneComplete
    ? "P0 market proof closure capstone complete · era25 governance chain closed for Band A"
    : input.bandAExecutionSolePathLocked
      ? closureIntegrity.frozenEnvMutationDetected
        ? "Closure capstone blocked · clear frozen era25 governance env keys"
        : !closureIntegrity.p0ArtifactProofPassed
          ? "Awaiting honest proof_passed on P0 artifact before closure capstone attest"
          : "Awaiting P0 market proof honest closure capstone after sole-path lock"
      : "Awaiting Band A sole-path lock before P0 market proof closure capstone";

  return {
    policyId: ERA25_P0_MARKET_PROOF_HONEST_CLOSURE_CAPSTONE_ERA25_UI_POLICY_ID,
    visible: true,
    bandAExecutionSolePathLocked: input.bandAExecutionSolePathLocked,
    closureCapstoneBlocked,
    closureCapstoneComplete,
    era25MarketProofGovernanceChainClosed: closureIntegrity.era25MarketProofGovernanceChainClosed,
    p0ProofStatus: closureIntegrity.p0ProofStatus,
    p0ArtifactPresent: closureIntegrity.p0ArtifactPresent,
    p0ArtifactProofPassed: closureIntegrity.p0ArtifactProofPassed,
    frozenEnvMutationDetected: closureIntegrity.frozenEnvMutationDetected,
    goDecision: closureIntegrity.goDecision,
    convergenceDoc: ERA25_P0_MARKET_PROOF_HONEST_CLOSURE_CAPSTONE_DOC,
    backlogId: ERA25_P0_MARKET_PROOF_HONEST_CLOSURE_CAPSTONE_BACKLOG_ID,
    guardrails: ERA25_P0_MARKET_PROOF_HONEST_CLOSURE_CAPSTONE_GUARDRAILS,
    foreverCommands: ERA25_P0_MARKET_PROOF_HONEST_CLOSURE_CAPSTONE_FOREVER_COMMANDS,
    integrityValidateCommand:
      "npm run ops:validate-era25-p0-market-proof-honest-closure-capstone-integrity -- --json",
    syncIntegrityBaselineCommand:
      "npm run ops:sync-era25-p0-market-proof-honest-closure-capstone-integrity-baseline -- --write",
    validateSolePathIntegrityCommand:
      "npm run ops:validate-era25-band-a-market-proof-execution-sole-path-integrity -- --json",
    validateP0StagingProofIntegrityCommand:
      "npm run ops:validate-p0-staging-proof-integrity -- --json",
    p0StagingProofSmokeCommand: "npm run smoke:p0-staging-proof-unblock",
    governanceBundlesCertCommand: "npm run test:ci:governance-bundles",
    commercialPilotRunbookCertCommand: "npm run test:ci:commercial-pilot-runbook:cert",
    era25P0MarketProofHonestClosureCapstoneIntegrityPassed: closureIntegrity.integrityPassed,
    era25BandAMarketProofExecutionSolePathIntegrityPassed:
      closureIntegrity.era25BandAMarketProofExecutionSolePathIntegrityPassed,
    launchWizardHref: `${LAUNCH_WIZARD_ROUTE}${LAUNCH_WIZARD_ERA25_P0_MARKET_PROOF_HONEST_CLOSURE_CAPSTONE_ANCHOR}`,
    platformOpsHref: `${SERIES_A_PLATFORM_OPS_ROUTE}${ERA25_P0_MARKET_PROOF_HONEST_CLOSURE_CAPSTONE_PLATFORM_ANCHOR}`,
    p0OpsVaultHref: `${SERIES_A_PLATFORM_OPS_ROUTE}#p0-ops-vault`,
    improvementLoopHref: `${SERIES_A_PLATFORM_OPS_ROUTE}#continuous-improvement-loop`,
    todayHref: "/dashboard/today",
    headline,
    era25PostMarketProofSteadyOperationalWitness,
  };
}

export function formatEra25P0MarketProofHonestClosureCapstoneEra25Label(
  slice: Era25P0MarketProofHonestClosureCapstoneEra25UiSlice,
): string {
  const status = slice.closureCapstoneBlocked ? "BLOCKED" : "CLOSED";
  const p0 = slice.p0ArtifactProofPassed ? "proof_passed" : slice.p0ProofStatus ?? "p0 n/a";
  return `era25 P0 closure capstone · ${status} · ${p0}`;
}
