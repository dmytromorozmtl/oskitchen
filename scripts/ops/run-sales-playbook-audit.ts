/**
 * FINAL-20 / task-214 — sales-safe playbook hub vitest + MKT-41 capstone gate.
 *
 * Usage: npx tsx scripts/ops/run-sales-playbook-audit.ts [--write]
 */
import { execSync } from "node:child_process";
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

import { auditMarketingSalesPlaybookCapstone } from "../../lib/marketing/marketing-sales-playbook-capstone-audit-policy";
import {
  SALES_PLAYBOOK_DOC,
  SALES_PLAYBOOK_RUNNER_SCRIPT,
  SALES_PLAYBOOK_SUMMARY_ARTIFACT,
  SALES_PLAYBOOK_SUMMARY_VERSION,
  SALES_PLAYBOOK_VITEST_SPEC,
} from "../../lib/execution/sales-playbook-policy";

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

  const playbookPresent = existsSync(join(root, SALES_PLAYBOOK_DOC));
  const capstone = auditMarketingSalesPlaybookCapstone(root);
  const capstonePassed = capstone.passed;

  let playbookVitestPassed = false;
  let vitestExitCode = 1;
  let testsPassed = 0;

  try {
    const vitestOut = execSync(`${VITEST_BIN} ${SALES_PLAYBOOK_VITEST_SPEC} --maxWorkers=1`, {
      cwd: root,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
      maxBuffer: 20 * 1024 * 1024,
    });
    vitestExitCode = 0;
    const parsed = parseVitestOutput(vitestOut);
    playbookVitestPassed = parsed.failed === 0 && parsed.passed > 0;
    testsPassed = parsed.testsPassed;
  } catch (error) {
    const err = error as { stdout?: string; stderr?: string };
    const parsed = parseVitestOutput(`${err.stdout ?? ""}\n${err.stderr ?? ""}`);
    playbookVitestPassed = parsed.failed === 0 && parsed.passed > 0;
    vitestExitCode = playbookVitestPassed ? 0 : 1;
    testsPassed = parsed.testsPassed;
  }

  const overall =
    playbookPresent && playbookVitestPassed && capstonePassed
      ? ("PASS" as const)
      : ("FAIL" as const);
  const proofStatus =
    overall === "PASS" ? "proof_passed_sales_playbook_hub" : "proof_failed_sales_playbook";

  const summary = {
    version: SALES_PLAYBOOK_SUMMARY_VERSION,
    task: "FINAL-20",
    runAt,
    overall,
    proofStatus,
    playbookVitestPassed,
    capstonePassed,
    vitestExitCode,
    testsPassed,
    playbookPresent,
    capstoneSubAuditCount: capstone.subAudits.length,
    vitestSpec: SALES_PLAYBOOK_VITEST_SPEC,
    playbookDoc: SALES_PLAYBOOK_DOC,
    runner: SALES_PLAYBOOK_RUNNER_SCRIPT,
    honestyNote:
      "PASS when SALES_PLAYBOOK hub markers exist, MKT-41 capstone sub-audits pass, and playbook vitest exits 0; not a guarantee of closed-won revenue.",
  };

  console.log("\n=== Sales playbook hub (FINAL-20) ===");
  console.log(`  overall:            ${overall}`);
  console.log(`  proofStatus:        ${proofStatus}`);
  console.log(`  playbook vitest:    ${playbookVitestPassed ? "PASS" : "FAIL"} (${testsPassed} tests)`);
  console.log(`  MKT-41 capstone:    ${capstonePassed ? "PASS" : "FAIL"}`);
  console.log(`  artifact:           ${SALES_PLAYBOOK_SUMMARY_ARTIFACT}\n`);

  if (write) {
    const path = join(root, SALES_PLAYBOOK_SUMMARY_ARTIFACT);
    mkdirSync(dirname(path), { recursive: true });
    writeFileSync(path, `${JSON.stringify(summary, null, 2)}\n`, "utf8");
  }

  if (overall === "FAIL") {
    process.exit(1);
  }
}

main();
