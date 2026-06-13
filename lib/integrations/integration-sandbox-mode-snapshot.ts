import {
  auditIntegrationSandboxReadiness,
  type IntegrationSandboxReadiness,
} from "@/lib/integrations/integration-sandbox-service";

export type IntegrationSandboxModeRow = {
  integrationId: string;
  name: string;
  configured: boolean;
  presentKeyCount: number;
  missingKeys: string[];
};

export type IntegrationSandboxModeSnapshot = {
  expectedCount: number;
  merchantConfiguredCount: number;
  merchantMissingCount: number;
  sharedMissing: string[];
  integrationHealthReady: boolean;
  rows: IntegrationSandboxModeRow[];
};

export function buildIntegrationSandboxModeSnapshot(
  env: Record<string, string | undefined> = process.env,
): IntegrationSandboxModeSnapshot {
  const readiness = auditIntegrationSandboxReadiness(env);
  return toIntegrationSandboxModeSnapshot(readiness);
}

export function toIntegrationSandboxModeSnapshot(
  readiness: IntegrationSandboxReadiness,
): IntegrationSandboxModeSnapshot {
  return {
    expectedCount: readiness.expectedCount,
    merchantConfiguredCount: readiness.merchantConfiguredCount,
    merchantMissingCount: readiness.merchantMissingCount,
    sharedMissing: readiness.sharedMissing,
    integrationHealthReady: readiness.integrationHealthReady,
    rows: readiness.rows.map((row) => ({
      integrationId: row.integrationId,
      name: row.name,
      configured: row.configured,
      presentKeyCount: row.presentKeys.length,
      missingKeys: row.configured ? [] : row.missingKeys,
    })),
  };
}
