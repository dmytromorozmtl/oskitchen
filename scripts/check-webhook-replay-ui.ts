/**
 * Verify webhook replay UI surfaces are wired for workspace + platform operators.
 *
 * Usage:
 *   npm run check:webhook-replay-ui
 */
import {
  auditWebhookReplayUi,
  formatWebhookReplayUiAuditLines,
} from "@/lib/webhooks/webhook-replay-ui-audit";
import { WEBHOOK_REPLAY_UI_RUNBOOK_STEPS } from "@/lib/webhooks/webhook-replay-ui-policy";

function main(): void {
  const summary = auditWebhookReplayUi();

  console.log("");
  for (const line of formatWebhookReplayUiAuditLines(summary)) {
    console.log(line);
  }

  console.log("\nRunbook:");
  for (const [index, step] of WEBHOOK_REPLAY_UI_RUNBOOK_STEPS.entries()) {
    console.log(`  ${index + 1}. ${step}`);
  }
  console.log("");

  if (!summary.passed) {
    process.exit(1);
  }

  console.log("✓ Webhook replay UI OK");
}

main();
