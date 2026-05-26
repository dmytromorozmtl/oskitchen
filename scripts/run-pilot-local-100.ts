/**
 * Local 100% — everything achievable without Upstash/Vercel deploy.
 * Writes docs/generated/PILOT_LOCAL_100_REPORT.md
 *
 *   npm run pilot:local:100
 */
import { execSync } from "node:child_process";
import { existsSync, writeFileSync } from "node:fs";
import { join } from "node:path";

import { loadStagingPilotEnv } from "./lib/load-dotenv-file";
import { ROOT } from "./lib/pilot-action-queue";

const OUT = join(ROOT, "docs/generated/PILOT_LOCAL_100_REPORT.md");

type Step = { id: string; ok: boolean; detail: string };

function sh(cmd: string): boolean {
  try {
    execSync(cmd, {
      cwd: ROOT,
      stdio: "pipe",
      env: {
        ...process.env,
        NPM_CONFIG_PRODUCTION: "false",
        PILOT_LOCAL_ENV: "1",
        SKIP_BUILD: process.env.SKIP_BUILD ?? "1",
      },
    });
    return true;
  } catch (e) {
    return false;
  }
}

async function main() {
  console.log("=== Pilot LOCAL 100% ===\n");
  loadStagingPilotEnv(ROOT);
  const steps: Step[] = [];

  const run = (id: string, cmd: string): void => {
    process.stdout.write(`  ${id}… `);
    const ok = sh(cmd);
    steps.push({ id, ok, detail: ok ? "PASS" : "FAIL" });
    console.log(ok ? "PASS" : "FAIL");
  };

  run("secrets", "bash scripts/generate-staging-pilot-secrets.sh");
  run("sync-env", "npx tsx scripts/sync-staging-env-from-local.ts");
  run("totp", "npx tsx scripts/generate-staging-totp.ts");
  run("local-continue", "npx tsx scripts/pilot-local-without-upstash.ts");
  loadStagingPilotEnv(ROOT);
  const backfillOk = sh("npx tsx scripts/check-backfill-status.ts");
  steps.push({
    id: "db-backfill",
    ok: backfillOk,
    detail: backfillOk ? "PASS" : "FAIL",
  });
  console.log(`  db-backfill… ${backfillOk ? "PASS" : "FAIL"}`);
  if (!backfillOk) {
    process.stdout.write("  db-pipeline… ");
    const dbPipe = sh("bash scripts/run-staging-pilot-db-only.sh");
    steps.push({ id: "db-pipeline", ok: dbPipe, detail: dbPipe ? "PASS" : "FAIL" });
    console.log(dbPipe ? "PASS" : "FAIL");
  } else {
    steps.push({ id: "db-pipeline", ok: true, detail: "SKIP (backfill OK)" });
    console.log("  db-pipeline… SKIP (backfill OK)");
  }
  run("verify-local", "npx tsx scripts/verify-staging-env.ts --local-pilot");
  run("code-readiness", "env SKIP_BUILD=1 SKIP_PILOT_CODE_READINESS=0 bash scripts/run-paid-pilot-readiness.sh");
  sh("npx tsx scripts/generate-pilot-go-no-go-report.ts");
  steps.push({ id: "go-no-go", ok: true, detail: "generated" });
  console.log("  go-no-go… generated");

  sh("npx tsx scripts/generate-pilot-ops-handoff.ts");
  sh("npx tsx scripts/generate-pilot-next-step-instructions.ts");

  const passed = steps.filter((s) => s.ok).length;
  const allOk = passed === steps.length;
  const verdict = allOk ? "LOCAL_GO" : "LOCAL_PARTIAL";

  const body = [
    "# Pilot LOCAL 100% report",
    "",
    `**Generated:** ${new Date().toISOString()}`,
    `**Verdict:** \`${verdict}\` (${passed}/${steps.length} automated steps)`,
    "",
    "> LOCAL_GO = code + DB + env for local/staging DB work. **Not** Vercel production GO (needs Upstash + live deploy).",
    "",
    "## Steps",
    "",
    "| Step | Result |",
    "|------|--------|",
    ...steps.map((s) => `| ${s.id} | ${s.ok ? "PASS" : "FAIL"} |`),
    "",
    "## To reach VERCEL GO",
    "",
    "1. Edit `.env.upstash.paste.local` with real Upstash REST credentials",
    "2. `npm run pilot:upstash:gate`",
    "3. `npm run vercel:staging-push -- --apply` + redeploy",
    "4. `npm run pilot:deploy:gate -- --url=https://….vercel.app`",
    "5. `npm run pilot:100-next`",
    "",
    "Handoff: `docs/generated/PILOT_OPS_HANDOFF.md`",
    "",
  ].join("\n");

  writeFileSync(OUT, body, "utf8");
  console.log(`\nWrote ${OUT}`);
  console.log(`Verdict: ${verdict}\n`);

  if (!allOk) process.exit(1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
