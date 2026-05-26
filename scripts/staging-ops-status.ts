/**
 * Staging ops readiness — what's missing for 100% GO (no secret values printed).
 *
 *   npm run staging:ops:status
 */
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { execSync } from "node:child_process";

import { loadStagingPilotEnv } from "./lib/load-dotenv-file";
import {
  isPlaceholderEnvValue,
  isValidUpstashToken,
  isValidUpstashUrl,
} from "./lib/staging-env-placeholders";
import {
  bestLiveStagingUrl,
  collectVercelUrlCandidates,
  nextIncompletePilotAction,
  pilotStagingUrl,
  probeAllStagingUrls,
  resolvePilotQueue,
} from "./lib/pilot-action-queue";
import { getUpstashPasteState } from "./lib/upstash-paste-state";

const KEYS = [
  { key: "CRON_SECRET", required: true },
  { key: "ENCRYPTION_KEY", required: true },
  { key: "PLATFORM_IMPERSONATION_TOTP_SECRET", required: true },
  { key: "UPSTASH_REDIS_REST_URL", required: true, validate: isValidUpstashUrl },
  { key: "UPSTASH_REDIS_REST_TOKEN", required: true, validate: isValidUpstashToken },
  {
    key: "NEXT_PUBLIC_APP_URL",
    required: true,
    validate: (v: string) => !isPlaceholderEnvValue(v),
  },
  { key: "DATABASE_URL", required: true, validate: (v: string) => !v.includes("aws-REGION") },
] as const;

async function main() {
  loadStagingPilotEnv();

  const resolved = await resolvePilotQueue();
  const done = resolved.filter((x) => x.complete).length;
  const pct = resolved.length ? Math.round((done / resolved.length) * 100) : 0;
  const next = await nextIncompletePilotAction();
  const paste = getUpstashPasteState(process.cwd());

  console.log("=== Staging ops status ===\n");
  console.log(`Pilot queue: ${done}/${resolved.length} (${pct}%)`);
  console.log(`Next blocker: ${next?.id ?? "none"}\n`);

  let fail = 0;
  for (const { key, required, validate } of KEYS) {
    const val = process.env[key]?.trim() ?? "";
    const ok =
      Boolean(val) &&
      !isPlaceholderEnvValue(val) &&
      (!validate || validate(val));
    const tag = ok ? "OK " : required ? "FAIL" : "WARN";
    if (!ok && required) fail++;
    let hint = "";
    if (key.startsWith("UPSTASH") && !ok) {
      hint = " → npm run pilot:upstash:gate";
    }
    if (key === "PLATFORM_IMPERSONATION_TOTP_SECRET" && !ok) {
      hint = " → npm run staging:totp:generate";
    }
    if (key === "NEXT_PUBLIC_APP_URL" && !ok) {
      hint = " → npm run staging:bootstrap-known-env";
    }
    console.log(`${tag.padEnd(5)} ${key}${hint}`);
  }

  const stagingFile = join(process.cwd(), ".env.staging.local");
  if (existsSync(stagingFile)) {
    const raw = readFileSync(stagingFile, "utf8");
    if (raw.includes("ВАШ") || raw.includes("AX…")) {
      console.log(
        "\nWARN  .env.staging.local contains doc placeholders — npm run staging:env:clean-placeholders",
      );
      fail++;
    }
    if (raw.includes("PILOT_LOCAL_MEMORY_RATE_LIMIT=1")) {
      console.log(
        "\nWARN  PILOT_LOCAL_MEMORY_RATE_LIMIT=1 — remove after Upstash: npm run pilot:upstash:gate",
      );
    }
  }

  if (!isValidUpstashUrl(process.env.UPSTASH_REDIS_REST_URL ?? "")) {
    console.log(`\nNOTE  Upstash paste: ${paste.state} (${paste.path})`);
    if (paste.state === "template") {
      console.log("      Replace example URL + paste TOKEN from console, then: npm run pilot:upstash:gate");
    }
  }

  const url = pilotStagingUrl();
  if (url) {
    const candidates = collectVercelUrlCandidates();
    const rows = await probeAllStagingUrls(candidates.length ? candidates : [url]);
    const live = bestLiveStagingUrl(rows);
    if (live) {
      console.log(`\nOK    Deploy responds (${live})`);
    } else {
      console.log(`\nFAIL  Deploy not live — npm run pilot:deploy:gate`);
      fail++;
    }
  }

  console.log("\n--- DO THIS NOW ---\n");
  if (next?.id === "upstash") {
    console.log("  1. Edit .env.upstash.paste.local (Upstash Console → REST API)");
    console.log("  2. npm run pilot:upstash:gate");
    console.log("  3. npm run vercel:staging-push -- --apply && redeploy");
  } else if (next?.id === "deploy-live") {
    console.log("  1. Vercel → Redeploy staging");
    console.log("  2. npm run pilot:deploy:gate -- --url=https://NEW-PREVIEW.vercel.app");
  } else {
    console.log("  npm run pilot:100-next");
  }

  try {
    execSync("npx tsx scripts/generate-pilot-ops-handoff.ts", {
      stdio: "pipe",
      env: { ...process.env, NPM_CONFIG_PRODUCTION: "false" },
    });
    execSync("npx tsx scripts/generate-pilot-next-step-instructions.ts", {
      stdio: "pipe",
      env: { ...process.env, NPM_CONFIG_PRODUCTION: "false" },
    });
    console.log("\nHandoff: docs/generated/PILOT_OPS_HANDOFF.md");
    console.log("Guide:  docs/generated/NEXT_STEP_INSTRUCTIONS.md");
  } catch {
    /* ignore */
  }

  process.exit(fail > 0 ? 1 : 0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
