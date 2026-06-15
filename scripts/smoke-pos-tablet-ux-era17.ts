/**
 * Era 17 POS tablet UX smoke — runs cert chain only (no manual tablet sign-off).
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { spawnSync } from "node:child_process";

import {
  POS_TABLET_UX_ERA17_POLICY_ID,
  POS_TABLET_UX_ERA17_SUMMARY_ARTIFACT,
  POS_TABLET_UX_ERA17_UX_TARGETS,
} from "../lib/pos/pos-tablet-ux-era17-policy";

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
  const path = join(process.cwd(), POS_TABLET_UX_ERA17_SUMMARY_ARTIFACT);
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(
    path,
    `${JSON.stringify(
      {
        version: POS_TABLET_UX_ERA17_POLICY_ID,
        runAt: new Date().toISOString(),
        overall: input.overall,
        uxProofStatus: input.overall === "PASSED" ? "tablet_ux_polished" : "proof_failed",
        uxTargets: POS_TABLET_UX_ERA17_UX_TARGETS,
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
Era 17 POS tablet UX smoke

  (default)  Run test:ci:pos-tablet-ux-era17:cert
`);
    process.exit(0);
  }

  console.log(`\nPOS tablet UX (${POS_TABLET_UX_ERA17_POLICY_ID})\n`);
  const code = runNpmScript("test:ci:pos-tablet-ux-era17:cert");
  const overall = code === 0 ? "PASSED" : "FAILED";
  writeSummary({ overall, certExitCode: code });
  console.log(`\nSummary artifact: ${POS_TABLET_UX_ERA17_SUMMARY_ARTIFACT}\n`);
  if (code !== 0) process.exit(code);
}

main();
