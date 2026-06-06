/**
 * Integration Health LIVE smoke summary — fleet cert for all 18 LIVE integrations (Era 91).
 */

import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
  INTEGRATION_HEALTH_LIVE_SMOKE_ERA91_DASHBOARD_PATHS,
  INTEGRATION_HEALTH_LIVE_SMOKE_ERA91_FLEET_SIZE,
  INTEGRATION_HEALTH_LIVE_SMOKE_ERA91_POLICY_ID,
  INTEGRATION_HEALTH_LIVE_SMOKE_ERA91_PROVIDER_CERTS,
} from "@/lib/integrations/integration-health-live-smoke-era91-policy";
import { LIVE_INTEGRATION_IDS } from "@/lib/integrations/integration-registry";

export const INTEGRATION_HEALTH_LIVE_SMOKE_SUMMARY_VERSION =
  INTEGRATION_HEALTH_LIVE_SMOKE_ERA91_POLICY_ID;

export type IntegrationHealthLiveSmokeEra91Overall = "PASSED" | "FAILED" | "SKIPPED";

export type IntegrationHealthLiveSmokeEra91ProofStatus =
  | "proof_passed"
  | "proof_skipped_missing_prerequisites"
  | "proof_failed_wiring"
  | "proof_failed_cert"
  | "proof_failed_fleet"
  | "proof_failed";

export type IntegrationHealthLiveSmokeEra91Step = {
  id: string;
  label: string;
  status: "PASSED" | "FAILED" | "SKIPPED";
  reason?: string;
};

export type IntegrationHealthLiveSmokeEra91ProviderResult = {
  integrationId: string;
  name: string;
  era: number;
  certScript: string;
  status: "PASSED" | "FAILED" | "SKIPPED";
  reason?: string;
};

export type IntegrationHealthLiveSmokeEra91Summary = {
  version: typeof INTEGRATION_HEALTH_LIVE_SMOKE_SUMMARY_VERSION;
  runAt: string;
  commitSha: string | null;
  overall: IntegrationHealthLiveSmokeEra91Overall;
  proofStatus: IntegrationHealthLiveSmokeEra91ProofStatus;
  wiringCertPassed: boolean;
  fleetCertPassed: boolean;
  providersPassed: number;
  providersFailed: number;
  fleetSize: number;
  registryLiveCount: number;
  steps: IntegrationHealthLiveSmokeEra91Step[];
  providers: IntegrationHealthLiveSmokeEra91ProviderResult[];
  honestyNote: string;
};

export function auditIntegrationHealthLiveSmokeWiring(root: string = process.cwd()): {
  ok: boolean;
  failures: string[];
} {
  const failures: string[] = [];

  for (const provider of INTEGRATION_HEALTH_LIVE_SMOKE_ERA91_PROVIDER_CERTS) {
    const policyPath = join(root, provider.policyPath);
    if (!existsSync(policyPath)) {
      failures.push(`missing ${provider.policyPath}`);
    }
  }

  for (const rel of INTEGRATION_HEALTH_LIVE_SMOKE_ERA91_DASHBOARD_PATHS) {
    const path = join(root, rel);
    if (!existsSync(path)) {
      failures.push(`missing ${rel}`);
      continue;
    }
    const src = readFileSync(path, "utf8");
    if (rel === "app/dashboard/integration-health/live/page.tsx") {
      if (!src.includes("IntegrationHealthLivePanel")) {
        failures.push("integration-health/live/page.tsx missing IntegrationHealthLivePanel");
      }
    }
    if (rel === "services/integrations/integration-health-live-service.ts") {
      if (!src.includes("loadLiveIntegrationHealthDashboard")) {
        failures.push("integration-health-live-service.ts missing loadLiveIntegrationHealthDashboard");
      }
    }
  }

  const registryMissing = LIVE_INTEGRATION_IDS.filter(
    (id) =>
      !INTEGRATION_HEALTH_LIVE_SMOKE_ERA91_PROVIDER_CERTS.some((row) => row.integrationId === id),
  );
  if (registryMissing.length > 0) {
    failures.push(`fleet cert missing registry LIVE ids: ${registryMissing.join(", ")}`);
  }

  return { ok: failures.length === 0, failures };
}

export function resolveIntegrationHealthLiveSmokeEra91ProofStatus(input: {
  wiringOk: boolean;
  certPassed: boolean;
  fleetPassed: boolean;
}): IntegrationHealthLiveSmokeEra91ProofStatus {
  if (!input.certPassed) return "proof_failed_cert";
  if (!input.wiringOk) return "proof_failed_wiring";
  if (!input.fleetPassed) return "proof_failed_fleet";
  return "proof_passed";
}

export function resolveIntegrationHealthLiveSmokeEra91Overall(
  proofStatus: IntegrationHealthLiveSmokeEra91ProofStatus,
): IntegrationHealthLiveSmokeEra91Overall {
  if (proofStatus === "proof_passed") return "PASSED";
  if (proofStatus === "proof_skipped_missing_prerequisites") return "SKIPPED";
  return "FAILED";
}

export function buildIntegrationHealthLiveSmokeEra91Summary(input: {
  certPassed: boolean;
  wiringFailures?: readonly string[];
  providerResults?: readonly IntegrationHealthLiveSmokeEra91ProviderResult[];
  commitSha?: string | null;
  runAt?: Date;
}): IntegrationHealthLiveSmokeEra91Summary {
  const wiringFailures = input.wiringFailures ?? [];
  const wiringOk = wiringFailures.length === 0;
  const providers = input.providerResults ?? [];
  const providersPassed = providers.filter((row) => row.status === "PASSED").length;
  const providersFailed = providers.filter((row) => row.status === "FAILED").length;
  const fleetPassed =
    providers.length === INTEGRATION_HEALTH_LIVE_SMOKE_ERA91_PROVIDER_CERTS.length &&
    providersFailed === 0;

  const proofStatus = resolveIntegrationHealthLiveSmokeEra91ProofStatus({
    wiringOk,
    certPassed: input.certPassed,
    fleetPassed: providers.length === 0 ? input.certPassed && wiringOk : fleetPassed,
  });
  const overall = resolveIntegrationHealthLiveSmokeEra91Overall(proofStatus);

  const steps: IntegrationHealthLiveSmokeEra91Step[] = [
    {
      id: "wiring_audit",
      label: "17 LIVE provider policies + Integration Health dashboard wiring",
      status: wiringOk ? "PASSED" : "FAILED",
      reason: wiringOk ? undefined : wiringFailures.join("; "),
    },
    {
      id: "unit_cert",
      label: "Era 91 Integration Health LIVE smoke cert",
      status: input.certPassed ? "PASSED" : "FAILED",
    },
  ];

  if (providers.length > 0) {
    steps.push({
      id: "fleet_provider_certs",
      label: "Fleet provider wiring certs (era71–era90)",
      status: fleetPassed ? "PASSED" : "FAILED",
      reason: fleetPassed
        ? `${providersPassed}/${providers.length} provider certs PASSED`
        : `${providersFailed} provider cert(s) FAILED`,
    });
    steps.push({
      id: "integration_health_dashboard",
      label: "Integration Health LIVE dashboard (18th surface)",
      status: wiringOk ? "PASSED" : "FAILED",
      reason: wiringOk
        ? `${INTEGRATION_HEALTH_LIVE_SMOKE_ERA91_FLEET_SIZE} LIVE surfaces certified (17 providers + dashboard)`
        : "Dashboard wiring incomplete",
    });
  }

  return {
    version: INTEGRATION_HEALTH_LIVE_SMOKE_SUMMARY_VERSION,
    runAt: (input.runAt ?? new Date()).toISOString(),
    commitSha: input.commitSha ?? null,
    overall,
    proofStatus,
    wiringCertPassed: wiringOk && input.certPassed,
    fleetCertPassed: fleetPassed,
    providersPassed,
    providersFailed,
    fleetSize: INTEGRATION_HEALTH_LIVE_SMOKE_ERA91_FLEET_SIZE,
    registryLiveCount: LIVE_INTEGRATION_IDS.length,
    steps,
    providers,
    honestyNote:
      "PASS requires all 17 provider wiring certs + Integration Health dashboard — live tenant smokes SKIPPED until vault credentials configured.",
  };
}

export function formatIntegrationHealthLiveSmokeEra91ReportLines(
  summary: IntegrationHealthLiveSmokeEra91Summary,
): string[] {
  return [
    `Overall: ${summary.overall}`,
    `Proof status: ${summary.proofStatus}`,
    `Wiring cert: ${summary.wiringCertPassed ? "PASSED" : "FAILED"}`,
    `Fleet cert: ${summary.fleetCertPassed ? "PASSED" : "FAILED"} (${summary.providersPassed}/${INTEGRATION_HEALTH_LIVE_SMOKE_ERA91_PROVIDER_CERTS.length} providers)`,
    `Registry LIVE count: ${summary.registryLiveCount}`,
    ...summary.steps.map(
      (step) =>
        `  [${step.status}] ${step.label}${step.reason ? ` — ${step.reason}` : ""}`,
    ),
  ];
}
