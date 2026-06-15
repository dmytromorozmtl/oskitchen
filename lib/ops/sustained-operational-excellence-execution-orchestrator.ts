/**
 * Sustained operational excellence execution orchestrator — Step 10 honest milestone + cadence truth.
 * Policy: era38-sustained-operational-excellence-execution-v1
 */
import { evaluateCommercialInflectionReadiness } from "@/lib/commercial/commercial-inflection-readiness-era28";
import { evaluateSustainedOperationalExcellenceIntegrity } from "@/lib/commercial/sustained-operational-excellence-integrity-era33";
import {
  resolveNextIncompleteSustainedOperationalExcellencePhase,
  resolveSustainedOperationalExcellenceComplete,
  type SustainedOperationalExcellencePhaseStatus,
} from "@/lib/commercial/sustained-operational-excellence-phases-era21";
import type { PilotGoNoGoSummary } from "@/lib/commercial/pilot-gono-go-summary";
import type { MarketLeaderPositioningExecutionSummary } from "@/lib/ops/market-leader-positioning-execution-orchestrator";
import { buildMarketLeaderPositioningExecutionSummary } from "@/lib/ops/market-leader-positioning-execution-orchestrator";
import type { ProductionGaExecutionSummary } from "@/lib/ops/production-ga-execution-orchestrator";
import type { PilotScaleExpansionExecutionSummary } from "@/lib/ops/pilot-scale-expansion-execution-orchestrator";
import type { PilotWeek1ExecutionOrchestratorSummary } from "@/lib/ops/pilot-week1-execution-orchestrator";
import type { SeriesAPartnerExpansionExecutionSummary } from "@/lib/ops/series-a-partner-expansion-execution-orchestrator";
import {
  evaluateSustainedOperationalExcellenceEnv,
  readSustainedOperationalExcellenceArtifacts,
} from "@/scripts/ops/validate-sustained-operational-excellence-env";

export const SUSTAINED_OPERATIONAL_EXCELLENCE_EXECUTION_POLICY_ID =
  "era38-sustained-operational-excellence-execution-v1" as const;

export const SUSTAINED_OPERATIONAL_EXCELLENCE_EXECUTION_DOC =
  "docs/next-step-10-sustained-operational-excellence-2026-05-29.md" as const;

export const SUSTAINED_OPERATIONAL_EXCELLENCE_EXECUTION_STEP11_DOC =
  "docs/next-step-11-sustained-product-evolution-2026-05-29.md" as const;

export const SUSTAINED_OPERATIONAL_EXCELLENCE_EXECUTION_SUMMARY_ARTIFACT =
  "artifacts/sustained-operational-excellence-execution-summary.json" as const;

export const SUSTAINED_OPERATIONAL_EXCELLENCE_EXECUTION_HTML_ARTIFACT =
  "artifacts/sustained-operational-excellence-execution-report.html" as const;

export const SUSTAINED_OPERATIONAL_EXCELLENCE_EXECUTION_ORCHESTRATOR_COMMAND =
  "npm run ops:run-sustained-operational-excellence-execution" as const;

export type SustainedOperationalExcellenceExecutionMilestone =
  | "market_leader_positioning_blocked"
  | "awaiting_cadence_a_daily_operational"
  | "awaiting_cadence_b_weekly_integration"
  | "awaiting_cadence_c_monthly_metrics"
  | "awaiting_cadence_d_quarterly_governance"
  | "awaiting_sustained_ops_integrity"
  | "sustained_operational_excellence_passed";

export type SustainedOperationalExcellenceExecutionGateStatus = {
  id: string;
  label: string;
  complete: boolean;
  proofStatus: string | null;
  detail: string;
  command: string | null;
};

export type SustainedOperationalExcellenceExecutionSummary = {
  version: "sustained-operational-excellence-execution-v1";
  policyId: typeof SUSTAINED_OPERATIONAL_EXCELLENCE_EXECUTION_POLICY_ID;
  generatedAt: string;
  milestone: SustainedOperationalExcellenceExecutionMilestone;
  marketLeaderExecutionMilestone: string | null;
  goDecision: string | null;
  customerName: string | null;
  cadencesComplete: boolean;
  marketLeaderComplete: boolean;
  sustainedOpsIntegrityPassed: boolean;
  commercialInflectionMilestone: string;
  pilotExecutableScore: number;
  p0ProofStatus: string | null;
  tier2ProofStatus: string | null;
  phases: readonly SustainedOperationalExcellencePhaseStatus[];
  gates: readonly SustainedOperationalExcellenceExecutionGateStatus[];
  nextPhase: SustainedOperationalExcellencePhaseStatus | null;
  recommendedCommands: readonly string[];
  productSurfaces: readonly string[];
  honestyNote: string;
};

export function resolveSustainedOperationalExcellenceExecutionMilestone(input: {
  marketLeaderPositioningPassed: boolean;
  cadences: readonly SustainedOperationalExcellencePhaseStatus[];
  sustainedOpsIntegrityPassed: boolean;
}): SustainedOperationalExcellenceExecutionMilestone {
  if (!input.marketLeaderPositioningPassed) return "market_leader_positioning_blocked";

  const nextCadence = resolveNextIncompleteSustainedOperationalExcellencePhase(input.cadences);
  if (nextCadence?.optional === false) {
    switch (nextCadence.id) {
      case "cadence_a_daily_operational":
        return "awaiting_cadence_a_daily_operational";
      case "cadence_b_weekly_integration":
        return "awaiting_cadence_b_weekly_integration";
      case "cadence_c_monthly_metrics":
        return "awaiting_cadence_c_monthly_metrics";
      case "cadence_d_quarterly_governance":
        return "awaiting_cadence_d_quarterly_governance";
      default:
        break;
    }
  }

  if (!resolveSustainedOperationalExcellenceComplete(input.cadences)) {
    return "awaiting_cadence_a_daily_operational";
  }

  if (!input.sustainedOpsIntegrityPassed) return "awaiting_sustained_ops_integrity";
  return "sustained_operational_excellence_passed";
}

export function buildSustainedOperationalExcellenceExecutionGates(input: {
  marketLeaderPositioningPassed: boolean;
  marketLeaderExecutionMilestone: string | null;
  cadencesComplete: boolean;
  marketLeaderComplete: boolean;
  sustainedOpsIntegrityPassed: boolean;
  commercialInflectionMilestone: string;
  goDecision: string | null;
  perCustomerIsolation: boolean;
  integrationHonest: boolean;
  metricsBaselinePassed: boolean;
  competitorAligned: boolean;
  claimsReviewed: boolean;
}): SustainedOperationalExcellenceExecutionGateStatus[] {
  return [
    {
      id: "market_leader_positioning",
      label: "Market leader positioning complete (Step 9)",
      complete: input.marketLeaderPositioningPassed,
      proofStatus: input.marketLeaderPositioningPassed
        ? "market_leader_positioning_passed"
        : input.marketLeaderExecutionMilestone,
      detail: input.marketLeaderPositioningPassed
        ? "Pillars 1–4 + market leader integrity passed."
        : "Complete Step 9 — market leader positioning execution.",
      command: "npm run ops:run-market-leader-positioning-execution -- --write",
    },
    {
      id: "market_leader_phases",
      label: "Market leader pillars complete (prerequisite)",
      complete: input.marketLeaderComplete,
      proofStatus: input.marketLeaderComplete ? "market_leader_complete" : "in_progress",
      detail: input.marketLeaderComplete
        ? "Category narrative, moat deck, analyst kit, expansion motion complete."
        : "Market leader phases must be complete before sustained ops cadences.",
      command: "npm run ops:validate-market-leader-positioning-env -- --json",
    },
    {
      id: "sustained_ops_cadences",
      label: "Sustained ops cadences A–D",
      complete: input.cadencesComplete,
      proofStatus: input.cadencesComplete ? "cadences_complete" : "in_progress",
      detail: input.cadencesComplete
        ? "Daily, weekly, monthly, quarterly cadences attested with real operator usage."
        : "Complete four ops cadences — all F&B formats, per-customer GO isolation.",
      command: SUSTAINED_OPERATIONAL_EXCELLENCE_EXECUTION_ORCHESTRATOR_COMMAND + " -- --write",
    },
    {
      id: "per_customer_isolation",
      label: "Per-customer GO isolation (Scale Gate 1)",
      complete: input.perCustomerIsolation,
      proofStatus: input.perCustomerIsolation ? "isolation_maintained" : "pending",
      detail: "Cadences A and C require SCALE_PER_CUSTOMER_GO_ISOLATION=1 per active customer.",
      command: "npm run ops:validate-scale-readiness-env -- --json",
    },
    {
      id: "integration_honesty",
      label: "Integration channel honesty (weekly cadence)",
      complete: input.integrationHonest,
      proofStatus: input.integrationHonest ? "integration_honest" : "pending",
      detail: "Cadence B requires smoke:woo-shopify-live PASS or Tier 2 proof_passed.",
      command: "npm run smoke:woo-shopify-live",
    },
    {
      id: "metrics_baseline",
      label: "Pilot metrics baseline PASS (monthly cadence)",
      complete: input.metricsBaselinePassed,
      proofStatus: input.metricsBaselinePassed ? "PASSED" : "pending",
      detail: "Cadence C requires honest pilot-metrics-baseline artifact per customer.",
      command: "npm run smoke:pilot-metrics-baseline",
    },
    {
      id: "quarterly_governance",
      label: "Quarterly governance artifacts (competitor + claims)",
      complete: input.competitorAligned && input.claimsReviewed,
      proofStatus:
        input.competitorAligned && input.claimsReviewed ? "governance_ready" : "pending",
      detail: "Cadence D requires competitor matrix evidence_aligned_era17 + forbidden claims reviewed.",
      command: "npm run smoke:pilot-forbidden-claims-enforcement",
    },
    {
      id: "sustained_ops_integrity",
      label: "Sustained operational excellence integrity",
      complete: input.sustainedOpsIntegrityPassed,
      proofStatus: input.sustainedOpsIntegrityPassed ? "integrity_passed" : "integrity_pending",
      detail: "No sustained ops started without market leader or fake metrics PASS.",
      command: "npm run ops:validate-sustained-operational-excellence-integrity -- --json",
    },
    {
      id: "go_decision",
      label: "GO decision still honest",
      complete: input.goDecision === "GO",
      proofStatus: input.goDecision,
      detail: "GO must remain valid through sustained ops — re-run smoke:pilot-gono-go if artifacts drift.",
      command: "npm run smoke:pilot-gono-go",
    },
  ];
}

export function buildSustainedOperationalExcellenceExecutionSummary(input: {
  env?: NodeJS.ProcessEnv;
  marketLeaderExecution?: MarketLeaderPositioningExecutionSummary | null;
  seriesAExpansion?: SeriesAPartnerExpansionExecutionSummary | null;
  productionGa?: ProductionGaExecutionSummary | null;
  scaleExpansion?: PilotScaleExpansionExecutionSummary | null;
  week1Execution?: PilotWeek1ExecutionOrchestratorSummary | null;
  goNoGo?: PilotGoNoGoSummary | null;
  generatedAt?: Date;
}): SustainedOperationalExcellenceExecutionSummary {
  const env = input.env ?? process.env;
  const sustainedArtifacts = readSustainedOperationalExcellenceArtifacts();
  const sustainedEvaluation = evaluateSustainedOperationalExcellenceEnv(env);
  const sustainedIntegrity = evaluateSustainedOperationalExcellenceIntegrity(process.cwd(), {
    env,
    goNoGoOverride: input.goNoGo ?? sustainedArtifacts.goNoGoSummary,
    p0StagingOverride: sustainedArtifacts.p0Staging,
    tier2SummaryOverride: sustainedArtifacts.tier2Summary,
    metricsBaselineOverride: sustainedArtifacts.metricsBaseline,
    caseStudyDraftOverride: sustainedArtifacts.caseStudyDraft,
    investorOnepagerOverride: sustainedArtifacts.investorOnepager,
    rollbackDrillOverride: sustainedArtifacts.rollbackDrill,
    competitorMatrixOverride: sustainedArtifacts.competitorMatrix,
  });
  const inflection = evaluateCommercialInflectionReadiness(env);

  const marketLeaderExecution =
    input.marketLeaderExecution ??
    buildMarketLeaderPositioningExecutionSummary({
      env,
      seriesAExpansion: input.seriesAExpansion ?? null,
      productionGa: input.productionGa ?? null,
      scaleExpansion: input.scaleExpansion ?? null,
      week1Execution: input.week1Execution ?? null,
      goNoGo: input.goNoGo ?? null,
    });

  const phases = sustainedEvaluation.phases;
  const marketLeaderPositioningPassed =
    marketLeaderExecution.milestone === "market_leader_positioning_passed";
  const cadencesComplete = resolveSustainedOperationalExcellenceComplete(phases);

  const perCustomerIsolation = parseEnvBoolean(env.SCALE_PER_CUSTOMER_GO_ISOLATION) === true;
  const channelLivePassed =
    sustainedArtifacts.p0Staging?.children.channelLive.overall === "PASSED";
  const tier2Passed = sustainedArtifacts.tier2Summary?.tier2ProofStatus === "proof_passed";
  const integrationHonest = channelLivePassed || tier2Passed;
  const metricsBaselinePassed = sustainedArtifacts.metricsBaseline?.overall === "PASSED";
  const competitorAligned =
    sustainedArtifacts.competitorMatrix?.overall === "PASSED" &&
    sustainedArtifacts.competitorMatrix.matrixProofStatus === "evidence_aligned_era17";
  const claimsReviewed =
    parseEnvBoolean(env.SERIES_A_MARKETING_CLAIMS_STRICT_REVIEWED) === true ||
    parseEnvBoolean(env.MARKETING_CLAIMS_STRICT) === true;

  const milestone = resolveSustainedOperationalExcellenceExecutionMilestone({
    marketLeaderPositioningPassed,
    cadences: phases,
    sustainedOpsIntegrityPassed: sustainedIntegrity.integrityPassed,
  });

  const gates = buildSustainedOperationalExcellenceExecutionGates({
    marketLeaderPositioningPassed,
    marketLeaderExecutionMilestone: marketLeaderExecution.milestone,
    cadencesComplete,
    marketLeaderComplete: sustainedEvaluation.marketLeaderComplete,
    sustainedOpsIntegrityPassed: sustainedIntegrity.integrityPassed,
    commercialInflectionMilestone: inflection.milestone,
    goDecision: input.goNoGo?.decision ?? sustainedEvaluation.goDecision,
    perCustomerIsolation,
    integrationHonest,
    metricsBaselinePassed,
    competitorAligned,
    claimsReviewed,
  });

  const nextPhase = marketLeaderPositioningPassed
    ? resolveNextIncompleteSustainedOperationalExcellencePhase(phases)
    : null;

  const recommendedCommands: string[] = [];
  if (!marketLeaderPositioningPassed) {
    recommendedCommands.push("npm run ops:run-market-leader-positioning-execution -- --write");
    recommendedCommands.push("npm run ops:run-market-leader-positioning-execution -- --execute");
  } else if (!cadencesComplete) {
    recommendedCommands.push(
      SUSTAINED_OPERATIONAL_EXCELLENCE_EXECUTION_ORCHESTRATOR_COMMAND + " -- --execute",
    );
    if (nextPhase?.smokeScripts.length) {
      for (const script of nextPhase.smokeScripts) {
        recommendedCommands.push(`npm run ${script}`);
      }
    }
    recommendedCommands.push(
      "npm run ops:run-sustained-operational-excellence-post-market-leader-orchestrator -- --write",
    );
    recommendedCommands.push("npm run ops:validate-sustained-operational-excellence-env -- --json");
  } else if (!sustainedIntegrity.integrityPassed) {
    recommendedCommands.push(
      "npm run ops:validate-sustained-operational-excellence-integrity -- --json",
    );
  }

  if (milestone === "sustained_operational_excellence_passed") {
    recommendedCommands.push(
      "npm run ops:run-sustained-product-evolution-execution -- --write",
    );
  }

  return {
    version: "sustained-operational-excellence-execution-v1",
    policyId: SUSTAINED_OPERATIONAL_EXCELLENCE_EXECUTION_POLICY_ID,
    generatedAt: (input.generatedAt ?? new Date()).toISOString(),
    milestone,
    marketLeaderExecutionMilestone: marketLeaderExecution.milestone,
    goDecision: input.goNoGo?.decision ?? sustainedEvaluation.goDecision,
    customerName: input.goNoGo?.customerName ?? null,
    cadencesComplete,
    marketLeaderComplete: sustainedEvaluation.marketLeaderComplete,
    sustainedOpsIntegrityPassed: sustainedIntegrity.integrityPassed,
    commercialInflectionMilestone: inflection.milestone,
    pilotExecutableScore: inflection.pilotExecutableScore,
    p0ProofStatus: sustainedArtifacts.p0Staging?.p0ProofStatus ?? null,
    tier2ProofStatus: sustainedArtifacts.tier2Summary?.tier2ProofStatus ?? null,
    phases,
    gates,
    nextPhase,
    recommendedCommands,
    productSurfaces: [
      "/dashboard/today",
      "/dashboard/order-hub",
      "/dashboard/production-calendar",
      "/dashboard/integration-health",
      "/dashboard/reports",
      "/platform/commercial-pilot-ops",
    ],
    honestyNote:
      "PASS > SKIPPED — daily cadence requires real operator usage, not checkbox-only. Quarterly rollback drill must show proof_passed. ICP = all F&B formats.",
  };
}

function parseEnvBoolean(raw: string | undefined): boolean | undefined {
  if (raw === undefined) return undefined;
  const value = raw.trim().toLowerCase();
  if (value === "1" || value === "true" || value === "yes") return true;
  if (value === "0" || value === "false" || value === "no") return false;
  return undefined;
}

export function formatSustainedOperationalExcellenceExecutionLines(
  summary: SustainedOperationalExcellenceExecutionSummary,
): string[] {
  return [
    `Sustained operational excellence execution: ${summary.milestone}`,
    `Market leader: ${summary.marketLeaderExecutionMilestone ?? "missing"} · GO: ${summary.goDecision ?? "not evaluated"}`,
    `Customer: ${summary.customerName ?? "not recorded"} · Cadences A–D: ${summary.cadencesComplete ? "complete" : "in progress"}`,
    `P0: ${summary.p0ProofStatus ?? "missing"} · Tier 2: ${summary.tier2ProofStatus ?? "missing"} · integrity ${summary.sustainedOpsIntegrityPassed ? "PASS" : "FAIL"}`,
    `Commercial inflection: ${summary.commercialInflectionMilestone} · pilot score ${summary.pilotExecutableScore}/100`,
    summary.nextPhase
      ? `Next cadence: ${summary.nextPhase.label} — ${summary.nextPhase.detail}`
      : "All cadences complete or blocked on market leader positioning",
  ];
}
