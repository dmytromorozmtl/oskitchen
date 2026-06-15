/**
 * Batch closed-beta preflight for 1–3 (or more) kitchen owner emails (step 6).
 *
 *   npm run beta:cohort -- --emails=chef1@x.com,chef2@x.com,chef3@x.com
 *   BETA_COHORT_EMAILS=chef1@x.com,chef2@x.com npm run beta:cohort
 */
import { spawnSync } from "node:child_process";

import { loadBetaEnv, applyPlaywrightEnvFromSmoke } from "@/lib/beta-ops/load-beta-env";
import { resolveCohortEmails } from "@/lib/beta-ops/cohort-emails";

function emailsFromArgv(): string[] {
  const env = process.env.BETA_COHORT_EMAILS?.split(/[,;\s]+/).map((e) => e.trim()).filter(Boolean) ?? [];
  const arg = process.argv.find((a) => a.startsWith("--emails="))?.split("=")[1];
  const fromArg =
    arg
      ?.split(/[,;]/)
      .map((e) => e.trim())
      .filter(Boolean) ?? [];
  return [...new Set([...env, ...fromArg])];
}

async function main() {
  loadBetaEnv();
  applyPlaywrightEnvFromSmoke();
  const resolved = resolveCohortEmails();
  const emails = resolved.emails.length ? resolved.emails : emailsFromArgv();
  if (emails.length === 0) {
    console.error("Usage: npm run beta:cohort -- --emails=owner1@,owner2@,owner3@");
    process.exit(1);
  }
  if (emails.length > 10) {
    console.error("Max 10 emails per cohort run.");
    process.exit(1);
  }

  console.log(`=== Closed beta cohort (${emails.length} kitchens) ===\n`);
  let fail = 0;
  for (const email of emails) {
    console.log(`--- ${email} ---`);
    const r = spawnSync("npm", ["run", "beta:kitchen-preflight", "--", `--email=${email}`], {
      stdio: "inherit",
      shell: process.platform === "win32",
    });
    if (r.status !== 0) fail++;
    console.log("");
  }

  const summary = {
    generatedAt: new Date().toISOString(),
    total: emails.length,
    failed: fail,
    emails,
    ready: fail === 0,
  };
  const { mkdirSync, writeFileSync } = await import("node:fs");
  const { join } = await import("node:path");
  const outDir = join(process.cwd(), "docs", "artifacts");
  mkdirSync(outDir, { recursive: true });
  writeFileSync(join(outDir, "BETA_COHORT_PREFLIGHT.json"), JSON.stringify(summary, null, 2), "utf8");
  console.log(`Wrote docs/artifacts/BETA_COHORT_PREFLIGHT.json`);

  if (fail > 0) {
    console.error(`${fail}/${emails.length} kitchens NOT ready.`);
    process.exit(1);
  }
  console.log(`All ${emails.length} kitchens passed preflight.`);
}

main();
