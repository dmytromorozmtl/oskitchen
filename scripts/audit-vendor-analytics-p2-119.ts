/**
 * Audit vendor analytics (Blueprint P2-119).
 *
 * Usage:
 *   npm run audit:vendor-analytics-p2-119
 */
import {
  auditVendorAnalyticsP2_119,
  formatVendorAnalyticsP2_119AuditLines,
} from "@/lib/marketplace/vendor-analytics-p2-119-audit";

function main(): void {
  const summary = auditVendorAnalyticsP2_119();

  console.log("");
  for (const line of formatVendorAnalyticsP2_119AuditLines(summary)) {
    console.log(line);
  }
  console.log("");

  if (!summary.passed) {
    process.exit(1);
  }

  console.log("✓ Vendor analytics (P2-119) audit OK");
}

main();
