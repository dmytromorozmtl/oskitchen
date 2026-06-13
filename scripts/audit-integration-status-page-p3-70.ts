/**
 * Audit integration status page (Blueprint P3-70).
 *
 * Usage:
 *   npm run audit:integration-status-page-p3-70
 */
import {
  auditIntegrationStatusPageP3_70,
  formatIntegrationStatusPageP3_70AuditLines,
} from "@/lib/marketing/integration-status-page-p3-70-audit";

function main(): void {
  const summary = auditIntegrationStatusPageP3_70();

  console.log("");
  for (const line of formatIntegrationStatusPageP3_70AuditLines(summary)) {
    console.log(line);
  }
  console.log("");

  if (!summary.passed) {
    process.exit(1);
  }

  console.log("✓ Integration status page P3-70 OK");
}

main();
