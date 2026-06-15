/**
 * Single entry: run all automatable gates for current blocker, then pilot:next-step.
 *
 *   npm run pilot:100-next
 */
import { execSync } from "node:child_process";

import { loadStagingPilotEnv } from "./lib/load-dotenv-file";
import {
  isValidUpstashToken,
  isValidUpstashUrl,
} from "./lib/staging-env-placeholders";
import {
  bestLiveStagingUrl,
  collectVercelUrlCandidates,
  nextIncompletePilotAction,
  probeAllStagingUrls,
  pilotStagingUrl,
  ROOT,
} from "./lib/pilot-action-queue";

function sh(cmd: string): boolean {
  try {
    execSync(cmd, {
      cwd: ROOT,
      stdio: "inherit",
      env: { ...process.env, NPM_CONFIG_PRODUCTION: "false" },
    });
    return true;
  } catch {
    return false;
  }
}

async function main() {
  console.log("=== Pilot 100% — automated next step ===\n");
  loadStagingPilotEnv(ROOT);

  const hasUpstash =
    isValidUpstashUrl(process.env.UPSTASH_REDIS_REST_URL ?? "") &&
    isValidUpstashToken(process.env.UPSTASH_REDIS_REST_TOKEN ?? "");

  if (!hasUpstash) {
    console.log("Phase 1/2: Upstash gate\n");
    const code = sh("npm run pilot:upstash:gate") ? 0 : 2;
    if (code !== 0) {
      loadStagingPilotEnv(ROOT);
      const retry =
        isValidUpstashUrl(process.env.UPSTASH_REDIS_REST_URL ?? "") &&
        isValidUpstashToken(process.env.UPSTASH_REDIS_REST_TOKEN ?? "");
      if (!retry) process.exit(2);
    }
  }

  const url = pilotStagingUrl();
  const candidates = collectVercelUrlCandidates();
  const rows = url || candidates.length ? await probeAllStagingUrls(candidates.length ? candidates : url ? [url] : []) : [];
  const live = bestLiveStagingUrl(rows);

  if (!live && url) {
    console.log("\nPhase 2/2: Deploy gate\n");
    if (!sh("npm run pilot:deploy:gate")) {
      /* checklist written */
    }
  }

  console.log("\nPhase 3: Pilot queue step\n");
  sh("npm run pilot:next-step");
  sh("npm run pilot:ops:handoff");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
