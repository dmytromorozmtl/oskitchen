/**
 * Interactive Upstash setup → save → ping → chain pilot steps.
 *
 *   npm run staging:upstash:wizard
 *   npm run staging:upstash:wizard -- --no-chain   # save only
 */
import { createInterface } from "node:readline/promises";
import { execSync } from "node:child_process";
import { stdin as input, stdout as output } from "node:process";

import { loadStagingPilotEnv } from "./lib/load-dotenv-file";
import {
import { logger } from "@/lib/logger";
  isValidUpstashToken,
  isValidUpstashUrl,
} from "./lib/staging-env-placeholders";

function sh(cmd: string): void {
  logger.cli(`\n$ ${cmd}\n`);
  execSync(cmd, { stdio: "inherit", env: { ...process.env, NPM_CONFIG_PRODUCTION: "false" } });
}

async function prompt(rl: ReturnType<typeof createInterface>, label: string): Promise<string> {
  const v = (await rl.question(`${label}: `)).trim();
  return v;
}

async function main() {
  const chain = !process.argv.includes("--no-chain");
  const preflight = process.argv.includes("--preflight");

  if (preflight) {
    loadStagingPilotEnv();
    const urlOk = isValidUpstashUrl(process.env.UPSTASH_REDIS_REST_URL ?? "");
    const tokenOk = isValidUpstashToken(process.env.UPSTASH_REDIS_REST_TOKEN ?? "");
    logger.cli("=== Upstash preflight ===\n");
    logger.cli(`UPSTASH_REDIS_REST_URL:     ${urlOk ? "OK" : "MISSING"}`);
    logger.cli(`UPSTASH_REDIS_REST_TOKEN:   ${tokenOk ? "OK" : "MISSING"}`);
    if (urlOk && tokenOk) {
      logger.cli("\nReady. Run: npm run verify:staging-env");
      return;
    }
    logger.cli("\n1. https://console.upstash.com/redis → Create Database");
    logger.cli("2. REST API tab → copy URL + Token");
    logger.cli("3. npm run staging:upstash:wizard");
    process.exit(1);
  }

  logger.cli("=== Upstash staging wizard ===\n");
  logger.cli("Open: https://console.upstash.com/redis");
  logger.cli("→ Create database (or pick existing)");
  logger.cli("→ Tab **REST API** → copy URL + Token\n");

  loadStagingPilotEnv();

  const rl = createInterface({ input, output });
  let url = "";
  let token = "";

  while (!isValidUpstashUrl(url)) {
    url = await prompt(rl, "UPSTASH_REDIS_REST_URL (https://….upstash.io)");
    if (!isValidUpstashUrl(url)) {
      logger.cli("  Invalid URL — use value from Upstash console, not doc examples.\n");
    }
  }

  while (!isValidUpstashToken(token)) {
    token = await prompt(rl, "UPSTASH_REDIS_REST_TOKEN");
    if (!isValidUpstashToken(token)) {
      logger.cli("  Token too short — paste full token from console.\n");
    }
  }
  rl.close();

  sh(
    `npm run staging:upstash:set -- --url="${url.replace(/"/g, "")}" --token="${token.replace(/"/g, "")}"`,
  );

  loadStagingPilotEnv();

  if (!chain) {
    logger.cli("\nSaved. Run: npm run pilot:next-step");
    return;
  }

  logger.cli("\n=== Chaining staging gates ===\n");
  sh("npm run staging:ops:status");
  sh("npm run verify:staging-env");
  sh("npm run staging:bootstrap-known-env");
  sh("npm run staging:url:probe");
  sh("npm run pilot:next-step -- --list");
  sh("npm run pilot:next-step:doc");
  logger.cli("\nUpstash step complete.");
  logger.cli("  1. npm run vercel:staging-push -- --apply");
  logger.cli("  2. Redeploy Vercel staging");
  logger.cli("  3. npm run staging:url:probe -- --fix");
  logger.cli("  4. npm run pilot:next-step");
  logger.cli("\nGuide: docs/generated/NEXT_STEP_INSTRUCTIONS.md");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
