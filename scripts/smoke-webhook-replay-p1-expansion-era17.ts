/**
 * Era 17 webhook replay P1 expansion smoke — runs cert chain only (no live webhook POST).
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { spawnSync } from "node:child_process";

import {
  WEBHOOK_REPLAY_P1_EXPANSION_ERA17_EXPANDED_ROUTES,
  WEBHOOK_REPLAY_P1_EXPANSION_ERA17_POLICY_ID,
  WEBHOOK_REPLAY_P1_EXPANSION_ERA17_SUMMARY_ARTIFACT,
} from "../lib/security/webhook-replay-p1-expansion-era17-policy";

function runNpmScript(script: string): number {
  const result = spawnSync("npm", ["run", script], {
    stdio: "inherit",
    env: process.env,
  });
  return result.status ?? 1;
}

function writeSummary(input: {
  overall: "PASSED" | "FAILED";
  certExitCode: number;
}): void {
  const path = join(process.cwd(), WEBHOOK_REPLAY_P1_EXPANSION_ERA17_SUMMARY_ARTIFACT);
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(
    path,
    `${JSON.stringify(
      {
        version: WEBHOOK_REPLAY_P1_EXPANSION_ERA17_POLICY_ID,
        runAt: new Date().toISOString(),
        overall: input.overall,
        expansionProofStatus:
          input.overall === "PASSED" ? "proof_passed" : "proof_failed",
        expandedRoutes: WEBHOOK_REPLAY_P1_EXPANSION_ERA17_EXPANDED_ROUTES,
        certExitCode: input.certExitCode,
      },
      null,
      2,
    )}\n`,
    "utf8",
  );
}

function main() {
  if (process.argv.includes("--help") || process.argv.includes("-h")) {
    console.log(`
Era 17 webhook replay P1 expansion smoke

  (default)  Run test:ci:webhook-replay-p1-expansion-era17:cert
`);
    process.exit(0);
  }

  console.log(`\nWebhook replay P1 expansion (${WEBHOOK_REPLAY_P1_EXPANSION_ERA17_POLICY_ID})\n`);
  const code = runNpmScript("test:ci:webhook-replay-p1-expansion-era17:cert");
  const overall = code === 0 ? "PASSED" : "FAILED";
  writeSummary({ overall, certExitCode: code });
  console.log(`\nSummary artifact: ${WEBHOOK_REPLAY_P1_EXPANSION_ERA17_SUMMARY_ARTIFACT}\n`);
  if (code !== 0) process.exit(code);
}

main();
