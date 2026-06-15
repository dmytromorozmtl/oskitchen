/**
 * Preflight Sentry production activation (Blueprint P0 #1).
 *
 * Usage:
 *   npm run sentry:production:preflight
 */
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { spawnSync } from "node:child_process";

import { SENTRY_PRODUCTION_ERA70_SUMMARY_ARTIFACT } from "@/lib/observability/sentry-production-era70-policy";
import {
  evaluateSentryProductionHealth,
  parseSentryServerCheck,
} from "@/scripts/verify-sentry-production-health";
import { loadProductionEnvLocal } from "./lib/load-dotenv-file";

const HEALTH_URL = "https://os-kitchen.com/api/health";
const ENV_TEMPLATE = ".env.production.local.example";
const UNBLOCK_ARTIFACT = "artifacts/sentry-p0-unblock-status.json";

function looksLikeDsn(value: string | undefined): boolean {
  return Boolean(value?.trim() && /^https:\/\//i.test(value.trim()));
}

function vercelEnvHasSentry(): boolean {
  const vercel = spawnSync("npx", ["vercel", "env", "ls", "production"], {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  });
  if (vercel.status !== 0) {
    return false;
  }
  return /SENTRY_DSN/i.test(vercel.stdout);
}

async function fetchHealthSentryOk(): Promise<boolean> {
  try {
    const response = await fetch(HEALTH_URL, {
      headers: { accept: "application/json" },
      cache: "no-store",
    });
    const payload = await response.json();
    const sentry = parseSentryServerCheck(payload);
    return evaluateSentryProductionHealth(sentry).ok;
  } catch {
    return false;
  }
}

async function main(): Promise<void> {
  const root = process.cwd();
  const lines: string[] = ["=== Sentry production preflight (P0 #1) ===", ""];

  loadProductionEnvLocal(root);
  const localDsn = process.env.SENTRY_DSN;
  const localReady = looksLikeDsn(localDsn);
  const templateExists = existsSync(join(root, ENV_TEMPLATE));
  const vercelReady = vercelEnvHasSentry();
  const healthOk = await fetchHealthSentryOk();

  lines.push(`Health ${HEALTH_URL}: ${healthOk ? "PASS (sentryServer.ok=true)" : "FAIL (sentryServer.ok=false)"}`);
  lines.push(`Local SENTRY_DSN: ${localReady ? "ready" : "missing or invalid"}`);
  lines.push(`Vercel Production SENTRY_DSN: ${vercelReady ? "present" : "absent"}`);
  lines.push(`Template ${ENV_TEMPLATE}: ${templateExists ? "yes" : "no"}`);
  lines.push(`Unblock artifact: ${existsSync(join(root, UNBLOCK_ARTIFACT)) ? UNBLOCK_ARTIFACT : "missing"}`);
  lines.push(`Smoke artifact target: ${SENTRY_PRODUCTION_ERA70_SUMMARY_ARTIFACT}`);

  const readyToApply = localReady || vercelReady;
  const passed = healthOk;

  if (!passed && !readyToApply) {
    lines.push("");
    lines.push("BLOCKED — no SENTRY_DSN locally or on Vercel Production.");
    lines.push("");
    lines.push("Next steps:");
    lines.push(`  1. cp ${ENV_TEMPLATE} .env.production.local`);
    lines.push("  2. Set SENTRY_DSN in .env.production.local (never commit)");
    lines.push("  3. npm run sentry:production:activate -- --apply --deploy --mirror-public-dsn");
    lines.push("  4. npm run sentry:production:verify");
    lines.push("  5. Mark artifacts/blueprint-tracker.json → 1-sentry-dsn-production: done");
  } else if (!passed && readyToApply) {
    lines.push("");
    lines.push("DSN configured but health not live — run activate + deploy:");
    lines.push("  npm run sentry:production:activate -- --apply --deploy --mirror-public-dsn");
    lines.push("  npm run sentry:production:verify");
  } else {
    lines.push("");
    lines.push("PASS — Sentry production is live.");
  }

  for (const line of lines) {
    console.log(line);
  }

  if (existsSync(join(root, UNBLOCK_ARTIFACT))) {
    try {
      const artifact = JSON.parse(readFileSync(join(root, UNBLOCK_ARTIFACT), "utf8")) as Record<
        string,
        unknown
      >;
      artifact.lastPreflightAt = new Date().toISOString();
      artifact.lastPreflightCycle = 357;
      artifact.preflight = {
        healthOk,
        localReady,
        vercelReady,
        templateExists,
        readyToApply,
        passed,
      };
      writeFileSync(join(root, UNBLOCK_ARTIFACT), `${JSON.stringify(artifact, null, 2)}\n`);
    } catch {
      // non-fatal
    }
  }

  process.exit(passed ? 0 : 1);
}

void main();
