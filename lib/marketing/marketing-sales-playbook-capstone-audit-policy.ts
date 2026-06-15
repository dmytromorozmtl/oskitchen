import { readFileSync } from "node:fs";
import { join } from "node:path";

import { auditDemoScript15MinDoc } from "@/lib/marketing/demo-script-15min-policy";
import { auditDiscoveryCallScriptDoc } from "@/lib/marketing/discovery-call-script-policy";
import { auditMarketingClaimsGovernanceCapstone } from "@/lib/marketing/marketing-claims-governance-capstone-audit-policy";
import {
  MARKETING_SALES_PLAYBOOK_CAPSTONE_POLICY_ID,
  MARKETING_SALES_PLAYBOOK_CAPSTONE_SUB_POLICIES,
} from "@/lib/marketing/marketing-sales-playbook-capstone-patterns";
import { auditObjectionHandlingDoc } from "@/lib/marketing/objection-handling-policy";

/**
 * MKT-41 — capstone audit for SALES_PLAYBOOK hub + GTM playbook + closing-motion policies + MKT-40.
 */

export const MARKETING_SALES_PLAYBOOK_CAPSTONE_AUDIT_POLICY_ID =
  MARKETING_SALES_PLAYBOOK_CAPSTONE_POLICY_ID;

export type MarketingSalesPlaybookCapstoneSubAuditResult = {
  taskId: string;
  policyId: string;
  surface: string;
  passed: boolean;
};

export type MarketingSalesPlaybookCapstoneAuditReport = {
  policyId: typeof MARKETING_SALES_PLAYBOOK_CAPSTONE_AUDIT_POLICY_ID;
  subAudits: MarketingSalesPlaybookCapstoneSubAuditResult[];
  passed: boolean;
};

function readSurface(root: string, relPath: string): string {
  return readFileSync(join(root, relPath), "utf8");
}

function auditSalesPlaybookHub(root: string): boolean {
  const source = readSurface(root, "docs/SALES_PLAYBOOK.md");
  return (
    source.includes("discovery-call-script.md") &&
    source.includes("objection-handling.md") &&
    source.includes("demo-script-15min.md") &&
    source.includes("MKT-21") &&
    source.includes("MKT-23")
  );
}

function auditGtmSalesPlaybook(root: string): boolean {
  const source = readSurface(root, "docs/GTM_SALES_PLAYBOOK.md");
  return (
    source.includes("Pilot vs general availability") &&
    source.includes("CAPABILITY_SIGNOFF_SALES.md") &&
    source.includes("ghost-kitchen") &&
    source.includes("Paid pilot")
  );
}

const SUB_AUDIT_RUNNERS: Record<
  string,
  (root: string) => { policyId: string; passed: boolean }
> = {
  "sales-playbook-hub": (root) => ({
    policyId: "sales-playbook-hub-mkt41-v1",
    passed: auditSalesPlaybookHub(root),
  }),
  "gtm-sales-playbook": (root) => ({
    policyId: "gtm-sales-playbook-mkt41-v1",
    passed: auditGtmSalesPlaybook(root),
  }),
  "MKT-21": (root) => ({
    policyId: "discovery-call-script-mkt21-v1",
    passed: auditDiscoveryCallScriptDoc(root).passed,
  }),
  "MKT-22": (root) => ({
    policyId: "demo-script-15min-mkt22-v1",
    passed: auditDemoScript15MinDoc(root).passed,
  }),
  "MKT-23": (root) => ({
    policyId: "objection-handling-mkt23-v1",
    passed: auditObjectionHandlingDoc(root).passed,
  }),
  "MKT-40": (root) => {
    const report = auditMarketingClaimsGovernanceCapstone(root);
    return {
      policyId: report.policyId,
      passed: report.passed,
    };
  },
};

export function auditMarketingSalesPlaybookCapstone(
  root = process.cwd(),
): MarketingSalesPlaybookCapstoneAuditReport {
  const subAudits = MARKETING_SALES_PLAYBOOK_CAPSTONE_SUB_POLICIES.map((entry) => {
    const report = SUB_AUDIT_RUNNERS[entry.id]!(root);
    return {
      taskId: entry.id,
      policyId: report.policyId,
      surface: entry.surface,
      passed: report.passed,
    };
  });

  return {
    policyId: MARKETING_SALES_PLAYBOOK_CAPSTONE_AUDIT_POLICY_ID,
    subAudits,
    passed: subAudits.every((a) => a.passed),
  };
}
