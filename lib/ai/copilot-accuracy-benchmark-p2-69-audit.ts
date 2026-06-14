import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { buildCopilotAccuracyCorpusP269 } from "@/lib/ai/copilot-accuracy-benchmark-p2-69-corpus";
import {
  COPILOT_ACCURACY_BENCHMARK_P2_69_ARTIFACT,
  COPILOT_ACCURACY_BENCHMARK_P2_69_BUILDER,
  COPILOT_ACCURACY_BENCHMARK_P2_69_CHAT_PAGE,
  COPILOT_ACCURACY_BENCHMARK_P2_69_COPILOT_SERVICE,
  COPILOT_ACCURACY_BENCHMARK_P2_69_DOC,
  COPILOT_ACCURACY_BENCHMARK_P2_69_EVAL_NOTE,
  COPILOT_ACCURACY_BENCHMARK_P2_69_POLICY_ID,
  COPILOT_ACCURACY_BENCHMARK_P2_69_SCENARIO_COUNT,
  COPILOT_ACCURACY_BENCHMARK_P2_69_WIRING_PATHS,
} from "@/lib/ai/copilot-accuracy-benchmark-p2-69-policy";
import { runCopilotAccuracyBenchmarkP269 } from "@/lib/ai/copilot-accuracy-benchmark-p2-69-scoring";

export type CopilotAccuracyBenchmarkP269AuditSummary = {
  policyId: typeof COPILOT_ACCURACY_BENCHMARK_P2_69_POLICY_ID;
  wiringComplete: boolean;
  docWired: boolean;
  builderWired: boolean;
  copilotServiceWired: boolean;
  chatPageWired: boolean;
  corpusLoaded: boolean;
  scoringPassed: boolean;
  answerAccuracyPct: number;
  hallucinationPct: number;
  artifactPresent: boolean;
  passed: boolean;
};

export function auditCopilotAccuracyBenchmarkP269(
  root = process.cwd(),
): CopilotAccuracyBenchmarkP269AuditSummary {
  const wiringComplete = COPILOT_ACCURACY_BENCHMARK_P2_69_WIRING_PATHS.every((rel) =>
    existsSync(join(root, rel)),
  );

  let docWired = false;
  if (existsSync(join(root, COPILOT_ACCURACY_BENCHMARK_P2_69_DOC))) {
    const source = readFileSync(join(root, COPILOT_ACCURACY_BENCHMARK_P2_69_DOC), "utf8");
    docWired =
      source.includes(COPILOT_ACCURACY_BENCHMARK_P2_69_POLICY_ID) &&
      source.includes("hallucination") &&
      source.includes(String(COPILOT_ACCURACY_BENCHMARK_P2_69_SCENARIO_COUNT));
  }

  let builderWired = false;
  if (existsSync(join(root, COPILOT_ACCURACY_BENCHMARK_P2_69_BUILDER))) {
    const source = readFileSync(join(root, COPILOT_ACCURACY_BENCHMARK_P2_69_BUILDER), "utf8");
    builderWired =
      source.includes("answerCopilotQuestionFromSnapshot") &&
      source.includes("detectCopilotAnswerHallucination");
  }

  let copilotServiceWired = false;
  if (existsSync(join(root, COPILOT_ACCURACY_BENCHMARK_P2_69_COPILOT_SERVICE))) {
    const source = readFileSync(join(root, COPILOT_ACCURACY_BENCHMARK_P2_69_COPILOT_SERVICE), "utf8");
    copilotServiceWired =
      source.includes("answerCopilotQuestionFromSnapshot") &&
      source.includes("buildDeterministicChatReply");
  }

  let chatPageWired = false;
  if (existsSync(join(root, COPILOT_ACCURACY_BENCHMARK_P2_69_CHAT_PAGE))) {
    const source = readFileSync(join(root, COPILOT_ACCURACY_BENCHMARK_P2_69_CHAT_PAGE), "utf8");
    chatPageWired = source.includes("Copilot") || source.includes("copilot");
  }

  const corpus = buildCopilotAccuracyCorpusP269();
  const result = runCopilotAccuracyBenchmarkP269(corpus);
  const artifactPresent = existsSync(join(root, COPILOT_ACCURACY_BENCHMARK_P2_69_ARTIFACT));

  const passed =
    wiringComplete &&
    docWired &&
    builderWired &&
    copilotServiceWired &&
    chatPageWired &&
    corpus.length === COPILOT_ACCURACY_BENCHMARK_P2_69_SCENARIO_COUNT &&
    result.passed &&
    artifactPresent;

  return {
    policyId: COPILOT_ACCURACY_BENCHMARK_P2_69_POLICY_ID,
    wiringComplete,
    docWired,
    builderWired,
    copilotServiceWired,
    chatPageWired,
    corpusLoaded: corpus.length === COPILOT_ACCURACY_BENCHMARK_P2_69_SCENARIO_COUNT,
    scoringPassed: result.passed,
    answerAccuracyPct: result.answerAccuracyPct,
    hallucinationPct: result.hallucinationPct,
    artifactPresent,
    passed,
  };
}

export function formatCopilotAccuracyBenchmarkP269AuditLines(
  summary: CopilotAccuracyBenchmarkP269AuditSummary,
): string[] {
  return [
    `Copilot accuracy benchmark (${summary.policyId})`,
    `Wiring paths: ${summary.wiringComplete ? "yes" : "no"}`,
    `Doc: ${summary.docWired ? "yes" : "no"}`,
    `Builder: ${summary.builderWired ? "wired" : "missing"}`,
    `Copilot service: ${summary.copilotServiceWired ? "wired" : "missing"}`,
    `Chat page: ${summary.chatPageWired ? "yes" : "no"}`,
    `Corpus: ${summary.corpusLoaded ? "yes" : "no"} (${COPILOT_ACCURACY_BENCHMARK_P2_69_SCENARIO_COUNT} scenarios)`,
    `Answer accuracy: ${summary.answerAccuracyPct}%`,
    `Hallucination rate: ${summary.hallucinationPct}%`,
    `Scoring passed: ${summary.scoringPassed ? "yes" : "no"}`,
    `Artifact: ${summary.artifactPresent ? "present" : "missing"}`,
    `Eval note: ${COPILOT_ACCURACY_BENCHMARK_P2_69_EVAL_NOTE}`,
    `Passed: ${summary.passed ? "YES" : "NO"}`,
  ];
}
