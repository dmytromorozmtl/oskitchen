/**
 * Audit offline POS PCI flow E2E wiring.
 *
 * Usage:
 *   npm run audit:offline-pos-pci-flow-e2e
 */
import {
  auditOfflinePosPciFlowE2E,
  formatOfflinePosPciFlowAuditLines,
} from "@/lib/qa/offline-pos-pci-flow-e2e-audit";
import { runOfflinePosPciNoopV1ContractChecks } from "@/lib/qa/offline-pos-pci-flow-e2e-scoring";

async function main(): Promise<void> {
  const summary = auditOfflinePosPciFlowE2E();
  const contract = await runOfflinePosPciNoopV1ContractChecks();

  console.log("");
  for (const line of formatOfflinePosPciFlowAuditLines(summary)) {
    console.log(line);
  }
  console.log(
    `noop-v1 contract: ${contract.passedCount}/${contract.checkCount} checks PASS`,
  );
  for (const row of contract.checks) {
    console.log(`  ${row.passed ? "✓" : "✗"} ${row.id}: ${row.detail}`);
  }
  console.log("");

  if (!summary.passed || !contract.passed) {
    process.exit(1);
  }

  console.log("✓ Offline POS PCI flow E2E audit OK");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
