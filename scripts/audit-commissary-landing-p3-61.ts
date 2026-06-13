/**
 * Audit commissary landing page (Blueprint P3-61).
 *
 * Usage:
 *   npm run audit:commissary-landing-p3-61
 */
import {
  auditCommissaryLandingP3_61,
  formatCommissaryLandingP3_61AuditLines,
} from "@/lib/marketing/commissary-landing-p3-61-audit";

function main(): void {
  const summary = auditCommissaryLandingP3_61();

  console.log("");
  for (const line of formatCommissaryLandingP3_61AuditLines(summary)) {
    console.log(line);
  }
  console.log("");

  if (!summary.passed) {
    process.exit(1);
  }

  console.log("✓ Commissary landing P3-61 OK");
}

main();
