/**
 * Audit KDS bump ticket UX (large target, haptic, visual confirmation, 3s undo).
 *
 * Usage:
 *   npm run audit:kds-bump-ticket-ux
 */
import {
  auditKdsBumpTicketUx,
  formatKdsBumpTicketUxAuditLines,
} from "@/lib/design/kds-bump-ticket-ux-audit";

function main(): void {
  const summary = auditKdsBumpTicketUx();

  console.log("");
  for (const line of formatKdsBumpTicketUxAuditLines(summary)) {
    console.log(line);
  }
  console.log("");

  if (!summary.passed) {
    process.exit(1);
  }

  console.log("✓ KDS bump ticket UX audit OK");
}

main();
