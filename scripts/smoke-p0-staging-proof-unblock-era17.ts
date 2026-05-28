/**
 * Era 17 P0 staging proof unblock — runs P0 smokes #1–3 and aggregates honest skip/fail state.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { spawnSync } from "node:child_process";

import {
  P0_STAGING_PROOF_UNBLOCK_ERA17_CHILD_SMOKES,
  P0_STAGING_PROOF_UNBLOCK_ERA17_NPM_SCRIPT,
  P0_STAGING_PROOF_UNBLOCK_ERA17_POLICY_ID,
  P0_STAGING_PROOF_UNBLOCK_ERA17_SUMMARY_ARTIFACT,
  P0_STAGING_PROOF_UNBLOCK_ERA17_UNBLOCK_STEPS,
} from "../lib/commercial/p0-staging-proof-unblock-era17-policy";
import {
  buildP0StagingProofUnblockSummary,
  formatP0StagingProofUnblockReportLines,
} from "../lib/commercial/p0-staging-proof-unblock-summary";

function runNpmScript(script: string): number {
  const result = spawnSync("npm", ["run", script], {
    stdio: "inherit",
    env: process.env,
  });
  return result.status ?? 1;
}

function readJsonArtifact<T>(relativePath: string): T | null {
  const path = join(process.cwd(), relativePath);
  if (!existsSync(path)) return null;
  try {
    return JSON.parse(readFileSync(path, "utf8")) as T;
  } catch {
    return null;
  }
}

function writeSummary(summary: ReturnType<typeof buildP0StagingProofUnblockSummary>): void {
  const path = join(process.cwd(), P0_STAGING_PROOF_UNBLOCK_ERA17_SUMMARY_ARTIFACT);
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, `${JSON.stringify(summary, null, 2)}\n`, "utf8");
}

function main() {
  if (process.argv.includes("--help") || process.argv.includes("-h")) {
    console.log(`
Era 17 P0 staging proof unblock

  (default)  Run P0 smokes #1–3 + aggregate summary artifact
  --checklist-only  Print ops unblock steps
`);
    process.exit(0);
  }

  if (process.argv.includes("--checklist-only")) {
    console.log(`\nP0 staging proof unblock (${P0_STAGING_PROOF_UNBLOCK_ERA17_POLICY_ID})\n`);
    for (const [index, step] of P0_STAGING_PROOF_UNBLOCK_ERA17_UNBLOCK_STEPS.entries()) {
      console.log(`${index + 1}. ${step}`);
    }
    process.exit(0);
  }

  console.log(`\n[${P0_STAGING_PROOF_UNBLOCK_ERA17_NPM_SCRIPT}] ${P0_STAGING_PROOF_UNBLOCK_ERA17_POLICY_ID}\n`);

  for (const script of P0_STAGING_PROOF_UNBLOCK_ERA17_CHILD_SMOKES) {
    console.log(`\n→ npm run ${script}\n`);
    runNpmScript(script);
  }

  const summary = buildP0StagingProofUnblockSummary({
    commitSha: process.env.GITHUB_SHA ?? process.env.VERCEL_GIT_COMMIT_SHA ?? null,
    ssoArtifact: readJsonArtifact("artifacts/enterprise-sso-idp-staging-smoke-summary.json"),
    workflowsArtifact: readJsonArtifact("artifacts/staging-workflows-first-green-summary.json"),
    channelArtifact: readJsonArtifact("artifacts/channel-live-smoke-summary.json"),
  });
  writeSummary(summary);

  console.log(`\nP0 staging proof unblock (${P0_STAGING_PROOF_UNBLOCK_ERA17_POLICY_ID})\n`);
  for (const line of formatP0StagingProofUnblockReportLines(summary)) {
    console.log(line);
  }
  console.log(`\nSummary artifact: ${P0_STAGING_PROOF_UNBLOCK_ERA17_SUMMARY_ARTIFACT}\n`);

  if (summary.overall === "FAILED") {
    process.exit(1);
  }
}

main();
