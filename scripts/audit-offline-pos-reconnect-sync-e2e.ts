/**
 * Audit Offline POS → reconnect → sync E2E wiring.
 *
 * Usage:
 *   npm run audit:offline-pos-reconnect-sync-e2e
 */
import {
  auditOfflinePosReconnectSyncE2E,
  formatOfflinePosReconnectSyncAuditLines,
} from "@/lib/qa/offline-pos-reconnect-sync-e2e-audit";

function main(): void {
  const summary = auditOfflinePosReconnectSyncE2E();

  console.log("");
  for (const line of formatOfflinePosReconnectSyncAuditLines(summary)) {
    console.log(line);
  }
  console.log("");

  if (!summary.passed) {
    process.exit(1);
  }

  console.log("✓ Offline POS → reconnect → sync E2E audit OK");
}

main();
