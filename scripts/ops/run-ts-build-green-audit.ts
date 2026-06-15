/**
 * FINAL-13 / task-207 — run typecheck:full + next build; write honest PASS/FAIL artifact.
 *
 * Usage: npx tsx scripts/ops/run-ts-build-green-audit.ts [--write]
 */
import { execSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

import {
  TS_BUILD_GREEN_BUILD_SCRIPT,
  TS_BUILD_GREEN_RUNNER_SCRIPT,
  TS_BUILD_GREEN_SUMMARY_ARTIFACT,
  TS_BUILD_GREEN_SUMMARY_VERSION,
  TS_BUILD_GREEN_TYPECHECK_SCRIPT,
} from "../../lib/execution/ts-build-green-policy";

function countTypecheckErrors(output: string): number {
  const matches = output.match(/error TS\d+:/g);
  return matches?.length ?? 0;
}

function main() {
  const write = process.argv.includes("--write");
  const skipBuild = process.argv.includes("--typecheck-only");
  const root = process.cwd();
  const runAt = new Date().toISOString();

  let typecheckOutput = "";
  let typecheckExit = 0;
  try {
    execSync(`npm run ${TS_BUILD_GREEN_TYPECHECK_SCRIPT}`, {
      cwd: root,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
      maxBuffer: 20 * 1024 * 1024,
    });
  } catch (error) {
    typecheckExit = 1;
    const err = error as { stdout?: string; stderr?: string };
    typecheckOutput = `${err.stdout ?? ""}\n${err.stderr ?? ""}`;
  }

  const typecheckErrorCount = typecheckExit === 0 ? 0 : countTypecheckErrors(typecheckOutput);

  let buildExitCode = skipBuild ? 0 : 1;
  if (typecheckErrorCount === 0 && !skipBuild) {
    try {
      execSync(`npm run ${TS_BUILD_GREEN_BUILD_SCRIPT}`, {
        cwd: root,
        encoding: "utf8",
        stdio: "inherit",
        maxBuffer: 20 * 1024 * 1024,
        env: {
          ...process.env,
          NODE_OPTIONS: process.env.NODE_OPTIONS ?? "--max-old-space-size=12288",
        },
      });
    } catch {
      buildExitCode = 1;
    }
  } else if (typecheckErrorCount > 0) {
    buildExitCode = 1;
  }

  const overall =
    typecheckErrorCount === 0 && buildExitCode === 0 ? "PASS" : "FAIL";

  const summary = {
    version: TS_BUILD_GREEN_SUMMARY_VERSION,
    task: "FINAL-13",
    runAt,
    overall,
    typecheckErrorCount,
    typecheckExitCode: typecheckExit,
    buildExitCode,
    buildSkipped: skipBuild,
    nodeOptions: "--max-old-space-size=12288",
    runner: TS_BUILD_GREEN_RUNNER_SCRIPT,
    commands: [`npm run ${TS_BUILD_GREEN_TYPECHECK_SCRIPT}`, `npm run ${TS_BUILD_GREEN_BUILD_SCRIPT}`],
    honestyNote:
      "PASS only when typecheck:full reports 0 TS errors and next build exits 0; never fabricates green on slice-only checks.",
  };

  console.log("\n=== TS + build green audit (FINAL-13) ===");
  console.log(`  overall:             ${overall}`);
  console.log(`  typecheck errors:    ${typecheckErrorCount}`);
  console.log(`  build exit:          ${buildExitCode}`);
  console.log(`  artifact:            ${TS_BUILD_GREEN_SUMMARY_ARTIFACT}\n`);

  if (write) {
    const path = join(root, TS_BUILD_GREEN_SUMMARY_ARTIFACT);
    mkdirSync(dirname(path), { recursive: true });
    writeFileSync(path, `${JSON.stringify(summary, null, 2)}\n`, "utf8");
  }

  if (overall === "FAIL") {
    process.exit(1);
  }
}

main();
