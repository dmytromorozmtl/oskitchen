import {
  INTEGRATION_SANDBOX_EXPECTED_COUNT,
  INTEGRATION_SANDBOX_FLEET,
  INTEGRATION_SANDBOX_POLICY_ID,
  INTEGRATION_SANDBOX_SHARED_ENV_KEYS,
} from "@/lib/integrations/integration-sandbox-policy";
import type { LiveIntegrationsStagingSmokeFleetEntry } from "@/lib/integrations/live-integrations-staging-smoke-policy";
import { listMissingLiveIntegrationsStagingSharedEnvVars } from "@/lib/integrations/live-integrations-staging-smoke-summary";

export type IntegrationSandboxEnv = Record<string, string | undefined>;

export type IntegrationSandboxCredentialRow = {
  integrationId: string;
  name: string;
  kind: LiveIntegrationsStagingSmokeFleetEntry["kind"];
  configured: boolean;
  missingKeys: string[];
  presentKeys: string[];
  smokeScript: string | null;
};

export type IntegrationSandboxReadiness = {
  policyId: typeof INTEGRATION_SANDBOX_POLICY_ID;
  expectedCount: typeof INTEGRATION_SANDBOX_EXPECTED_COUNT;
  sharedMissing: string[];
  merchantConfiguredCount: number;
  merchantMissingCount: number;
  integrationHealthReady: boolean;
  rows: IntegrationSandboxCredentialRow[];
};

function envValue(env: IntegrationSandboxEnv, key: string): string | undefined {
  return env[key]?.trim() || undefined;
}

/** True when at least one direct merchant env key is set for the integration. */
export function hasDirectMerchantSandboxCredentials(
  entry: LiveIntegrationsStagingSmokeFleetEntry,
  env: IntegrationSandboxEnv = process.env,
): boolean {
  if (entry.kind !== "merchant_live") return false;
  return entry.merchantEnvKeys.some((key) => Boolean(envValue(env, key)));
}

/** True when DB-backed channel smoke path is configured (shared tenant anchor). */
export function hasChannelSmokeDbPath(env: IntegrationSandboxEnv = process.env): boolean {
  return (
    Boolean(envValue(env, "CHANNEL_SMOKE_CONNECTION_ID")) ||
    Boolean(envValue(env, "CHANNEL_SMOKE_OWNER_EMAIL"))
  );
}

export function listMissingMerchantSandboxKeys(
  entry: LiveIntegrationsStagingSmokeFleetEntry,
  env: IntegrationSandboxEnv = process.env,
): string[] {
  if (entry.kind !== "merchant_live") return [];
  return entry.merchantEnvKeys.filter((key) => !envValue(env, key));
}

export function listPresentMerchantSandboxKeys(
  entry: LiveIntegrationsStagingSmokeFleetEntry,
  env: IntegrationSandboxEnv = process.env,
): string[] {
  if (entry.kind !== "merchant_live") return [];
  return entry.merchantEnvKeys.filter((key) => Boolean(envValue(env, key)));
}

/** Resolve non-secret credential map for an integration (values only when present). */
export function resolveIntegrationSandboxCredentials(
  integrationId: string,
  env: IntegrationSandboxEnv = process.env,
): Record<string, string> | null {
  const entry = INTEGRATION_SANDBOX_FLEET.find((row) => row.integrationId === integrationId);
  if (!entry || entry.kind !== "merchant_live") return null;

  const credentials: Record<string, string> = {};
  for (const key of entry.merchantEnvKeys) {
    const value = envValue(env, key);
    if (value) credentials[key] = value;
  }
  return Object.keys(credentials).length > 0 ? credentials : null;
}

export function isIntegrationSandboxConfigured(
  integrationId: string,
  env: IntegrationSandboxEnv = process.env,
): boolean {
  const entry = INTEGRATION_SANDBOX_FLEET.find((row) => row.integrationId === integrationId);
  if (!entry) return false;
  if (entry.kind === "integration_health_probe") {
    return Boolean(envValue(env, "E2E_STAGING_BASE_URL"));
  }
  return hasDirectMerchantSandboxCredentials(entry, env) || hasChannelSmokeDbPath(env);
}

export function auditIntegrationSandboxReadiness(
  env: IntegrationSandboxEnv = process.env,
): IntegrationSandboxReadiness {
  const sharedMissing = listMissingLiveIntegrationsStagingSharedEnvVars({
    stagingBaseUrl: envValue(env, "E2E_STAGING_BASE_URL") ?? null,
    databaseUrl: envValue(env, "DATABASE_URL") ?? null,
    encryptionKey: envValue(env, "ENCRYPTION_KEY") ?? null,
    connectionId: envValue(env, "CHANNEL_SMOKE_CONNECTION_ID") ?? null,
    ownerEmail: envValue(env, "CHANNEL_SMOKE_OWNER_EMAIL") ?? null,
  });

  const dbPath = hasChannelSmokeDbPath(env);
  const rows: IntegrationSandboxCredentialRow[] = INTEGRATION_SANDBOX_FLEET.map((entry) => {
    if (entry.kind === "integration_health_probe") {
      const stagingReady = Boolean(envValue(env, "E2E_STAGING_BASE_URL"));
      return {
        integrationId: entry.integrationId,
        name: entry.name,
        kind: entry.kind,
        configured: stagingReady,
        missingKeys: stagingReady ? [] : ["E2E_STAGING_BASE_URL"],
        presentKeys: stagingReady ? ["E2E_STAGING_BASE_URL"] : [],
        smokeScript: entry.smokeScript,
      };
    }

    const presentKeys = listPresentMerchantSandboxKeys(entry, env);
    const missingKeys = listMissingMerchantSandboxKeys(entry, env);
    const configured = presentKeys.length > 0 || dbPath;

    return {
      integrationId: entry.integrationId,
      name: entry.name,
      kind: entry.kind,
      configured,
      missingKeys: configured ? [] : [...missingKeys],
      presentKeys,
      smokeScript: entry.smokeScript,
    };
  });

  const merchantRows = rows.filter((row) => row.kind === "merchant_live");
  const merchantConfiguredCount = merchantRows.filter((row) => row.configured).length;

  return {
    policyId: INTEGRATION_SANDBOX_POLICY_ID,
    expectedCount: INTEGRATION_SANDBOX_EXPECTED_COUNT,
    sharedMissing,
    merchantConfiguredCount,
    merchantMissingCount: merchantRows.length - merchantConfiguredCount,
    integrationHealthReady: rows.some(
      (row) => row.integrationId === "integration-health" && row.configured,
    ),
    rows,
  };
}

export function formatIntegrationSandboxReportLines(
  readiness: IntegrationSandboxReadiness,
): string[] {
  return [
    `Integration sandbox (${readiness.policyId})`,
    `Expected surfaces: ${readiness.expectedCount}`,
    `Merchant configured: ${readiness.merchantConfiguredCount}/${readiness.expectedCount - 1}`,
    readiness.sharedMissing.length > 0
      ? `Shared env missing: ${readiness.sharedMissing.join(", ")}`
      : "Shared env: complete",
    "",
    ...readiness.rows.map((row) => {
      const status = row.configured ? "CONFIGURED" : "MISSING";
      const detail =
        row.presentKeys.length > 0
          ? `keys: ${row.presentKeys.join(", ")}`
          : row.missingKeys.length > 0
            ? `needs: ${row.missingKeys.join(", ")}`
            : "DB channel path";
      return `[${status}] ${row.name} (${row.integrationId}) — ${detail}`;
    }),
  ];
}

export { INTEGRATION_SANDBOX_SHARED_ENV_KEYS };
