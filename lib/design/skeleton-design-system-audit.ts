import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
  SKELETON_DESIGN_SYSTEM_MODULE,
  SKELETON_DESIGN_SYSTEM_POLICY_ID,
  SKELETON_DESIGN_SYSTEM_PRIMITIVES,
  SKELETON_DESIGN_SYSTEM_TEST_IDS,
} from "@/lib/design/skeleton-design-system-policy";

export type SkeletonDesignSystemAuditSummary = {
  policyId: typeof SKELETON_DESIGN_SYSTEM_POLICY_ID;
  modulePresent: boolean;
  primitiveCount: number;
  primitivesWired: string[];
  missingPrimitives: string[];
  usesDesignTokens: boolean;
  tableReExportWired: boolean;
  passed: boolean;
};

export function auditSkeletonDesignSystem(
  root = process.cwd(),
): SkeletonDesignSystemAuditSummary {
  const modulePath = join(root, SKELETON_DESIGN_SYSTEM_MODULE);
  const modulePresent = existsSync(modulePath);

  const primitivesWired: string[] = [];
  const missingPrimitives: string[] = [];

  let usesDesignTokens = false;
  let tableReExportWired = false;

  if (modulePresent) {
    const source = readFileSync(modulePath, "utf8");
    for (const primitive of SKELETON_DESIGN_SYSTEM_PRIMITIVES) {
      if (source.includes(`function ${primitive}`) || source.includes(`export function ${primitive}`)) {
        primitivesWired.push(primitive);
      } else if (source.includes(`export { ${primitive}`)) {
        primitivesWired.push(primitive);
      } else {
        missingPrimitives.push(primitive);
      }
    }
    usesDesignTokens =
      source.includes("SKELETON_SURFACE_CLASS") && source.includes("LoadingSkeleton");
    tableReExportWired =
      source.includes('export { TableSkeleton }') &&
      source.includes("@/components/tables/table-skeleton");
  } else {
    missingPrimitives.push(...SKELETON_DESIGN_SYSTEM_PRIMITIVES);
  }

  const testIdsPresent =
    modulePresent &&
    readFileSync(modulePath, "utf8").includes("SKELETON_DESIGN_SYSTEM_TEST_IDS");

  const passed =
    modulePresent &&
    primitivesWired.length === SKELETON_DESIGN_SYSTEM_PRIMITIVES.length &&
    missingPrimitives.length === 0 &&
    usesDesignTokens &&
    tableReExportWired &&
    testIdsPresent;

  return {
    policyId: SKELETON_DESIGN_SYSTEM_POLICY_ID,
    modulePresent,
    primitiveCount: SKELETON_DESIGN_SYSTEM_PRIMITIVES.length,
    primitivesWired,
    missingPrimitives,
    usesDesignTokens,
    tableReExportWired,
    passed,
  };
}

export function formatSkeletonDesignSystemAuditLines(
  summary: SkeletonDesignSystemAuditSummary,
): string[] {
  return [
    `Skeleton design system audit (${summary.policyId})`,
    `Module: ${summary.modulePresent ? "present" : "missing"} (${SKELETON_DESIGN_SYSTEM_MODULE})`,
    `Primitives wired: ${summary.primitivesWired.join(", ") || "none"}`,
    `Missing primitives: ${summary.missingPrimitives.length === 0 ? "none" : summary.missingPrimitives.join(", ")}`,
    `Design tokens: ${summary.usesDesignTokens ? "yes" : "no"}`,
    `TableSkeleton re-export: ${summary.tableReExportWired ? "yes" : "no"}`,
    `Passed: ${summary.passed ? "YES" : "NO"}`,
  ];
}
