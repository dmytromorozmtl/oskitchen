/**
 * Probe candidate staging URLs and report which respond.
 *
 *   npm run staging:url:probe
 *   npm run staging:url:probe -- --fix   # write best live URL to .env.staging.local
 */
import { join } from "node:path";

import { patchEnvFile } from "./lib/patch-env-file";
import {
  bestLiveStagingUrl,
  collectVercelUrlCandidates,
  probeAllStagingUrls,
  ROOT,
} from "./lib/pilot-action-queue";

const TARGET = join(ROOT, ".env.staging.local");

async function main() {
  const fix = process.argv.includes("--fix");
  const candidates = collectVercelUrlCandidates();

  if (candidates.length === 0) {
    console.log("No .vercel.app URLs in env files.");
    process.exit(1);
  }

  console.log("=== Staging URL probe ===\n");
  const rows = await probeAllStagingUrls(candidates);

  const byUrl = new Map<string, typeof rows>();
  for (const r of rows) {
    const list = byUrl.get(r.url) ?? [];
    list.push(r);
    byUrl.set(r.url, list);
  }

  for (const [url, probes] of byUrl) {
    const summary = probes.map((p) => `${p.path}→${p.status || "ERR"}`).join(", ");
    const ok = probes.some((p) => p.ok);
    console.log(`${ok ? "OK " : "   "} ${url}`);
    console.log(`     ${summary}`);
  }

  const best = bestLiveStagingUrl(rows);
  console.log("");
  if (best) {
    console.log(`Live deploy: ${best}`);
    if (fix) {
      patchEnvFile(TARGET, "NEXT_PUBLIC_APP_URL", best);
      console.log(`Updated NEXT_PUBLIC_APP_URL in .env.staging.local`);
    } else {
      console.log(`Fix: npm run staging:url:probe -- --fix`);
    }
  } else {
    console.log(
      "No URL returned 200 on /api/health or /login — redeploy Vercel staging or set STAGING_APP_URL.",
    );
    process.exit(1);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
