/**
 * Audit webhook replay idempotency for all 59 ingress routes.
 *
 * Usage:
 *   npm run audit:webhook-replay-idempotency-e2e
 */
import {
  auditWebhookReplayIdempotencyE2E,
  buildWebhookReplayIdempotencyAuditReport,
  formatWebhookReplayIdempotencyAuditLines,
} from "@/lib/qa/webhook-replay-idempotency-e2e-audit";

function main(): void {
  const report = buildWebhookReplayIdempotencyAuditReport();
  const summary = auditWebhookReplayIdempotencyE2E();

  console.log("");
  for (const line of formatWebhookReplayIdempotencyAuditLines(summary, report)) {
    console.log(line);
  }
  console.log("");

  if (!summary.passed) {
    if (report.missingIdempotency.length > 0) {
      console.log("Missing idempotency wiring:");
      for (const row of report.missingIdempotency.slice(0, 10)) {
        console.log(`  - ${row.apiPath} (${row.replayProtection})`);
      }
    }
    process.exit(1);
  }

  console.log("✓ Webhook replay idempotency E2E audit OK");
}

main();
