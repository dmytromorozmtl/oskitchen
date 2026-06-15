/**
 * Era25 post-market-proof steady operational witness UI slice.
 */
import type { CompetitorFeatureGapMatrixSummary } from "@/lib/commercial/competitor-feature-gap-matrix-summary";
import { evaluateEra25PostMarketProofSteadyOperationalWitnessIntegrity } from "@/lib/commercial/era25-post-market-proof-steady-operational-witness-integrity-era63";
import type { Era25P0MarketProofHonestClosureCapstoneIntegritySummary } from "@/lib/commercial/era25-p0-market-proof-honest-closure-capstone-integrity-era62";
import {
  ERA25_POST_MARKET_PROOF_STEADY_OPERATIONAL_WITNESS_DOC,
  ERA25_POST_MARKET_PROOF_STEADY_OPERATIONAL_WITNESS_FOREVER_COMMANDS,
  ERA25_POST_MARKET_PROOF_STEADY_OPERATIONAL_WITNESS_GUARDRAILS,
  ERA25_POST_MARKET_PROOF_STEADY_OPERATIONAL_WITNESS_BACKLOG_ID,
  ERA25_POST_MARKET_PROOF_STEADY_OPERATIONAL_WITNESS_PLATFORM_ANCHOR,
  detectEra25PostMarketProofSteadyOperationalWitnessStarted,
} from "@/lib/commercial/era25-post-market-proof-steady-operational-witness-phases-era63";
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
  buildEra25GovernanceTrainTerminalSealEra25UiSlice,
  type Era25GovernanceTrainTerminalSealEra25UiSlice,
} from "@/lib/commercial/era25-governance-train-terminal-seal-ui-era25";
import { LAUNCH_WIZARD_ERA25_POST_MARKET_PROOF_STEADY_OPERATIONAL_WITNESS_ANCHOR } from "@/lib/launch-wizard/launch-wizard-era25-post-market-proof-steady-operational-witness-era63";

export const ERA25_POST_MARKET_PROOF_STEADY_OPERATIONAL_WITNESS_ERA25_UI_POLICY_ID =
  "era25-post-market-proof-steady-operational-witness-ui-v1" as const;

export type Era25PostMarketProofSteadyOperationalWitnessEra25UiSlice = {
  policyId: typeof ERA25_POST_MARKET_PROOF_STEADY_OPERATIONAL_WITNESS_ERA25_UI_POLICY_ID;
  visible: boolean;
  era25MarketProofGovernanceChainClosed: boolean;
  witnessBlocked: boolean;
  witnessComplete: boolean;
  postMarketProofSteadyOpsWitnessActive: boolean;
  governanceReopenClaimed: boolean;
  continuousImprovementLoopIntegrityPassed: boolean;
  p0ProofStatus: string | null;
  p0ArtifactProofPassed: boolean;
  goDecision: string | null;
  convergenceDoc: typeof ERA25_POST_MARKET_PROOF_STEADY_OPERATIONAL_WITNESS_DOC;
  backlogId: typeof ERA25_POST_MARKET_PROOF_STEADY_OPERATIONAL_WITNESS_BACKLOG_ID;
  guardrails: typeof ERA25_POST_MARKET_PROOF_STEADY_OPERATIONAL_WITNESS_GUARDRAILS;
  foreverCommands: typeof ERA25_POST_MARKET_PROOF_STEADY_OPERATIONAL_WITNESS_FOREVER_COMMANDS;
  integrityValidateCommand: string;
  syncIntegrityBaselineCommand: string;
  validateClosureCapstoneIntegrityCommand: string;
  validateImprovementLoopIntegrityCommand: string;
  governanceBundlesCertCommand: string;
  commercialPilotRunbookCertCommand: string;
  era25PostMarketProofSteadyOperationalWitnessIntegrityPassed: boolean;
  era25P0MarketProofHonestClosureCapstoneIntegrityPassed: boolean;
  launchWizardHref: string;
  platformOpsHref: string;
  improvementLoopHref: string;
  todayHref: string;
  headline: string;
  era25GovernanceTrainTerminalSeal: Era25GovernanceTrainTerminalSealEra25UiSlice | null;
};

export function buildEra25PostMarketProofSteadyOperationalWitnessEra25UiSlice(input: {
  era25P0MarketProofHonestClosureCapstoneVisible: boolean;
  era25MarketProofGovernanceChainClosed: boolean;
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
  closureCapstoneIntegritySummary?: Era25P0MarketProofHonestClosureCapstoneIntegritySummary | null;
}): Era25PostMarketProofSteadyOperationalWitnessEra25UiSlice | null {
  const env = input.env ?? process.env;
  const witnessStarted = detectEra25PostMarketProofSteadyOperationalWitnessStarted(env);

  if (!input.era25P0MarketProofHonestClosureCapstoneVisible && !witnessStarted) {
    return null;
  }

  const p0ProofStatus = input.p0ProofStatus ?? input.p0Staging?.p0ProofStatus ?? null;
  const tier2ProofStatus = input.tier2ProofStatus ?? input.tier2Summary?.tier2ProofStatus ?? null;

  const witnessIntegrity = evaluateEra25PostMarketProofSteadyOperationalWitnessIntegrity(
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
      closureCapstoneIntegrityOverride: input.closureCapstoneIntegritySummary ?? null,
    },
  );

  const witnessComplete = witnessIntegrity.era25PostMarketProofSteadyOperationalWitnessComplete;
  const witnessBlocked = !witnessComplete;

  const era25GovernanceTrainTerminalSeal = buildEra25GovernanceTrainTerminalSealEra25UiSlice({
    era25PostMarketProofSteadyOperationalWitnessVisible: true,
    era25MarketProofGovernanceChainClosed: input.era25MarketProofGovernanceChainClosed,
    postMarketProofSteadyOpsWitnessActive: witnessIntegrity.postMarketProofSteadyOpsWitnessActive,
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
    witnessIntegritySummary: witnessIntegrity,
  });

  const headline = witnessComplete
    ? "Post-market-proof steady ops witness active · era25 governance frozen · improvement loop only"
    : input.era25MarketProofGovernanceChainClosed
      ? witnessIntegrity.governanceReopenClaimed
        ? "Witness blocked · era25 governance reopen env detected — clear frozen keys"
        : !witnessIntegrity.continuousImprovementLoopIntegrityPassed
          ? "Witness blocked · improvement loop integrity FAIL"
          : "Awaiting post-market-proof steady operational witness after P0 closure capstone"
      : "Awaiting P0 market proof closure capstone before steady operational witness";

  return {
    policyId: ERA25_POST_MARKET_PROOF_STEADY_OPERATIONAL_WITNESS_ERA25_UI_POLICY_ID,
    visible: true,
    era25MarketProofGovernanceChainClosed: input.era25MarketProofGovernanceChainClosed,
    witnessBlocked,
    witnessComplete,
    postMarketProofSteadyOpsWitnessActive: witnessIntegrity.postMarketProofSteadyOpsWitnessActive,
    governanceReopenClaimed: witnessIntegrity.governanceReopenClaimed,
    continuousImprovementLoopIntegrityPassed:
      witnessIntegrity.continuousImprovementLoopIntegrityPassed,
    p0ProofStatus: witnessIntegrity.p0ProofStatus,
    p0ArtifactProofPassed: witnessIntegrity.p0ArtifactProofPassed,
    goDecision: witnessIntegrity.goDecision,
    convergenceDoc: ERA25_POST_MARKET_PROOF_STEADY_OPERATIONAL_WITNESS_DOC,
    backlogId: ERA25_POST_MARKET_PROOF_STEADY_OPERATIONAL_WITNESS_BACKLOG_ID,
    guardrails: ERA25_POST_MARKET_PROOF_STEADY_OPERATIONAL_WITNESS_GUARDRAILS,
    foreverCommands: ERA25_POST_MARKET_PROOF_STEADY_OPERATIONAL_WITNESS_FOREVER_COMMANDS,
    integrityValidateCommand:
      "npm run ops:validate-era25-post-market-proof-steady-operational-witness-integrity -- --json",
    syncIntegrityBaselineCommand:
      "npm run ops:sync-era25-post-market-proof-steady-operational-witness-integrity-baseline -- --write",
    validateClosureCapstoneIntegrityCommand:
      "npm run ops:validate-era25-p0-market-proof-honest-closure-capstone-integrity -- --json",
    validateImprovementLoopIntegrityCommand:
      "npm run ops:validate-continuous-improvement-loop-integrity -- --json",
    governanceBundlesCertCommand: "npm run test:ci:governance-bundles",
    commercialPilotRunbookCertCommand: "npm run test:ci:commercial-pilot-runbook:cert",
    era25PostMarketProofSteadyOperationalWitnessIntegrityPassed: witnessIntegrity.integrityPassed,
    era25P0MarketProofHonestClosureCapstoneIntegrityPassed:
      witnessIntegrity.era25P0MarketProofHonestClosureCapstoneIntegrityPassed,
    launchWizardHref: `${LAUNCH_WIZARD_ROUTE}${LAUNCH_WIZARD_ERA25_POST_MARKET_PROOF_STEADY_OPERATIONAL_WITNESS_ANCHOR}`,
    platformOpsHref: `${SERIES_A_PLATFORM_OPS_ROUTE}${ERA25_POST_MARKET_PROOF_STEADY_OPERATIONAL_WITNESS_PLATFORM_ANCHOR}`,
    improvementLoopHref: `${SERIES_A_PLATFORM_OPS_ROUTE}#continuous-improvement-loop`,
    todayHref: "/dashboard/today",
    headline,
    era25GovernanceTrainTerminalSeal,
  };
}

export function formatEra25PostMarketProofSteadyOperationalWitnessEra25Label(
  slice: Era25PostMarketProofSteadyOperationalWitnessEra25UiSlice,
): string {
  const status = slice.witnessBlocked ? "BLOCKED" : "WITNESS";
  const ops = slice.postMarketProofSteadyOpsWitnessActive ? "steady ops" : "pending";
  return `era25 post-market witness · ${status} · ${ops}`;
}
