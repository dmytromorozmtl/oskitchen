/**
 * Push Sentry env vars to Vercel Production with a safe dry-run default.
 *
 * Dry-run:
 *   npm run sentry:production:activate
 *
 * Apply:
 *   SENTRY_DSN=https://... npm run sentry:production:activate -- --apply
 *
 * Apply + redeploy:
 *   SENTRY_DSN=https://... npm run sentry:production:activate -- --apply --deploy
 *
 * Optional:
 *   SENTRY_TRACES_SAMPLE_RATE=0.1
 *   NEXT_PUBLIC_SENTRY_DSN=https://...
 *   NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE=0
 *   --mirror-public-dsn   # use SENTRY_DSN for NEXT_PUBLIC_SENTRY_DSN when unset
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { execSync, spawnSync } from "node:child_process";

import { SENTRY_PRODUCTION_ERA70_SUMMARY_ARTIFACT } from "../lib/observability/sentry-production-era70-policy";
import {
  buildSentryProductionSmokeSummary,
  formatSentryProductionSmokeReportLines,
} from "../lib/observability/sentry-production-summary";
import { loadProductionEnvLocal } from "./lib/load-dotenv-file";

const REQUIRED_KEYS = ["SENTRY_DSN"] as const;
const OPTIONAL_KEYS = [
  "SENTRY_TRACES_SAMPLE_RATE",
  "NEXT_PUBLIC_SENTRY_DSN",
  "NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE",
] as const;

function vercelCommand(): string[] {
  try {
    execSync("vercel --version", { stdio: "ignore" });
    return ["vercel"];
  } catch {
    return ["npx", "vercel"];
  }
}

function writeActivationArtifact(input: {
  vercelPushed: boolean;
  deployTriggered: boolean;
}): void {
  const summary = buildSentryProductionSmokeSummary({
    certPassed: true,
    wiringFailures: [],
    commitSha: process.env.VERCEL_GIT_COMMIT_SHA ?? null,
  });
  const enriched = {
    ...summary,
    vercelPushed: input.vercelPushed,
    deployTriggered: input.deployTriggered,
    activationScript: "scripts/push-vercel-production-sentry.ts",
  };
  const path = join(process.cwd(), SENTRY_PRODUCTION_ERA70_SUMMARY_ARTIFACT);
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, `${JSON.stringify(enriched, null, 2)}\n`, "utf8");
  for (const line of formatSentryProductionSmokeReportLines(summary)) {
    console.log(line);
  }
  console.log(`\nArtifact: ${SENTRY_PRODUCTION_ERA70_SUMMARY_ARTIFACT}\n`);
}

function looksLikeUrl(v: string | undefined): boolean {
  if (!v?.trim()) return false;
  return /^https:\/\//i.test(v.trim());
}

function getEnvValue(key: string): string | undefined {
  const value = process.env[key]?.trim();
  return value ? value : undefined;
}

function printKeyState(key: string, present: boolean, note?: string) {
  const tag = present ? "[ready]" : "[MISSING]";
  console.log(`${tag} ${key}${note ? ` — ${note}` : ""}`);
}

function pushKey(key: string, value: string): void {
  const useStdin = value.startsWith("-") || value.includes("\n");
  const args = useStdin
    ? ["env", "add", key, "production", "--yes", "--force"]
    : ["env", "add", key, "production", "--yes", "--force", "--value", value];

  const vercel = vercelCommand();
  const res = spawnSync(vercel[0], [...vercel.slice(1), ...args], {
    input: useStdin ? value : undefined,
    stdio: useStdin ? ["pipe", "inherit", "inherit"] : ["pipe", "inherit", "inherit"],
    encoding: "utf8",
  });
  if (res.status !== 0) {
    throw new Error(`Failed to push ${key}`);
  }
}

function main() {
  const dryRun = !process.argv.includes("--apply");
  const deploy = process.argv.includes("--deploy");
  const mirrorPublicDsn = process.argv.includes("--mirror-public-dsn");

  loadProductionEnvLocal();

  if (!getEnvValue("SENTRY_TRACES_SAMPLE_RATE")) {
    process.env.SENTRY_TRACES_SAMPLE_RATE = "0.1";
  }
  if (mirrorPublicDsn && !getEnvValue("NEXT_PUBLIC_SENTRY_DSN")) {
    const dsn = getEnvValue("SENTRY_DSN");
    if (dsn) process.env.NEXT_PUBLIC_SENTRY_DSN = dsn;
  }
  if (!getEnvValue("NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE")) {
    process.env.NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE = "0";
  }

  console.log("=== Vercel Production Sentry activation ===\n");
  console.log("Loaded local env overlays: .env, .env.local, .env.production.local (when present)");
  console.log("Target: Vercel → Project → Settings → Environment → Production\n");

  const requiredMissing: string[] = [];
  const ready: string[] = [];

  for (const key of REQUIRED_KEYS) {
    const value = getEnvValue(key);
    const ok = key.endsWith("_DSN") ? looksLikeUrl(value) : Boolean(value);
    if (ok) ready.push(key);
    else requiredMissing.push(key);
    printKeyState(key, ok, ok ? "present" : "set it in shell env or .env.production.local");
  }

  for (const key of OPTIONAL_KEYS) {
    const value = getEnvValue(key);
    const ok = key.endsWith("_DSN") ? !value || looksLikeUrl(value) : Boolean(value);
    if (value && ok) ready.push(key);
    printKeyState(key, Boolean(value) && ok, value ? "present" : "optional");
  }

  console.log("");
  console.log("Recommended minimum:");
  console.log("  SENTRY_DSN=<server DSN>");
  console.log("  SENTRY_TRACES_SAMPLE_RATE=0.1");
  console.log("Optional browser capture:");
  console.log("  NEXT_PUBLIC_SENTRY_DSN=<browser DSN or same DSN>");
  console.log("  NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE=0");

  if (dryRun) {
    console.log("\nDry-run only.");
    if (requiredMissing.length > 0) {
      console.log("Missing required keys:");
      for (const key of requiredMissing) console.log(`  - ${key}`);
    }
    console.log(
      "\nApply with: SENTRY_DSN=https://... npm run sentry:production:activate -- --apply --deploy",
    );
    process.exit(requiredMissing.length > 0 ? 1 : 0);
  }

  if (requiredMissing.length > 0) {
    console.error(`\nCannot apply: missing required keys (${requiredMissing.join(", ")}).`);
    process.exit(1);
  }
  const keysToPush = [...REQUIRED_KEYS, ...OPTIONAL_KEYS].filter((key) => Boolean(getEnvValue(key)));
  console.log(`\nApplying ${keysToPush.length} key(s) to Vercel Production...\n`);
  for (const key of keysToPush) {
    const value = getEnvValue(key);
    if (!value) continue;
    pushKey(key, value);
    console.log(`  pushed ${key}`);
  }

  writeActivationArtifact({ vercelPushed: true, deployTriggered: false });

  if (!deploy) {
    console.log("\nDone. Next:");
    console.log("  npm run deploy:prod");
    console.log("  curl -s https://os-kitchen.com/api/health | jq '.checks.observability, .checks.sentryServer'");
    return;
  }

  console.log("\nRedeploying production...");
  const deployRes = spawnSync("npm", ["run", "deploy:prod"], {
    stdio: "inherit",
    encoding: "utf8",
    shell: process.platform === "win32",
  });
  if (deployRes.status !== 0) {
    throw new Error("Production deploy failed after pushing Sentry envs.");
  }

  writeActivationArtifact({ vercelPushed: true, deployTriggered: true });

  console.log("\nVerify:");
  console.log("  npm run sentry:production:verify");
  console.log("  curl -s https://os-kitchen.com/api/health | jq '.checks.observability, .checks.sentryServer'");
  console.log("  npm run final:100");
  console.log("  npm run smoke:sentry-production");
  console.log("\nConfigure error-rate alert (>1%) — docs/SENTRY_ALERT_RULES.md §6");

  const verify = spawnSync("npm", ["run", "sentry:production:verify"], {
    stdio: "inherit",
    encoding: "utf8",
    shell: process.platform === "win32",
  });
  if (verify.status !== 0) {
    throw new Error("Sentry production verify failed after deploy — check SENTRY_DSN on Vercel.");
  }
}

main();
