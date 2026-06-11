/**
 * Audit Webhook ingest → order creation E2E wiring.
 *
 * Usage:
 *   npm run audit:webhook-ingest-order-creation-e2e
 */
import {
  auditWebhookIngestOrderCreationE2E,
  formatWebhookIngestOrderCreationAuditLines,
} from "@/lib/qa/webhook-ingest-order-creation-e2e-audit";

function main(): void {
  const summary = auditWebhookIngestOrderCreationE2E();

  console.log("");
  for (const line of formatWebhookIngestOrderCreationAuditLines(summary)) {
    console.log(line);
  }
  console.log("");

  if (!summary.passed) {
    process.exit(1);
  }

  console.log("✓ Webhook ingest → order creation E2E audit OK");
}

main();
