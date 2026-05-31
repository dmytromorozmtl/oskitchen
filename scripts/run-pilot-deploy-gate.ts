/**
 * Deploy-live blocker — discover URL, probe, fix env, redeploy checklist.
 *
 *   npm run pilot:deploy:gate
 *   npm run pilot:deploy:gate -- --url=https://your-preview.vercel.app
 */
import { execSync } from "node:child_process";
import { writeFileSync } from "node:fs";
import { join } from "node:path";

import { patchEnvFile } from "./lib/patch-env-file";
import {
  bestLiveStagingUrl,
  collectVercelUrlCandidates,
  pilotStagingUrl,
  probeAllStagingUrls,
  ROOT,
} from "./lib/pilot-action-queue";
import { loadStagingPilotEnv } from "./lib/load-dotenv-file";
import { isPlaceholderEnvValue } from "./lib/staging-env-placeholders";

const TARGET = join(ROOT, ".env.staging.local");
const CHECKLIST = join(ROOT, "docs/generated/PILOT_DEPLOY_VERCEL_CHECKLIST.md");

function arg(name: string): string | undefined {
  return process.argv.find((a) => a.startsWith(`--${name}=`))?.split("=").slice(1).join("=");
}

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
  console.log("=== Pilot deploy gate ===\n");
  loadStagingPilotEnv(ROOT);

  const override = arg("url")?.trim();
  if (override && !isPlaceholderEnvValue(override)) {
    patchEnvFile(TARGET, "NEXT_PUBLIC_APP_URL", override.replace(/\/$/, ""));
    if (process.env.STAGING_APP_URL !== undefined) {
      patchEnvFile(TARGET, "STAGING_APP_URL", override.replace(/\/$/, ""));
    }
    loadStagingPilotEnv(ROOT);
    console.log(`Set staging URL: ${override}\n`);
  }

  sh("npx tsx scripts/bootstrap-staging-from-known-env.ts");

  const candidates = collectVercelUrlCandidates();
  const explicit = pilotStagingUrl();
  if (explicit && !candidates.includes(explicit)) candidates.unshift(explicit);

  if (candidates.length === 0) {
    console.error("No staging URL candidates. Use: npm run pilot:deploy:gate -- --url=https://….vercel.app");
    process.exit(1);
  }

  console.log("Probing deploy health…\n");
  const rows = await probeAllStagingUrls(candidates);
  for (const r of rows) {
    console.log(`  ${r.url}${r.path} → HTTP ${r.status || "ERR"}${r.ok ? " ✓" : ""}`);
  }

  const live = bestLiveStagingUrl(rows);
  if (live) {
    patchEnvFile(TARGET, "NEXT_PUBLIC_APP_URL", live);
    console.log(`\nLive deploy: ${live}`);
    sh("npm run pilot:next-step:doc");
    console.log("\nDeploy gate OK. Run: npm run pilot:next-step");
    return;
  }

  const checklist = [
    "# Vercel staging redeploy checklist",
    "",
    `Generated: ${new Date().toISOString()}`,
    "",
    "## Symptom",
    "",
    "All candidate URLs return **404** on `/api/health`, `/login`, `/`.",
    "",
    "## Fix (Ops)",
    "",
    "1. [Vercel Dashboard](https://vercel.com) → OS Kitchen project → **Deployments**",
    "2. Find latest **staging** / **preview** deployment (or branch linked to staging)",
    "3. Click **⋯** → **Redeploy** (use existing build or trigger new from main/staging branch)",
    "4. Copy deployment URL (must end with `.vercel.app`)",
    "5. Run:",
    "",
    "```bash",
    "npm run pilot:deploy:gate -- --url=https://YOUR-NEW-PREVIEW.vercel.app",
    "npm run vercel:staging-push -- --apply",
    "```",
    "",
    "6. Verify:",
    "",
    "```bash",
    "npm run staging:url:probe -- --fix",
    "SMOKE_BASE_URL=$NEXT_PUBLIC_APP_URL npm run smoke:golden-path-http",
    "```",
    "",
    "## CI alternative",
    "",
    "GitHub → **Paid Pilot Gate** → Run workflow → use deployment URL from workflow summary.",
    "",
    "## Candidates probed",
    "",
    ...candidates.map((u) => `- ${u}`),
    "",
  ].join("\n");

  writeFileSync(CHECKLIST, checklist, "utf8");
  console.log(`\nNo live deploy. Wrote ${CHECKLIST}`);
  sh("npm run pilot:next-step:doc", false);
  process.exit(2);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
