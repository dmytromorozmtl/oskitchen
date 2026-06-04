import type { BetaEnvReadinessRowsContract } from "@/lib/integrations/beta-env-readiness-rows-e2e-policy";

export function summarizeBetaEnvReadinessRowsResult(
  input: BetaEnvReadinessRowsContract,
): BetaEnvReadinessRowsContract {
  return { ...input };
}

export function betaEnvReadinessRowsSucceeded(
  summary: BetaEnvReadinessRowsContract,
): boolean {
  return summary.panelVisible && summary.rowCount === summary.expectedCount && summary.allRowsHaveStatusBadge;
}
