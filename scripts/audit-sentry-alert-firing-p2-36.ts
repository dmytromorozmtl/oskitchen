/**
 * Audit P2-36 Sentry alert firing wiring and verification runbook.
 *
 * Usage:
 *   npm run audit:sentry-alert-firing-p2-36
 */
import {
  auditSentryAlertFiringP2_36,
  formatSentryAlertFiringP2_36AuditLines,
} from "@/lib/qa/sentry-alert-firing-p2-36-audit";

function main(): void {
  const summary = auditSentryAlertFiringP2_36();

  console.log("");
  for (const line of formatSentryAlertFiringP2_36AuditLines(summary)) {
    console.log(line);
  }
  console.log("");

  if (!summary.passed) {
    process.exit(1);
  }

  console.log("✓ Sentry alert firing P2-36 OK");
}

main();
