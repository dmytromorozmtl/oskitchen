/**
 * Enterprise procurement honesty smoke (local / pre-RFP).
 *
 * Runs wired Vitest procurement + identity cert wiring — does not implement SSO/SOC2.
 */
import { spawnSync } from "node:child_process";

import {
  ENTERPRISE_PROCUREMENT_ERA15_PILOT_CHECKLIST,
  ENTERPRISE_PROCUREMENT_ERA15_POLICY_ID,
} from "../lib/enterprise/enterprise-procurement-era15-policy";

function runNpmScript(script: string): number {
  const result = spawnSync("npm", ["run", script], {
    stdio: "inherit",
    env: process.env,
  });
  return result.status ?? 1;
}

function printChecklist(): void {
  console.log(`\nEnterprise procurement (${ENTERPRISE_PROCUREMENT_ERA15_POLICY_ID})\n`);
  for (const [index, step] of ENTERPRISE_PROCUREMENT_ERA15_PILOT_CHECKLIST.entries()) {
    console.log(`${index + 1}. ${step}`);
  }
  console.log("\nSee docs/enterprise-procurement-pack.md\n");
}

async function main() {
  if (process.argv.includes("--help") || process.argv.includes("-h")) {
    console.log(`
Enterprise procurement honesty smoke

  (default)         Run test:ci:enterprise-procurement:cert + era15 cert + identity roadmap cert
  --checklist-only  Print pilot checklist only
`);
    process.exit(0);
  }

  if (process.argv.includes("--checklist-only")) {
    printChecklist();
    process.exit(0);
  }

  console.log(`\n[smoke:enterprise-procurement] ${ENTERPRISE_PROCUREMENT_ERA15_POLICY_ID}\n`);

  const steps = [
    "test:ci:enterprise-procurement",
    "test:ci:enterprise-procurement:cert",
    "test:ci:enterprise-procurement-era15:cert",
    "test:ci:enterprise-identity-roadmap:cert",
  ] as const;

  for (const script of steps) {
    console.log(`\n→ npm run ${script}\n`);
    const code = runNpmScript(script);
    if (code !== 0) {
      console.error(`\n[smoke:enterprise-procurement] FAILED at ${script} (exit ${code})\n`);
      process.exit(code);
    }
  }

  printChecklist();
  console.log("\n[smoke:enterprise-procurement] PASSED (CI cert wiring only)\n");
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
