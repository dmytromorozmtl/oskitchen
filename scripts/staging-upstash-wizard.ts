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
  isValidUpstashToken,
  isValidUpstashUrl,
} from "./lib/staging-env-placeholders";

function sh(cmd: string): void {
  console.log(`\n$ ${cmd}\n`);
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
    console.log("=== Upstash preflight ===\n");
    console.log(`UPSTASH_REDIS_REST_URL:     ${urlOk ? "OK" : "MISSING"}`);
    console.log(`UPSTASH_REDIS_REST_TOKEN:   ${tokenOk ? "OK" : "MISSING"}`);
    if (urlOk && tokenOk) {
      console.log("\nReady. Run: npm run verify:staging-env");
      return;
    }
    console.log("\n1. https://console.upstash.com/redis → Create Database");
    console.log("2. REST API tab → copy URL + Token");
    console.log("3. npm run staging:upstash:wizard");
    process.exit(1);
  }

  console.log("=== Upstash staging wizard ===\n");
  console.log("Open: https://console.upstash.com/redis");
  console.log("→ Create database (or pick existing)");
  console.log("→ Tab **REST API** → copy URL + Token\n");

  loadStagingPilotEnv();

  const rl = createInterface({ input, output });
  let url = "";
  let token = "";

  while (!isValidUpstashUrl(url)) {
    url = await prompt(rl, "UPSTASH_REDIS_REST_URL (https://….upstash.io)");
    if (!isValidUpstashUrl(url)) {
      console.log("  Invalid URL — use value from Upstash console, not doc examples.\n");
    }
  }

  while (!isValidUpstashToken(token)) {
    token = await prompt(rl, "UPSTASH_REDIS_REST_TOKEN");
    if (!isValidUpstashToken(token)) {
      console.log("  Token too short — paste full token from console.\n");
    }
  }
  rl.close();

  sh(
    `npm run staging:upstash:set -- --url="${url.replace(/"/g, "")}" --token="${token.replace(/"/g, "")}"`,
  );

  loadStagingPilotEnv();

  if (!chain) {
    console.log("\nSaved. Run: npm run pilot:next-step");
    return;
  }

  console.log("\n=== Chaining staging gates ===\n");
  sh("npm run staging:ops:status");
  sh("npm run verify:staging-env");
  sh("npm run staging:bootstrap-known-env");
  sh("npm run staging:url:probe");
  sh("npm run pilot:next-step -- --list");
  sh("npm run pilot:next-step:doc");
  console.log("\nUpstash step complete.");
  console.log("  1. npm run vercel:staging-push -- --apply");
  console.log("  2. Redeploy Vercel staging");
  console.log("  3. npm run staging:url:probe -- --fix");
  console.log("  4. npm run pilot:next-step");
  console.log("\nGuide: docs/generated/NEXT_STEP_INSTRUCTIONS.md");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
