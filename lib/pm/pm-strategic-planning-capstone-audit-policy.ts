import { readFileSync } from "node:fs";
import { join } from "node:path";

import { auditPmCustomerGtmCapstone } from "@/lib/pm/pm-customer-gtm-capstone-audit-policy";
import {
  PM_STRATEGIC_PLANNING_CAPSTONE_POLICY_ID,
  PM_STRATEGIC_PLANNING_CAPSTONE_SUB_POLICIES,
} from "@/lib/pm/pm-strategic-planning-capstone-patterns";

/**
 * PM-05 — capstone audit for Q3 OKRs, Series A posture, SOC2, marketplace pricing + PM-04.
 */

export const PM_STRATEGIC_PLANNING_CAPSTONE_AUDIT_POLICY_ID =
  PM_STRATEGIC_PLANNING_CAPSTONE_POLICY_ID;

export type PmStrategicPlanningCapstoneSubAuditResult = {
  taskId: string;
  policyId: string;
  surface: string;
  passed: boolean;
};

export type PmStrategicPlanningCapstoneAuditReport = {
  policyId: typeof PM_STRATEGIC_PLANNING_CAPSTONE_AUDIT_POLICY_ID;
  subAudits: PmStrategicPlanningCapstoneSubAuditResult[];
  passed: boolean;
};

function readSurface(root: string, relPath: string): string {
  return readFileSync(join(root, relPath), "utf8");
}

function auditQ3Okrs(root: string): boolean {
  const source = readSurface(root, "docs/q3-2026-okrs.md");
  return (
    source.includes("q3-2026-okrs-v1") &&
    source.includes("## O1") &&
    source.includes("Scoring guide") &&
    source.includes("NO-GO")
  );
}

function auditSeriesANarrative(root: string): boolean {
  const source = readSurface(root, "docs/series-a-narrative.md");
  return (
    source.includes("series-a-narrative-v1") &&
    source.includes("NOT fundraise-ready") &&
    source.includes("pilot-gono-go-summary.json")
  );
}

function auditSeriesAHold(root: string): boolean {
  const source = readSurface(root, "docs/series-a-hold-notice.md");
  return (
    source.includes("Hold summary") &&
    source.includes("first pilot") &&
    source.includes("series-a-narrative.md")
  );
}

function auditSoc2Readiness(root: string): boolean {
  const source = readSurface(root, "docs/soc2-readiness-assessment.md");
  return (
    source.includes("soc2-readiness-assessment-v1") &&
    source.includes("Not certified") &&
    source.includes("Do **not** claim")
  );
}

function auditMarketplacePricing(root: string): boolean {
  const source = readSurface(root, "docs/marketplace-pricing-strategy.md");
  return (
    source.includes("marketplace-pricing-strategy-v1") &&
    source.includes("BETA") &&
    source.includes("Live transactions")
  );
}

const SUB_AUDIT_RUNNERS: Record<string, (root: string) => { policyId: string; passed: boolean }> =
  {
    "q3-okrs": (root) => ({
      policyId: "q3-2026-okrs-v1",
      passed: auditQ3Okrs(root),
    }),
    "series-a-narrative": (root) => ({
      policyId: "series-a-narrative-v1",
      passed: auditSeriesANarrative(root),
    }),
    "series-a-hold": (root) => ({
      policyId: "series-a-hold-notice-mkt10-v1",
      passed: auditSeriesAHold(root),
    }),
    "soc2-readiness": (root) => ({
      policyId: "soc2-readiness-assessment-v1",
      passed: auditSoc2Readiness(root),
    }),
    "marketplace-pricing": (root) => ({
      policyId: "marketplace-pricing-strategy-v1",
      passed: auditMarketplacePricing(root),
    }),
    "PM-04": (root) => {
      const report = auditPmCustomerGtmCapstone(root);
      return {
        policyId: report.policyId,
        passed: report.passed,
      };
    },
  };

export function auditPmStrategicPlanningCapstone(
  root = process.cwd(),
): PmStrategicPlanningCapstoneAuditReport {
  const subAudits = PM_STRATEGIC_PLANNING_CAPSTONE_SUB_POLICIES.map((entry) => {
    const report = SUB_AUDIT_RUNNERS[entry.id]!(root);
    return {
      taskId: entry.id,
      policyId: report.policyId,
      surface: entry.surface,
      passed: report.passed,
    };
  });

  return {
    policyId: PM_STRATEGIC_PLANNING_CAPSTONE_AUDIT_POLICY_ID,
    subAudits,
    passed: subAudits.every((a) => a.passed),
  };
}
