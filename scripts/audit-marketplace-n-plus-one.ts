/**
 * Marketplace N+1 query detection — Task 82 / docs/prisma-optimization-audit.md
 *
 * Usage: npm run audit:marketplace-n-plus-one
 * Write: npm run audit:marketplace-n-plus-one -- --write
 * Output: artifacts/marketplace-n-plus-one-audit.json
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

import {
  MARKETPLACE_N_PLUS_ONE_AUDIT_ARTIFACT,
  buildMarketplaceNPlusOneReport,
} from "./lib/marketplace-n-plus-one-audit";

function main() {
  const root = process.cwd();
  const report = buildMarketplaceNPlusOneReport(root);
  const shouldWrite = process.argv.includes("--write") || process.argv.includes("-w");

  console.log(`\nMarketplace N+1 audit (${report.version})\n`);
  console.log(`Scanned: ${report.scannedFiles} files under ${report.scannedRoot}`);
  console.log(
    `Findings: ${report.findings.length} (high: ${report.summary.high}, medium: ${report.summary.medium})`,
  );
  console.log(`Overall: ${report.overall}`);

  if (report.findings.length > 0) {
    console.log("\nTop findings:");
    for (const row of report.findings.slice(0, 12)) {
      console.log(`  [${row.severity}] ${row.file}:${row.line} (${row.pattern})`);
    }
    if (report.findings.length > 12) {
      console.log(`  ... and ${report.findings.length - 12} more`);
    }
  }

  for (const hot of report.hotPaths) {
    console.log(`  Hot path ${hot.file}: ${hot.status}`);
  }

  if (shouldWrite) {
    const artifactPath = join(root, MARKETPLACE_N_PLUS_ONE_AUDIT_ARTIFACT);
    mkdirSync(dirname(artifactPath), { recursive: true });
    writeFileSync(artifactPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");
    console.log(`\nWrote ${MARKETPLACE_N_PLUS_ONE_AUDIT_ARTIFACT}`);
  }

  if (report.overall === "NEEDS_ATTENTION") {
    process.exit(1);
  }
}

main();
