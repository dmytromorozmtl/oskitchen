/**
 * Audit cross-channel guest identity (Blueprint P2-115).
 *
 * Usage:
 *   npm run audit:cross-channel-guest-identity-p2-115
 */
import {
  auditCrossChannelGuestIdentityP2_115,
  formatCrossChannelGuestIdentityP2_115AuditLines,
} from "@/lib/crm/cross-channel-guest-identity-p2-115-audit";

function main(): void {
  const summary = auditCrossChannelGuestIdentityP2_115();

  console.log("");
  for (const line of formatCrossChannelGuestIdentityP2_115AuditLines(summary)) {
    console.log(line);
  }
  console.log("");

  if (!summary.passed) {
    process.exit(1);
  }

  console.log("✓ Cross-channel guest identity (P2-115) audit OK");
}

main();
