/**
 * Fleet orchestrator — 18 LIVE integration order→KDS round-trip smoke suite.
 *
 * Usage:
 *   npm run smoke:integration-suite-order-kds
 *   npm run smoke:integration-suite-order-kds -- --provider woocommerce
 *   npm run smoke:integration-suite-order-kds -- --checklist-only
 *
 * Missing merchant credentials → SKIPPED (exit 0). Real failure → FAILED (exit 1).
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { spawnSync } from "node:child_process";

import { loadSmokeEnv } from "./lib/load-smoke-env";

loadSmokeEnv();

import {
  INTEGRATION_SMOKE_SUITE_ORDER_KDS_FLEET,
  INTEGRATION_SMOKE_SUITE_ORDER_KDS_KDS_PATH,
  INTEGRATION_SMOKE_SUITE_ORDER_KDS_POLICY_ID,
  INTEGRATION_SMOKE_SUITE_ORDER_KDS_SUMMARY_ARTIFACT,
  integrationSmokeSuiteRequiresKdsTicket,
} from "@/lib/integrations/integration-smoke-suite-order-kds-policy";
import {
  buildIntegrationSmokeSuiteSummary,
  formatIntegrationSmokeSuiteStepLine,
  type IntegrationSmokeSuiteStep,
  type IntegrationSmokeSuiteStepStatus,
} from "@/lib/integrations/integration-smoke-suite-order-kds-summary";
import { listMissingLiveIntegrationsStagingSharedEnvVars } from "@/lib/integrations/live-integrations-staging-smoke-summary";

function hasFlag(name: string): boolean {
  return process.argv.includes(name);
}

function arg(name: string): string | undefined {
  const index = process.argv.indexOf(name);
  if (index === -1) return undefined;
  return process.argv[index + 1];
}

function runNpmScript(script: string): number {
  const result = spawnSync("npm", ["run", script], {
    stdio: "inherit",
    env: process.env,
  });
  return result.status ?? 1;
}

function resolveStepStatus(exitCode: number): IntegrationSmokeSuiteStepStatus {
  if (exitCode === 0) return "PASSED";
  return "FAILED";
}

function missingSharedEnv(): string[] {
  return listMissingLiveIntegrationsStagingSharedEnvVars({
    stagingBaseUrl: process.env.E2E_STAGING_BASE_URL,
    databaseUrl: process.env.DATABASE_URL,
    encryptionKey: process.env.ENCRYPTION_KEY,
    connectionId: process.env.CHANNEL_SMOKE_CONNECTION_ID,
    ownerEmail: process.env.CHANNEL_SMOKE_OWNER_EMAIL,
  });
}

function probeKdsBoard(): IntegrationSmokeSuiteStep {
  const base = process.env.E2E_STAGING_BASE_URL?.trim();
  if (!base) {
    return {
      integrationId: "integration-health",
      name: "Integration Health + KDS board",
      roundTripKind: "kds_board_probe",
      status: "SKIPPED",
      smokeScript: null,
      kdsRequired: true,
      reason: "missing E2E_STAGING_BASE_URL",
    };
  }

  try {
    const res = spawnSync(
      "curl",
      ["-sf", "-o", "/dev/null", "-w", "%{http_code}", `${base.replace(/\/$/, "")}${INTEGRATION_SMOKE_SUITE_ORDER_KDS_KDS_PATH}`],
      { encoding: "utf8" },
    );
    const code = Number(res.stdout?.trim() ?? "0");
    if (code >= 200 && code < 400) {
      return {
        integrationId: "integration-health",
        name: "Integration Health + KDS board",
        roundTripKind: "kds_board_probe",
        status: "PASSED",
        smokeScript: null,
        kdsRequired: true,
        reason: `KDS path HTTP ${code}`,
      };
    }
    return {
      integrationId: "integration-health",
      name: "Integration Health + KDS board",
      roundTripKind: "kds_board_probe",
      status: "FAILED",
      smokeScript: null,
      kdsRequired: true,
      reason: `KDS path HTTP ${code || "unreachable"}`,
    };
  } catch (error) {
    return {
      integrationId: "integration-health",
      name: "Integration Health + KDS board",
      roundTripKind: "kds_board_probe",
      status: "FAILED",
      smokeScript: null,
      kdsRequired: true,
      reason: error instanceof Error ? error.message : "probe failed",
    };
  }
}

function main(): void {
  const providerFilter = arg("--provider");
  const checklistOnly = hasFlag("--checklist-only");
  const write = hasFlag("--write") || !hasFlag("--no-write");

  console.log(`
Integration smoke suite — 18 LIVE order→KDS round-trip
Policy: ${INTEGRATION_SMOKE_SUITE_ORDER_KDS_POLICY_ID}
`);

  if (checklistOnly) {
    for (const entry of INTEGRATION_SMOKE_SUITE_ORDER_KDS_FLEET) {
      const kds = integrationSmokeSuiteRequiresKdsTicket(entry) ? "order→KDS" : entry.roundTripKind;
      console.log(`- ${entry.name} (${kds}) → ${entry.smokeScript ?? "KDS board probe"}`);
    }
    return;
  }

  const sharedMissing = missingSharedEnv();
  const steps: IntegrationSmokeSuiteStep[] = [];

  for (const entry of INTEGRATION_SMOKE_SUITE_ORDER_KDS_FLEET) {
    if (providerFilter && entry.integrationId !== providerFilter) continue;

    if (entry.roundTripKind === "kds_board_probe") {
      steps.push(probeKdsBoard());
      continue;
    }

    const kdsRequired = integrationSmokeSuiteRequiresKdsTicket(entry);

    if (entry.roundTripKind === "sync_only") {
      if (sharedMissing.length > 0) {
        steps.push({
          integrationId: entry.integrationId,
          name: entry.name,
          roundTripKind: entry.roundTripKind,
          status: "SKIPPED",
          smokeScript: entry.smokeScript,
          kdsRequired: false,
          reason: `sync-only — missing shared env: ${sharedMissing.join(", ")}`,
        });
        continue;
      }
    } else if (sharedMissing.length > 0) {
      steps.push({
        integrationId: entry.integrationId,
        name: entry.name,
        roundTripKind: entry.roundTripKind,
        status: "SKIPPED",
        smokeScript: entry.smokeScript,
        kdsRequired: kdsRequired,
        reason: `missing shared env: ${sharedMissing.join(", ")}`,
      });
      continue;
    }

    if (!entry.smokeScript) {
      steps.push({
        integrationId: entry.integrationId,
        name: entry.name,
        roundTripKind: entry.roundTripKind,
        status: "SKIPPED",
        smokeScript: null,
        kdsRequired: kdsRequired,
        reason: "no smoke script",
      });
      continue;
    }

    const exitCode = runNpmScript(entry.smokeScript);
    steps.push({
      integrationId: entry.integrationId,
      name: entry.name,
      roundTripKind: entry.roundTripKind,
      status: resolveStepStatus(exitCode),
      smokeScript: entry.smokeScript,
      kdsRequired: kdsRequired,
      reason:
        entry.roundTripKind === "sync_only"
          ? "sync-only — KDS not applicable"
          : `${entry.roundTripSteps.join(" → ")}`,
    });
  }

  const summary = buildIntegrationSmokeSuiteSummary(steps);
  for (const step of steps) {
    console.log(formatIntegrationSmokeSuiteStepLine(step));
  }
  console.log(`\nOverall: ${summary.overall} (${summary.passedCount} passed, ${summary.skippedCount} skipped, ${summary.failedCount} failed)`);

  if (write) {
    const outPath = join(process.cwd(), INTEGRATION_SMOKE_SUITE_ORDER_KDS_SUMMARY_ARTIFACT);
    mkdirSync(dirname(outPath), { recursive: true });
    writeFileSync(outPath, `${JSON.stringify(summary, null, 2)}\n`, "utf8");
    console.log(`Wrote ${INTEGRATION_SMOKE_SUITE_ORDER_KDS_SUMMARY_ARTIFACT}`);
  }

  if (summary.overall === "FAILED") {
    process.exit(1);
  }
}

main();
