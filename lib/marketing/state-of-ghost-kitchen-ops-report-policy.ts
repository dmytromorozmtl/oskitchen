import { readFileSync } from "node:fs";
import { join } from "node:path";

/**
 * MKT-33 — State of Ghost Kitchen Operations industry report policy.
 *
 * @see docs/state-of-ghost-kitchen-ops-report.md
 * @see docs/icp-definition-final.md
 */

export const STATE_OF_GHOST_KITCHEN_OPS_REPORT_POLICY_ID =
  "state-of-ghost-kitchen-ops-mkt33-v1" as const;

export const STATE_OF_GHOST_KITCHEN_OPS_REPORT_DOC =
  "docs/state-of-ghost-kitchen-ops-report.md" as const;

export const STATE_OF_GHOST_KITCHEN_OPS_ARTIFACT =
  "artifacts/state-of-ghost-kitchen-ops-summary.json" as const;

export const STATE_OF_GHOST_KITCHEN_OPS_REPORT_TITLE =
  "State of Ghost Kitchen Operations 2026" as const;

export const STATE_OF_GHOST_KITCHEN_OPS_MIN_PILOTS = 5 as const;

export const STATE_OF_GHOST_KITCHEN_OPS_REPORT_STATUS = "DRAFT OUTLINE" as const;

export const STATE_OF_GHOST_KITCHEN_OPS_REPORT_SECTIONS = [
  "S1",
  "S2",
  "S3",
  "S4",
  "S5",
  "S6",
  "S7",
  "S8",
  "S9",
  "S10",
  "S11",
] as const;

export const STATE_OF_GHOST_KITCHEN_OPS_PUBLISH_GATES = [
  "contributing pilots",
  "anonymized aggregate file",
  "no individual tenant identification",
  "metrics from verified exports",
  "forbidden claims lint",
  "series a hold",
] as const;

export const STATE_OF_GHOST_KITCHEN_OPS_FORBIDDEN_CLAIMS = [
  "thousands of operators surveyed",
  "xb ghost kitchen market",
  "outperform industry",
  "toast replacement",
  "production-certified",
  "live nationwide",
  "series a",
  "guaranteed",
  "unsourced market",
] as const;

export const STATE_OF_GHOST_KITCHEN_OPS_DOC_REQUIRED_HEADINGS = [
  "Publish gates",
  "Report sections",
  "Data collection contract",
  "Forbidden report claims",
  "Pre-publish checklist",
] as const;

export type StateOfGhostKitchenOpsReportDocAudit = {
  docPath: typeof STATE_OF_GHOST_KITCHEN_OPS_REPORT_DOC;
  missingHeadings: string[];
  sectionCount: number;
  minPilotsDocumented: boolean;
  passed: boolean;
};

export function auditStateOfGhostKitchenOpsReportDoc(
  root = process.cwd(),
): StateOfGhostKitchenOpsReportDocAudit {
  const source = readFileSync(join(root, STATE_OF_GHOST_KITCHEN_OPS_REPORT_DOC), "utf8");
  const missingHeadings = STATE_OF_GHOST_KITCHEN_OPS_DOC_REQUIRED_HEADINGS.filter(
    (heading) => !source.includes(heading),
  );
  const sectionCount = STATE_OF_GHOST_KITCHEN_OPS_REPORT_SECTIONS.filter((id) =>
    source.includes(`**${id}**`),
  ).length;
  const minPilotsDocumented = source.includes(String(STATE_OF_GHOST_KITCHEN_OPS_MIN_PILOTS));

  return {
    docPath: STATE_OF_GHOST_KITCHEN_OPS_REPORT_DOC,
    missingHeadings,
    sectionCount,
    minPilotsDocumented,
    passed:
      missingHeadings.length === 0 &&
      sectionCount === STATE_OF_GHOST_KITCHEN_OPS_REPORT_SECTIONS.length &&
      minPilotsDocumented,
  };
}

export function isStateOfGhostKitchenOpsReportPublishable(
  pilotCount: number,
  publishableFlag = false,
): boolean {
  return pilotCount >= STATE_OF_GHOST_KITCHEN_OPS_MIN_PILOTS && publishableFlag;
}

export type StateOfGhostKitchenOpsLint = {
  forbiddenHits: string[];
  passed: boolean;
};

export function lintStateOfGhostKitchenOpsCopy(source: string): StateOfGhostKitchenOpsLint {
  const lower = source.toLowerCase();
  const forbiddenHits = STATE_OF_GHOST_KITCHEN_OPS_FORBIDDEN_CLAIMS.filter((phrase) =>
    lower.includes(phrase),
  );
  return {
    forbiddenHits,
    passed: forbiddenHits.length === 0,
  };
}

export function cohortMedian(values: number[]): number | null {
  if (values.length === 0) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? Math.round((sorted[mid - 1]! + sorted[mid]!) / 2)
    : sorted[mid]!;
}
