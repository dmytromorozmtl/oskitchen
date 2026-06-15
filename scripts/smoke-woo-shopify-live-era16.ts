/**
 * Era 16 Woo/Shopify live channel smoke orchestrator.
 *
 * 1. Synthetic golden-path cert (Vitest)
 * Missing credentials → SKIPPED WITH REASON (exit 0). Real failures → FAILED (exit 1).
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { spawnSync } from "node:child_process";

import {
  CHANNEL_LIVE_SMOKE_ERA16_LEGACY_NPM_SCRIPT,
  CHANNEL_LIVE_SMOKE_ERA16_NPM_SCRIPT,
  CHANNEL_LIVE_SMOKE_ERA16_POLICY_ID,
  CHANNEL_LIVE_SMOKE_ERA16_PILOT_RUNBOOK_STEPS,
  CHANNEL_LIVE_SMOKE_ERA16_SUMMARY_ARTIFACT,
  CHANNEL_LIVE_SMOKE_ERA16_TENANT_SCRIPT,
} from "../lib/integrations/channel-live-smoke-era16-policy";
import {
  buildChannelLiveSmokeSummary,
  evaluateChannelLiveSmokePrerequisites,
  formatChannelLiveSmokeStepLine,
  printChannelLiveSmokeSummary,
  type ChannelLiveSmokeStep,
} from "../lib/integrations/channel-live-smoke-summary";

function runNpmScript(script: string): number {
  const result = spawnSync("npm", ["run", script], {
    stdio: "inherit",
    env: process.env,
  });
  return result.status ?? 1;
}

function runTenantSmoke(args: string[]): number {
  const result = spawnSync("npx", ["tsx", CHANNEL_LIVE_SMOKE_ERA16_TENANT_SCRIPT, ...args], {
    stdio: "inherit",
    env: process.env,
  });
  return result.status ?? 1;
}

function hasFlag(name: string): boolean {
  return process.argv.includes(name);
}

function arg(name: string): string | undefined {
  const index = process.argv.indexOf(name);
  if (index === -1) return undefined;
  return process.argv[index + 1];
}

function writeSummaryArtifact(summary: ReturnType<typeof buildChannelLiveSmokeSummary>): void {
  const path = join(process.cwd(), CHANNEL_LIVE_SMOKE_ERA16_SUMMARY_ARTIFACT);
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, `${JSON.stringify(summary, null, 2)}\n`, "utf8");
  console.log(`Summary artifact: ${CHANNEL_LIVE_SMOKE_ERA16_SUMMARY_ARTIFACT}`);
}

function printRunbook(): void {
  console.log(`\nChannel live smoke (${CHANNEL_LIVE_SMOKE_ERA16_POLICY_ID})\n`);
  for (const [index, step] of CHANNEL_LIVE_SMOKE_ERA16_PILOT_RUNBOOK_STEPS.entries()) {
    console.log(`${index + 1}. ${step}`);
  }
  console.log(
    `\nLegacy tenant-only script: npm run ${CHANNEL_LIVE_SMOKE_ERA16_LEGACY_NPM_SCRIPT}`,
  );
  console.log("\nSee docs/WOO_SHOPIFY_CERTIFICATION_CHECKLIST.md\n");
}

async function main() {
  if (hasFlag("--help") || hasFlag("-h")) {
    console.log(`
Era 16 Woo/Shopify live channel smoke

  (default)           Synthetic cert + optional live tenant certification
  --checklist-only      Print pilot runbook steps
  --skip-live           Skip live REST API calls (passes --skip-live to tenant script)
  --owner-email <email> Override CHANNEL_SMOKE_OWNER_EMAIL
  --connection-id <id>  Override CHANNEL_SMOKE_CONNECTION_ID
  --provider woocommerce|shopify
`);
    process.exit(0);
  }

  if (hasFlag("--checklist-only")) {
    printRunbook();
    process.exit(0);
  }

  console.log(`\n[${CHANNEL_LIVE_SMOKE_ERA16_NPM_SCRIPT}] ${CHANNEL_LIVE_SMOKE_ERA16_POLICY_ID}\n`);

  const steps: ChannelLiveSmokeStep[] = [];

  console.log("\n→ npm run test:ci:channel-golden-path:cert\n");
  const syntheticCode = runNpmScript("test:ci:channel-golden-path:cert");
  steps.push({
    id: "synthetic_golden_path_cert",
    label: "Synthetic channel golden-path cert",
    status: syntheticCode === 0 ? "PASSED" : "FAILED",
    reason:
      syntheticCode === 0
        ? "Vitest golden-path cert chain passed."
        : `Exit code ${syntheticCode}.`,
  });

  const ownerEmail = arg("--owner-email") ?? process.env.CHANNEL_SMOKE_OWNER_EMAIL ?? null;
  const connectionId =
    arg("--connection-id") ?? process.env.CHANNEL_SMOKE_CONNECTION_ID ?? null;
  const skipLive = hasFlag("--skip-live");
  const provider = arg("--provider");

  const prereq = evaluateChannelLiveSmokePrerequisites({
    databaseUrl: process.env.DATABASE_URL,
    encryptionKey: process.env.ENCRYPTION_KEY,
    ownerEmail,
    connectionId,
  });

  if (!prereq.ok) {
    steps.push({
      id: "live_tenant_certification",
      label: "Live Woo/Shopify tenant certification",
      status: "SKIPPED",
      reason: prereq.reason,
    });
    const summary = buildChannelLiveSmokeSummary(steps);
    printChannelLiveSmokeSummary(summary);
    writeSummaryArtifact(summary);
    printRunbook();
    const exitCode = summary.overall === "FAILED" ? 1 : 0;
    console.log(
      `[${CHANNEL_LIVE_SMOKE_ERA16_NPM_SCRIPT}] ${summary.overall}${exitCode === 0 ? "" : " — fix synthetic cert failures"}\n`,
    );
    process.exit(exitCode);
  }

  const tenantArgs: string[] = [];
  if (connectionId) tenantArgs.push("--connection-id", connectionId);
  if (ownerEmail) tenantArgs.push("--owner-email", ownerEmail);
  if (provider) tenantArgs.push("--provider", provider);
  if (skipLive) tenantArgs.push("--skip-live");

  console.log(`\n→ npx tsx ${CHANNEL_LIVE_SMOKE_ERA16_TENANT_SCRIPT} ${tenantArgs.join(" ")}\n`);
  const liveCode = runTenantSmoke(tenantArgs);
  steps.push({
    id: "live_tenant_certification",
    label: skipLive
      ? "Live Woo/Shopify tenant certification (credentials only)"
      : "Live Woo/Shopify tenant certification",
    status: liveCode === 0 ? "PASSED" : "FAILED",
    reason:
      liveCode === 0
        ? skipLive
          ? "Credentials and crypto checks passed (--skip-live)."
          : "Tenant certification passed."
        : `Exit code ${liveCode}.`,
  });

  const summary = buildChannelLiveSmokeSummary(steps);
  printChannelLiveSmokeSummary(summary);
  writeSummaryArtifact(summary);
  printRunbook();

  for (const step of summary.steps) {
    if (step.status === "SKIPPED") {
      console.log(formatChannelLiveSmokeStepLine(step));
    }
  }

  const exitCode = summary.overall === "FAILED" ? 1 : 0;
  console.log(`[${CHANNEL_LIVE_SMOKE_ERA16_NPM_SCRIPT}] ${summary.overall}\n`);
  process.exit(exitCode);
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
