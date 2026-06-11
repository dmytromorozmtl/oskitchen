/**
 * Audit Integration Health marketing explainer (Blueprint P1-73).
 *
 * Usage:
 *   npm run audit:integration-health-marketing
 */
import {
  auditIntegrationHealthMarketing,
  formatIntegrationHealthMarketingAuditLines,
} from "@/lib/marketing/integration-health-marketing-audit";

function main(): void {
  const summary = auditIntegrationHealthMarketing();

  console.log("");
  for (const line of formatIntegrationHealthMarketingAuditLines(summary)) {
    console.log(line);
  }
  console.log("");

  if (!summary.passed) {
    process.exit(1);
  }

  console.log("✓ Integration Health marketing audit OK");
}

main();
