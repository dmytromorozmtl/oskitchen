/**
 * Audit delivery orchestration Olo baseline (Blueprint P3-147).
 *
 * Usage:
 *   npm run audit:delivery-orchestration-p3-147
 */
import {
  auditDeliveryOrchestrationP3_147,
  formatDeliveryOrchestrationP3_147AuditLines,
} from "@/lib/delivery/delivery-orchestration-p3-147-audit";

function main(): void {
  const summary = auditDeliveryOrchestrationP3_147();

  console.log("");
  for (const line of formatDeliveryOrchestrationP3_147AuditLines(summary)) {
    console.log(line);
  }
  console.log("");

  if (!summary.passed) {
    process.exit(1);
  }

  console.log("✓ Delivery orchestration Olo audit OK");
}

main();
