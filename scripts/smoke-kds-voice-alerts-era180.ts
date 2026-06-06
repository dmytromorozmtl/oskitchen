/**
 * Era 180 KDS Voice Alerts orchestrator — TTS Round 2 wiring cert.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { spawnSync } from "node:child_process";

import {
  KDS_VOICE_ALERTS_ERA180_CYCLE_RUNBOOK_STEPS,
  KDS_VOICE_ALERTS_ERA180_NPM_SCRIPT,
  KDS_VOICE_ALERTS_ERA180_OPS_DOC,
  KDS_VOICE_ALERTS_ERA180_POLICY_ID,
  KDS_VOICE_ALERTS_ERA180_SUMMARY_ARTIFACT,
} from "../lib/kitchen/kds-voice-alerts-era180-policy";
import {
  auditKdsVoiceAlertsSmokeEra180Wiring,
  buildKdsVoiceAlertsSmokeEra180Summary,
  formatKdsVoiceAlertsSmokeEra180ReportLines,
} from "../lib/kitchen/kds-voice-alerts-era180-smoke-summary";

function runNpmScript(script: string): number {
  const result = spawnSync("npm", ["run", script], {
    stdio: "inherit",
    env: process.env,
  });
  return result.status ?? 1;
}

function writeSummary(
  summary: ReturnType<typeof buildKdsVoiceAlertsSmokeEra180Summary>,
): void {
  const path = join(process.cwd(), KDS_VOICE_ALERTS_ERA180_SUMMARY_ARTIFACT);
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, `${JSON.stringify(summary, null, 2)}\n`, "utf8");
}

function printRunbook(): void {
  console.log(`\nKDS Voice Alerts (${KDS_VOICE_ALERTS_ERA180_POLICY_ID})\n`);
  for (const [index, step] of KDS_VOICE_ALERTS_ERA180_CYCLE_RUNBOOK_STEPS.entries()) {
    console.log(`${index + 1}. ${step}`);
  }
  console.log(`\nSee ${KDS_VOICE_ALERTS_ERA180_OPS_DOC}\n`);
}

function main() {
  if (process.argv.includes("--help") || process.argv.includes("-h")) {
    console.log(`
Era 180 KDS Voice Alerts smoke

  (default)         Cert chain + wiring audit
  --checklist-only  Print activation runbook steps
`);
    process.exit(0);
  }

  if (process.argv.includes("--checklist-only")) {
    printRunbook();
    process.exit(0);
  }

  console.log(`\n[${KDS_VOICE_ALERTS_ERA180_NPM_SCRIPT}] ${KDS_VOICE_ALERTS_ERA180_POLICY_ID}\n`);
  console.log("\n→ npm run test:ci:kds-voice-alerts-era180:cert\n");
  const certCode = runNpmScript("test:ci:kds-voice-alerts-era180:cert");

  const wiring = auditKdsVoiceAlertsSmokeEra180Wiring(process.cwd());

  const summary = buildKdsVoiceAlertsSmokeEra180Summary({
    certPassed: certCode === 0,
    wiringFailures: wiring.failures,
    commitSha: process.env.GITHUB_SHA ?? process.env.VERCEL_GIT_COMMIT_SHA ?? null,
  });
  writeSummary(summary);

  for (const line of formatKdsVoiceAlertsSmokeEra180ReportLines(summary)) {
    console.log(line);
  }
  console.log(`\nSummary artifact: ${KDS_VOICE_ALERTS_ERA180_SUMMARY_ARTIFACT}\n`);
  printRunbook();

  if (summary.overall === "FAILED") {
    process.exit(1);
  }
}

main();
