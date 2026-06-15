import type { Ga4ParityScore } from "@/lib/storefront/ga4-parity-score";
import { toJsonValue } from "@/lib/prisma/json";
import type { ExperimentProdDecision } from "@/lib/storefront/theme-experiment-decision";
import { buildExperimentFeatureVector } from "@/lib/storefront/theme-experiment-ml-risk";
import { isAutoConcludeFrozen } from "@/lib/storefront/theme-experiment-post-publish-guard";
import { computeMlRiskWithVertex } from "@/lib/storefront/theme-experiment-vertex-ml";
import type { ExperimentSrmCheck } from "@/lib/storefront/theme-experiment-srm";

export type AutoConcludeGate = {
  id: string;
  label: string;
  passed: boolean;
  detail: string;
};

export type AutoConcludeReadiness = {
  allPassed: boolean;
  gates: AutoConcludeGate[];
  scheduledAt: string | null;
  executeNow: boolean;
};

export function isAutoConcludeGloballyEnabled(): boolean {
  return process.env.THEME_EXPERIMENT_AUTO_CONCLUDE === "1";
}

export function autoConcludeGraceMs(): number {
  const hours = Number(process.env.THEME_EXPERIMENT_AUTO_CONCLUDE_GRACE_HOURS ?? "24");
  return Math.max(1, hours) * 60 * 60 * 1000;
}

export function readAutoConcludeEnabled(raw: unknown): boolean {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return false;
  return (raw as Record<string, unknown>).autoConcludeEnabled === true;
}

export function readAutoConcludeScheduledAt(raw: unknown): string | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const v = (raw as Record<string, unknown>).autoConcludeScheduledAt;
  return typeof v === "string" ? v : null;
}

export function evaluateAutoConcludeReadiness(input: {
  themeExperimentJson: unknown;
  decision: ExperimentProdDecision;
  parity: Ga4ParityScore;
  srm: ExperimentSrmCheck;
  edgeSynced: boolean;
  blockingEdgeJobs: number;
  experimentEnabled: boolean;
}): AutoConcludeReadiness {
  const scheduledAt = readAutoConcludeScheduledAt(input.themeExperimentJson);
  const mlRisk = computeMlRiskWithVertex({
    features: buildExperimentFeatureVector({
      decision: input.decision,
      srm: input.srm,
      parity: input.parity,
      edgeSynced: input.edgeSynced,
    }),
    themeExperimentJson: input.themeExperimentJson,
  });
  const gates: AutoConcludeGate[] = [
    {
      id: "experiment_enabled",
      label: "Experiment active",
      passed: input.experimentEnabled,
      detail: input.experimentEnabled ? "Running" : "Experiment is off",
    },
    {
      id: "publish_draft",
      label: "Decision = publish_draft",
      passed: input.decision.recommendation === "publish_draft",
      detail: `Current: ${input.decision.recommendation}`,
    },
    {
      id: "parity_ok",
      label: "GA4 parity OK",
      passed: input.parity.status === "ok",
      detail: input.parity.headline,
    },
    {
      id: "srm_ok",
      label: "Traffic sanity OK",
      passed: !input.srm.warn,
      detail: input.srm.warn ? input.srm.headline : "No SRM drift",
    },
    {
      id: "edge_synced",
      label: "Edge Config synced",
      passed: input.edgeSynced && input.blockingEdgeJobs === 0,
      detail:
        input.blockingEdgeJobs > 0
          ? `${input.blockingEdgeJobs} blocking edge job(s)`
          : input.edgeSynced
            ? "DB version matches Edge"
            : "Edge version drift",
    },
    {
      id: "bayesian_ok",
      label: "Bayesian gate (when enabled)",
      passed: input.decision.bayesianPassed,
      detail: input.decision.bayesianProbLift
        ? `P(lift) ${input.decision.bayesianProbLift}%`
        : "Frequentist only",
    },
    {
      id: "ml_risk_ok",
      label: "ML conclude risk",
      passed: !mlRisk.blocked,
      detail: mlRisk.headline,
    },
    {
      id: "post_publish_not_frozen",
      label: "Post-publish guard",
      passed: !isAutoConcludeFrozen(input.themeExperimentJson),
      detail: isAutoConcludeFrozen(input.themeExperimentJson)
        ? "Auto-conclude frozen after regression (7d)"
        : "No active regression freeze",
    },
  ];

  const allPassed = gates.every((g) => g.passed);
  const executeNow =
    allPassed && scheduledAt !== null && Date.now() >= new Date(scheduledAt).getTime();

  return { allPassed, gates, scheduledAt, executeNow };
}
