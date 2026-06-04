/**
 * POST-220 — Re-certify 220-task closure + surface next ops blocker.
 *
 * Usage: npx tsx scripts/ops/run-post-220-verification.ts [--write]
 */
import { execSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

import { auditPost220Verification } from "../../lib/execution/audit-post-220-verification";
import {
  POST_220_VERIFICATION_POLICY_ID,
  POST_220_VERIFICATION_RUNNER_SCRIPT,
  POST_220_VERIFICATION_SUMMARY_ARTIFACT,
  POST_220_VERIFICATION_VITEST_SPEC,
} from "../../lib/execution/post-220-verification-policy";

const VITEST_BIN = "node ./node_modules/vitest/vitest.mjs run";

function parseVitestOutput(output: string): { passed: number; failed: number } {
  const filesMatch = output.match(/Test Files\s+(\d+) failed[^\d]*(\d+) passed|Test Files\s+(\d+) passed/);
  const failed = filesMatch?.[1] != null ? Number(filesMatch[1]) : 0;
  const passed = filesMatch?.[2] != null ? Number(filesMatch[2]) : Number(filesMatch?.[3] ?? 0);
  return { passed, failed };
}

function main() {
  const write = process.argv.includes("--write");
  const root = process.cwd();
  const runAt = new Date().toISOString();

  const report = auditPost220Verification(root);

  let vitestPassed = false;
  try {
    const vitestOut = execSync(`${VITEST_BIN} ${POST_220_VERIFICATION_VITEST_SPEC} --maxWorkers=1`, {
      cwd: root,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
      maxBuffer: 20 * 1024 * 1024,
    });
    const parsed = parseVitestOutput(vitestOut);
    vitestPassed = parsed.failed === 0 && parsed.passed > 0;
  } catch (error) {
    const err = error as { stdout?: string; stderr?: string };
    const parsed = parseVitestOutput(`${err.stdout ?? ""}\n${err.stderr ?? ""}`);
    vitestPassed = parsed.failed === 0 && parsed.passed > 0;
  }

  const overall = report.passed && vitestPassed ? ("PASS" as const) : ("FAIL" as const);
  const proofStatus =
    overall === "PASS"
      ? "proof_passed_post_220_verification"
      : "proof_failed_post_220_verification";

  if (write) {
    const summary = {
      version: POST_220_VERIFICATION_POLICY_ID,
      task: "POST-220-VERIFY",
      runAt,
      overall,
      proofStatus,
      vitestPassed,
      canonicalSlotsDone: report.canonicalSlotsDone,
      trackerDoneCount: report.trackerDoneCount,
      trackerTotalCount: report.trackerTotalCount,
      ready: report.ready,
      goDecision: report.goDecision,
      p0ArtifactOverall: report.p0ArtifactOverall,
      nextOpsPriority: report.nextOpsPriority,
      runner: POST_220_VERIFICATION_RUNNER_SCRIPT,
      honestyNote:
        "220-task tracker complete; POST-220 PASS does not imply pilot GO or ready:true.",
    };
    const path = join(root, POST_220_VERIFICATION_SUMMARY_ARTIFACT);
    mkdirSync(dirname(path), { recursive: true });
    writeFileSync(path, `${JSON.stringify(summary, null, 2)}\n`, "utf8");
  }

  console.log("\n=== POST-220 program verification ===");
  console.log(`  overall:            ${overall}`);
  console.log(`  proofStatus:        ${proofStatus}`);
  console.log(
    `  tracker:            ${report.trackerDoneCount}/${report.trackerTotalCount}`,
  );
  console.log(`  canonical:          ${report.canonicalSlotsDone}/220`);
  console.log(`  ready:              ${report.ready}`);
  console.log(`  goDecision:         ${report.goDecision}`);
  console.log(`  P0:                 ${report.p0ArtifactOverall}`);
  console.log(`  next ops:           ${report.nextOpsPriority}`);
  console.log(`  artifact:           ${POST_220_VERIFICATION_SUMMARY_ARTIFACT}\n`);

  if (overall === "FAIL") {
    process.exit(1);
  }
}

main();
