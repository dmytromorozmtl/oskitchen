/**
 * FINAL-14 / task-208 — run final-orchestrator vitest bundle; write honest PASS/FAIL artifact.
 *
 * Usage: npx tsx scripts/ops/run-vitest-health-audit.ts [--write]
 */
import { execSync } from "node:child_process";
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

import {
  VITEST_HEALTH_FINAL_ORCHESTRATOR_TESTS,
  VITEST_HEALTH_NPM_SCRIPT,
  VITEST_HEALTH_RUNNER_SCRIPT,
  VITEST_HEALTH_SUMMARY_ARTIFACT,
  VITEST_HEALTH_SUMMARY_VERSION,
} from "../../lib/execution/vitest-health-policy";

const VITEST_BIN = "node ./node_modules/vitest/vitest.mjs run";

function parseVitestSummary(output: string): {
  testFilesPassed: number;
  testFilesFailed: number;
  testsPassed: number;
  testsFailed: number;
} {
  const filesMatch = output.match(/Test Files\s+(\d+) failed[^\d]*(\d+) passed|Test Files\s+(\d+) passed/);
  const testsMatch = output.match(/Tests\s+(\d+) failed[^\d]*(\d+) passed|Tests\s+(\d+) passed/);

  let testFilesFailed = 0;
  let testFilesPassed = 0;
  if (filesMatch) {
    if (filesMatch[1] != null) {
      testFilesFailed = Number(filesMatch[1]);
      testFilesPassed = Number(filesMatch[2] ?? 0);
    } else {
      testFilesPassed = Number(filesMatch[3] ?? 0);
    }
  }

  let testsFailed = 0;
  let testsPassed = 0;
  if (testsMatch) {
    if (testsMatch[1] != null) {
      testsFailed = Number(testsMatch[1]);
      testsPassed = Number(testsMatch[2] ?? 0);
    } else {
      testsPassed = Number(testsMatch[3] ?? 0);
    }
  }

  return { testFilesPassed, testFilesFailed, testsPassed, testsFailed };
}

function main() {
  const write = process.argv.includes("--write");
  const root = process.cwd();
  const runAt = new Date().toISOString();
  const bundle = [...VITEST_HEALTH_FINAL_ORCHESTRATOR_TESTS];

  let exitCode = 0;
  let output = "";
  try {
    output = execSync(`${VITEST_BIN} ${bundle.join(" ")} --maxWorkers=1`, {
      cwd: root,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
      maxBuffer: 30 * 1024 * 1024,
      env: {
        ...process.env,
        NODE_OPTIONS: process.env.NODE_OPTIONS ?? "--max-old-space-size=8192",
      },
    });
  } catch (error) {
    exitCode = 1;
    const err = error as { stdout?: string; stderr?: string };
    output = `${err.stdout ?? ""}\n${err.stderr ?? ""}`;
  }

  const parsed = parseVitestSummary(output);
  const failedTestFiles = parsed.testFilesFailed;
  const overall = exitCode === 0 && failedTestFiles === 0 ? "PASS" : "FAIL";

  const summary = {
    version: VITEST_HEALTH_SUMMARY_VERSION,
    task: "FINAL-14",
    runAt,
    overall,
    exitCode,
    failedTestFiles,
    testFilesPassed: parsed.testFilesPassed,
    testsPassed: parsed.testsPassed,
    testsFailed: parsed.testsFailed,
    bundle,
    npmScript: VITEST_HEALTH_NPM_SCRIPT,
    runner: VITEST_HEALTH_RUNNER_SCRIPT,
    honestyNote:
      "PASS only when final-orchestrator vitest bundle exits 0 with 0 failed test files; proxy for npm test health, not full-suite count.",
  };

  console.log("\n=== Vitest health audit (FINAL-14) ===");
  console.log(`  overall:          ${overall}`);
  console.log(`  failed files:     ${failedTestFiles}`);
  console.log(`  tests passed:     ${parsed.testsPassed}`);
  console.log(`  bundle size:      ${bundle.length}`);
  console.log(`  artifact:         ${VITEST_HEALTH_SUMMARY_ARTIFACT}\n`);

  if (write) {
    const path = join(root, VITEST_HEALTH_SUMMARY_ARTIFACT);
    mkdirSync(dirname(path), { recursive: true });
    writeFileSync(path, `${JSON.stringify(summary, null, 2)}\n`, "utf8");
  }

  if (overall === "FAIL") {
    process.exit(1);
  }
}

main();
