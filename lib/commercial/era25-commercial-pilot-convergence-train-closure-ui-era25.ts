/**
 * era25 Commercial pilot convergence train closure UI slice.
 */
import type { CompetitorFeatureGapMatrixSummary } from "@/lib/commercial/competitor-feature-gap-matrix-summary";
import { evaluateEra25CommercialPilotConvergenceTrainClosureIntegrity } from "@/lib/commercial/era25-commercial-pilot-convergence-train-closure-integrity-era55";
import { ERA25_COMMERCIAL_PILOT_CONVERGENCE_TRAIN_INTEGRITY_BASELINES } from "@/lib/commercial/era25-commercial-pilot-convergence-train-closure-integrity-era55-registry";
import {
  ERA25_COMMERCIAL_PILOT_CONVERGENCE_TRAIN_CLOSURE_DOC,
  ERA25_COMMERCIAL_PILOT_CONVERGENCE_TRAIN_CLOSURE_FOREVER_COMMANDS,
  ERA25_COMMERCIAL_PILOT_CONVERGENCE_TRAIN_CLOSURE_GUARDRAILS,
  ERA25_COMMERCIAL_PILOT_CONVERGENCE_TRAIN_CLOSURE_BACKLOG_ID,
  ERA25_COMMERCIAL_PILOT_CONVERGENCE_TRAIN_CLOSURE_PLATFORM_ANCHOR,
  detectEra25CommercialPilotConvergenceTrainClosureStarted,
} from "@/lib/commercial/era25-commercial-pilot-convergence-train-closure-phases-era25";
import type { PureOperationalModeTerminusEra25Milestone } from "@/lib/commercial/pure-operational-mode-terminus-post-sustained-ops-convergence-orchestrator-era25";
import type { InvestorNarrativeOnepagerSummary } from "@/lib/commercial/investor-narrative-onepager-summary";
import type { P0StagingProofUnblockSummary } from "@/lib/commercial/p0-staging-proof-unblock-summary";
import type { PilotCaseStudyDraftSummary } from "@/lib/commercial/pilot-case-study-draft-summary";
import type { PilotGoNoGoSummary } from "@/lib/commercial/pilot-gono-go-summary";
import type { PilotMetricsBaselineSummary } from "@/lib/commercial/pilot-metrics-baseline-summary";
import type { PilotRollbackDrillSummary } from "@/lib/commercial/pilot-rollback-drill-summary";
import type { Tier2StagingGoldenPathSummary } from "@/lib/commercial/tier2-staging-golden-path-summary";
import { SERIES_A_PLATFORM_OPS_ROUTE } from "@/lib/commercial/sustained-operational-excellence-phases-era21";
import { LAUNCH_WIZARD_ROUTE } from "@/lib/launch-wizard/launch-wizard-era19-policy";
import { LAUNCH_WIZARD_ERA25_COMMERCIAL_PILOT_CONVERGENCE_TRAIN_CLOSURE_ANCHOR } from "@/lib/launch-wizard/launch-wizard-era25-commercial-pilot-convergence-train-closure-era55";
import {
  buildSustainedProductEvolutionReentrantEra25UiSlice,
  type SustainedProductEvolutionReentrantEra25UiSlice,
} from "@/lib/commercial/sustained-product-evolution-re-entrant-ui-era25";

export const ERA25_COMMERCIAL_PILOT_CONVERGENCE_TRAIN_CLOSURE_ERA25_UI_POLICY_ID =
  "era25-commercial-pilot-convergence-train-closure-ui-v1" as const;

export type Era25CommercialPilotConvergenceTrainClosureEra25UiSlice = {
  policyId: typeof ERA25_COMMERCIAL_PILOT_CONVERGENCE_TRAIN_CLOSURE_ERA25_UI_POLICY_ID;
  visible: boolean;
  pureOperationalModeTerminusEra25Milestone: PureOperationalModeTerminusEra25Milestone;
  pureOperationalModeEra25Active: boolean;
  trainClosureBlocked: boolean;
  trainClosureComplete: boolean;
  convergenceIntegrityBaselinesHonestCount: number;
  convergenceIntegrityBaselinesTotalCount: number;
  goDecision: string | null;
  convergenceDoc: typeof ERA25_COMMERCIAL_PILOT_CONVERGENCE_TRAIN_CLOSURE_DOC;
  backlogId: typeof ERA25_COMMERCIAL_PILOT_CONVERGENCE_TRAIN_CLOSURE_BACKLOG_ID;
  guardrails: typeof ERA25_COMMERCIAL_PILOT_CONVERGENCE_TRAIN_CLOSURE_GUARDRAILS;
  foreverCommands: typeof ERA25_COMMERCIAL_PILOT_CONVERGENCE_TRAIN_CLOSURE_FOREVER_COMMANDS;
  integrityValidateCommand: string;
  syncIntegrityBaselineCommand: string;
  validatePureOpsTerminusIntegrityCommand: string;
  commercialPilotRunbookCertCommand: string;
  era25CommercialPilotConvergenceTrainClosureIntegrityPassed: boolean;
  pureOperationalModeTerminusConvergenceIntegrityPassed: boolean;
  launchWizardHref: string;
  platformOpsHref: string;
  todayHref: string;
  headline: string;
  sustainedProductEvolutionReentrant: SustainedProductEvolutionReentrantEra25UiSlice | null;
};

export function buildEra25CommercialPilotConvergenceTrainClosureEra25UiSlice(input: {
  pureOperationalModeTerminusVisible: boolean;
  pureOperationalModeEra25Active: boolean;
  pureOperationalModeTerminusEra25Milestone: PureOperationalModeTerminusEra25Milestone;
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
}): Era25CommercialPilotConvergenceTrainClosureEra25UiSlice | null {
  const env = input.env ?? process.env;
  const trainClosureStarted = detectEra25CommercialPilotConvergenceTrainClosureStarted(env);

  if (!input.pureOperationalModeTerminusVisible && !trainClosureStarted) return null;

  const p0ProofStatus = input.p0ProofStatus ?? input.p0Staging?.p0ProofStatus ?? null;
  const tier2ProofStatus = input.tier2ProofStatus ?? input.tier2Summary?.tier2ProofStatus ?? null;

  const trainClosureIntegrity = evaluateEra25CommercialPilotConvergenceTrainClosureIntegrity(
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

  const trainClosureComplete = trainClosureIntegrity.era25CommercialPilotConvergenceTrainClosureComplete;
  const trainClosureBlocked = !trainClosureComplete;
  const sustainedProductEvolutionReentrant = buildSustainedProductEvolutionReentrantEra25UiSlice({
    commercialPilotConvergenceTrainClosureVisible: true,
    trainClosureComplete,
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
  });

  const headline = trainClosureComplete
    ? `Era25 convergence train closed · ${trainClosureIntegrity.convergenceIntegrityBaselinesHonestCount}/${trainClosureIntegrity.convergenceIntegrityBaselinesTotalCount} baselines honest · GO ${trainClosureIntegrity.goDecision ?? "GO"}`
    : input.pureOperationalModeEra25Active
      ? `Awaiting train closure rollup · ${trainClosureIntegrity.convergenceIntegrityBaselinesHonestCount}/${ERA25_COMMERCIAL_PILOT_CONVERGENCE_TRAIN_INTEGRITY_BASELINES.length} baselines on disk`
      : "Awaiting pure operational mode terminus before train closure";

  return {
    policyId: ERA25_COMMERCIAL_PILOT_CONVERGENCE_TRAIN_CLOSURE_ERA25_UI_POLICY_ID,
    visible: true,
    pureOperationalModeTerminusEra25Milestone: input.pureOperationalModeTerminusEra25Milestone,
    pureOperationalModeEra25Active: input.pureOperationalModeEra25Active,
    trainClosureBlocked,
    trainClosureComplete,
    convergenceIntegrityBaselinesHonestCount:
      trainClosureIntegrity.convergenceIntegrityBaselinesHonestCount,
    convergenceIntegrityBaselinesTotalCount:
      trainClosureIntegrity.convergenceIntegrityBaselinesTotalCount,
    goDecision: trainClosureIntegrity.goDecision,
    convergenceDoc: ERA25_COMMERCIAL_PILOT_CONVERGENCE_TRAIN_CLOSURE_DOC,
    backlogId: ERA25_COMMERCIAL_PILOT_CONVERGENCE_TRAIN_CLOSURE_BACKLOG_ID,
    guardrails: ERA25_COMMERCIAL_PILOT_CONVERGENCE_TRAIN_CLOSURE_GUARDRAILS,
    foreverCommands: ERA25_COMMERCIAL_PILOT_CONVERGENCE_TRAIN_CLOSURE_FOREVER_COMMANDS,
    integrityValidateCommand:
      "npm run ops:validate-era25-commercial-pilot-convergence-train-closure-integrity -- --json",
    syncIntegrityBaselineCommand:
      "npm run ops:sync-era25-commercial-pilot-convergence-train-closure-integrity-baseline -- --write",
    validatePureOpsTerminusIntegrityCommand:
      "npm run ops:validate-pure-operational-mode-terminus-convergence-integrity -- --json",
    commercialPilotRunbookCertCommand: "npm run test:ci:commercial-pilot-runbook:cert",
    era25CommercialPilotConvergenceTrainClosureIntegrityPassed: trainClosureIntegrity.integrityPassed,
    pureOperationalModeTerminusConvergenceIntegrityPassed:
      trainClosureIntegrity.pureOperationalModeTerminusConvergenceIntegrityPassed,
    launchWizardHref: `${LAUNCH_WIZARD_ROUTE}${LAUNCH_WIZARD_ERA25_COMMERCIAL_PILOT_CONVERGENCE_TRAIN_CLOSURE_ANCHOR}`,
    platformOpsHref: `${SERIES_A_PLATFORM_OPS_ROUTE}${ERA25_COMMERCIAL_PILOT_CONVERGENCE_TRAIN_CLOSURE_PLATFORM_ANCHOR}`,
    todayHref: "/dashboard/today",
    headline,
    sustainedProductEvolutionReentrant,
  };
}

export function formatEra25CommercialPilotConvergenceTrainClosureEra25Label(
  slice: Era25CommercialPilotConvergenceTrainClosureEra25UiSlice,
): string {
  const status = slice.trainClosureBlocked ? "BLOCKED" : "CLOSED";
  const baselines = `${slice.convergenceIntegrityBaselinesHonestCount}/${slice.convergenceIntegrityBaselinesTotalCount} baselines`;
  return `era25 commercial pilot convergence train closure · ${status} · ${baselines}`;
}
