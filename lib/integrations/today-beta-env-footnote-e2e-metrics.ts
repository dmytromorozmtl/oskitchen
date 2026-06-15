import type { TodayBetaEnvFootnoteContract } from "@/lib/integrations/today-beta-env-footnote-e2e-policy";

export function summarizeTodayBetaEnvFootnoteResult(
  input: TodayBetaEnvFootnoteContract,
): TodayBetaEnvFootnoteContract {
  return { ...input };
}

export function todayBetaEnvFootnoteSucceeded(
  summary: TodayBetaEnvFootnoteContract,
): boolean {
  return summary.healthStripVisible && summary.footnoteVisible && summary.badgeSumMatchesTotal;
}
