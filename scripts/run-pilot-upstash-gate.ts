/**
 * Complete Upstash blocker — scan, paste file, ingest, verify, Vercel checklist.
 *
 *   npm run pilot:upstash:gate
 *   npm run pilot:upstash:gate -- --wizard    # interactive paste
 *   npm run pilot:upstash:gate -- --open      # open Upstash console (macOS)
 */
import { execSync } from "node:child_process";
import { copyFileSync, existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

import { patchEnvFile, removeEnvKey } from "./lib/patch-env-file";
import { loadStagingPilotEnv } from "./lib/load-dotenv-file";
import { scanUpstashCredentials } from "./lib/scan-upstash-credentials";
import { getUpstashPasteState } from "./lib/upstash-paste-state";
import {
import { logger } from "@/lib/logger";
  isValidUpstashToken,
  isValidUpstashUrl,
} from "./lib/staging-env-placeholders";

const ROOT = process.cwd();
const TARGET = join(ROOT, ".env.staging.local");
const PASTE = join(ROOT, ".env.upstash.paste.local");
const TEMPLATE = join(ROOT, "docs/templates/UPSTASH_PASTE.env.example");
const CHECKLIST = join(ROOT, "docs/generated/PILOT_UPSTASH_VERCEL_CHECKLIST.md");

function sh(cmd: string, inherit = true): boolean {
  try {
    execSync(cmd, {
      cwd: ROOT,
      stdio: inherit ? "inherit" : "pipe",
      env: { ...process.env, NPM_CONFIG_PRODUCTION: "false" },
    });
    return true;
  } catch {
    return false;
  }
}

function ensurePasteTemplate(): void {
  if (existsSync(PASTE)) return;
  if (existsSync(TEMPLATE)) {
    copyFileSync(TEMPLATE, PASTE);
    logger.cli(`Created ${PASTE} — paste Upstash REST URL + token, then re-run.\n`);
    return;
  }
  writeFileSync(
    PASTE,
    [
      "# Paste from Upstash Console → REST API (then: npm run pilot:upstash:gate)",
      "UPSTASH_REDIS_REST_URL=https://YOUR-REGION-NAME-12345.upstash.io",
      "UPSTASH_REDIS_REST_TOKEN=",
      "",
    ].join("\n"),
    "utf8",
  );
  logger.cli(`Created ${PASTE}\n`);
}

function writeVercelChecklist(url: string, token: string): void {
  const mask = token.length > 8 ? `${token.slice(0, 4)}…${token.slice(-4)}` : "****";
  const body = [
    "# Upstash → Vercel staging checklist",
    "",
    `Generated: ${new Date().toISOString()}`,
    "",
    "## Local (done after gate)",
    "",
    "- [x] `.env.staging.local` — UPSTASH_* saved",
    "- [x] Ping OK",
    "",
    "## Vercel Dashboard",
    "",
    "Settings → Environment Variables → **Staging**:",
    "",
    "| Key | Value |",
    "|-----|-------|",
    `| \`RATE_LIMIT_ADAPTER\` | \`upstash\` |`,
    `| \`UPSTASH_REDIS_REST_URL\` | \`${url}\` |`,
    `| \`UPSTASH_REDIS_REST_TOKEN\` | \`${mask}\` (full token in .env.staging.local) |`,
    "",
    "Or CLI:",
    "",
    "```bash",
    "npm run vercel:staging-push -- --apply",
    "# Redeploy staging deployment",
    "```",
    "",
    "## Verify",
    "",
    "```bash",
    "npm run verify:staging-env",
    "npm run staging:url:probe -- --fix",
    "npm run pilot:next-step",
    "```",
    "",
  ].join("\n");
  writeFileSync(CHECKLIST, body, "utf8");
  logger.cli(`Wrote ${CHECKLIST}`);
}

async function ingest(url: string, token: string): Promise<boolean> {
  return sh(
    `npm run staging:upstash:set -- --url="${url.replace(/"/g, "")}" --token="${token.replace(/"/g, "")}"`,
  );
}

async function main() {
  const wizard = process.argv.includes("--wizard");
  const openConsole = process.argv.includes("--open");

  logger.cli("=== Pilot Upstash gate (100% next step) ===\n");

  if (openConsole) {
    try {
      execSync("open https://console.upstash.com/redis", { stdio: "ignore" });
    } catch {
      logger.cli("Open: https://console.upstash.com/redis\n");
    }
  }

  loadStagingPilotEnv(ROOT);
  if (
    isValidUpstashUrl(process.env.UPSTASH_REDIS_REST_URL ?? "") &&
    isValidUpstashToken(process.env.UPSTASH_REDIS_REST_TOKEN ?? "")
  ) {
    logger.cli("Upstash already configured in environment.\n");
    sh("npm run staging:ops:status");
    sh("npm run pilot:next-step:doc");
    return;
  }

  ensurePasteTemplate();
  sh("npx tsx scripts/bootstrap-staging-from-known-env.ts", false);
  sh("npx tsx scripts/clean-staging-env-placeholders.ts", false);

  const hit = scanUpstashCredentials(ROOT);
  if (hit) {
    logger.cli(`Found Upstash in ${hit.source} → ingesting…\n`);
    if (await ingest(hit.url, hit.token)) {
      removeEnvKey(TARGET, "PILOT_LOCAL_MEMORY_RATE_LIMIT");
      patchEnvFile(TARGET, "RATE_LIMIT_ADAPTER", "upstash");
      loadStagingPilotEnv(ROOT);
      writeVercelChecklist(hit.url, hit.token);
      sh("npm run verify:staging-env");
      sh("npm run pilot:next-step:doc");
      logger.cli("\nUpstash gate OK. Next: npm run vercel:staging-push -- --apply && redeploy");
      return;
    }
  }

  if (wizard) {
    sh("npm run staging:upstash:wizard");
    return;
  }

  const pasteState = getUpstashPasteState(ROOT);
  logger.cli("Upstash credentials not found yet.\n");
  if (pasteState.state === "template") {
    logger.cli("  Your .env.upstash.paste.local still has the EXAMPLE url/token.");
    logger.cli("  → Open https://console.upstash.com/redis → REST API");
    logger.cli("  → Replace lines 8–9 with real values, save, re-run this command.\n");
  } else if (pasteState.state === "url-only") {
    logger.cli("  URL set but UPSTASH_REDIS_REST_TOKEN is empty in .env.upstash.paste.local\n");
  }

  logger.cli("Choose one path:\n");
  logger.cli("  A) Interactive wizard");
  logger.cli("     npm run pilot:upstash:gate -- --wizard\n");
  logger.cli("  B) Paste file (no interactive terminal)");
  logger.cli(`     1. Edit ${PASTE}`);
  logger.cli("     2. Paste URL + token from Upstash → REST API");
  logger.cli("     3. npm run pilot:upstash:gate\n");
  logger.cli("  C) One-liner");
  logger.cli(
    '     npm run staging:upstash:set -- --url="https://….upstash.io" --token="AX…" --continue\n',
  );
  logger.cli("  D) Open console");
  logger.cli("     npm run pilot:upstash:gate -- --open\n");
  logger.cli(`Template: ${TEMPLATE}`);

  sh("npm run pilot:next-step:doc", false);
  process.exit(2);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
