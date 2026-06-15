/**
 * Enterprise SSO R2 pilot smoke (local / pre-staging).
 *
 * Runs wired Vitest SSO R2 cert chain — does not perform live IdP login.
 */
import { spawnSync } from "node:child_process";

import {
  ENTERPRISE_SSO_R2_ADMIN_ERA16_PILOT_RUNBOOK_STEPS,
  ENTERPRISE_SSO_R2_ADMIN_ERA16_POLICY_ID,
  ENTERPRISE_SSO_R2_ADMIN_ERA16_SMOKE_SCRIPT,
} from "../lib/enterprise/enterprise-sso-r2-admin-era16-policy";

function runNpmScript(script: string): number {
  const result = spawnSync("npm", ["run", script], {
    stdio: "inherit",
    env: process.env,
  });
  return result.status ?? 1;
}

function printRunbook(): void {
  console.log(`\nEnterprise SSO R2 pilot (${ENTERPRISE_SSO_R2_ADMIN_ERA16_POLICY_ID})\n`);
  for (const [index, step] of ENTERPRISE_SSO_R2_ADMIN_ERA16_PILOT_RUNBOOK_STEPS.entries()) {
    console.log(`${index + 1}. ${step}`);
  }
  console.log("\nSee docs/enterprise-sso-r2-pilot-design.md\n");
}

async function main() {
  if (process.argv.includes("--help") || process.argv.includes("-h")) {
    console.log(`
Enterprise SSO R2 pilot smoke

  (default)         Run SSO R2 pilot + schema + runtime + admin cert chain
  --checklist-only  Print pilot runbook steps only
`);
    process.exit(0);
  }

  if (process.argv.includes("--checklist-only")) {
    printRunbook();
    process.exit(0);
  }

  console.log(`\n[${ENTERPRISE_SSO_R2_ADMIN_ERA16_SMOKE_SCRIPT}] ${ENTERPRISE_SSO_R2_ADMIN_ERA16_POLICY_ID}\n`);

  const steps = [
    "test:ci:enterprise-sso-r2-pilot-era16:cert",
    "test:ci:enterprise-sso-r2-schema-era16:cert",
    "test:ci:enterprise-sso-r2-runtime-era16:cert",
    "test:ci:enterprise-sso-r2-admin-era16:cert",
  ] as const;

  for (const script of steps) {
    console.log(`\n→ npm run ${script}\n`);
    const code = runNpmScript(script);
    if (code !== 0) {
      console.error(`\n[${ENTERPRISE_SSO_R2_ADMIN_ERA16_SMOKE_SCRIPT}] FAILED at ${script} (exit ${code})\n`);
      process.exit(code);
    }
  }

  printRunbook();
  console.log(`\n[${ENTERPRISE_SSO_R2_ADMIN_ERA16_SMOKE_SCRIPT}] PASSED (CI cert wiring only — not live IdP smoke)\n`);
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
