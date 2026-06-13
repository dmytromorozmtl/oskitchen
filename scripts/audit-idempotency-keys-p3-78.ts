/**
 * Audit idempotency keys (Blueprint P3-78).
 *
 * Usage:
 *   npm run audit:idempotency-keys-p3-78
 */
import { auditAllIdempotencyKeys } from "@/lib/idempotency/idempotency-keys-policy";
import {
  auditIdempotencyKeysP3_78,
  formatIdempotencyKeysP3_78AuditLines,
} from "@/lib/idempotency/idempotency-keys-p3-78-audit";

function main(): void {
  const upstream = auditAllIdempotencyKeys();

  console.log("");
  console.log(`Idempotency keys wiring (${upstream.policyId})`);
  console.log(`Registry entries: ${upstream.reports.length}`);
  console.log(`All wired: ${upstream.passed ? "yes" : "no"}`);
  console.log("");

  const summary = auditIdempotencyKeysP3_78();

  for (const line of formatIdempotencyKeysP3_78AuditLines(summary)) {
    console.log(line);
  }
  console.log("");

  if (!summary.passed) {
    process.exit(1);
  }

  console.log("✓ Idempotency keys P3-78 OK");
}

main();
