import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
  pageHasSuspenseWave1Boundary,
  SUSPENSE_BOUNDARIES_P2_41_POLICY_ID,
  SUSPENSE_WAVE_1_BASELINE_PAGES,
  SUSPENSE_WAVE_1_PAGES,
  SUSPENSE_WAVE_1_SECTORS,
} from "@/lib/frontend/suspense-boundaries-p2-41-policy";

export type SuspenseBoundariesP241AuditSummary = {
  policyId: typeof SUSPENSE_BOUNDARIES_P2_41_POLICY_ID;
  wave1PageCount: number;
  baselinePageCount: number;
  sectors: readonly string[];
  wrappedCount: number;
  baselineWrappedCount: number;
  boundaryComponentPresent: boolean;
  passed: boolean;
};

export function auditSuspenseBoundariesP241(root = process.cwd()): SuspenseBoundariesP241AuditSummary {
  let wrappedCount = 0;
  for (const route of SUSPENSE_WAVE_1_PAGES) {
    const source = readFileSync(join(root, route.pagePath), "utf8");
    if (pageHasSuspenseWave1Boundary(source)) wrappedCount += 1;
  }

  let baselineWrappedCount = 0;
  for (const pagePath of SUSPENSE_WAVE_1_BASELINE_PAGES) {
    const source = readFileSync(join(root, pagePath), "utf8");
    if (pageHasSuspenseWave1Boundary(source)) baselineWrappedCount += 1;
  }

  const boundaryComponentPresent = existsSync(
    join(root, "components/dashboard/suspense-wave1-page-boundary.tsx"),
  );

  const passed =
    wrappedCount === SUSPENSE_WAVE_1_PAGES.length &&
    baselineWrappedCount === SUSPENSE_WAVE_1_BASELINE_PAGES.length &&
    boundaryComponentPresent;

  return {
    policyId: SUSPENSE_BOUNDARIES_P2_41_POLICY_ID,
    wave1PageCount: SUSPENSE_WAVE_1_PAGES.length,
    baselinePageCount: SUSPENSE_WAVE_1_BASELINE_PAGES.length,
    sectors: SUSPENSE_WAVE_1_SECTORS,
    wrappedCount,
    baselineWrappedCount,
    boundaryComponentPresent,
    passed,
  };
}

export function formatSuspenseBoundariesP241AuditLines(
  summary: SuspenseBoundariesP241AuditSummary,
): string[] {
  return [
    `Suspense boundaries wave 1 audit (${summary.policyId})`,
    `Wave 1 pages: ${summary.wrappedCount}/${summary.wave1PageCount}`,
    `Baseline pages: ${summary.baselineWrappedCount}/${summary.baselinePageCount}`,
    `Sectors: ${summary.sectors.join(", ")}`,
    `Boundary component: ${summary.boundaryComponentPresent ? "present" : "missing"}`,
    `Passed: ${summary.passed ? "YES" : "NO"}`,
  ];
}
