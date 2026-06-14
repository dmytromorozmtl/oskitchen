import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { buildCopilotHallucinationCorpusP271 } from "@/lib/ai/copilot-hallucination-regression-p2-71-corpus";
import {
  COPILOT_HALLUCINATION_REGRESSION_P2_71_ARTIFACT,
  COPILOT_HALLUCINATION_REGRESSION_P2_71_BUILDER,
  COPILOT_HALLUCINATION_REGRESSION_P2_71_COPILOT_SERVICE,
  COPILOT_HALLUCINATION_REGRESSION_P2_71_EVAL_NOTE,
  COPILOT_HALLUCINATION_REGRESSION_P2_71_GUARDRAILS,
  COPILOT_HALLUCINATION_REGRESSION_P2_71_NO_HALLUCINATION,
  COPILOT_HALLUCINATION_REGRESSION_P2_71_PATTERNS_MODULE,
  COPILOT_HALLUCINATION_REGRESSION_P2_71_POLICY_ID,
  COPILOT_HALLUCINATION_REGRESSION_P2_71_SCENARIO_COUNT,
  COPILOT_HALLUCINATION_REGRESSION_P2_71_WIRING_PATHS,
} from "@/lib/ai/copilot-hallucination-regression-p2-71-policy";
import { runCopilotHallucinationRegressionP271 } from "@/lib/ai/copilot-hallucination-regression-p2-71-scoring";

export type CopilotHallucinationRegressionP271AuditSummary = {
  policyId: typeof COPILOT_HALLUCINATION_REGRESSION_P2_71_POLICY_ID;
  wiringComplete: boolean;
  patternsWired: boolean;
  builderWired: boolean;
  copilotServiceWired: boolean;
  guardrailsWired: boolean;
  noHallucinationWired: boolean;
  corpusLoaded: boolean;
  scoringPassed: boolean;
  passPct: number;
  hallucinationPct: number;
  artifactPresent: boolean;
  passed: boolean;
};

export function auditCopilotHallucinationRegressionP271(
  root = process.cwd(),
): CopilotHallucinationRegressionP271AuditSummary {
  const wiringComplete = COPILOT_HALLUCINATION_REGRESSION_P2_71_WIRING_PATHS.every((rel) =>
    existsSync(join(root, rel)),
  );

  let patternsWired = false;
  if (existsSync(join(root, COPILOT_HALLUCINATION_REGRESSION_P2_71_PATTERNS_MODULE))) {
    const source = readFileSync(
      join(root, COPILOT_HALLUCINATION_REGRESSION_P2_71_PATTERNS_MODULE),
      "utf8",
    );
    patternsWired =
      source.includes("detectCopilotHallucinationRegression") &&
      source.includes("COPILOT_HALLUCINATION_REGRESSION_EXTRA_PATTERNS");
  }

  let builderWired = false;
  if (existsSync(join(root, COPILOT_HALLUCINATION_REGRESSION_P2_71_BUILDER))) {
    const source = readFileSync(join(root, COPILOT_HALLUCINATION_REGRESSION_P2_71_BUILDER), "utf8");
    builderWired =
      source.includes("answerCopilotQuestionFromSnapshot") &&
      source.includes("detectCopilotAnswerHallucination");
  }

  let copilotServiceWired = false;
  if (existsSync(join(root, COPILOT_HALLUCINATION_REGRESSION_P2_71_COPILOT_SERVICE))) {
    const source = readFileSync(
      join(root, COPILOT_HALLUCINATION_REGRESSION_P2_71_COPILOT_SERVICE),
      "utf8",
    );
    copilotServiceWired =
      source.includes("answerCopilotQuestionFromSnapshot") &&
      source.includes("buildDeterministicChatReply");
  }

  let guardrailsWired = false;
  if (existsSync(join(root, COPILOT_HALLUCINATION_REGRESSION_P2_71_GUARDRAILS))) {
    const source = readFileSync(
      join(root, COPILOT_HALLUCINATION_REGRESSION_P2_71_GUARDRAILS),
      "utf8",
    );
    guardrailsWired = source.includes("runOutboundGuardrail");
  }

  let noHallucinationWired = false;
  if (existsSync(join(root, COPILOT_HALLUCINATION_REGRESSION_P2_71_NO_HALLUCINATION))) {
    const source = readFileSync(
      join(root, COPILOT_HALLUCINATION_REGRESSION_P2_71_NO_HALLUCINATION),
      "utf8",
    );
    noHallucinationWired = source.includes("detectUnsupportedClaim");
  }

  const corpus = buildCopilotHallucinationCorpusP271();
  const result = runCopilotHallucinationRegressionP271(corpus);
  const artifactPresent = existsSync(
    join(root, COPILOT_HALLUCINATION_REGRESSION_P2_71_ARTIFACT),
  );

  const passed =
    wiringComplete &&
    patternsWired &&
    builderWired &&
    copilotServiceWired &&
    guardrailsWired &&
    noHallucinationWired &&
    corpus.length === COPILOT_HALLUCINATION_REGRESSION_P2_71_SCENARIO_COUNT &&
    result.passed &&
    artifactPresent;

  return {
    policyId: COPILOT_HALLUCINATION_REGRESSION_P2_71_POLICY_ID,
    wiringComplete,
    patternsWired,
    builderWired,
    copilotServiceWired,
    guardrailsWired,
    noHallucinationWired,
    corpusLoaded: corpus.length === COPILOT_HALLUCINATION_REGRESSION_P2_71_SCENARIO_COUNT,
    scoringPassed: result.passed,
    passPct: result.passPct,
    hallucinationPct: result.hallucinationPct,
    artifactPresent,
    passed,
  };
}

export function formatCopilotHallucinationRegressionP271AuditLines(
  summary: CopilotHallucinationRegressionP271AuditSummary,
): string[] {
  return [
    `Co-pilot hallucination regression (${summary.policyId})`,
    `Wiring paths: ${summary.wiringComplete ? "yes" : "no"}`,
    `Patterns module: ${summary.patternsWired ? "wired" : "missing"}`,
    `Builder: ${summary.builderWired ? "wired" : "missing"}`,
    `Copilot service: ${summary.copilotServiceWired ? "wired" : "missing"}`,
    `Guardrails: ${summary.guardrailsWired ? "yes" : "no"}`,
    `No-hallucination mode: ${summary.noHallucinationWired ? "yes" : "no"}`,
    `Corpus: ${summary.corpusLoaded ? "yes" : "no"} (${COPILOT_HALLUCINATION_REGRESSION_P2_71_SCENARIO_COUNT} scenarios)`,
    `Pass rate: ${summary.passPct}%`,
    `Hallucination rate: ${summary.hallucinationPct}%`,
    `Scoring passed: ${summary.scoringPassed ? "yes" : "no"}`,
    `Artifact: ${summary.artifactPresent ? "present" : "missing"}`,
    `Eval note: ${COPILOT_HALLUCINATION_REGRESSION_P2_71_EVAL_NOTE}`,
    `Passed: ${summary.passed ? "YES" : "NO"}`,
  ];
}
