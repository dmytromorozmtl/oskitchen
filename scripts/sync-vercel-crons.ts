/**
 * Apply a Vercel cron profile to vercel.json.
 *
 * Profiles:
 *   production — `services/cron/production-manifest.ts` (allowlist + schedules)
 *   staging    — full experiment + compliance set (config/vercel/crons-full.json)
 *   full       — alias of staging
 *
 * Usage:
 *   npm run vercel:crons:production
 *   npm run vercel:crons:staging
 *   CRON_PROFILE=production tsx scripts/sync-vercel-crons.ts
 */
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

import {
  ALLOWED_PRODUCTION_CRON_PATHS,
  ALLOWED_PRODUCTION_CRON_SLUGS,
  buildProductionCronEntries,
} from "../services/cron/production-manifest";

const ROOT = process.cwd();
const VERCEL_PATH = join(ROOT, "vercel.json");

type CronEntry = { path: string; schedule: string };

const PROFILES: Record<string, string> = {
  staging: join(ROOT, "config/vercel/crons-full.json"),
  full: join(ROOT, "config/vercel/crons-full.json"),
};

function validateProductionCrons(crons: CronEntry[]): void {
  const paths = new Set(crons.map((c) => c.path));
  const missing = ALLOWED_PRODUCTION_CRON_PATHS.filter((p) => !paths.has(p));
  const extra = crons.map((c) => c.path).filter((p) => !ALLOWED_PRODUCTION_CRON_PATHS.includes(p));

  if (missing.length > 0) {
    throw new Error(`Production cron profile missing allowlisted paths: ${missing.join(", ")}`);
  }
  if (extra.length > 0) {
    throw new Error(
      `Production cron profile has paths not on allowlist (remove or add to production-manifest): ${extra.join(", ")}`,
    );
  }
  if (crons.length !== ALLOWED_PRODUCTION_CRON_SLUGS.length) {
    throw new Error(
      `Expected ${ALLOWED_PRODUCTION_CRON_SLUGS.length} production crons, got ${crons.length}`,
    );
  }
}

function writeCronsProductionJson(crons: CronEntry[]): void {
  const outPath = join(ROOT, "config/vercel/crons-production.json");
  writeFileSync(outPath, `${JSON.stringify(crons, null, 2)}\n`, "utf8");
  console.log(`  Wrote ${outPath.replace(ROOT, ".")}`);
}

function main(): void {
  const profile = (process.env.CRON_PROFILE ?? process.argv[2] ?? "production").toLowerCase();

  const vercel = JSON.parse(readFileSync(VERCEL_PATH, "utf8")) as {
    crons?: CronEntry[];
    [key: string]: unknown;
  };

  let crons: CronEntry[];

  if (profile === "production") {
    crons = buildProductionCronEntries();
    validateProductionCrons(crons);
    writeCronsProductionJson(crons);
  } else {
    const cronFile = PROFILES[profile];
    if (!cronFile) {
      console.error(`Unknown profile "${profile}". Use: production, ${Object.keys(PROFILES).join(", ")}`);
      process.exitCode = 1;
      return;
    }
    crons = JSON.parse(readFileSync(cronFile, "utf8")) as CronEntry[];
    if (!Array.isArray(crons) || crons.some((c) => !c.path || !c.schedule)) {
      console.error(`Invalid cron file: ${cronFile}`);
      process.exitCode = 1;
      return;
    }
  }

  vercel.crons = crons;
  writeFileSync(VERCEL_PATH, `${JSON.stringify(vercel, null, 2)}\n`, "utf8");

  console.log(`✓ vercel.json crons → profile "${profile}" (${crons.length} paths)`);
  if (profile === "production") {
    console.log(`  Source: services/cron/production-manifest.ts`);
    console.log("  Staging / game-day: npm run vercel:crons:staging");
  } else {
    console.log(`  Source: ${PROFILES[profile]!.replace(ROOT, ".")}`);
  }
}

main();
