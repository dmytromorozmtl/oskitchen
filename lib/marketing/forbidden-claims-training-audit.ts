import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
  FORBIDDEN_CLAIMS_TRAINING_CERTIFICATION_TEST_ID,
  FORBIDDEN_CLAIMS_TRAINING_DOC,
  FORBIDDEN_CLAIMS_TRAINING_HEADLINE,
  FORBIDDEN_CLAIMS_TRAINING_HONESTY_MARKERS,
  FORBIDDEN_CLAIMS_TRAINING_PAGE,
  FORBIDDEN_CLAIMS_TRAINING_PASS_THRESHOLD,
  FORBIDDEN_CLAIMS_TRAINING_POLICY_ID,
  FORBIDDEN_CLAIMS_TRAINING_QUESTION_COUNT,
  FORBIDDEN_CLAIMS_TRAINING_QUIZ_COMPONENT,
  FORBIDDEN_CLAIMS_TRAINING_QUIZ_TEST_ID,
  FORBIDDEN_CLAIMS_TRAINING_ROUTE,
  FORBIDDEN_CLAIMS_TRAINING_WIRING_PATHS,
} from "@/lib/marketing/forbidden-claims-training-policy";

export type ForbiddenClaimsTrainingAuditSummary = {
  policyId: typeof FORBIDDEN_CLAIMS_TRAINING_POLICY_ID;
  wiringComplete: boolean;
  docWired: boolean;
  quizComponentWired: boolean;
  pageWired: boolean;
  questionCountCorrect: boolean;
  passThresholdCorrect: boolean;
  trustPageLinked: boolean;
  honestyMarkersPresent: boolean;
  passed: boolean;
};

export function auditForbiddenClaimsTraining(
  root = process.cwd(),
): ForbiddenClaimsTrainingAuditSummary {
  const wiringComplete = FORBIDDEN_CLAIMS_TRAINING_WIRING_PATHS.every((rel) =>
    existsSync(join(root, rel)),
  );

  let docWired = false;
  let quizComponentWired = false;
  let pageWired = false;
  let questionCountCorrect = false;
  let passThresholdCorrect = false;
  let trustPageLinked = false;

  if (existsSync(join(root, FORBIDDEN_CLAIMS_TRAINING_DOC))) {
    const source = readFileSync(join(root, FORBIDDEN_CLAIMS_TRAINING_DOC), "utf8");
    docWired =
      source.includes(FORBIDDEN_CLAIMS_TRAINING_HEADLINE) &&
      source.includes(FORBIDDEN_CLAIMS_TRAINING_ROUTE) &&
      source.includes("Certification quiz") &&
      source.includes(String(FORBIDDEN_CLAIMS_TRAINING_PASS_THRESHOLD));
  }

  if (existsSync(join(root, FORBIDDEN_CLAIMS_TRAINING_QUIZ_COMPONENT))) {
    const source = readFileSync(join(root, FORBIDDEN_CLAIMS_TRAINING_QUIZ_COMPONENT), "utf8");
    quizComponentWired =
      source.includes("ForbiddenClaimsTrainingQuiz") &&
      source.includes("FORBIDDEN_CLAIMS_TRAINING_QUIZ") &&
      source.includes("FORBIDDEN_CLAIMS_TRAINING_QUIZ_TEST_ID") &&
      source.includes("FORBIDDEN_CLAIMS_TRAINING_CERTIFICATION_TEST_ID");
    questionCountCorrect = source.includes("FORBIDDEN_CLAIMS_TRAINING_QUESTION_COUNT");
    passThresholdCorrect = source.includes("FORBIDDEN_CLAIMS_TRAINING_PASS_THRESHOLD");
  }

  if (existsSync(join(root, FORBIDDEN_CLAIMS_TRAINING_PAGE))) {
    const source = readFileSync(join(root, FORBIDDEN_CLAIMS_TRAINING_PAGE), "utf8");
    pageWired =
      source.includes("ForbiddenClaimsTrainingQuiz") &&
      source.includes(FORBIDDEN_CLAIMS_TRAINING_ROUTE.replace("/trust", ""));
  }

  const trustPagePath = "app/trust/page.tsx";
  if (existsSync(join(root, trustPagePath))) {
    const source = readFileSync(join(root, trustPagePath), "utf8");
    trustPageLinked = source.includes(FORBIDDEN_CLAIMS_TRAINING_ROUTE);
  }

  const combinedSources = [
    FORBIDDEN_CLAIMS_TRAINING_DOC,
    FORBIDDEN_CLAIMS_TRAINING_QUIZ_COMPONENT,
    "lib/marketing/forbidden-claims-training-content.ts",
  ]
    .filter((rel) => existsSync(join(root, rel)))
    .map((rel) => readFileSync(join(root, rel), "utf8"))
    .join("\n");

  const honestyMarkersPresent = FORBIDDEN_CLAIMS_TRAINING_HONESTY_MARKERS.every((marker) =>
    combinedSources.includes(marker),
  );

  const passed =
    wiringComplete &&
    docWired &&
    quizComponentWired &&
    pageWired &&
    questionCountCorrect &&
    passThresholdCorrect &&
    trustPageLinked &&
    honestyMarkersPresent;

  return {
    policyId: FORBIDDEN_CLAIMS_TRAINING_POLICY_ID,
    wiringComplete,
    docWired,
    quizComponentWired,
    pageWired,
    questionCountCorrect,
    passThresholdCorrect,
    trustPageLinked,
    honestyMarkersPresent,
    passed,
  };
}

export function formatForbiddenClaimsTrainingAuditLines(
  summary: ForbiddenClaimsTrainingAuditSummary,
): string[] {
  return [
    `Forbidden claims training audit (${summary.policyId})`,
    `Wiring paths: ${summary.wiringComplete ? "yes" : "no"}`,
    `Doc (${FORBIDDEN_CLAIMS_TRAINING_DOC}): ${summary.docWired ? "yes" : "no"}`,
    `Quiz (${FORBIDDEN_CLAIMS_TRAINING_QUIZ_TEST_ID}): ${summary.quizComponentWired ? "yes" : "no"}`,
    `Training page wired: ${summary.pageWired ? "yes" : "no"}`,
    `Questions (${FORBIDDEN_CLAIMS_TRAINING_QUESTION_COUNT}): ${summary.questionCountCorrect ? "yes" : "no"}`,
    `Pass threshold (${FORBIDDEN_CLAIMS_TRAINING_PASS_THRESHOLD}/10): ${summary.passThresholdCorrect ? "yes" : "no"}`,
    `Trust page linked: ${summary.trustPageLinked ? "yes" : "no"}`,
    `Honesty markers: ${summary.honestyMarkersPresent ? "yes" : "no"}`,
    `Passed: ${summary.passed ? "YES" : "NO"}`,
  ];
}
