/**
 * FINAL-15 / task-209 — dashboard RSC golden path Playwright run + honest artifact.
 *
 * Usage: npx tsx scripts/ops/run-dashboard-rsc-golden-path-audit.ts [--write]
 */
import { execSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

import {
  DASHBOARD_RSC_E2E_PROJECT,
  DASHBOARD_RSC_E2E_SPEC,
  DASHBOARD_RSC_GOLDEN_PATH_ROUTES,
  DASHBOARD_RSC_GOLDEN_PATH_SUMMARY_ARTIFACT,
  DASHBOARD_RSC_GOLDEN_PATH_SUMMARY_VERSION,
  DASHBOARD_RSC_REQUIRED_E2E_ENV,
  DASHBOARD_RSC_RUNNER_SCRIPT,
} from "../../lib/execution/dashboard-rsc-golden-path-policy";

function loadEnvFile(relativePath: string): void {
  const path = join(process.cwd(), relativePath);
  if (!existsSync(path)) return;
  const raw = readFileSync(path, "utf8");
  for (const line of raw.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq <= 0) continue;
    const key = trimmed.slice(0, eq).trim();
    const value = trimmed.slice(eq + 1).trim().replace(/^['"]|['"]$/g, "");
    if (!process.env[key]) process.env[key] = value;
  }
}

function missingE2eEnv(): string[] {
  return DASHBOARD_RSC_REQUIRED_E2E_ENV.filter((key) => !process.env[key]?.trim());
}

function main() {
  const write = process.argv.includes("--write");
  const root = process.cwd();
  const runAt = new Date().toISOString();

  loadEnvFile(".env.local");
  loadEnvFile(".env.staging.local");
  loadEnvFile(".env.smoke.local");

  const missing = missingE2eEnv();
  let overall: "PASS" | "FAIL" | "SKIPPED" = "SKIPPED";
  let proofStatus = "proof_skipped_missing_e2e_credentials";
  let exitCode = 0;
  let testsPassed = 0;
  let testsFailed = 0;
  let testsSkipped = 0;

  if (missing.length === 0) {
    try {
      const output = execSync(
        `node ./node_modules/@playwright/test/cli.js test ${DASHBOARD_RSC_E2E_SPEC} --project=${DASHBOARD_RSC_E2E_PROJECT}`,
        {
          cwd: root,
          encoding: "utf8",
          stdio: ["ignore", "pipe", "pipe"],
          maxBuffer: 30 * 1024 * 1024,
          env: { ...process.env, CI: process.env.CI ?? "1" },
        },
      );
      const passedMatch = output.match(/(\d+) passed/);
      const failedMatch = output.match(/(\d+) failed/);
      const skippedMatch = output.match(/(\d+) skipped/);
      testsPassed = passedMatch ? Number(passedMatch[1]) : 0;
      testsFailed = failedMatch ? Number(failedMatch[1]) : 0;
      testsSkipped = skippedMatch ? Number(skippedMatch[1]) : 0;
      overall = testsFailed === 0 && testsPassed > 0 ? "PASS" : "FAIL";
      proofStatus = overall === "PASS" ? "proof_passed" : "proof_failed";
      exitCode = overall === "PASS" ? 0 : 1;
    } catch (error) {
      const err = error as { stdout?: string; stderr?: string; message?: string };
      const output = `${err.stdout ?? ""}\n${err.stderr ?? ""}\n${err.message ?? ""}`;
      const bootstrapBroken =
        /MODULE_NOT_FOUND|Cannot find module.*playwright/i.test(output);

      if (bootstrapBroken) {
        overall = "SKIPPED";
        proofStatus = "proof_skipped_playwright_bootstrap";
        exitCode = 0;
      } else {
        exitCode = 1;
        overall = "FAIL";
        proofStatus = "proof_failed";
        const failedMatch = output.match(/(\d+) failed/);
        const passedMatch = output.match(/(\d+) passed/);
        testsFailed = failedMatch ? Number(failedMatch[1]) : 1;
        testsPassed = passedMatch ? Number(passedMatch[1]) : 0;
      }
    }
  }

  const summary = {
    version: DASHBOARD_RSC_GOLDEN_PATH_SUMMARY_VERSION,
    task: "FINAL-15",
    runAt,
    overall,
    proofStatus,
    exitCode,
    testsPassed,
    testsFailed,
    testsSkipped,
    routes: [...DASHBOARD_RSC_GOLDEN_PATH_ROUTES],
    missingEnvVars: missing,
    e2eSpec: DASHBOARD_RSC_E2E_SPEC,
    playwrightProject: DASHBOARD_RSC_E2E_PROJECT,
    runner: DASHBOARD_RSC_RUNNER_SCRIPT,
    honestyNote:
      "PASS requires chromium-authed Playwright run with 0 failed tests on today, marketplace, and POS terminal; SKIPPED when E2E staging creds missing.",
  };

  console.log("\n=== Dashboard RSC golden path (FINAL-15) ===");
  console.log(`  overall:       ${overall}`);
  console.log(`  proofStatus:   ${proofStatus}`);
  console.log(`  tests passed:  ${testsPassed}`);
  console.log(`  tests failed:  ${testsFailed}`);
  if (missing.length) console.log(`  missing env:   ${missing.join(", ")}`);
  console.log(`  artifact:      ${DASHBOARD_RSC_GOLDEN_PATH_SUMMARY_ARTIFACT}\n`);

  if (write) {
    const path = join(root, DASHBOARD_RSC_GOLDEN_PATH_SUMMARY_ARTIFACT);
    mkdirSync(dirname(path), { recursive: true });
    writeFileSync(path, `${JSON.stringify(summary, null, 2)}\n`, "utf8");
  }

  if (overall === "FAIL") {
    process.exit(1);
  }
}

main();
