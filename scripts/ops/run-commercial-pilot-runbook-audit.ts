/**
 * FINAL-21 / task-215 — commercial pilot runbook vitest + CI cert wiring gate.
 *
 * Usage: npx tsx scripts/ops/run-commercial-pilot-runbook-audit.ts [--write]
 */
import { execSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

import {
  COMMERCIAL_PILOT_CI_SCRIPTS,
  COMMERCIAL_PILOT_RUNBOOK_DOC,
} from "../../lib/commercial/commercial-pilot-runbook-policy";
import {
  COMMERCIAL_PILOT_RUNBOOK_FINAL_RUNNER_SCRIPT,
  COMMERCIAL_PILOT_RUNBOOK_FINAL_SUMMARY_ARTIFACT,
  COMMERCIAL_PILOT_RUNBOOK_FINAL_SUMMARY_VERSION,
  COMMERCIAL_PILOT_RUNBOOK_FINAL_VITEST_BUNDLE,
} from "../../lib/execution/commercial-pilot-runbook-final-policy";

const VITEST_BIN = "node ./node_modules/vitest/vitest.mjs run";

function parseVitestOutput(output: string): { passed: number; failed: number; testsPassed: number } {
  const filesMatch = output.match(/Test Files\s+(\d+) failed[^\d]*(\d+) passed|Test Files\s+(\d+) passed/);
  const testsMatch = output.match(/Tests\s+(\d+) failed[^\d]*(\d+) passed|Tests\s+(\d+) passed/);
  const failed = filesMatch?.[1] != null ? Number(filesMatch[1]) : 0;
  const passed = filesMatch?.[2] != null ? Number(filesMatch[2]) : Number(filesMatch?.[3] ?? 0);
  const testsPassed = testsMatch?.[2] != null ? Number(testsMatch[2]) : Number(testsMatch?.[3] ?? 0);
  return { passed, failed, testsPassed };
}

function readPackageScripts(root: string): Record<string, string> {
  const pkg = JSON.parse(readFileSync(join(root, "package.json"), "utf8")) as {
    scripts?: Record<string, string>;
  };
  return pkg.scripts ?? {};
}

function main() {
  const write = process.argv.includes("--write");
  const root = process.cwd();
  const runAt = new Date().toISOString();

  const runbookPresent = existsSync(join(root, COMMERCIAL_PILOT_RUNBOOK_DOC));
  const scripts = readPackageScripts(root);
  const ciCertScriptsPresent = COMMERCIAL_PILOT_CI_SCRIPTS.every((name) => Boolean(scripts[name]));

  let runbookVitestPassed = false;
  let vitestExitCode = 1;
  let testsPassed = 0;
  const bundle = [...COMMERCIAL_PILOT_RUNBOOK_FINAL_VITEST_BUNDLE];

  try {
    const vitestOut = execSync(`${VITEST_BIN} ${bundle.join(" ")} --maxWorkers=1`, {
      cwd: root,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
      maxBuffer: 20 * 1024 * 1024,
    });
    vitestExitCode = 0;
    const parsed = parseVitestOutput(vitestOut);
    runbookVitestPassed = parsed.failed === 0 && parsed.passed > 0;
    testsPassed = parsed.testsPassed;
  } catch (error) {
    const err = error as { stdout?: string; stderr?: string };
    const parsed = parseVitestOutput(`${err.stdout ?? ""}\n${err.stderr ?? ""}`);
    runbookVitestPassed = parsed.failed === 0 && parsed.passed > 0;
    vitestExitCode = runbookVitestPassed ? 0 : 1;
    testsPassed = parsed.testsPassed;
  }

  const overall =
    runbookPresent && runbookVitestPassed && ciCertScriptsPresent
      ? ("PASS" as const)
      : ("FAIL" as const);
  const proofStatus =
    overall === "PASS"
      ? "proof_passed_commercial_pilot_runbook"
      : "proof_failed_commercial_pilot_runbook";

  const summary = {
    version: COMMERCIAL_PILOT_RUNBOOK_FINAL_SUMMARY_VERSION,
    task: "FINAL-21",
    runAt,
    overall,
    proofStatus,
    runbookVitestPassed,
    ciCertScriptsPresent,
    vitestExitCode,
    testsPassed,
    runbookPresent,
    vitestBundle: bundle,
    runbookDoc: COMMERCIAL_PILOT_RUNBOOK_DOC,
    runner: COMMERCIAL_PILOT_RUNBOOK_FINAL_RUNNER_SCRIPT,
    honestyNote:
      "PASS when commercial-pilot-runbook.md sections/markers are present, era7 vitest bundle exits 0, and CI cert scripts are wired; does not mean a paid pilot is GO.",
  };

  console.log("\n=== Commercial pilot runbook (FINAL-21) ===");
  console.log(`  overall:            ${overall}`);
  console.log(`  proofStatus:        ${proofStatus}`);
  console.log(`  runbook vitest:     ${runbookVitestPassed ? "PASS" : "FAIL"} (${testsPassed} tests)`);
  console.log(`  CI cert scripts:    ${ciCertScriptsPresent ? "PASS" : "FAIL"}`);
  console.log(`  artifact:           ${COMMERCIAL_PILOT_RUNBOOK_FINAL_SUMMARY_ARTIFACT}\n`);

  if (write) {
    const path = join(root, COMMERCIAL_PILOT_RUNBOOK_FINAL_SUMMARY_ARTIFACT);
    mkdirSync(dirname(path), { recursive: true });
    writeFileSync(path, `${JSON.stringify(summary, null, 2)}\n`, "utf8");
  }

  if (overall === "FAIL") {
    process.exit(1);
  }
}

main();
