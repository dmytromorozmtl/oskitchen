/**
 * Audit KDS Playwright E2E wiring.
 *
 * Usage:
 *   npm run audit:kds-playwright-e2e
 */
import {
  auditKdsPlaywrightE2E,
  formatKdsPlaywrightAuditLines,
} from "@/lib/qa/kds-playwright-e2e-audit";

function main(): void {
  const summary = auditKdsPlaywrightE2E();

  console.log("");
  for (const line of formatKdsPlaywrightAuditLines(summary)) {
    console.log(line);
  }
  console.log("");

  if (!summary.passed) {
    process.exit(1);
  }

  console.log("✓ KDS Playwright E2E audit OK");
}

main();
