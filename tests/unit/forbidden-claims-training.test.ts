import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  FORBIDDEN_CLAIMS_CHEAT_SHEET_COLUMN_LABELS,
  FORBIDDEN_CLAIMS_CHEAT_SHEET_ENTRIES,
  FORBIDDEN_CLAIMS_CHEAT_SHEET_HEADLINE,
  FORBIDDEN_CLAIMS_CHEAT_SHEET_MIN_ENTRIES,
  FORBIDDEN_CLAIMS_CHEAT_SHEET_VERDICT_COUNTS,
} from "@/lib/marketing/forbidden-claims-cheat-sheet-content";
import {
  auditForbiddenClaimsTraining,
  formatForbiddenClaimsTrainingAuditLines,
} from "@/lib/marketing/forbidden-claims-training-audit";
import { FORBIDDEN_CLAIMS_TRAINING_QUIZ } from "@/lib/marketing/forbidden-claims-training-content";
import {
  FORBIDDEN_CLAIMS_CHEAT_SHEET_DOC,
  FORBIDDEN_CLAIMS_CHEAT_SHEET_P1_26_POLICY_ID,
  FORBIDDEN_CLAIMS_TRAINING_CHECK_NPM_SCRIPT,
  FORBIDDEN_CLAIMS_TRAINING_CI_WORKFLOW,
  FORBIDDEN_CLAIMS_TRAINING_DOC,
  FORBIDDEN_CLAIMS_TRAINING_HEADLINE,
  FORBIDDEN_CLAIMS_TRAINING_NPM_SCRIPT,
  FORBIDDEN_CLAIMS_TRAINING_PASS_THRESHOLD,
  FORBIDDEN_CLAIMS_TRAINING_POLICY_ID,
  FORBIDDEN_CLAIMS_TRAINING_QUESTION_COUNT,
  FORBIDDEN_CLAIMS_TRAINING_QUIZ_TEST_ID,
  FORBIDDEN_CLAIMS_TRAINING_ROUTE,
  FORBIDDEN_CLAIMS_TRAINING_UNIT_TEST,
} from "@/lib/marketing/forbidden-claims-training-policy";
import { gradeQuiz } from "@/lib/training/quiz-engine";

const ROOT = process.cwd();

describe("Forbidden claims training + cheat-sheet (P1-26 + P1-84)", () => {
  it("locks policy ids, cheat-sheet columns, and quiz threshold", () => {
    expect(FORBIDDEN_CLAIMS_CHEAT_SHEET_P1_26_POLICY_ID).toBe(
      "forbidden-claims-cheat-sheet-p1-26-v1",
    );
    expect(FORBIDDEN_CLAIMS_TRAINING_POLICY_ID).toBe("forbidden-claims-training-p1-84-v1");
    expect(FORBIDDEN_CLAIMS_CHEAT_SHEET_COLUMN_LABELS).toEqual(["SAFE", "CAVEAT", "NEVER"]);
    expect(FORBIDDEN_CLAIMS_CHEAT_SHEET_HEADLINE).toContain("не говорить");
    expect(FORBIDDEN_CLAIMS_CHEAT_SHEET_ENTRIES.length).toBeGreaterThanOrEqual(
      FORBIDDEN_CLAIMS_CHEAT_SHEET_MIN_ENTRIES,
    );
    expect(FORBIDDEN_CLAIMS_CHEAT_SHEET_VERDICT_COUNTS.SAFE).toBeGreaterThanOrEqual(4);
    expect(FORBIDDEN_CLAIMS_CHEAT_SHEET_VERDICT_COUNTS.CAVEAT).toBeGreaterThanOrEqual(5);
    expect(FORBIDDEN_CLAIMS_CHEAT_SHEET_VERDICT_COUNTS.NEVER).toBeGreaterThanOrEqual(6);
    expect(FORBIDDEN_CLAIMS_TRAINING_ROUTE).toBe("/trust/forbidden-claims-training");
    expect(FORBIDDEN_CLAIMS_TRAINING_HEADLINE).toContain("quiz");
    expect(FORBIDDEN_CLAIMS_TRAINING_QUESTION_COUNT).toBe(10);
    expect(FORBIDDEN_CLAIMS_TRAINING_PASS_THRESHOLD).toBe(8);
    expect(FORBIDDEN_CLAIMS_TRAINING_QUIZ.questions).toHaveLength(10);
  });

  it("passes full forbidden claims training audit including P1-26 cheat-sheet", () => {
    const summary = auditForbiddenClaimsTraining(ROOT);
    expect(summary.wiringComplete).toBe(true);
    expect(summary.docWired).toBe(true);
    expect(summary.cheatSheetWired).toBe(true);
    expect(summary.quizComponentWired).toBe(true);
    expect(summary.pageWired).toBe(true);
    expect(summary.questionCountCorrect).toBe(true);
    expect(summary.passThresholdCorrect).toBe(true);
    expect(summary.trustPageLinked).toBe(true);
    expect(summary.honestyMarkersPresent).toBe(true);
    expect(summary.passed).toBe(true);
  });

  it("grades perfect answers as certified pass", () => {
    const answers = FORBIDDEN_CLAIMS_TRAINING_QUIZ.questions.map((question) => ({
      questionId: question.id,
      selectedOptionId: question.options?.find((option) => option.correct)?.id,
    }));
    const grade = gradeQuiz(FORBIDDEN_CLAIMS_TRAINING_QUIZ, answers);
    expect(grade.score).toBe(100);
    expect(grade.passed).toBe(true);
  });

  it("ships quiz component with test ids", () => {
    const source = readFileSync(
      join(ROOT, "components/marketing/forbidden-claims-training-quiz.tsx"),
      "utf8",
    );
    expect(source).toContain("ForbiddenClaimsTrainingQuiz");
    expect(source).toContain("FORBIDDEN_CLAIMS_TRAINING_QUIZ_TEST_ID");
    expect(source).toContain("FORBIDDEN_CLAIMS_TRAINING_CERTIFICATION_TEST_ID");
    expect(source).toContain("forbidden-claims-question-");
  });

  it("registers audit script, check script, and deploy gate", () => {
    expect(existsSync(join(ROOT, FORBIDDEN_CLAIMS_TRAINING_DOC))).toBe(true);
    expect(existsSync(join(ROOT, FORBIDDEN_CLAIMS_CHEAT_SHEET_DOC))).toBe(true);
    expect(existsSync(join(ROOT, FORBIDDEN_CLAIMS_TRAINING_UNIT_TEST))).toBe(true);

    const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
      scripts?: Record<string, string>;
    };
    expect(pkg.scripts?.[FORBIDDEN_CLAIMS_TRAINING_NPM_SCRIPT]).toContain(
      "audit-forbidden-claims-training.ts",
    );
    expect(pkg.scripts?.[FORBIDDEN_CLAIMS_TRAINING_CHECK_NPM_SCRIPT]).toContain(
      FORBIDDEN_CLAIMS_TRAINING_UNIT_TEST,
    );

    const archive = JSON.parse(
      readFileSync(join(ROOT, "config/npm-scripts/archive-v1.json"), "utf8"),
    ) as { scripts?: Record<string, string> };
    expect(archive.scripts?.["test:ci:forbidden-claims-training"]).toContain(
      FORBIDDEN_CLAIMS_TRAINING_UNIT_TEST,
    );

    const workflow = readFileSync(join(ROOT, FORBIDDEN_CLAIMS_TRAINING_CI_WORKFLOW), "utf8");
    expect(workflow).toContain("forbidden-claims-training");
  });

  it("formats audit lines", () => {
    const summary = auditForbiddenClaimsTraining(ROOT);
    const lines = formatForbiddenClaimsTrainingAuditLines(summary);
    expect(lines.some((line) => line.includes(FORBIDDEN_CLAIMS_TRAINING_POLICY_ID))).toBe(true);
    expect(lines.some((line) => line.includes(FORBIDDEN_CLAIMS_CHEAT_SHEET_P1_26_POLICY_ID))).toBe(
      true,
    );
    expect(lines.some((line) => line.includes(FORBIDDEN_CLAIMS_TRAINING_QUIZ_TEST_ID))).toBe(true);
    expect(lines.some((line) => line.includes("Passed: YES"))).toBe(true);
  });
});
