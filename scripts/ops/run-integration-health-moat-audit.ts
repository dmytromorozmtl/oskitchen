/**
 * FINAL-18 / task-212 — Integration Health moat surfaces vitest gate.
 *
 * Usage: npx tsx scripts/ops/run-integration-health-moat-audit.ts [--write]
 */
import { execSync } from "node:child_process";
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

import {
  INTEGRATION_HEALTH_DASHBOARD_PAGE,
  INTEGRATION_HEALTH_LANDING_COMPONENT,
  INTEGRATION_HEALTH_MOAT_RUNNER_SCRIPT,
  INTEGRATION_HEALTH_MOAT_SUMMARY_ARTIFACT,
  INTEGRATION_HEALTH_MOAT_SUMMARY_VERSION,
  INTEGRATION_HEALTH_MOAT_VITEST_SPEC,
  INTEGRATION_HEALTH_STRIP_COMPONENT,
} from "../../lib/execution/integration-health-moat-policy";

const VITEST_BIN = "node ./node_modules/vitest/vitest.mjs run";

function parseVitestOutput(output: string): { passed: number; failed: number; testsPassed: number } {
  const filesMatch = output.match(/Test Files\s+(\d+) failed[^\d]*(\d+) passed|Test Files\s+(\d+) passed/);
  const testsMatch = output.match(/Tests\s+(\d+) failed[^\d]*(\d+) passed|Tests\s+(\d+) passed/);
  const failed = filesMatch?.[1] != null ? Number(filesMatch[1]) : 0;
  const passed = filesMatch?.[2] != null ? Number(filesMatch[2]) : Number(filesMatch?.[3] ?? 0);
  const testsPassed = testsMatch?.[2] != null ? Number(testsMatch[2]) : Number(testsMatch?.[3] ?? 0);
  return { passed, failed, testsPassed };
}

function main() {
  const write = process.argv.includes("--write");
  const root = process.cwd();
  const runAt = new Date().toISOString();

  const stripPresent = existsSync(join(root, INTEGRATION_HEALTH_STRIP_COMPONENT));
  const landingPresent = existsSync(join(root, INTEGRATION_HEALTH_LANDING_COMPONENT));
  const dashboardPagePresent = existsSync(join(root, INTEGRATION_HEALTH_DASHBOARD_PAGE));

  let moatVitestPassed = false;
  let vitestExitCode = 1;
  let testsPassed = 0;

  try {
    const vitestOut = execSync(`${VITEST_BIN} ${INTEGRATION_HEALTH_MOAT_VITEST_SPEC} --maxWorkers=1`, {
      cwd: root,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
      maxBuffer: 20 * 1024 * 1024,
    });
    vitestExitCode = 0;
    const parsed = parseVitestOutput(vitestOut);
    moatVitestPassed = parsed.failed === 0 && parsed.passed > 0;
    testsPassed = parsed.testsPassed;
  } catch (error) {
    const err = error as { stdout?: string; stderr?: string };
    const parsed = parseVitestOutput(`${err.stdout ?? ""}\n${err.stderr ?? ""}`);
    moatVitestPassed = parsed.failed === 0 && parsed.passed > 0;
    vitestExitCode = moatVitestPassed ? 0 : 1;
    testsPassed = parsed.testsPassed;
  }

  const surfacesPresent = stripPresent && landingPresent && dashboardPagePresent;
  const overall =
    moatVitestPassed && surfacesPresent ? ("PASS" as const) : ("FAIL" as const);
  const proofStatus =
    overall === "PASS" ? "proof_passed_moat_surfaces" : "proof_failed_moat_vitest";

  const summary = {
    version: INTEGRATION_HEALTH_MOAT_SUMMARY_VERSION,
    task: "FINAL-18",
    runAt,
    overall,
    proofStatus,
    moatVitestPassed,
    vitestExitCode,
    testsPassed,
    stripPresent,
    landingPresent,
    dashboardPagePresent,
    vitestSpec: INTEGRATION_HEALTH_MOAT_VITEST_SPEC,
    stripComponent: INTEGRATION_HEALTH_STRIP_COMPONENT,
    landingComponent: INTEGRATION_HEALTH_LANDING_COMPONENT,
    dashboardPage: INTEGRATION_HEALTH_DASHBOARD_PAGE,
    runner: INTEGRATION_HEALTH_MOAT_RUNNER_SCRIPT,
    honestyNote:
      "PASS when Integration Health strip, landing moat, and dashboard page exist with contract markers and moat vitest exits 0; does not prove live channel connectivity.",
  };

  console.log("\n=== Integration Health moat (FINAL-18) ===");
  console.log(`  overall:            ${overall}`);
  console.log(`  proofStatus:        ${proofStatus}`);
  console.log(`  moat vitest:        ${moatVitestPassed ? "PASS" : "FAIL"} (${testsPassed} tests)`);
  console.log(`  surfaces:           strip=${stripPresent} landing=${landingPresent} page=${dashboardPagePresent}`);
  console.log(`  artifact:           ${INTEGRATION_HEALTH_MOAT_SUMMARY_ARTIFACT}\n`);

  if (write) {
    const path = join(root, INTEGRATION_HEALTH_MOAT_SUMMARY_ARTIFACT);
    mkdirSync(dirname(path), { recursive: true });
    writeFileSync(path, `${JSON.stringify(summary, null, 2)}\n`, "utf8");
  }

  if (overall === "FAIL") {
    process.exit(1);
  }
}

main();
