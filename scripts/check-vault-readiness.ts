#!/usr/bin/env npx tsx
/**
 * Vault readiness check — writes JSON + optional HTML artifacts.
 * Policy: era29-vault-readiness-v1
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

import { renderVaultReadinessHtml } from "@/lib/ops/vault-readiness-html";
import { VAULT_READINESS_HTML_ARTIFACT } from "@/lib/ops/vault-readiness-policy";
import {
  resolveVaultReadinessReport,
  formatVaultReadinessReportLines,
  VAULT_READINESS_REPORT_ARTIFACT,
} from "@/lib/ops/vault-readiness-report";

function writeArtifacts(report: ReturnType<typeof resolveVaultReadinessReport>, writeHtml: boolean): void {
  const jsonPath = join(process.cwd(), VAULT_READINESS_REPORT_ARTIFACT);
  mkdirSync(dirname(jsonPath), { recursive: true });
  writeFileSync(jsonPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");

  if (writeHtml) {
    const htmlPath = join(process.cwd(), VAULT_READINESS_HTML_ARTIFACT);
    writeFileSync(htmlPath, renderVaultReadinessHtml(report), "utf8");
  }
}

export function runVaultReadinessCheck(options?: {
  env?: NodeJS.ProcessEnv;
  writeHtml?: boolean;
}): ReturnType<typeof resolveVaultReadinessReport> {
  const report = resolveVaultReadinessReport(process.cwd(), { env: options?.env });
  writeArtifacts(report, options?.writeHtml ?? false);
  return report;
}

function main() {
  const jsonOnly = process.argv.includes("--json");
  const writeHtml = process.argv.includes("--write-html") || process.argv.includes("--write");
  const report = runVaultReadinessCheck({ writeHtml });

  if (jsonOnly) {
    console.log(JSON.stringify(report, null, 2));
    process.exit(report.vaultReady ? 0 : 1);
  }

  console.log("\nVault readiness report\n");
  console.log(`JSON artifact: ${VAULT_READINESS_REPORT_ARTIFACT}`);
  if (writeHtml) {
    console.log(`HTML artifact: ${VAULT_READINESS_HTML_ARTIFACT}`);
  }
  for (const line of formatVaultReadinessReportLines(report)) {
    console.log(line);
  }
  console.log("\nNext:");
  for (const step of report.recommendedNextSteps) {
    console.log(`  ${step}`);
  }
  console.log(`\n${report.honestyNote}\n`);

  process.exit(report.vaultReady ? 0 : 1);
}

const isDirectRun =
  typeof require !== "undefined" &&
  typeof module !== "undefined" &&
  require.main === module;

if (isDirectRun) {
  main();
}
