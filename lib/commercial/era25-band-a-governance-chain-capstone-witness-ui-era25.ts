/**
 * Era25 Band A governance chain capstone witness UI slice.
 */
import type { CompetitorFeatureGapMatrixSummary } from "@/lib/commercial/competitor-feature-gap-matrix-summary";
import { evaluateEra25BandAGovernanceChainCapstoneWitnessIntegrity } from "@/lib/commercial/era25-band-a-governance-chain-capstone-witness-integrity-era66";
import type { Era25PostTerminalSealCommercialOpsPermanenceIntegritySummary } from "@/lib/commercial/era25-post-terminal-seal-commercial-ops-permanence-integrity-era65";
import {
  ERA25_BAND_A_GOVERNANCE_CHAIN_CAPSTONE_WITNESS_DOC,
  ERA25_BAND_A_GOVERNANCE_CHAIN_CAPSTONE_WITNESS_FOREVER_COMMANDS,
  ERA25_BAND_A_GOVERNANCE_CHAIN_CAPSTONE_WITNESS_GUARDRAILS,
  ERA25_BAND_A_GOVERNANCE_CHAIN_CAPSTONE_WITNESS_BACKLOG_ID,
  ERA25_BAND_A_GOVERNANCE_CHAIN_CAPSTONE_WITNESS_PLATFORM_ANCHOR,
  detectEra25BandAGovernanceChainCapstoneWitnessStarted,
} from "@/lib/commercial/era25-band-a-governance-chain-capstone-witness-phases-era66";
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
  buildEra25PostBandAGovernanceSteadyProductModeWitnessEra25UiSlice,
  type Era25PostBandAGovernanceSteadyProductModeWitnessEra25UiSlice,
} from "@/lib/commercial/era25-post-band-a-governance-steady-product-mode-witness-ui-era25";
import { LAUNCH_WIZARD_ERA25_BAND_A_GOVERNANCE_CHAIN_CAPSTONE_WITNESS_ANCHOR } from "@/lib/launch-wizard/launch-wizard-era25-band-a-governance-chain-capstone-witness-era66";

export const ERA25_BAND_A_GOVERNANCE_CHAIN_CAPSTONE_WITNESS_ERA25_UI_POLICY_ID =
  "era25-band-a-governance-chain-capstone-witness-ui-v1" as const;

export type Era25BandAGovernanceChainCapstoneWitnessEra25UiSlice = {
  policyId: typeof ERA25_BAND_A_GOVERNANCE_CHAIN_CAPSTONE_WITNESS_ERA25_UI_POLICY_ID;
  visible: boolean;
  era25MarketProofGovernanceChainClosed: boolean;
  capstoneWitnessBlocked: boolean;
  capstoneWitnessComplete: boolean;
  bandAGovernanceChainCapstoneWitnessActive: boolean;
  postTerminalSealCommercialOpsPermanenceActive: boolean;
  era25GovernanceTrainSealed: boolean;
  governanceReopenClaimed: boolean;
  continuousImprovementLoopIntegrityPassed: boolean;
  p0ProofStatus: string | null;
  p0ArtifactProofPassed: boolean;
  goDecision: string | null;
  convergenceDoc: typeof ERA25_BAND_A_GOVERNANCE_CHAIN_CAPSTONE_WITNESS_DOC;
  backlogId: typeof ERA25_BAND_A_GOVERNANCE_CHAIN_CAPSTONE_WITNESS_BACKLOG_ID;
  guardrails: typeof ERA25_BAND_A_GOVERNANCE_CHAIN_CAPSTONE_WITNESS_GUARDRAILS;
  foreverCommands: typeof ERA25_BAND_A_GOVERNANCE_CHAIN_CAPSTONE_WITNESS_FOREVER_COMMANDS;
  integrityValidateCommand: string;
  syncIntegrityBaselineCommand: string;
  validateCommercialOpsPermanenceIntegrityCommand: string;
  validateImprovementLoopIntegrityCommand: string;
  governanceBundlesCertCommand: string;
  commercialPilotRunbookCertCommand: string;
  era25BandAGovernanceChainCapstoneWitnessIntegrityPassed: boolean;
  era25PostTerminalSealCommercialOpsPermanenceIntegrityPassed: boolean;
  launchWizardHref: string;
  platformOpsHref: string;
  improvementLoopHref: string;
  commercialOpsHref: string;
  todayHref: string;
  headline: string;
  era25PostBandAGovernanceSteadyProductModeWitness: Era25PostBandAGovernanceSteadyProductModeWitnessEra25UiSlice | null;
};

export function buildEra25BandAGovernanceChainCapstoneWitnessEra25UiSlice(input: {
  era25PostTerminalSealCommercialOpsPermanenceVisible: boolean;
  era25MarketProofGovernanceChainClosed: boolean;
  postTerminalSealCommercialOpsPermanenceActive: boolean;
  era25GovernanceTrainSealed: boolean;
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
  permanenceIntegritySummary?: Era25PostTerminalSealCommercialOpsPermanenceIntegritySummary | null;
}): Era25BandAGovernanceChainCapstoneWitnessEra25UiSlice | null {
  const env = input.env ?? process.env;
  const capstoneWitnessStarted = detectEra25BandAGovernanceChainCapstoneWitnessStarted(env);

  if (!input.era25PostTerminalSealCommercialOpsPermanenceVisible && !capstoneWitnessStarted) {
    return null;
  }

  const p0ProofStatus = input.p0ProofStatus ?? input.p0Staging?.p0ProofStatus ?? null;
  const tier2ProofStatus = input.tier2ProofStatus ?? input.tier2Summary?.tier2ProofStatus ?? null;

  const capstoneWitnessIntegrity = evaluateEra25BandAGovernanceChainCapstoneWitnessIntegrity(
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
      permanenceIntegrityOverride: input.permanenceIntegritySummary ?? null,
    },
  );

  const capstoneWitnessComplete = capstoneWitnessIntegrity.era25BandAGovernanceChainCapstoneWitnessComplete;
  const capstoneWitnessBlocked = !capstoneWitnessComplete;

  const era25PostBandAGovernanceSteadyProductModeWitness =
    buildEra25PostBandAGovernanceSteadyProductModeWitnessEra25UiSlice({
      era25BandAGovernanceChainCapstoneWitnessVisible: true,
      era25MarketProofGovernanceChainClosed: input.era25MarketProofGovernanceChainClosed,
      bandAGovernanceChainCapstoneWitnessActive:
        capstoneWitnessIntegrity.bandAGovernanceChainCapstoneWitnessActive,
      era25GovernanceTrainSealed: capstoneWitnessIntegrity.era25GovernanceTrainSealed,
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
      capstoneIntegritySummary: capstoneWitnessIntegrity,
    });

  const headline = capstoneWitnessComplete
    ? "Band A governance chain capstone witness active · era61–AO stack closed · post-governance steady ops"
    : input.postTerminalSealCommercialOpsPermanenceActive
      ? capstoneWitnessIntegrity.governanceReopenClaimed
        ? "Capstone witness blocked · era25 governance reopen env detected — clear frozen keys"
        : !capstoneWitnessIntegrity.continuousImprovementLoopIntegrityPassed
          ? "Capstone witness blocked · improvement loop integrity FAIL"
          : "Awaiting Band A governance chain capstone witness after commercial ops permanence"
      : "Awaiting commercial ops permanence before Band A governance chain capstone witness";

  return {
    policyId: ERA25_BAND_A_GOVERNANCE_CHAIN_CAPSTONE_WITNESS_ERA25_UI_POLICY_ID,
    visible: true,
    era25MarketProofGovernanceChainClosed: input.era25MarketProofGovernanceChainClosed,
    capstoneWitnessBlocked,
    capstoneWitnessComplete,
    bandAGovernanceChainCapstoneWitnessActive:
      capstoneWitnessIntegrity.bandAGovernanceChainCapstoneWitnessActive,
    postTerminalSealCommercialOpsPermanenceActive:
      capstoneWitnessIntegrity.postTerminalSealCommercialOpsPermanenceActive,
    era25GovernanceTrainSealed: capstoneWitnessIntegrity.era25GovernanceTrainSealed,
    governanceReopenClaimed: capstoneWitnessIntegrity.governanceReopenClaimed,
    continuousImprovementLoopIntegrityPassed:
      capstoneWitnessIntegrity.continuousImprovementLoopIntegrityPassed,
    p0ProofStatus: capstoneWitnessIntegrity.p0ProofStatus,
    p0ArtifactProofPassed: capstoneWitnessIntegrity.p0ArtifactProofPassed,
    goDecision: capstoneWitnessIntegrity.goDecision,
    convergenceDoc: ERA25_BAND_A_GOVERNANCE_CHAIN_CAPSTONE_WITNESS_DOC,
    backlogId: ERA25_BAND_A_GOVERNANCE_CHAIN_CAPSTONE_WITNESS_BACKLOG_ID,
    guardrails: ERA25_BAND_A_GOVERNANCE_CHAIN_CAPSTONE_WITNESS_GUARDRAILS,
    foreverCommands: ERA25_BAND_A_GOVERNANCE_CHAIN_CAPSTONE_WITNESS_FOREVER_COMMANDS,
    integrityValidateCommand:
      "npm run ops:validate-era25-band-a-governance-chain-capstone-witness-integrity -- --json",
    syncIntegrityBaselineCommand:
      "npm run ops:sync-era25-band-a-governance-chain-capstone-witness-integrity-baseline -- --write",
    validateCommercialOpsPermanenceIntegrityCommand:
      "npm run ops:validate-era25-post-terminal-seal-commercial-ops-permanence-integrity -- --json",
    validateImprovementLoopIntegrityCommand:
      "npm run ops:validate-continuous-improvement-loop-integrity -- --json",
    governanceBundlesCertCommand: "npm run test:ci:governance-bundles",
    commercialPilotRunbookCertCommand: "npm run test:ci:commercial-pilot-runbook:cert",
    era25BandAGovernanceChainCapstoneWitnessIntegrityPassed: capstoneWitnessIntegrity.integrityPassed,
    era25PostTerminalSealCommercialOpsPermanenceIntegrityPassed:
      capstoneWitnessIntegrity.era25PostTerminalSealCommercialOpsPermanenceIntegrityPassed,
    launchWizardHref: `${LAUNCH_WIZARD_ROUTE}${LAUNCH_WIZARD_ERA25_BAND_A_GOVERNANCE_CHAIN_CAPSTONE_WITNESS_ANCHOR}`,
    platformOpsHref: `${SERIES_A_PLATFORM_OPS_ROUTE}${ERA25_BAND_A_GOVERNANCE_CHAIN_CAPSTONE_WITNESS_PLATFORM_ANCHOR}`,
    improvementLoopHref: `${SERIES_A_PLATFORM_OPS_ROUTE}#continuous-improvement-loop`,
    commercialOpsHref: `${SERIES_A_PLATFORM_OPS_ROUTE}#commercial-pilot-ops`,
    todayHref: "/dashboard/today",
    headline,
    era25PostBandAGovernanceSteadyProductModeWitness,
  };
}

export function formatEra25BandAGovernanceChainCapstoneWitnessEra25Label(
  slice: Era25BandAGovernanceChainCapstoneWitnessEra25UiSlice,
): string {
  const status = slice.capstoneWitnessBlocked ? "BLOCKED" : "CAPSTONE";
  const chain = slice.bandAGovernanceChainCapstoneWitnessActive ? "Band A closed" : "pending";
  return `era25 Band A capstone witness · ${status} · ${chain}`;
}
