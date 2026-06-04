import { auditAnalystBriefingDeckDoc } from "@/lib/marketing/analyst-briefing-deck-policy";
import {
  MARKETING_P2_STABILIZATION_PATTERNS_POLICY_ID,
  MARKETING_P2_STABILIZATION_SUB_POLICIES,
} from "@/lib/marketing/marketing-p2-stabilization-patterns";
import { auditPartnerProgramShopifyAgenciesDoc } from "@/lib/marketing/partner-program-shopify-agencies-policy";
import { auditPressReleaseFirstDesignPartnerDoc } from "@/lib/marketing/press-release-first-design-partner-policy";
import { auditProductHuntLaunchDeferDoc } from "@/lib/marketing/product-hunt-launch-defer-policy";
import { auditReferralProgramDoc } from "@/lib/marketing/referral-program-policy";
import { auditStateOfGhostKitchenOpsReportDoc } from "@/lib/marketing/state-of-ghost-kitchen-ops-report-policy";
import { auditToastGapPublicSummaryDoc } from "@/lib/marketing/toast-gap-analysis-public-summary-policy";

/**
 * MKT-36 — capstone audit composing MKT-29 through MKT-35 P2 marketing policies.
 */

export const MARKETING_P2_STABILIZATION_AUDIT_POLICY_ID =
  MARKETING_P2_STABILIZATION_PATTERNS_POLICY_ID;

export type MarketingP2StabilizationSubAuditResult = {
  taskId: string;
  policyId: string;
  passed: boolean;
};

export type MarketingP2StabilizationAuditReport = {
  policyId: typeof MARKETING_P2_STABILIZATION_AUDIT_POLICY_ID;
  subAudits: MarketingP2StabilizationSubAuditResult[];
  passed: boolean;
};

const SUB_AUDIT_RUNNERS: Record<
  string,
  () => { policyId: string; passed: boolean }
> = {
  "MKT-29": () => {
    const r = auditPressReleaseFirstDesignPartnerDoc();
    return { policyId: "press-release-first-design-partner-mkt29-v1", passed: r.passed };
  },
  "MKT-30": () => {
    const r = auditProductHuntLaunchDeferDoc();
    return { policyId: "product-hunt-launch-defer-mkt30-v1", passed: r.passed };
  },
  "MKT-31": () => {
    const r = auditPartnerProgramShopifyAgenciesDoc();
    return { policyId: "partner-program-shopify-agencies-mkt31-v1", passed: r.passed };
  },
  "MKT-32": () => {
    const r = auditReferralProgramDoc();
    return { policyId: "referral-program-mkt32-v1", passed: r.passed };
  },
  "MKT-33": () => {
    const r = auditStateOfGhostKitchenOpsReportDoc();
    return { policyId: "state-of-ghost-kitchen-ops-mkt33-v1", passed: r.passed };
  },
  "MKT-34": () => {
    const r = auditToastGapPublicSummaryDoc();
    return { policyId: "toast-gap-analysis-public-summary-mkt34-v1", passed: r.passed };
  },
  "MKT-35": () => {
    const r = auditAnalystBriefingDeckDoc();
    return { policyId: "analyst-briefing-deck-mkt35-v1", passed: r.passed };
  },
};

export function auditMarketingP2Stabilization(
  root?: string,
): MarketingP2StabilizationAuditReport {
  void root;
  const subAudits = MARKETING_P2_STABILIZATION_SUB_POLICIES.map((entry) => {
    const report = SUB_AUDIT_RUNNERS[entry.id]!();
    return {
      taskId: entry.id,
      policyId: report.policyId,
      passed: report.passed,
    };
  });

  return {
    policyId: MARKETING_P2_STABILIZATION_AUDIT_POLICY_ID,
    subAudits,
    passed: subAudits.every((a) => a.passed),
  };
}
