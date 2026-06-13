/**
 * Audit demo tenant seed (Blueprint P3-75).
 *
 * Usage:
 *   npm run audit:demo-tenant-seed-p3-75
 */
import { auditDemoTenantSeedPolicy } from "@/lib/demo/demo-tenant-seed-policy";
import {
  auditDemoTenantSeedP3_75,
  formatDemoTenantSeedP3_75AuditLines,
} from "@/lib/demo/demo-tenant-seed-p3-75-audit";

function main(): void {
  const upstream = auditDemoTenantSeedPolicy();

  console.log("");
  console.log(`Demo tenant seed (${upstream.policyId})`);
  console.log(
    `Catalog: ${upstream.catalogLength} inventory · ${upstream.vendorLength} vendors · service=${upstream.serviceWired ? "yes" : "no"}`,
  );
  console.log(`Passed: ${upstream.passed ? "YES" : "NO"}`);
  console.log("");

  const summary = auditDemoTenantSeedP3_75();

  for (const line of formatDemoTenantSeedP3_75AuditLines(summary)) {
    console.log(line);
  }
  console.log("");

  if (!summary.passed) {
    process.exit(1);
  }

  console.log("✓ Demo tenant seed P3-75 OK");
}

main();
