import { readFileSync } from "node:fs";
import { join } from "node:path";

import {
  COMPETITOR_FEATURE_GAP_MATRIX_ERA17_POLICY_ID,
  COMPETITOR_FEATURE_GAP_MATRIX_ERA17_PROOF_STATUS,
  COMPETITOR_FEATURE_GAP_MATRIX_ERA17_REQUIRED_COMPETITORS,
  COMPETITOR_FEATURE_GAP_MATRIX_ERA17_REQUIRED_SECTIONS,
  COMPETITOR_FEATURE_GAP_MATRIX_ERA17_SUMMARY_ARTIFACT,
} from "@/lib/commercial/competitor-feature-gap-matrix-era17-policy";
import {
  COMPETITOR_P0_INTELLIGENCE_POLICY_ID,
  COMPETITOR_P0_INTELLIGENCE_SUB_POLICIES,
} from "@/lib/competitor/competitor-p0-intelligence-patterns";
import { auditCompetitiveBattleCardsDoc } from "@/lib/marketing/competitive-battle-cards-policy";
import { auditToastGapPublicSummaryDoc } from "@/lib/marketing/toast-gap-analysis-public-summary-policy";

/**
 * COMP-01 — capstone audit for P0 competitor intelligence (honest comparison, tracker, battle cards, gap matrix, Toast wedge).
 */

export const COMPETITOR_P0_INTELLIGENCE_AUDIT_POLICY_ID = COMPETITOR_P0_INTELLIGENCE_POLICY_ID;

const SEVEN_COMPETITOR_IDS = [
  "toast",
  "square",
  "lightspeed",
  "clover",
  "touchbistro",
  "spoton",
  "oracle_simphony",
] as const;

export type CompetitorP0IntelligenceSubAuditResult = {
  taskId: string;
  policyId: string;
  surface: string;
  passed: boolean;
};

export type CompetitorP0IntelligenceAuditReport = {
  policyId: typeof COMPETITOR_P0_INTELLIGENCE_AUDIT_POLICY_ID;
  subAudits: CompetitorP0IntelligenceSubAuditResult[];
  passed: boolean;
};

function readSurface(root: string, relPath: string): string {
  return readFileSync(join(root, relPath), "utf8");
}

function auditCompetitorComparison(root: string): boolean {
  const source = readSurface(root, "docs/competitor-comparison-honest.md");
  return (
    source.includes("competitor-comparison-honest-v1") &&
    source.includes("Toast") &&
    source.includes("Square") &&
    source.includes("17 LIVE")
  );
}

function auditCompetitorTracker(root: string): boolean {
  const raw = readSurface(root, "artifacts/competitor-feature-tracker.json");
  const tracker = JSON.parse(raw) as {
    competitorComparison: {
      headToHeadFilled: number;
      headToHead: Record<
        string,
        { competitorWins: unknown[]; osKitchenWinsQualified: unknown[]; safeTalkTrack: string }
      >;
    };
    salesSafeFeatures: Record<string, { salesSafeVerdict: string }>;
  };
  if (tracker.competitorComparison.headToHeadFilled !== 7) return false;
  for (const id of SEVEN_COMPETITOR_IDS) {
    const profile = tracker.competitorComparison.headToHead[id];
    if (!profile) return false;
    if (profile.competitorWins.length < 4) return false;
    if (profile.osKitchenWinsQualified.length < 4) return false;
    if (profile.safeTalkTrack.length < 20) return false;
  }
  return Object.keys(tracker.salesSafeFeatures).length >= 20;
}

function auditCompetitorGapMatrix(root: string): boolean {
  const matrix = readSurface(root, "docs/competitor-feature-gap-matrix.md");
  if (!matrix.includes(COMPETITOR_FEATURE_GAP_MATRIX_ERA17_POLICY_ID)) return false;
  if (!matrix.includes(COMPETITOR_FEATURE_GAP_MATRIX_ERA17_PROOF_STATUS)) return false;
  for (const section of COMPETITOR_FEATURE_GAP_MATRIX_ERA17_REQUIRED_SECTIONS) {
    if (!matrix.includes(section)) return false;
  }
  for (const name of COMPETITOR_FEATURE_GAP_MATRIX_ERA17_REQUIRED_COMPETITORS) {
    if (!matrix.includes(name)) return false;
  }

  const summaryRaw = readSurface(root, COMPETITOR_FEATURE_GAP_MATRIX_ERA17_SUMMARY_ARTIFACT);
  const summary = JSON.parse(summaryRaw) as {
    overall: string;
    certPassed: boolean;
    requiredCompetitorCount: number;
    matrixProofStatus: string;
  };
  return (
    summary.overall === "PASSED" &&
    summary.certPassed === true &&
    summary.requiredCompetitorCount ===
      COMPETITOR_FEATURE_GAP_MATRIX_ERA17_REQUIRED_COMPETITORS.length &&
    summary.matrixProofStatus === "evidence_aligned_era17"
  );
}

const SUB_AUDIT_RUNNERS: Record<string, (root: string) => { policyId: string; passed: boolean }> =
  {
    "COMP-01a": (root) => ({
      policyId: "competitor-comparison-honest-v1",
      passed: auditCompetitorComparison(root),
    }),
    "COMP-01b": (root) => ({
      policyId: "competitor-feature-tracker-v1",
      passed: auditCompetitorTracker(root),
    }),
    "COMP-01c": (root) => ({
      policyId: "competitive-battle-cards-mkt26-v1",
      passed: auditCompetitiveBattleCardsDoc(root).passed,
    }),
    "COMP-01d": (root) => ({
      policyId: COMPETITOR_FEATURE_GAP_MATRIX_ERA17_POLICY_ID,
      passed: auditCompetitorGapMatrix(root),
    }),
    "COMP-01e": (root) => ({
      policyId: "toast-gap-analysis-public-summary-mkt34-v1",
      passed: auditToastGapPublicSummaryDoc(root).passed,
    }),
  };

export function auditCompetitorP0Intelligence(
  root = process.cwd(),
): CompetitorP0IntelligenceAuditReport {
  const subAudits = COMPETITOR_P0_INTELLIGENCE_SUB_POLICIES.map((entry) => {
    const report = SUB_AUDIT_RUNNERS[entry.id]!(root);
    return {
      taskId: entry.id,
      policyId: report.policyId,
      surface: entry.surface,
      passed: report.passed,
    };
  });

  return {
    policyId: COMPETITOR_P0_INTELLIGENCE_AUDIT_POLICY_ID,
    subAudits,
    passed: subAudits.every((a) => a.passed),
  };
}
