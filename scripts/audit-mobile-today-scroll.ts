/**
 * Audit mobile Today scroll (5+ playbooks, no horizontal scroll, sticky header).
 *
 * Usage:
 *   npm run audit:mobile-today-scroll
 */
import {
  auditMobileTodayScroll,
  formatMobileTodayScrollAuditLines,
} from "@/lib/design/mobile-today-scroll-audit";

function main(): void {
  const summary = auditMobileTodayScroll();

  console.log("");
  for (const line of formatMobileTodayScrollAuditLines(summary)) {
    console.log(line);
  }
  console.log("");

  if (!summary.passed) {
    process.exit(1);
  }

  console.log("✓ Mobile Today scroll audit OK");
}

main();
