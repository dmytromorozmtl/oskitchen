/**
 * Audit commission comparison landing page (Blueprint P3-64).
 *
 * Usage:
 *   npm run audit:commission-comparison-landing-p3-64
 */
import {
  auditCommissionComparisonLandingP3_64,
  formatCommissionComparisonLandingP3_64AuditLines,
} from "@/lib/marketing/commission-comparison-landing-p3-64-audit";

function main(): void {
  const summary = auditCommissionComparisonLandingP3_64();

  console.log("");
  for (const line of formatCommissionComparisonLandingP3_64AuditLines(summary)) {
    console.log(line);
  }
  console.log("");

  if (!summary.passed) {
    process.exit(1);
  }

  console.log("✓ Commission comparison landing P3-64 OK");
}

main();
