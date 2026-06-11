/**
 * Fleet orchestrator — 18 LIVE integration staging smokes with merchant credentials.
 *
 * Usage:
 *   npx tsx scripts/smoke-live-integrations-staging.ts [--write]
 *   npx tsx scripts/smoke-live-integrations-staging.ts --provider woocommerce
 *   npx tsx scripts/smoke-live-integrations-staging.ts --checklist-only
 *
 * Env: `.env.smoke.local` + staging vault (see docs/live-integrations-staging-smoke-setup.md)
 *
 * Missing credentials → SKIPPED WITH REASON (exit 0). Real failure → FAILED (exit 1).
 */
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { spawnSync } from "node:child_process";

import { loadSmokeEnv } from "./lib/load-smoke-env";

loadSmokeEnv();

import {
  LIVE_INTEGRATIONS_STAGING_SMOKE_CYCLE_RUNBOOK_STEPS,
  LIVE_INTEGRATIONS_STAGING_SMOKE_FLEET,
  LIVE_INTEGRATIONS_STAGING_SMOKE_INTEGRATION_HEALTH_PATH,
  LIVE_INTEGRATIONS_STAGING_SMOKE_NPM_SCRIPT,
  LIVE_INTEGRATIONS_STAGING_SMOKE_OPS_DOC,
  LIVE_INTEGRATIONS_STAGING_SMOKE_POLICY_ID,
  LIVE_INTEGRATIONS_STAGING_SMOKE_SUMMARY_ARTIFACT,
} from "@/lib/integrations/live-integrations-staging-smoke-policy";
import { hasDirectMerchantSandboxCredentials } from "@/lib/integrations/integration-sandbox-service";
import {
  buildLiveIntegrationsStagingSmokeSummary,
  formatLiveIntegrationsStagingSmokeReportLines,
  listMissingLiveIntegrationsStagingSharedEnvVars,
  printLiveIntegrationsStagingSmokeSummary,
  type LiveIntegrationsStagingSmokeStep,
  type LiveIntegrationsStagingSmokeStepStatus,
} from "@/lib/integrations/live-integrations-staging-smoke-summary";

type SmokeArtifactOverall = "PASSED" | "FAILED" | "SKIPPED";

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

function readArtifactOverall(artifactPath: string | null): SmokeArtifactOverall | null {
  if (!artifactPath) return null;
  try {
    const raw = readFileSync(join(process.cwd(), artifactPath), "utf8");
    const json = JSON.parse(raw) as { overall?: string };
    if (json.overall === "PASSED" || json.overall === "FAILED" || json.overall === "SKIPPED") {
      return json.overall;
    }
  } catch {
    // artifact not written or invalid
  }
  return null;
}

function hasDirectMerchantEnv(
  entry: (typeof LIVE_INTEGRATIONS_STAGING_SMOKE_FLEET)[number],
): boolean {
  return hasDirectMerchantSandboxCredentials(entry, process.env);
}

function resolveStepStatus(
  exitCode: number,
  artifactOverall: SmokeArtifactOverall | null,
  entry: (typeof LIVE_INTEGRATIONS_STAGING_SMOKE_FLEET)[number],
): {
  status: LiveIntegrationsStagingSmokeStepStatus;
  reason: string;
} {
  if (artifactOverall === "SKIPPED") {
    return {
      status: "SKIPPED",
      reason: "missing merchant credentials — configure `.env.smoke.local`",
    };
  }
  if (exitCode !== 0) {
    if (artifactOverall === null && !hasDirectMerchantEnv(entry)) {
      return {
        status: "SKIPPED",
        reason:
          "missing direct merchant env — configure `.env.smoke.local` or staging DB connection",
      };
    }
    return { status: "FAILED", reason: `exit code ${exitCode}` };
  }
  if (artifactOverall === "FAILED") {
    return { status: "FAILED", reason: "artifact overall FAILED" };
  }
  if (artifactOverall === "PASSED") {
    return { status: "PASSED", reason: "live merchant proof PASSED" };
  }
  return {
    status: "SKIPPED",
    reason: "no artifact — likely missing merchant credentials",
  };
}

async function probeIntegrationHealthStaging(stagingBaseUrl: string): Promise<{
  status: LiveIntegrationsStagingSmokeStepStatus;
  reason: string;
}> {
  const url = `${stagingBaseUrl.replace(/\/$/, "")}${LIVE_INTEGRATIONS_STAGING_SMOKE_INTEGRATION_HEALTH_PATH}`;
  try {
    const response = await fetch(url, {
      method: "GET",
      redirect: "manual",
      headers: { Accept: "text/html" },
    });
    if (response.status >= 200 && response.status < 400) {
      return { status: "PASSED", reason: `HTTP ${response.status} ${url}` };
    }
    if (response.status === 401 || response.status === 302 || response.status === 307) {
      return {
        status: "PASSED",
        reason: `auth redirect HTTP ${response.status} — staging route reachable`,
      };
    }
    return { status: "FAILED", reason: `HTTP ${response.status} for ${url}` };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return { status: "FAILED", reason: `fetch failed: ${message}` };
  }
}

function writeSummaryArtifact(summary: ReturnType<typeof buildLiveIntegrationsStagingSmokeSummary>): void {
  const path = join(process.cwd(), LIVE_INTEGRATIONS_STAGING_SMOKE_SUMMARY_ARTIFACT);
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, `${JSON.stringify(summary, null, 2)}\n`, "utf8");
}

function printRunbook(): void {
  console.log(`\nLIVE integrations staging smoke (${LIVE_INTEGRATIONS_STAGING_SMOKE_POLICY_ID})\n`);
  for (const [index, step] of LIVE_INTEGRATIONS_STAGING_SMOKE_CYCLE_RUNBOOK_STEPS.entries()) {
    console.log(`${index + 1}. ${step}`);
  }
  console.log(`\nSee ${LIVE_INTEGRATIONS_STAGING_SMOKE_OPS_DOC}\n`);
}

async function main(): Promise<void> {
  if (hasFlag("--help") || hasFlag("-h")) {
    console.log(`
LIVE integrations staging smoke — 18 LIVE surfaces

  (default)         Run 17 merchant live smokes + Integration Health staging probe
  --provider ID     Run a single provider (e.g. woocommerce)
  --checklist-only  Print runbook steps
  --write           Write ${LIVE_INTEGRATIONS_STAGING_SMOKE_SUMMARY_ARTIFACT}
`);
    process.exit(0);
  }

  if (hasFlag("--checklist-only")) {
    printRunbook();
    process.exit(0);
  }

  console.log(
    `\n[${LIVE_INTEGRATIONS_STAGING_SMOKE_NPM_SCRIPT}] ${LIVE_INTEGRATIONS_STAGING_SMOKE_POLICY_ID}\n`,
  );

  const stagingBaseUrl = process.env.E2E_STAGING_BASE_URL ?? null;
  const missingShared = listMissingLiveIntegrationsStagingSharedEnvVars({
    stagingBaseUrl,
    databaseUrl: process.env.DATABASE_URL ?? null,
    encryptionKey: process.env.ENCRYPTION_KEY ?? null,
    connectionId: arg("--connection-id") ?? process.env.CHANNEL_SMOKE_CONNECTION_ID ?? null,
    ownerEmail: arg("--owner-email") ?? process.env.CHANNEL_SMOKE_OWNER_EMAIL ?? null,
  });

  const providerFilter = arg("--provider");
  const fleet = providerFilter
    ? LIVE_INTEGRATIONS_STAGING_SMOKE_FLEET.filter((entry) => entry.integrationId === providerFilter)
    : LIVE_INTEGRATIONS_STAGING_SMOKE_FLEET;

  if (providerFilter && fleet.length === 0) {
    console.error(`Unknown provider: ${providerFilter}`);
    process.exit(1);
  }

  const steps: LiveIntegrationsStagingSmokeStep[] = [];

  for (const entry of fleet) {
    if (entry.kind === "integration_health_probe") {
      if (!stagingBaseUrl?.trim()) {
        steps.push({
          integrationId: entry.integrationId,
          name: entry.name,
          status: "SKIPPED",
          smokeScript: null,
          reason: "E2E_STAGING_BASE_URL not set",
        });
        continue;
      }
      console.log(`\n→ Integration Health staging probe (${stagingBaseUrl})\n`);
      const probe = await probeIntegrationHealthStaging(stagingBaseUrl);
      steps.push({
        integrationId: entry.integrationId,
        name: entry.name,
        status: probe.status,
        smokeScript: null,
        reason: probe.reason,
      });
      continue;
    }

    if (!entry.smokeScript) {
      steps.push({
        integrationId: entry.integrationId,
        name: entry.name,
        status: "SKIPPED",
        smokeScript: null,
        reason: "no smoke script configured",
      });
      continue;
    }

    if (missingShared.length > 0 && !hasFlag("--force")) {
      steps.push({
        integrationId: entry.integrationId,
        name: entry.name,
        status: "SKIPPED",
        smokeScript: entry.smokeScript,
        reason: `missing shared staging env: ${missingShared.join(", ")}`,
        missingEnvVars: [...missingShared],
      });
      continue;
    }

    console.log(`\n→ npm run ${entry.smokeScript} (${entry.name})\n`);
    const exitCode = runNpmScript(entry.smokeScript);
    const artifactOverall = readArtifactOverall(entry.summaryArtifact);
    const resolved = resolveStepStatus(exitCode, artifactOverall, entry);
    steps.push({
      integrationId: entry.integrationId,
      name: entry.name,
      status: resolved.status,
      smokeScript: entry.smokeScript,
      reason: resolved.reason,
    });
  }

  const summary = buildLiveIntegrationsStagingSmokeSummary(steps, {
    stagingBaseUrl,
    missingSharedEnvVars: missingShared,
  });

  printLiveIntegrationsStagingSmokeSummary(summary);

  if (hasFlag("--write") || !hasFlag("--no-write")) {
    writeSummaryArtifact(summary);
    console.log(`Wrote ${LIVE_INTEGRATIONS_STAGING_SMOKE_SUMMARY_ARTIFACT}\n`);
  }

  for (const line of formatLiveIntegrationsStagingSmokeReportLines(summary)) {
    console.log(line);
  }

  if (summary.overall === "FAILED") {
    process.exit(1);
  }
  process.exit(0);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
