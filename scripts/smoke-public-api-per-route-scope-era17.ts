/**
 * Era 17 public API per-route scope smoke — runs cert chain only (no live staging API key).
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { spawnSync } from "node:child_process";

import {
  PUBLIC_API_PER_ROUTE_SCOPE_ERA17_HONEST_SCOPE,
  PUBLIC_API_PER_ROUTE_SCOPE_ERA17_POLICY_ID,
  PUBLIC_API_PER_ROUTE_SCOPE_ERA17_SUMMARY_ARTIFACT,
} from "../lib/api-public/public-api-per-route-scope-era17-policy";

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
  const path = join(process.cwd(), PUBLIC_API_PER_ROUTE_SCOPE_ERA17_SUMMARY_ARTIFACT);
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(
    path,
    `${JSON.stringify(
      {
        version: PUBLIC_API_PER_ROUTE_SCOPE_ERA17_POLICY_ID,
        runAt: new Date().toISOString(),
        overall: input.overall,
        scopeProofStatus:
          input.overall === "PASSED" ? "per_route_scope_enforced" : "proof_failed",
        honestScope: PUBLIC_API_PER_ROUTE_SCOPE_ERA17_HONEST_SCOPE,
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
Era 17 public API per-route scope smoke

  (default)  Run test:ci:public-api-per-route-scope-era17:cert
`);
    process.exit(0);
  }

  console.log(
    `\nPublic API per-route scope (${PUBLIC_API_PER_ROUTE_SCOPE_ERA17_POLICY_ID})\n`,
  );
  const code = runNpmScript("test:ci:public-api-per-route-scope-era17:cert");
  const overall = code === 0 ? "PASSED" : "FAILED";
  writeSummary({ overall, certExitCode: code });
  console.log(`\nSummary artifact: ${PUBLIC_API_PER_ROUTE_SCOPE_ERA17_SUMMARY_ARTIFACT}\n`);
  if (code !== 0) process.exit(code);
}

main();
