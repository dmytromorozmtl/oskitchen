/**
 * Audit integration sandbox mode (Blueprint P3-76).
 *
 * Usage:
 *   npm run audit:integration-sandbox-p3-76
 */
import {
  auditIntegrationSandboxReadiness,
  formatIntegrationSandboxReportLines,
} from "@/lib/integrations/integration-sandbox-service";
import {
  auditIntegrationSandboxP3_76,
  formatIntegrationSandboxP3_76AuditLines,
} from "@/lib/integrations/integration-sandbox-p3-76-audit";

function main(): void {
  const upstream = auditIntegrationSandboxReadiness(process.env);

  console.log("");
  for (const line of formatIntegrationSandboxReportLines(upstream)) {
    console.log(line);
  }
  console.log("");

  const summary = auditIntegrationSandboxP3_76();

  for (const line of formatIntegrationSandboxP3_76AuditLines(summary)) {
    console.log(line);
  }
  console.log("");

  if (!summary.passed) {
    process.exit(1);
  }

  console.log("✓ Integration sandbox P3-76 OK");
}

main();
