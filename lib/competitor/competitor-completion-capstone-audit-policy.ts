import { auditCompetitorLeapfrogGapClosure } from "@/lib/competitor/competitor-leapfrog-gap-closure-audit-policy";
import {
  COMPETITOR_COMPLETION_CAPSTONE_POLICY_ID,
  COMPETITOR_COMPLETION_CAPSTONE_SUB_POLICIES,
} from "@/lib/competitor/competitor-completion-capstone-patterns";
import { auditCompetitorP0Intelligence } from "@/lib/competitor/competitor-p0-intelligence-audit-policy";

/**
 * COMP-03 — completion capstone audit composing COMP-01 and COMP-02 competitor capstones.
 */

export const COMPETITOR_COMPLETION_CAPSTONE_AUDIT_POLICY_ID =
  COMPETITOR_COMPLETION_CAPSTONE_POLICY_ID;

export type CompetitorCompletionCapstoneSubAuditResult = {
  taskId: string;
  policyId: string;
  surface: string;
  nestedSubAuditCount: number;
  passed: boolean;
};

export type CompetitorCompletionCapstoneAuditReport = {
  policyId: typeof COMPETITOR_COMPLETION_CAPSTONE_AUDIT_POLICY_ID;
  subAudits: CompetitorCompletionCapstoneSubAuditResult[];
  passed: boolean;
};

const SUB_AUDIT_RUNNERS: Record<
  string,
  (root?: string) => { policyId: string; nestedSubAuditCount: number; passed: boolean }
> = {
  "COMP-01": (root) => {
    const report = auditCompetitorP0Intelligence(root);
    return {
      policyId: report.policyId,
      nestedSubAuditCount: report.subAudits.length,
      passed: report.passed,
    };
  },
  "COMP-02": (root) => {
    const report = auditCompetitorLeapfrogGapClosure(root);
    return {
      policyId: report.policyId,
      nestedSubAuditCount: report.subAudits.length,
      passed: report.passed,
    };
  },
};

export function auditCompetitorCompletionCapstone(
  root?: string,
): CompetitorCompletionCapstoneAuditReport {
  const subAudits = COMPETITOR_COMPLETION_CAPSTONE_SUB_POLICIES.map((entry) => {
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
    policyId: COMPETITOR_COMPLETION_CAPSTONE_AUDIT_POLICY_ID,
    subAudits,
    passed: subAudits.every((a) => a.passed),
  };
}
