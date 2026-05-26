/**
 * Continue pilot queue locally while Upstash/Vercel staging pending.
 * Sets RATE_LIMIT_ADAPTER=memory in .env.staging.local (local dev only — not Vercel GO).
 *
 *   npm run pilot:local-continue
 */
import { existsSync } from "node:fs";
import { join } from "node:path";
import { execSync } from "node:child_process";

import { loadStagingPilotEnv } from "./lib/load-dotenv-file";
import { patchEnvFile } from "./lib/patch-env-file";
import {
  isValidUpstashToken,
  isValidUpstashUrl,
} from "./lib/staging-env-placeholders";

const TARGET = join(process.cwd(), ".env.staging.local");

function sh(cmd: string): boolean {
  try {
    execSync(cmd, { stdio: "inherit", env: { ...process.env, NPM_CONFIG_PRODUCTION: "false" } });
    return true;
  } catch {
    return false;
  }
}

function main() {
  if (!existsSync(TARGET)) {
    console.error("Run: npm run staging:secrets:generate");
    process.exit(1);
  }

  loadStagingPilotEnv();
  const hasUpstash =
    isValidUpstashUrl(process.env.UPSTASH_REDIS_REST_URL) &&
    isValidUpstashToken(process.env.UPSTASH_REDIS_REST_TOKEN);

  if (hasUpstash) {
    console.log("Upstash already configured — use: npm run pilot:next-step");
    process.exit(0);
  }

  console.log("=== Local pilot continue (memory rate limits) ===\n");
  console.log("NOTE: Vercel staging still requires Upstash. This unblocks local dev + DB steps.\n");

  patchEnvFile(TARGET, "RATE_LIMIT_ADAPTER", "memory");
  patchEnvFile(TARGET, "PILOT_LOCAL_MEMORY_RATE_LIMIT", "1");

  loadStagingPilotEnv();

  sh("npm run verify:staging-env -- --local-pilot");
  sh("npm run staging:pilot:db");
  sh("npm run pilot:next-step -- --list");

  console.log("\nWhen Upstash is ready:");
  console.log("  npm run staging:upstash:wizard");
  console.log("  # Remove PILOT_LOCAL_MEMORY_RATE_LIMIT from .env.staging.local");
}

main();
