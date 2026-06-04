import { readFileSync } from "node:fs";
import { join } from "node:path";

import { auditPmOpsGovernanceCapstone } from "@/lib/pm/pm-ops-governance-capstone-audit-policy";
import {
  PM_CUSTOMER_GTM_CAPSTONE_POLICY_ID,
  PM_CUSTOMER_GTM_CAPSTONE_SUB_POLICIES,
} from "@/lib/pm/pm-customer-gtm-capstone-patterns";

/**
 * PM-04 — capstone audit for customer success playbook + demo environment + competitor intelligence + PM-03.
 */

export const PM_CUSTOMER_GTM_CAPSTONE_AUDIT_POLICY_ID = PM_CUSTOMER_GTM_CAPSTONE_POLICY_ID;

const SEVEN_COMPETITOR_IDS = [
  "toast",
  "square",
  "lightspeed",
  "clover",
  "touchbistro",
  "spoton",
  "oracle_simphony",
] as const;

export type PmCustomerGtmCapstoneSubAuditResult = {
  taskId: string;
  policyId: string;
  surface: string;
  passed: boolean;
};

export type PmCustomerGtmCapstoneAuditReport = {
  policyId: typeof PM_CUSTOMER_GTM_CAPSTONE_AUDIT_POLICY_ID;
  subAudits: PmCustomerGtmCapstoneSubAuditResult[];
  passed: boolean;
};

function readSurface(root: string, relPath: string): string {
  return readFileSync(join(root, relPath), "utf8");
}

function auditCustomerSuccessPlaybook(root: string): boolean {
  const source = readSurface(root, "docs/customer-success-playbook.md");
  return (
    source.includes("customer-success-playbook-v1") &&
    source.includes("Customer lifecycle map") &&
    source.includes("pilot-execution-checklist.md") &&
    source.includes("NO-GO")
  );
}

function auditSalesDemoEnvironment(root: string): boolean {
  const source = readSurface(root, "docs/sales-demo-environment.md");
  return (
    source.includes("sales-demo-environment-v1") &&
    source.includes("pilot-gono-go-summary.json") &&
    source.includes("sales-safe-claims-registry.md")
  );
}

function auditCompetitorComparison(root: string): boolean {
  const source = readSurface(root, "docs/competitor-comparison-honest.md");
  return (
    source.includes("competitor-comparison-honest-v1") &&
    source.includes("Toast") &&
    source.includes("Square") &&
    source.includes("0 LIVE")
  );
}

function auditCompetitorTracker(root: string): boolean {
  const raw = readSurface(root, "artifacts/competitor-feature-tracker.json");
  const tracker = JSON.parse(raw) as {
    competitorComparison: {
      headToHeadFilled: number;
      competitors: string[];
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

const SUB_AUDIT_RUNNERS: Record<string, (root: string) => { policyId: string; passed: boolean }> =
  {
    "customer-success-playbook": (root) => ({
      policyId: "customer-success-playbook-v1",
      passed: auditCustomerSuccessPlaybook(root),
    }),
    "sales-demo-environment": (root) => ({
      policyId: "sales-demo-environment-v1",
      passed: auditSalesDemoEnvironment(root),
    }),
    "competitor-comparison": (root) => ({
      policyId: "competitor-comparison-honest-v1",
      passed: auditCompetitorComparison(root),
    }),
    "competitor-tracker": (root) => ({
      policyId: "competitor-feature-tracker-v1",
      passed: auditCompetitorTracker(root),
    }),
    "PM-03": (root) => {
      const report = auditPmOpsGovernanceCapstone(root);
      return {
        policyId: report.policyId,
        passed: report.passed,
      };
    },
  };

export function auditPmCustomerGtmCapstone(
  root = process.cwd(),
): PmCustomerGtmCapstoneAuditReport {
  const subAudits = PM_CUSTOMER_GTM_CAPSTONE_SUB_POLICIES.map((entry) => {
    const report = SUB_AUDIT_RUNNERS[entry.id]!(root);
    return {
      taskId: entry.id,
      policyId: report.policyId,
      surface: entry.surface,
      passed: report.passed,
    };
  });

  return {
    policyId: PM_CUSTOMER_GTM_CAPSTONE_AUDIT_POLICY_ID,
    subAudits,
    passed: subAudits.every((a) => a.passed),
  };
}
