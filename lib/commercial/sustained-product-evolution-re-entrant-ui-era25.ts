/**
 * Sustained product evolution re-entrant UI slice — post-train-closure product growth via improvement loop.
 */
import type { CompetitorFeatureGapMatrixSummary } from "@/lib/commercial/competitor-feature-gap-matrix-summary";
import { evaluateSustainedProductEvolutionReentrantIntegrity } from "@/lib/commercial/sustained-product-evolution-re-entrant-integrity-era56";
import {
  SUSTAINED_PRODUCT_EVOLUTION_REENTRANT_DOC,
  SUSTAINED_PRODUCT_EVOLUTION_REENTRANT_FOREVER_COMMANDS,
  SUSTAINED_PRODUCT_EVOLUTION_REENTRANT_GUARDRAILS,
  SUSTAINED_PRODUCT_EVOLUTION_REENTRANT_BACKLOG_ID,
  SUSTAINED_PRODUCT_EVOLUTION_REENTRANT_PLATFORM_ANCHOR,
  detectSustainedProductEvolutionReentrantStarted,
} from "@/lib/commercial/sustained-product-evolution-re-entrant-phases-era56";
import type { InvestorNarrativeOnepagerSummary } from "@/lib/commercial/investor-narrative-onepager-summary";
import type { P0StagingProofUnblockSummary } from "@/lib/commercial/p0-staging-proof-unblock-summary";
import type { PilotCaseStudyDraftSummary } from "@/lib/commercial/pilot-case-study-draft-summary";
import type { PilotGoNoGoSummary } from "@/lib/commercial/pilot-gono-go-summary";
import type { PilotMetricsBaselineSummary } from "@/lib/commercial/pilot-metrics-baseline-summary";
import type { PilotRollbackDrillSummary } from "@/lib/commercial/pilot-rollback-drill-summary";
import type { Tier2StagingGoldenPathSummary } from "@/lib/commercial/tier2-staging-golden-path-summary";
import { SERIES_A_PLATFORM_OPS_ROUTE } from "@/lib/commercial/sustained-operational-excellence-phases-era21";
import { SUSTAINED_PRODUCT_EVOLUTION_PLATFORM_ANCHOR } from "@/lib/commercial/sustained-product-evolution-ui-era23";
import { LAUNCH_WIZARD_ROUTE } from "@/lib/launch-wizard/launch-wizard-era19-policy";
import { LAUNCH_WIZARD_ERA25_SUSTAINED_PRODUCT_EVOLUTION_REENTRANT_ANCHOR } from "@/lib/launch-wizard/launch-wizard-era25-sustained-product-evolution-re-entrant-era56";

export const SUSTAINED_PRODUCT_EVOLUTION_REENTRANT_ERA25_UI_POLICY_ID =
  "era25-sustained-product-evolution-re-entrant-ui-v1" as const;

export type SustainedProductEvolutionReentrantEra25UiSlice = {
  policyId: typeof SUSTAINED_PRODUCT_EVOLUTION_REENTRANT_ERA25_UI_POLICY_ID;
  visible: boolean;
  trainClosureComplete: boolean;
  reentrantBlocked: boolean;
  reentrantComplete: boolean;
  improvementLoopActive: boolean;
  linearConvergenceSurfaceReopened: boolean;
  goDecision: string | null;
  convergenceDoc: typeof SUSTAINED_PRODUCT_EVOLUTION_REENTRANT_DOC;
  backlogId: typeof SUSTAINED_PRODUCT_EVOLUTION_REENTRANT_BACKLOG_ID;
  guardrails: typeof SUSTAINED_PRODUCT_EVOLUTION_REENTRANT_GUARDRAILS;
  foreverCommands: typeof SUSTAINED_PRODUCT_EVOLUTION_REENTRANT_FOREVER_COMMANDS;
  integrityValidateCommand: string;
  syncIntegrityBaselineCommand: string;
  validateTrainClosureIntegrityCommand: string;
  validateProductEvolutionIntegrityCommand: string;
  validateImprovementLoopIntegrityCommand: string;
  postImprovementLoopOrchestratorCommand: string;
  commercialPilotRunbookCertCommand: string;
  sustainedProductEvolutionReentrantIntegrityPassed: boolean;
  era25CommercialPilotConvergenceTrainClosureIntegrityPassed: boolean;
  sustainedProductEvolutionIntegrityPassed: boolean;
  launchWizardHref: string;
  platformOpsHref: string;
  productEvolutionHref: string;
  improvementLoopHref: string;
  todayHref: string;
  headline: string;
};

export function buildSustainedProductEvolutionReentrantEra25UiSlice(input: {
  commercialPilotConvergenceTrainClosureVisible: boolean;
  trainClosureComplete: boolean;
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
}): SustainedProductEvolutionReentrantEra25UiSlice | null {
  const env = input.env ?? process.env;
  const reentrantStarted = detectSustainedProductEvolutionReentrantStarted(env);

  if (!input.commercialPilotConvergenceTrainClosureVisible && !reentrantStarted) return null;

  const p0ProofStatus = input.p0ProofStatus ?? input.p0Staging?.p0ProofStatus ?? null;
  const tier2ProofStatus = input.tier2ProofStatus ?? input.tier2Summary?.tier2ProofStatus ?? null;

  const reentrantIntegrity = evaluateSustainedProductEvolutionReentrantIntegrity(process.cwd(), {
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
  });

  const reentrantComplete = reentrantIntegrity.sustainedProductEvolutionReentrantComplete;
  const reentrantBlocked = !reentrantComplete;

  const headline = reentrantComplete
    ? `Product evolution re-entrant · improvement loop active · GO ${reentrantIntegrity.goDecision ?? "GO"}`
    : input.trainClosureComplete
      ? reentrantIntegrity.linearConvergenceSurfaceReopened
        ? "Re-entrant blocked · era25 linear convergence env keys detected — clear attestations"
        : "Awaiting re-entrant attest · train closure closed · run improvement loop + product evolution integrity"
      : "Awaiting era25 commercial pilot convergence train closure before re-entrant product evolution";

  return {
    policyId: SUSTAINED_PRODUCT_EVOLUTION_REENTRANT_ERA25_UI_POLICY_ID,
    visible: true,
    trainClosureComplete: input.trainClosureComplete,
    reentrantBlocked,
    reentrantComplete,
    improvementLoopActive: reentrantIntegrity.improvementLoopActive,
    linearConvergenceSurfaceReopened: reentrantIntegrity.linearConvergenceSurfaceReopened,
    goDecision: reentrantIntegrity.goDecision,
    convergenceDoc: SUSTAINED_PRODUCT_EVOLUTION_REENTRANT_DOC,
    backlogId: SUSTAINED_PRODUCT_EVOLUTION_REENTRANT_BACKLOG_ID,
    guardrails: SUSTAINED_PRODUCT_EVOLUTION_REENTRANT_GUARDRAILS,
    foreverCommands: SUSTAINED_PRODUCT_EVOLUTION_REENTRANT_FOREVER_COMMANDS,
    integrityValidateCommand:
      "npm run ops:validate-sustained-product-evolution-re-entrant-integrity -- --json",
    syncIntegrityBaselineCommand:
      "npm run ops:sync-sustained-product-evolution-re-entrant-integrity-baseline -- --write",
    validateTrainClosureIntegrityCommand:
      "npm run ops:validate-era25-commercial-pilot-convergence-train-closure-integrity -- --json",
    validateProductEvolutionIntegrityCommand:
      "npm run ops:validate-sustained-product-evolution-integrity -- --json",
    validateImprovementLoopIntegrityCommand:
      "npm run ops:validate-continuous-improvement-loop-integrity -- --json",
    postImprovementLoopOrchestratorCommand:
      "npm run ops:run-sustained-product-evolution-post-improvement-loop-orchestrator -- --write",
    commercialPilotRunbookCertCommand: "npm run test:ci:commercial-pilot-runbook:cert",
    sustainedProductEvolutionReentrantIntegrityPassed: reentrantIntegrity.integrityPassed,
    era25CommercialPilotConvergenceTrainClosureIntegrityPassed:
      reentrantIntegrity.era25CommercialPilotConvergenceTrainClosureIntegrityPassed,
    sustainedProductEvolutionIntegrityPassed:
      reentrantIntegrity.sustainedProductEvolutionIntegrityPassed,
    launchWizardHref: `${LAUNCH_WIZARD_ROUTE}${LAUNCH_WIZARD_ERA25_SUSTAINED_PRODUCT_EVOLUTION_REENTRANT_ANCHOR}`,
    platformOpsHref: `${SERIES_A_PLATFORM_OPS_ROUTE}${SUSTAINED_PRODUCT_EVOLUTION_REENTRANT_PLATFORM_ANCHOR}`,
    productEvolutionHref: `${SERIES_A_PLATFORM_OPS_ROUTE}${SUSTAINED_PRODUCT_EVOLUTION_PLATFORM_ANCHOR}`,
    improvementLoopHref: `${SERIES_A_PLATFORM_OPS_ROUTE}#continuous-improvement-loop`,
    todayHref: "/dashboard/today",
    headline,
  };
}

export function formatSustainedProductEvolutionReentrantEra25Label(
  slice: SustainedProductEvolutionReentrantEra25UiSlice,
): string {
  const status = slice.reentrantBlocked ? "BLOCKED" : "RE-ENTRANT";
  const loop = slice.improvementLoopActive ? "loop active" : "loop pending";
  return `era25 sustained product evolution re-entrant · ${status} · ${loop}`;
}
