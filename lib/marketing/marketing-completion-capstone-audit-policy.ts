import { auditMarketingClaimsGovernanceCapstone } from "@/lib/marketing/marketing-claims-governance-capstone-audit-policy";
import {
  MARKETING_COMPLETION_CAPSTONE_POLICY_ID,
  MARKETING_COMPLETION_CAPSTONE_SUB_POLICIES,
} from "@/lib/marketing/marketing-completion-capstone-patterns";
import { auditMarketingFullStabilization } from "@/lib/marketing/marketing-full-stabilization-audit-policy";
import { auditMarketingSalesPlaybookCapstone } from "@/lib/marketing/marketing-sales-playbook-capstone-audit-policy";

/**
 * MKT-42 — completion capstone audit composing MKT-39, MKT-40, and MKT-41 marketing capstones.
 */

export const MARKETING_COMPLETION_CAPSTONE_AUDIT_POLICY_ID =
  MARKETING_COMPLETION_CAPSTONE_POLICY_ID;

export type MarketingCompletionCapstoneSubAuditResult = {
  taskId: string;
  policyId: string;
  surface: string;
  nestedSubAuditCount: number;
  passed: boolean;
};

export type MarketingCompletionCapstoneAuditReport = {
  policyId: typeof MARKETING_COMPLETION_CAPSTONE_AUDIT_POLICY_ID;
  subAudits: MarketingCompletionCapstoneSubAuditResult[];
  passed: boolean;
};

const SUB_AUDIT_RUNNERS: Record<
  string,
  (root?: string) => { policyId: string; nestedSubAuditCount: number; passed: boolean }
> = {
  "MKT-39": (root) => {
    const report = auditMarketingFullStabilization(root);
    return {
      policyId: report.policyId,
      nestedSubAuditCount: report.subAudits.length,
      passed: report.passed,
    };
  },
  "MKT-40": (root) => {
    const report = auditMarketingClaimsGovernanceCapstone(root);
    return {
      policyId: report.policyId,
      nestedSubAuditCount: report.subAudits.length,
      passed: report.passed,
    };
  },
  "MKT-41": (root) => {
    const report = auditMarketingSalesPlaybookCapstone(root);
    return {
      policyId: report.policyId,
      nestedSubAuditCount: report.subAudits.length,
      passed: report.passed,
    };
  },
};

export function auditMarketingCompletionCapstone(
  root?: string,
): MarketingCompletionCapstoneAuditReport {
  const subAudits = MARKETING_COMPLETION_CAPSTONE_SUB_POLICIES.map((entry) => {
    const report = SUB_AUDIT_RUNNERS[entry.id]!(root);
    return {
      taskId: entry.id,
      policyId: report.policyId,
      surface: entry.surface,
      nestedSubAuditCount: report.nestedSubAuditCount,
      passed: report.passed,
    };
  });

  return {
    policyId: MARKETING_COMPLETION_CAPSTONE_AUDIT_POLICY_ID,
    subAudits,
    passed: subAudits.every((a) => a.passed),
  };
}
