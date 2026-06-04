/**
 * Era 17 Woo/Shopify live channel smoke orchestrator (Cycles 7–8).
 *
 * 1. Synthetic golden-path cert
 * 2. Woo live tenant certification (--provider woocommerce)
 * 3. Shopify live tenant certification (--provider shopify)
 * Missing credentials → SKIPPED WITH REASON (exit 0). Real failures → FAILED (exit 1).
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { spawnSync } from "node:child_process";

import {
  CHANNEL_LIVE_SMOKE_WOO_ERA17_NPM_SCRIPT,
  CHANNEL_LIVE_SMOKE_WOO_ERA17_POLICY_ID,
  CHANNEL_LIVE_SMOKE_WOO_ERA17_SUMMARY_ARTIFACT,
  CHANNEL_LIVE_SMOKE_WOO_ERA17_TENANT_SCRIPT,
  CHANNEL_LIVE_SMOKE_WOO_ERA17_WOO_PROVIDER,
} from "../lib/integrations/channel-live-smoke-woo-era17-policy";
import {
  CHANNEL_LIVE_SMOKE_SHOPIFY_ERA17_CYCLE_RUNBOOK_STEPS,
  CHANNEL_LIVE_SMOKE_SHOPIFY_ERA17_POLICY_ID,
  CHANNEL_LIVE_SMOKE_SHOPIFY_ERA17_SHOPIFY_PROVIDER,
} from "../lib/integrations/channel-live-smoke-shopify-era17-policy";
import { CHANNEL_LIVE_SMOKE_ERA16_POLICY_ID } from "../lib/integrations/channel-live-smoke-era16-policy";
import {
  buildChannelLiveSmokeSummary,
  evaluateChannelLiveSmokePrerequisites,
  formatChannelLiveSmokeReportLines,
  listMissingChannelLiveSmokeEnvVars,
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
  const result = spawnSync("npx", ["tsx", CHANNEL_LIVE_SMOKE_WOO_ERA17_TENANT_SCRIPT, ...args], {
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
  const path = join(process.cwd(), CHANNEL_LIVE_SMOKE_WOO_ERA17_SUMMARY_ARTIFACT);
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, `${JSON.stringify(summary, null, 2)}\n`, "utf8");
}

function readPrerequisiteInput() {
  return {
    databaseUrl: process.env.DATABASE_URL ?? null,
    encryptionKey: process.env.ENCRYPTION_KEY ?? null,
    ownerEmail: arg("--owner-email") ?? process.env.CHANNEL_SMOKE_OWNER_EMAIL ?? null,
    connectionId: arg("--connection-id") ?? process.env.CHANNEL_SMOKE_CONNECTION_ID ?? null,
  };
}

function runProviderLiveStep(input: {
  provider: string;
  stepId: "woo_live_certification" | "shopify_live_certification";
  label: string;
  prereqOk: boolean;
  prereqReason: string;
  prereqInput: ReturnType<typeof readPrerequisiteInput>;
  skipLive: boolean;
}): ChannelLiveSmokeStep {
  if (!input.prereqOk) {
    return {
      id: input.stepId,
      label: input.label,
      status: "SKIPPED",
      reason: input.prereqReason,
    };
  }

  const tenantArgs: string[] = ["--provider", input.provider];
  if (input.prereqInput.connectionId) tenantArgs.push("--connection-id", input.prereqInput.connectionId);
  if (input.prereqInput.ownerEmail) tenantArgs.push("--owner-email", input.prereqInput.ownerEmail);
  if (input.skipLive) tenantArgs.push("--skip-live");

  console.log(`\n→ npx tsx ${CHANNEL_LIVE_SMOKE_WOO_ERA17_TENANT_SCRIPT} ${tenantArgs.join(" ")}\n`);
  const liveCode = runTenantSmoke(tenantArgs);
  const credentialsOnly = input.skipLive;

  return {
    id: input.stepId,
    label: credentialsOnly ? `${input.label} (credentials only)` : input.label,
    status: liveCode === 0 ? "PASSED" : "FAILED",
    reason:
      liveCode === 0
        ? credentialsOnly
          ? "Credentials and crypto checks passed (--skip-live)."
          : `${input.label} passed.`
        : `exit ${liveCode}`,
  };
}

function printRunbook(): void {
  console.log(`\nChannel live smoke (${CHANNEL_LIVE_SMOKE_ERA16_POLICY_ID})\n`);
  console.log(`Era 17 Woo proof (${CHANNEL_LIVE_SMOKE_WOO_ERA17_POLICY_ID})\n`);
  console.log(`Era 17 Shopify proof (${CHANNEL_LIVE_SMOKE_SHOPIFY_ERA17_POLICY_ID})\n`);
  for (const [index, step] of CHANNEL_LIVE_SMOKE_SHOPIFY_ERA17_CYCLE_RUNBOOK_STEPS.entries()) {
    console.log(`${index + 1}. ${step}`);
  }
  console.log("\nSee docs/WOO_SHOPIFY_CERTIFICATION_CHECKLIST.md\n");
}

async function main() {
  if (hasFlag("--help") || hasFlag("-h")) {
    console.log(`
Era 17 Woo/Shopify live channel smoke

  (default)             Synthetic cert + Woo live + Shopify live
  --checklist-only      Print Era 17 Woo/Shopify runbook steps
  --skip-live           Skip live REST API calls (--skip-live to tenant script)
  --owner-email <email> Override CHANNEL_SMOKE_OWNER_EMAIL
  --connection-id <id>  Override CHANNEL_SMOKE_CONNECTION_ID
`);
    process.exit(0);
  }

  if (hasFlag("--checklist-only")) {
    printRunbook();
    process.exit(0);
  }

  console.log(
    `\n[${CHANNEL_LIVE_SMOKE_WOO_ERA17_NPM_SCRIPT}] ${CHANNEL_LIVE_SMOKE_WOO_ERA17_POLICY_ID} + ${CHANNEL_LIVE_SMOKE_SHOPIFY_ERA17_POLICY_ID}\n`,
  );

  const steps: ChannelLiveSmokeStep[] = [];

  console.log("\n→ npx prisma generate (channel live smokes require @prisma/client)\n");
  const prismaCode = spawnSync("npx", ["prisma", "generate"], {
    stdio: "inherit",
    env: process.env,
  }).status ?? 1;
  steps.push({
    id: "prisma_client_generate",
    label: "Prisma client generate",
    status: prismaCode === 0 ? "PASSED" : "FAILED",
    reason: prismaCode === 0 ? undefined : `exit ${prismaCode}`,
  });
  if (prismaCode !== 0) {
    const summary = buildChannelLiveSmokeSummary(steps, {
      missingEnvVars: listMissingChannelLiveSmokeEnvVars(readPrerequisiteInput()),
      prerequisitesMet: false,
    });
    writeSummaryArtifact(summary);
    for (const line of formatChannelLiveSmokeReportLines(summary)) {
      console.log(line);
    }
    process.exit(1);
  }
  const prereqInput = readPrerequisiteInput();
  const missingEnvVars = listMissingChannelLiveSmokeEnvVars(prereqInput);
  const prereq = evaluateChannelLiveSmokePrerequisites(prereqInput);
  const skipLive = hasFlag("--skip-live");
  const prereqReason = prereq.ok ? "" : prereq.reason;

  console.log("\n→ npm run test:ci:channel-golden-path:cert\n");
  const syntheticCode = runNpmScript("test:ci:channel-golden-path:cert");
  steps.push({
    id: "synthetic_golden_path_cert",
    label: "Synthetic channel golden-path cert",
    status: syntheticCode === 0 ? "PASSED" : "FAILED",
    reason: syntheticCode === 0 ? undefined : `exit ${syntheticCode}`,
  });

  steps.push(
    runProviderLiveStep({
      provider: CHANNEL_LIVE_SMOKE_WOO_ERA17_WOO_PROVIDER,
      stepId: "woo_live_certification",
      label: "Woo live tenant certification",
      prereqOk: prereq.ok,
      prereqReason,
      prereqInput,
      skipLive,
    }),
  );

  steps.push(
    runProviderLiveStep({
      provider: CHANNEL_LIVE_SMOKE_SHOPIFY_ERA17_SHOPIFY_PROVIDER,
      stepId: "shopify_live_certification",
      label: "Shopify live tenant certification",
      prereqOk: prereq.ok,
      prereqReason,
      prereqInput,
      skipLive,
    }),
  );

  const summary = buildChannelLiveSmokeSummary(steps, {
    missingEnvVars,
    prerequisitesMet: prereq.ok,
  });
  writeSummaryArtifact(summary);

  for (const line of formatChannelLiveSmokeReportLines(summary)) {
    console.log(line);
  }
  console.log(`\nSummary artifact: ${CHANNEL_LIVE_SMOKE_WOO_ERA17_SUMMARY_ARTIFACT}\n`);

  printRunbook();

  if (summary.overall === "FAILED") {
    process.exit(1);
  }
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
