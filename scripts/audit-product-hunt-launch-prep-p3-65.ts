/**
 * Audit Product Hunt launch prep (Blueprint P3-65).
 *
 * Usage:
 *   npm run audit:product-hunt-launch-prep-p3-65
 */
import {
  auditProductHuntLaunchPrepP3_65,
  formatProductHuntLaunchPrepP3_65AuditLines,
} from "@/lib/marketing/product-hunt-launch-prep-p3-65-audit";

function main(): void {
  const summary = auditProductHuntLaunchPrepP3_65();

  console.log("");
  for (const line of formatProductHuntLaunchPrepP3_65AuditLines(summary)) {
    console.log(line);
  }
  console.log("");

  if (!summary.passed) {
    process.exit(1);
  }

  console.log("✓ Product Hunt launch prep P3-65 OK");
}

main();
