import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
  auditDes21ColorTokenCoverage,
  countColorUsage,
  coveragePercent,
} from "@/lib/design/color-token-audit-policy";
import {
  DESIGN_TOKEN_ARBITRARY_SPACING_PATTERN,
  DESIGN_TOKEN_ARBITRARY_TEXT_PATTERN,
  DESIGN_TOKEN_PASS_BASELINE_PERCENT,
  DESIGN_TOKEN_PASS_MODULES,
  DESIGN_TOKEN_PASS_POLICY_ID,
  DESIGN_TOKEN_PASS_TARGET_PERCENT,
} from "@/lib/design/design-token-pass-policy";

export type DesignTokenPassModuleAudit = {
  module: (typeof DESIGN_TOKEN_PASS_MODULES)[number];
  present: boolean;
  arbitraryTextCount: number;
  arbitrarySpacingCount: number;
  usesDesignTokens: boolean;
  passed: boolean;
};

export type DesignTokenPassAuditSummary = {
  policyId: typeof DESIGN_TOKEN_PASS_POLICY_ID;
  baselinePercent: typeof DESIGN_TOKEN_PASS_BASELINE_PERCENT;
  targetPercent: typeof DESIGN_TOKEN_PASS_TARGET_PERCENT;
  colorCoveragePercent: number;
  colorPassed: boolean;
  modules: DesignTokenPassModuleAudit[];
  passed: boolean;
};

function moduleUsesDesignTokens(source: string): boolean {
  return (
    source.includes("DESIGN_TOKEN_") ||
    source.includes("colorVar.") ||
    source.includes("chartSeriesColor") ||
    source.includes("ERROR_TEMPLATE_") ||
    source.includes("PERMISSION_DENIED_") ||
    source.includes("layout.contentMaxClass")
  );
}

export function auditDesignTokenPassModule(
  modulePath: (typeof DESIGN_TOKEN_PASS_MODULES)[number],
  root = process.cwd(),
): DesignTokenPassModuleAudit {
  const fullPath = join(root, modulePath);
  const present = existsSync(fullPath);

  if (!present) {
    return {
      module: modulePath,
      present: false,
      arbitraryTextCount: 0,
      arbitrarySpacingCount: 0,
      usesDesignTokens: false,
      passed: false,
    };
  }

  const source = readFileSync(fullPath, "utf8");
  const arbitraryTextCount = (source.match(DESIGN_TOKEN_ARBITRARY_TEXT_PATTERN) ?? []).length;
  const arbitrarySpacingCount = (source.match(DESIGN_TOKEN_ARBITRARY_SPACING_PATTERN) ?? []).length;
  const usesDesignTokens = moduleUsesDesignTokens(source);

  return {
    module: modulePath,
    present: true,
    arbitraryTextCount,
    arbitrarySpacingCount,
    usesDesignTokens,
    passed:
      arbitraryTextCount === 0 &&
      arbitrarySpacingCount === 0 &&
      usesDesignTokens,
  };
}

export function auditDesignTokenPass(root = process.cwd()): DesignTokenPassAuditSummary {
  const colorReport = auditDes21ColorTokenCoverage(root);
  const modules = DESIGN_TOKEN_PASS_MODULES.map((modulePath) =>
    auditDesignTokenPassModule(modulePath, root),
  );

  const passed =
    colorReport.overallCoveragePercent >= DESIGN_TOKEN_PASS_TARGET_PERCENT &&
    colorReport.passed &&
    modules.every((module) => module.passed);

  return {
    policyId: DESIGN_TOKEN_PASS_POLICY_ID,
    baselinePercent: DESIGN_TOKEN_PASS_BASELINE_PERCENT,
    targetPercent: DESIGN_TOKEN_PASS_TARGET_PERCENT,
    colorCoveragePercent: colorReport.overallCoveragePercent,
    colorPassed: colorReport.passed,
    modules,
    passed,
  };
}

export function formatDesignTokenPassAuditLines(summary: DesignTokenPassAuditSummary): string[] {
  const moduleLines = summary.modules.map(
    (module) =>
      `${module.module}: arbitrary text=${module.arbitraryTextCount}, spacing=${module.arbitrarySpacingCount}, tokens=${module.usesDesignTokens ? "yes" : "no"} → ${module.passed ? "PASS" : "FAIL"}`,
  );

  return [
    `Design token pass audit (${summary.policyId})`,
    `Color coverage: ${summary.colorCoveragePercent}% (target ${summary.targetPercent}%) → ${summary.colorPassed ? "PASS" : "FAIL"}`,
    ...moduleLines,
    `Passed: ${summary.passed ? "YES" : "NO"}`,
  ];
}

export { countColorUsage, coveragePercent };
