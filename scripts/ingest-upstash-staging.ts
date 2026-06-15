/**
 * Save Upstash REST credentials to .env.staging.local and verify ping.
 *
 *   npm run staging:upstash:set -- --url=https://xxx.upstash.io --token=AX...
 *   UPSTASH_REDIS_REST_URL=... UPSTASH_REDIS_REST_TOKEN=... npm run staging:upstash:set
 */
import { copyFileSync, existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { parseDotenv } from "./lib/load-dotenv-file";
import { patchEnvFile } from "./lib/patch-env-file";
import {
  isPlaceholderEnvValue,
  isValidUpstashToken,
  isValidUpstashUrl,
} from "./lib/staging-env-placeholders";

const TARGET = join(process.cwd(), ".env.staging.local");
const EXAMPLE = join(process.cwd(), ".env.staging.example");

function arg(name: string): string | undefined {
  return process.argv.find((a) => a.startsWith(`--${name}=`))?.split("=").slice(1).join("=");
}

async function main(): Promise<void> {
  const fromFile = arg("from-file")?.trim();
  const fileEnv = fromFile && existsSync(fromFile) ? parseDotenv(readFileSync(fromFile, "utf8")) : {};

  const url =
    arg("url")?.trim() ??
    fileEnv.UPSTASH_REDIS_REST_URL?.trim() ??
    process.env.UPSTASH_REDIS_REST_URL?.trim();
  const token =
    arg("token")?.trim() ??
    fileEnv.UPSTASH_REDIS_REST_TOKEN?.trim() ??
    process.env.UPSTASH_REDIS_REST_TOKEN?.trim();

  if (!url || !token) {
    console.error(
      "Usage:\n" +
        "  npm run staging:upstash:set -- --url=https://….upstash.io --token=…\n" +
        "Or export UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN",
    );
    process.exit(1);
  }

  if (!isValidUpstashUrl(url)) {
    console.error(
      "Invalid Upstash URL. Use https://xxxx.upstash.io from console → REST API (not a doc placeholder).",
    );
    process.exit(1);
  }
  if (!isValidUpstashToken(token)) {
    console.error("Invalid token. Paste the full UPSTASH_REDIS_REST_TOKEN from Upstash console.");
    process.exit(1);
  }

  if (!existsSync(TARGET)) {
    copyFileSync(EXAMPLE, TARGET);
  }

  patchEnvFile(TARGET, "UPSTASH_REDIS_REST_URL", url.replace(/\/$/, ""));
  patchEnvFile(TARGET, "UPSTASH_REDIS_REST_TOKEN", token);
  patchEnvFile(TARGET, "RATE_LIMIT_ADAPTER", "upstash");

  console.log("Saved UPSTASH_* to .env.staging.local");
  console.log("Verifying ping…");

  const res = await fetch(`${url.replace(/\/$/, "")}/ping`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    console.error(`Upstash ping failed: HTTP ${res.status}`);
    process.exit(1);
  }

  console.log("Upstash ping OK.");

  if (process.argv.includes("--continue")) {
    const { execSync } = await import("node:child_process");
    const run = (c: string): void => {
      console.log(`\n$ ${c}\n`);
      execSync(c, { stdio: "inherit", env: { ...process.env, NPM_CONFIG_PRODUCTION: "false" } });
    };
    run("npm run verify:staging-env");
    run("npm run vercel:staging-push -- --dry-run");
    console.log("\nApply to Vercel: npm run vercel:staging-push -- --apply");
    run("npm run pilot:next-step -- --list");
  } else {
    console.log("\nNext:");
    console.log("  npm run staging:upstash:wizard   # interactive + chain");
    console.log("  npm run vercel:staging-push -- --apply");
    console.log("  npm run verify:staging-env");
    console.log("  npm run pilot:next-step");
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
