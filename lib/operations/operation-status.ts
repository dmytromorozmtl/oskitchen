/** Workspace-wide operational rollup — not persisted as a single enum. */
export type OperationalHealthStatus = "HEALTHY" | "DEGRADED" | "CRITICAL";

export function operationalHealthFromSignals(input: {
  criticalBlockers: number;
  highBlockers: number;
  failedWebhooks: number;
  integrationErrors: number;
  integrityIssues: number;
}): OperationalHealthStatus {
  if (
    input.criticalBlockers > 0 ||
    input.integrationErrors > 5 ||
    input.integrityIssues > 20
  ) {
    return "CRITICAL";
  }
  if (
    input.highBlockers > 0 ||
    input.failedWebhooks > 0 ||
    input.integrationErrors > 0 ||
    input.integrityIssues > 0
  ) {
    return "DEGRADED";
  }
  return "HEALTHY";
}
