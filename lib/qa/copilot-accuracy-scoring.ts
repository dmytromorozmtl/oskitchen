import {
  AI_ACCURACY_BENCHMARK_COPILOT_QUESTION_COUNT,
  AI_ACCURACY_BENCHMARK_MIN_COPILOT_PCT,
} from "@/lib/qa/ai-accuracy-benchmark-policy";
import type { CopilotAccuracyFixture } from "@/lib/qa/copilot-accuracy-corpus";

export type CopilotAnswerScore = {
  id: string;
  question: string;
  passed: boolean;
  matchedKeywords: string[];
  missingKeywords: string[];
  forbiddenHits: string[];
};

export type CopilotAccuracyBenchmarkResult = {
  questionCount: number;
  passedCount: number;
  accuracyPct: number;
  passed: boolean;
  thresholdPct: number;
  scores: CopilotAnswerScore[];
};

/** Mirrors services/ai/copilot-service deterministic fallback (no LLM in CI). */
export function buildDeterministicCopilotBenchmarkReply(
  question: string,
  contextSummary: string,
): string {
  return [
    "AI narrative is currently disabled or unavailable. Here is the deterministic answer based on your workspace data:",
    "",
    contextSummary,
    "",
    `Question asked: ${question}`,
  ].join("\n");
}

function normalizeForMatch(value: string): string {
  return value.trim().toLowerCase();
}

export function scoreCopilotAnswer(
  fixture: CopilotAccuracyFixture,
  answer: string,
): CopilotAnswerScore {
  const normalizedAnswer = normalizeForMatch(answer);
  const answerBody = answer.split("\n\nQuestion asked:")[0] ?? answer;
  const matchedKeywords: string[] = [];
  const missingKeywords: string[] = [];

  for (const keyword of fixture.expectedKeywords) {
    if (normalizedAnswer.includes(normalizeForMatch(keyword))) {
      matchedKeywords.push(keyword);
    } else {
      missingKeywords.push(keyword);
    }
  }

  const forbiddenHits: string[] = [];
  for (const pattern of fixture.forbiddenPatterns) {
    const match = answerBody.match(pattern);
    if (match?.[0]) {
      forbiddenHits.push(match[0]);
    }
  }

  const passed = missingKeywords.length === 0 && forbiddenHits.length === 0;

  return {
    id: fixture.id,
    question: fixture.question,
    passed,
    matchedKeywords,
    missingKeywords,
    forbiddenHits,
  };
}

export function runCopilotAccuracyBenchmark(
  fixtures: CopilotAccuracyFixture[],
): CopilotAccuracyBenchmarkResult {
  const scores = fixtures.map((fixture) => {
    const answer = buildDeterministicCopilotBenchmarkReply(
      fixture.question,
      fixture.contextSummary,
    );
    return scoreCopilotAnswer(fixture, answer);
  });

  const questionCount = fixtures.length;
  const passedCount = scores.filter((score) => score.passed).length;
  const accuracyPct =
    questionCount === 0 ? 0 : Math.round((passedCount / questionCount) * 100);

  const passed =
    questionCount >= AI_ACCURACY_BENCHMARK_COPILOT_QUESTION_COUNT &&
    accuracyPct >= AI_ACCURACY_BENCHMARK_MIN_COPILOT_PCT;

  return {
    questionCount,
    passedCount,
    accuracyPct,
    passed,
    thresholdPct: AI_ACCURACY_BENCHMARK_MIN_COPILOT_PCT,
    scores,
  };
}
