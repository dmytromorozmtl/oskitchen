/**
 * Audit webhook replay/retry UI (Blueprint P3-74).
 *
 * Usage:
 *   npm run audit:webhook-replay-ui-p3-74
 */
import {
  auditWebhookReplayUi,
  formatWebhookReplayUiAuditLines,
} from "@/lib/webhooks/webhook-replay-ui-audit";
import {
  auditWebhookReplayUiP3_74,
  formatWebhookReplayUiP3_74AuditLines,
} from "@/lib/webhooks/webhook-replay-ui-p3-74-audit";

function main(): void {
  const upstream = auditWebhookReplayUi();

  console.log("");
  for (const line of formatWebhookReplayUiAuditLines(upstream)) {
    console.log(line);
  }
  console.log("");

  const summary = auditWebhookReplayUiP3_74();

  for (const line of formatWebhookReplayUiP3_74AuditLines(summary)) {
    console.log(line);
  }
  console.log("");

  if (!summary.passed) {
    process.exit(1);
  }

  console.log("✓ Webhook replay UI P3-74 OK");
}

main();
