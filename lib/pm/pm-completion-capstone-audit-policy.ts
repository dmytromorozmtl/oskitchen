import { auditPmCustomerGtmCapstone } from "@/lib/pm/pm-customer-gtm-capstone-audit-policy";
import {
  PM_COMPLETION_CAPSTONE_POLICY_ID,
  PM_COMPLETION_CAPSTONE_SUB_POLICIES,
} from "@/lib/pm/pm-completion-capstone-patterns";
import { auditPmOpsGovernanceCapstone } from "@/lib/pm/pm-ops-governance-capstone-audit-policy";
import { auditPmP0Foundation } from "@/lib/pm/pm-p0-foundation-audit-policy";
import { auditPmPilotGonoGoCapstone } from "@/lib/pm/pm-pilot-gono-go-capstone-audit-policy";
import { auditPmStrategicPlanningCapstone } from "@/lib/pm/pm-strategic-planning-capstone-audit-policy";

/**
 * PM-06 — completion capstone audit composing PM-01 through PM-05 program management capstones.
 */

export const PM_COMPLETION_CAPSTONE_AUDIT_POLICY_ID = PM_COMPLETION_CAPSTONE_POLICY_ID;

export type PmCompletionCapstoneSubAuditResult = {
  taskId: string;
  policyId: string;
  surface: string;
  nestedSubAuditCount: number;
  passed: boolean;
};

export type PmCompletionCapstoneAuditReport = {
  policyId: typeof PM_COMPLETION_CAPSTONE_AUDIT_POLICY_ID;
  subAudits: PmCompletionCapstoneSubAuditResult[];
  passed: boolean;
};

const SUB_AUDIT_RUNNERS: Record<
  string,
  (root?: string) => { policyId: string; nestedSubAuditCount: number; passed: boolean }
> = {
  "PM-01": (root) => {
    const report = auditPmP0Foundation(root);
    return {
      policyId: report.policyId,
      nestedSubAuditCount: report.subAudits.length,
      passed: report.passed,
    };
  },
  "PM-02": (root) => {
    const report = auditPmPilotGonoGoCapstone(root);
    return {
      policyId: report.policyId,
      nestedSubAuditCount: report.subAudits.length,
      passed: report.passed,
    };
  },
  "PM-03": (root) => {
    const report = auditPmOpsGovernanceCapstone(root);
    return {
      policyId: report.policyId,
      nestedSubAuditCount: report.subAudits.length,
      passed: report.passed,
    };
  },
  "PM-04": (root) => {
    const report = auditPmCustomerGtmCapstone(root);
    return {
      policyId: report.policyId,
      nestedSubAuditCount: report.subAudits.length,
      passed: report.passed,
    };
  },
  "PM-05": (root) => {
    const report = auditPmStrategicPlanningCapstone(root);
    return {
      policyId: report.policyId,
      nestedSubAuditCount: report.subAudits.length,
      passed: report.passed,
    };
  },
};

export function auditPmCompletionCapstone(root?: string): PmCompletionCapstoneAuditReport {
  const subAudits = PM_COMPLETION_CAPSTONE_SUB_POLICIES.map((entry) => {
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
    policyId: PM_COMPLETION_CAPSTONE_AUDIT_POLICY_ID,
    subAudits,
    passed: subAudits.every((a) => a.passed),
  };
}
