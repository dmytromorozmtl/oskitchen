/**
 * Month 2 market readiness integrity — blocks Month 2 without honest Week 1 + narrative proof.
 * Policy: era29-month2-market-readiness-integrity-v1
 */
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import type { InvestorNarrativeOnepagerSummary } from "@/lib/commercial/investor-narrative-onepager-summary";
import { recomputeInvestorNarrativeProofStatusFromSummary } from "@/lib/commercial/investor-narrative-onepager-summary";
import {
  INVESTOR_NARRATIVE_ONEPAGER_ARTIFACT_PATH,
  MONTH2_MARKET_READINESS_TRACKED_ENV_KEYS,
  resolveWeek1CompleteForMonth2,
} from "@/lib/commercial/month2-market-readiness-phases-era21";
import type { PilotCaseStudyDraftSummary } from "@/lib/commercial/pilot-case-study-draft-summary";
import { recomputePublishProofStatusFromSummary } from "@/lib/commercial/pilot-case-study-draft-summary";
import type { PilotGoNoGoSummary } from "@/lib/commercial/pilot-gono-go-summary";
import { PILOT_GONOGO_ERA17_SUMMARY_ARTIFACT } from "@/lib/commercial/pilot-gono-go-era17-policy";
import {
  PILOT_CASE_STUDY_DRAFT_ARTIFACT_PATH,
  PILOT_METRICS_BASELINE_ARTIFACT_PATH,
} from "@/lib/commercial/pilot-week1-execution-phases-era21";
import {
  evaluatePilotWeek1ExecutionIntegrity,
  type PilotWeek1ExecutionIntegrityBaseline,
} from "@/lib/commercial/pilot-week1-execution-integrity-era28";
import type { PilotMetricsBaselineSummary } from "@/lib/commercial/pilot-metrics-baseline-summary";

export const MONTH2_MARKET_READINESS_INTEGRITY_ERA29_POLICY_ID =
  "era29-month2-market-readiness-integrity-v1" as const;

export const MONTH2_MARKET_READINESS_INTEGRITY_BASELINE_ARTIFACT =
  "artifacts/month2-market-readiness-integrity-baseline.json" as const;

export type Month2MarketReadinessIntegrityViolationId =
  | "week1_prerequisite_not_complete"
  | "week1_integrity_fail"
  | "go_integrity_fail"
  | "month2_started_without_week1"
  | "fake_investor_pass"
  | "fake_investor_proof_mismatch"
  | "fake_case_study_publish"
  | "baseline_regression";

export type Month2MarketReadinessIntegrityViolation = {
  id: Month2MarketReadinessIntegrityViolationId;
  detail: string;
};

export type Month2MarketReadinessIntegrityBaseline = {
  month2ExecutionHonest: true;
  recordedAt: string;
  week1CompleteAttested: true;
  goDecision: "GO";
};

export type Month2MarketReadinessIntegritySummary = {
  policyId: typeof MONTH2_MARKET_READINESS_INTEGRITY_ERA29_POLICY_ID;
  integrityPassed: boolean;
  month2ExecutionStarted: boolean;
  week1Complete: boolean;
  week1IntegrityPassed: boolean;
  goDecision: string | null;
  goIntegrityPassed: boolean;
  investorArtifactPresent: boolean;
  investorOverall: string | null;
  recomputedNarrativeProofStatus: string | null;
  caseStudyPresent: boolean;
  publishProofStatus: string | null;
  recomputedPublishProofStatus: string | null;
  baselinePresent: boolean;
  regressionDetected: boolean;
  violations: readonly Month2MarketReadinessIntegrityViolation[];
  recommendedCommands: readonly string[];
};

const BLOCKING_VIOLATION_IDS: readonly Month2MarketReadinessIntegrityViolationId[] = [
  "week1_prerequisite_not_complete",
  "week1_integrity_fail",
  "go_integrity_fail",
  "month2_started_without_week1",
  "fake_investor_pass",
  "fake_investor_proof_mismatch",
  "fake_case_study_publish",
  "baseline_regression",
];

function readJsonFile<T>(root: string, relativePath: string): T | null {
  const path = join(root, relativePath);
  if (!existsSync(path)) return null;
  try {
    return JSON.parse(readFileSync(path, "utf8")) as T;
  } catch {
    return null;
  }
}

function readIntegrityBaseline(root: string): Month2MarketReadinessIntegrityBaseline | null {
  try {
    const path = join(root, MONTH2_MARKET_READINESS_INTEGRITY_BASELINE_ARTIFACT);
    if (!existsSync(path)) return null;
    return JSON.parse(readFileSync(path, "utf8")) as Month2MarketReadinessIntegrityBaseline;
  } catch {
    return null;
  }
}

export function detectMonth2MarketReadinessStarted(
  env: NodeJS.ProcessEnv = process.env,
  options?: {
    investorOnepager?: InvestorNarrativeOnepagerSummary | null;
  },
): boolean {
  const envStarted = MONTH2_MARKET_READINESS_TRACKED_ENV_KEYS.some((key) =>
    Boolean(env[key]?.trim()),
  );
  const investorStarted =
    options?.investorOnepager !== undefined && options.investorOnepager !== null;
  return envStarted || investorStarted;
}

export function evaluateMonth2MarketReadinessIntegrity(
  root: string = process.cwd(),
  options?: {
    env?: NodeJS.ProcessEnv;
    goNoGoOverride?: PilotGoNoGoSummary | null;
    metricsBaselineOverride?: PilotMetricsBaselineSummary | null;
    caseStudyDraftOverride?: PilotCaseStudyDraftSummary | null;
    investorOnepagerOverride?: InvestorNarrativeOnepagerSummary | null;
    p0ProofStatusOverride?: string | null;
    tier2ProofStatusOverride?: string | null;
    week1IntegrityBaselineOverride?: PilotWeek1ExecutionIntegrityBaseline | null;
    baselineOverride?: Month2MarketReadinessIntegrityBaseline | null;
  },
): Month2MarketReadinessIntegritySummary {
  const env = options?.env ?? process.env;
  const goNoGo =
    options?.goNoGoOverride !== undefined
      ? options.goNoGoOverride
      : readJsonFile<PilotGoNoGoSummary>(root, PILOT_GONOGO_ERA17_SUMMARY_ARTIFACT);
  const metrics =
    options?.metricsBaselineOverride !== undefined
      ? options.metricsBaselineOverride
      : readJsonFile<PilotMetricsBaselineSummary>(root, PILOT_METRICS_BASELINE_ARTIFACT_PATH);
  const caseStudy =
    options?.caseStudyDraftOverride !== undefined
      ? options.caseStudyDraftOverride
      : readJsonFile<PilotCaseStudyDraftSummary>(root, PILOT_CASE_STUDY_DRAFT_ARTIFACT_PATH);
  const investor =
    options?.investorOnepagerOverride !== undefined
      ? options.investorOnepagerOverride
      : readJsonFile<InvestorNarrativeOnepagerSummary>(root, INVESTOR_NARRATIVE_ONEPAGER_ARTIFACT_PATH);
  const baseline =
    options?.baselineOverride !== undefined
      ? options.baselineOverride
      : readIntegrityBaseline(root);

  const week1Integrity = evaluatePilotWeek1ExecutionIntegrity(root, {
    env,
    goNoGoOverride: goNoGo,
    metricsBaselineOverride: metrics,
    caseStudyPresent: caseStudy !== null,
    p0ProofStatusOverride: options?.p0ProofStatusOverride,
    tier2ProofStatusOverride: options?.tier2ProofStatusOverride,
    baselineOverride: options?.week1IntegrityBaselineOverride,
  });

  const goDecision = goNoGo?.decision ?? null;
  const goHonest = goDecision === "GO" && week1Integrity.goIntegrityPassed;
  const week1Complete = resolveWeek1CompleteForMonth2({
    goNoGoSummary: goNoGo,
    metricsBaseline: metrics,
    caseStudyDraft: caseStudy,
    env,
  });
  const week1Honest = week1Complete && week1Integrity.integrityPassed;
  const month2ExecutionStarted = detectMonth2MarketReadinessStarted(env, {
    investorOnepager: investor,
  });

  const violations: Month2MarketReadinessIntegrityViolation[] = [];

  if (month2ExecutionStarted && goDecision === "GO" && !week1Integrity.goIntegrityPassed) {
    violations.push({
      id: "go_integrity_fail",
      detail: "GO artifact fails pilot-gono-go integrity — fix before Month 2 market readiness train.",
    });
  }

  if (month2ExecutionStarted && !week1Integrity.integrityPassed) {
    violations.push({
      id: "week1_integrity_fail",
      detail: "Pilot Week 1 execution integrity FAIL — complete Phase D before Month 2 narrative.",
    });
  }

  if (month2ExecutionStarted && !week1Honest) {
    violations.push({
      id: "month2_started_without_week1",
      detail: week1Complete
        ? "Month 2 env/artifacts present but Week 1 integrity FAIL — fix Phase D before investor/GTM train."
        : "Month 2 env/artifacts present but Week 1 is not complete — finish Week 1 integrity + Day 5 smokes first.",
    });
  }

  if (month2ExecutionStarted && goDecision !== "GO") {
    violations.push({
      id: "week1_prerequisite_not_complete",
      detail: `Month 2 started but GO decision=${goDecision ?? "missing"} — smoke:pilot-gono-go must remain honest GO.`,
    });
  }

  if (investor) {
    const recomputed = recomputeInvestorNarrativeProofStatusFromSummary(investor);
    if (investor.overall === "PASSED" && recomputed !== "proof_ready_with_metrics") {
      violations.push({
        id: "fake_investor_pass",
        detail: `Investor one-pager overall PASSED but recomputed ${recomputed} — never hand-edit PASS without metrics.`,
      });
    }
    if (
      investor.overall === "PASSED" &&
      investor.narrativeProofStatus !== "proof_ready_with_metrics"
    ) {
      violations.push({
        id: "fake_investor_proof_mismatch",
        detail: `overall PASSED but narrativeProofStatus=${investor.narrativeProofStatus} — SKIPPED ≠ PASS.`,
      });
    }
  }

  if (caseStudy) {
    const recomputedPublish = recomputePublishProofStatusFromSummary(caseStudy);
    if (
      caseStudy.publishProofStatus === "proof_ready_for_publish" &&
      recomputedPublish !== "proof_ready_for_publish"
    ) {
      violations.push({
        id: "fake_case_study_publish",
        detail: `publishProofStatus=proof_ready_for_publish but recomputed ${recomputedPublish} — customer approval + metrics required.`,
      });
    }
  }

  if (baseline?.month2ExecutionHonest && !goHonest) {
    violations.push({
      id: "baseline_regression",
      detail: `Baseline recorded honest Month 2 at ${baseline.recordedAt} but GO/Week 1 is no longer honest.`,
    });
  }

  const integrityPassed = !violations.some((row) => BLOCKING_VIOLATION_IDS.includes(row.id));
  const regressionDetected = violations.some((row) => row.id === "baseline_regression");

  return {
    policyId: MONTH2_MARKET_READINESS_INTEGRITY_ERA29_POLICY_ID,
    integrityPassed,
    month2ExecutionStarted,
    week1Complete: week1Honest,
    week1IntegrityPassed: week1Integrity.integrityPassed,
    goDecision,
    goIntegrityPassed: week1Integrity.goIntegrityPassed,
    investorArtifactPresent: investor !== null,
    investorOverall: investor?.overall ?? null,
    recomputedNarrativeProofStatus: investor
      ? recomputeInvestorNarrativeProofStatusFromSummary(investor)
      : null,
    caseStudyPresent: caseStudy !== null,
    publishProofStatus: caseStudy?.publishProofStatus ?? null,
    recomputedPublishProofStatus: caseStudy
      ? recomputePublishProofStatusFromSummary(caseStudy)
      : null,
    baselinePresent: baseline !== null,
    regressionDetected,
    violations,
    recommendedCommands: [
      "npm run ops:validate-month2-market-readiness-integrity -- --json",
      "npm run ops:validate-pilot-week1-execution-integrity -- --json",
      "npm run ops:validate-month2-market-readiness-env -- --json",
      "npm run ops:run-month2-market-readiness-post-week1-orchestrator -- --write",
      "npm run smoke:investor-narrative-onepager",
    ],
  };
}
