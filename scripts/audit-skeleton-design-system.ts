/**
 * Audit skeleton design system primitives (Table, CardGrid, KPI, Chart).
 *
 * Usage:
 *   npm run audit:skeleton-design-system
 */
import {
  auditSkeletonDesignSystem,
  formatSkeletonDesignSystemAuditLines,
} from "@/lib/design/skeleton-design-system-audit";

function main(): void {
  const summary = auditSkeletonDesignSystem();

  console.log("");
  for (const line of formatSkeletonDesignSystemAuditLines(summary)) {
    console.log(line);
  }
  console.log("");

  if (!summary.passed) {
    process.exit(1);
  }

  console.log("✓ Skeleton design system audit OK");
}

main();
