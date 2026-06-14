import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
  AI_BRIEFING_ACCURACY_BENCHMARK_P2_61_ARTIFACT,
  AI_BRIEFING_ACCURACY_BENCHMARK_P2_61_DOC,
  AI_BRIEFING_ACCURACY_BENCHMARK_P2_61_POLICY_ID,
  AI_BRIEFING_ACCURACY_BENCHMARK_P2_61_SCENARIO_COUNT,
  AI_BRIEFING_ACCURACY_BENCHMARK_P2_61_TOAST_IQ_PARITY_NOTE,
  AI_BRIEFING_ACCURACY_BENCHMARK_P2_61_WIRING_PATHS,
} from "@/lib/ai/ai-briefing-accuracy-benchmark-p2-61-policy";
import { buildAiBriefingAccuracyCorpusP261 } from "@/lib/ai/ai-briefing-accuracy-benchmark-p2-61-corpus";
import { runAiBriefingAccuracyBenchmarkP261 } from "@/lib/ai/ai-briefing-accuracy-benchmark-p2-61-scoring";

export type AiBriefingAccuracyBenchmarkP261AuditSummary = {
  policyId: typeof AI_BRIEFING_ACCURACY_BENCHMARK_P2_61_POLICY_ID;
  wiringComplete: boolean;
  docWired: boolean;
  corpusLoaded: boolean;
  scoringPassed: boolean;
  insightRecallPct: number;
  routeAccuracyPct: number;
  hallucinationPct: number;
  artifactPresent: boolean;
  passed: boolean;
};

export function auditAiBriefingAccuracyBenchmarkP261(
  root = process.cwd(),
): AiBriefingAccuracyBenchmarkP261AuditSummary {
  const wiringComplete = AI_BRIEFING_ACCURACY_BENCHMARK_P2_61_WIRING_PATHS.every((rel) =>
    existsSync(join(root, rel)),
  );

  let docWired = false;
  if (existsSync(join(root, AI_BRIEFING_ACCURACY_BENCHMARK_P2_61_DOC))) {
    const source = readFileSync(join(root, AI_BRIEFING_ACCURACY_BENCHMARK_P2_61_DOC), "utf8");
    docWired =
      source.includes(AI_BRIEFING_ACCURACY_BENCHMARK_P2_61_POLICY_ID) &&
      source.includes("Toast IQ") &&
      source.includes(String(AI_BRIEFING_ACCURACY_BENCHMARK_P2_61_SCENARIO_COUNT));
  }

  const corpus = buildAiBriefingAccuracyCorpusP261();
  const result = runAiBriefingAccuracyBenchmarkP261(corpus);
  const artifactPresent = existsSync(join(root, AI_BRIEFING_ACCURACY_BENCHMARK_P2_61_ARTIFACT));

  const passed =
    wiringComplete &&
    docWired &&
    corpus.length === AI_BRIEFING_ACCURACY_BENCHMARK_P2_61_SCENARIO_COUNT &&
    result.passed &&
    artifactPresent;

  return {
    policyId: AI_BRIEFING_ACCURACY_BENCHMARK_P2_61_POLICY_ID,
    wiringComplete,
    docWired,
    corpusLoaded: corpus.length === AI_BRIEFING_ACCURACY_BENCHMARK_P2_61_SCENARIO_COUNT,
    scoringPassed: result.passed,
    insightRecallPct: result.insightRecallPct,
    routeAccuracyPct: result.routeAccuracyPct,
    hallucinationPct: result.hallucinationPct,
    artifactPresent,
    passed,
  };
}

export function formatAiBriefingAccuracyBenchmarkP261AuditLines(
  summary: AiBriefingAccuracyBenchmarkP261AuditSummary,
): string[] {
  return [
    `AI briefing accuracy benchmark (${summary.policyId})`,
    `Wiring paths: ${summary.wiringComplete ? "yes" : "no"}`,
    `Doc: ${summary.docWired ? "yes" : "no"}`,
    `Corpus: ${summary.corpusLoaded ? "yes" : "no"} (${AI_BRIEFING_ACCURACY_BENCHMARK_P2_61_SCENARIO_COUNT} scenarios)`,
    `Insight recall: ${summary.insightRecallPct}%`,
    `Route accuracy: ${summary.routeAccuracyPct}%`,
    `Hallucination: ${summary.hallucinationPct}%`,
    `Scoring passed: ${summary.scoringPassed ? "yes" : "no"}`,
    `Artifact: ${summary.artifactPresent ? "present" : "missing"}`,
    `Toast IQ parity: ${AI_BRIEFING_ACCURACY_BENCHMARK_P2_61_TOAST_IQ_PARITY_NOTE}`,
    `Passed: ${summary.passed ? "YES" : "NO"}`,
  ];
}
