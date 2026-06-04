import { auditMarketingP0Stabilization } from "@/lib/marketing/marketing-p0-stabilization-audit-policy";
import { auditMarketingP1Stabilization } from "@/lib/marketing/marketing-p1-stabilization-audit-policy";
import { auditMarketingP2Stabilization } from "@/lib/marketing/marketing-p2-stabilization-audit-policy";
import {
  MARKETING_FULL_STABILIZATION_PATTERNS_POLICY_ID,
  MARKETING_FULL_STABILIZATION_SUB_POLICIES,
} from "@/lib/marketing/marketing-full-stabilization-patterns";

/**
 * MKT-39 — capstone audit composing MKT-36, MKT-37, and MKT-38 marketing tier audits.
 */

export const MARKETING_FULL_STABILIZATION_AUDIT_POLICY_ID =
  MARKETING_FULL_STABILIZATION_PATTERNS_POLICY_ID;

export type MarketingFullStabilizationSubAuditResult = {
  taskId: string;
  policyId: string;
  tier: string;
  surface: string;
  subAuditCount: number;
  passed: boolean;
};

export type MarketingFullStabilizationAuditReport = {
  policyId: typeof MARKETING_FULL_STABILIZATION_AUDIT_POLICY_ID;
  subAudits: MarketingFullStabilizationSubAuditResult[];
  passed: boolean;
};

const SUB_AUDIT_RUNNERS: Record<
  string,
  (root?: string) => { policyId: string; subAuditCount: number; passed: boolean }
> = {
  "MKT-38": (root) => {
    const report = auditMarketingP0Stabilization(root);
    return {
      policyId: report.policyId,
      subAuditCount: report.subAudits.length,
      passed: report.passed,
    };
  },
  "MKT-37": (root) => {
    const report = auditMarketingP1Stabilization(root);
    return {
      policyId: report.policyId,
      subAuditCount: report.subAudits.length,
      passed: report.passed,
    };
  },
  "MKT-36": (root) => {
    const report = auditMarketingP2Stabilization(root);
    return {
      policyId: report.policyId,
      subAuditCount: report.subAudits.length,
      passed: report.passed,
    };
  },
};

export function auditMarketingFullStabilization(
  root?: string,
): MarketingFullStabilizationAuditReport {
  const subAudits = MARKETING_FULL_STABILIZATION_SUB_POLICIES.map((entry) => {
    const report = SUB_AUDIT_RUNNERS[entry.id]!(root);
    return {
      taskId: entry.id,
      policyId: report.policyId,
      tier: entry.tier,
      surface: entry.surface,
      subAuditCount: report.subAuditCount,
      passed: report.passed,
    };
  });

  return {
    policyId: MARKETING_FULL_STABILIZATION_AUDIT_POLICY_ID,
    subAudits,
    passed: subAudits.every((a) => a.passed),
  };
}
