import type { LiveIntegrationDodGatesContract } from "@/lib/integrations/live-integration-dod-gates-e2e-policy";

export function summarizeLiveIntegrationDodGatesResult(
  input: LiveIntegrationDodGatesContract,
): LiveIntegrationDodGatesContract {
  return { ...input };
}

export function liveIntegrationDodGatesSucceeded(
  summary: LiveIntegrationDodGatesContract,
): boolean {
  return summary.panelVisible && summary.allG3NotMeasured && summary.allG4NotMeasured;
}
