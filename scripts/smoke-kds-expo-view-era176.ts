/**
 * Era 176 KDS Expo View orchestrator — ready/waiting/delayed Round 2 wiring cert.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { spawnSync } from "node:child_process";

import {
  KDS_EXPO_VIEW_ERA176_CYCLE_RUNBOOK_STEPS,
  KDS_EXPO_VIEW_ERA176_NPM_SCRIPT,
  KDS_EXPO_VIEW_ERA176_OPS_DOC,
  KDS_EXPO_VIEW_ERA176_POLICY_ID,
  KDS_EXPO_VIEW_ERA176_SUMMARY_ARTIFACT,
} from "../lib/kitchen/kds-expo-view-era176-policy";
import {
  auditKdsExpoViewSmokeEra176Wiring,
  buildKdsExpoViewSmokeEra176Summary,
  formatKdsExpoViewSmokeEra176ReportLines,
} from "../lib/kitchen/kds-expo-view-era176-smoke-summary";

function runNpmScript(script: string): number {
  const result = spawnSync("npm", ["run", script], {
    stdio: "inherit",
    env: process.env,
  });
  return result.status ?? 1;
}

function writeSummary(
  summary: ReturnType<typeof buildKdsExpoViewSmokeEra176Summary>,
): void {
  const path = join(process.cwd(), KDS_EXPO_VIEW_ERA176_SUMMARY_ARTIFACT);
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, `${JSON.stringify(summary, null, 2)}\n`, "utf8");
}

function printRunbook(): void {
  console.log(`\nKDS Expo View (${KDS_EXPO_VIEW_ERA176_POLICY_ID})\n`);
  for (const [index, step] of KDS_EXPO_VIEW_ERA176_CYCLE_RUNBOOK_STEPS.entries()) {
    console.log(`${index + 1}. ${step}`);
  }
  console.log(`\nSee ${KDS_EXPO_VIEW_ERA176_OPS_DOC}\n`);
}

function main() {
  if (process.argv.includes("--help") || process.argv.includes("-h")) {
    console.log(`
Era 176 KDS Expo View smoke

  (default)         Cert chain + wiring audit
  --checklist-only  Print activation runbook steps
`);
    process.exit(0);
  }

  if (process.argv.includes("--checklist-only")) {
    printRunbook();
    process.exit(0);
  }

  console.log(`\n[${KDS_EXPO_VIEW_ERA176_NPM_SCRIPT}] ${KDS_EXPO_VIEW_ERA176_POLICY_ID}\n`);
  console.log("\n→ npm run test:ci:kds-expo-view-era176:cert\n");
  const certCode = runNpmScript("test:ci:kds-expo-view-era176:cert");

  const wiring = auditKdsExpoViewSmokeEra176Wiring(process.cwd());

  const summary = buildKdsExpoViewSmokeEra176Summary({
    certPassed: certCode === 0,
    wiringFailures: wiring.failures,
    commitSha: process.env.GITHUB_SHA ?? process.env.VERCEL_GIT_COMMIT_SHA ?? null,
  });
  writeSummary(summary);

  for (const line of formatKdsExpoViewSmokeEra176ReportLines(summary)) {
    console.log(line);
  }
  console.log(`\nSummary artifact: ${KDS_EXPO_VIEW_ERA176_SUMMARY_ARTIFACT}\n`);
  printRunbook();

  if (summary.overall === "FAILED") {
    process.exit(1);
  }
}

main();
