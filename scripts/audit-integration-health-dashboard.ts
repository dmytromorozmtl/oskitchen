/**
 * Audit Integration Health dashboard design (score cards, sparklines, alerts).
 *
 * Usage:
 *   npm run audit:integration-health-dashboard
 */
import {
  auditIntegrationHealthDashboard,
  formatIntegrationHealthDashboardAuditLines,
} from "@/lib/design/integration-health-dashboard-audit";

function main(): void {
  const summary = auditIntegrationHealthDashboard();

  console.log("");
  for (const line of formatIntegrationHealthDashboardAuditLines(summary)) {
    console.log(line);
  }
  console.log("");

  if (!summary.passed) {
    process.exit(1);
  }

  console.log("✓ Integration Health dashboard audit OK");
}

main();
