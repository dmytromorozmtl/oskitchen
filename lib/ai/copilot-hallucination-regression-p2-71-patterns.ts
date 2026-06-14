import { detectCopilotAnswerHallucination } from "@/lib/ai/copilot-accuracy-benchmark-p2-69-builder";

/** Extended forbidden patterns for P2-71 hallucination regression (beyond P2-69 base set). */
export const COPILOT_HALLUCINATION_REGRESSION_EXTRA_PATTERNS = [
  /\bfda approved\b/i,
  /\ballergen-free\b/i,
  /\bsoc\s*2 compliant\b/i,
  /\b100% safe\b/i,
  /\bguarantee\b/i,
  /\balways profitable\b/i,
  /\bmarket[- ]dominat/i,
  /\bcertified organic\b/i,
  /\bpci dss level 1\b/i,
  /\btoast is better\b/i,
] as const;

export function detectCopilotHallucinationRegression(answer: string): boolean {
  if (detectCopilotAnswerHallucination(answer)) return true;
  return COPILOT_HALLUCINATION_REGRESSION_EXTRA_PATTERNS.some((pattern) =>
    pattern.test(answer),
  );
}

export function findCopilotHallucinationRegressionMatches(answer: string): string[] {
  const matches: string[] = [];
  if (detectCopilotAnswerHallucination(answer)) {
    matches.push("base-hallucination-pattern");
  }
  for (const pattern of COPILOT_HALLUCINATION_REGRESSION_EXTRA_PATTERNS) {
    if (pattern.test(answer)) {
      matches.push(pattern.source);
    }
  }
  return matches;
}
