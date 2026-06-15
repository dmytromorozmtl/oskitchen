import { readFileSync } from "node:fs";
import { join } from "node:path";

import { auditCompetitorP0Intelligence } from "@/lib/competitor/competitor-p0-intelligence-audit-policy";
import {
  COMPETITOR_LEAPFROG_GAP_CLOSURE_POLICY_ID,
  COMPETITOR_LEAPFROG_GAP_CLOSURE_SUB_POLICIES,
} from "@/lib/competitor/competitor-leapfrog-gap-closure-patterns";

/**
 * COMP-02 — capstone audit for leapfrog roadmap, v12 gap-closure program, forensic sales-safe audit, Era 19 scorecard.
 */

export const COMPETITOR_LEAPFROG_GAP_CLOSURE_AUDIT_POLICY_ID =
  COMPETITOR_LEAPFROG_GAP_CLOSURE_POLICY_ID;

export type CompetitorLeapfrogGapClosureSubAuditResult = {
  taskId: string;
  policyId: string;
  surface: string;
  passed: boolean;
};

export type CompetitorLeapfrogGapClosureAuditReport = {
  policyId: typeof COMPETITOR_LEAPFROG_GAP_CLOSURE_AUDIT_POLICY_ID;
  subAudits: CompetitorLeapfrogGapClosureSubAuditResult[];
  passed: boolean;
};

function readSurface(root: string, relPath: string): string {
  return readFileSync(join(root, relPath), "utf8");
}

function auditLeapfrogRoadmap(root: string): boolean {
  const source = readSurface(root, "docs/competitor-leapfrog-roadmap-2026-05-28.md");
  return (
    source.includes("era17-competitor-feature-gap-matrix-refresh-v1") &&
    source.includes("evidence_aligned_awaiting_pilot_proof") &&
    source.includes("## Competitor Benchmark Matrix") &&
    source.includes("## Top 50 Competitor Features") &&
    source.includes("## Build Now vs Defer")
  );
}

function auditGapClosureProgram(root: string): boolean {
  const source = readSurface(root, "docs/competitor-gap-closure-v12.md");
  return (
    source.includes("COMPETITOR GAP CLOSURE (v12.0)") &&
    source.includes("ONE feature per cycle") &&
    source.includes("PASS > SKIPPED") &&
    source.includes("competitor-feature-tracker.json") &&
    source.includes("competitor-audit-report.md")
  );
}

function auditForensicSalesSafeReport(root: string): boolean {
  const source = readSurface(root, "artifacts/competitor-audit-report.md");
  return (
    source.includes("OS Kitchen — Competitor Feature Audit Report") &&
    source.includes("**TOTAL** | **25**") &&
    source.includes("1 done · 22 partial · 2 placeholder") &&
    source.includes("Tracker vs Audit Reconciliation")
  );
}

function auditPostEra19GapAudit(root: string): boolean {
  const source = readSurface(root, "docs/competitor-gap-audit-post-era19-2026-05-28.md");
  return (
    source.includes("Competitor readiness score: 59/100") &&
    source.includes("## Top 30 Competitor Gaps") &&
    source.includes("## Era 19 Competitor Impact") &&
    source.includes("competitor-leapfrog-roadmap-2026-05-28.md")
  );
}

function auditProductGapRoadmap(root: string): boolean {
  const source = readSurface(root, "docs/product/competitor-gap-roadmap.md");
  return (
    source.includes("## Competitor Matrix") &&
    source.includes("## Prioritized Features") &&
    source.includes("Restaurant365") &&
    source.includes("Toast")
  );
}

const SUB_AUDIT_RUNNERS: Record<string, (root: string) => { policyId: string; passed: boolean }> =
  {
    "COMP-01": (root) => {
      const report = auditCompetitorP0Intelligence(root);
      return { policyId: report.policyId, passed: report.passed };
    },
    "COMP-02a": (root) => ({
      policyId: "competitor-leapfrog-roadmap-era17-v1",
      passed: auditLeapfrogRoadmap(root),
    }),
    "COMP-02b": (root) => ({
      policyId: "competitor-gap-closure-program-v12-v1",
      passed: auditGapClosureProgram(root),
    }),
    "COMP-02c": (root) => ({
      policyId: "competitor-forensic-audit-sales-safe-v1",
      passed: auditForensicSalesSafeReport(root),
    }),
    "COMP-02d": (root) => ({
      policyId: "competitor-gap-audit-post-era19-v1",
      passed: auditPostEra19GapAudit(root),
    }),
    "COMP-02e": (root) => ({
      policyId: "competitor-gap-roadmap-product-v1",
      passed: auditProductGapRoadmap(root),
    }),
  };

export function auditCompetitorLeapfrogGapClosure(
  root = process.cwd(),
): CompetitorLeapfrogGapClosureAuditReport {
  const subAudits = COMPETITOR_LEAPFROG_GAP_CLOSURE_SUB_POLICIES.map((entry) => {
    const report = SUB_AUDIT_RUNNERS[entry.id]!(root);
    return {
      taskId: entry.id,
      policyId: report.policyId,
      surface: entry.surface,
      passed: report.passed,
    };
  });

  return {
    policyId: COMPETITOR_LEAPFROG_GAP_CLOSURE_AUDIT_POLICY_ID,
    subAudits,
    passed: subAudits.every((a) => a.passed),
  };
}
