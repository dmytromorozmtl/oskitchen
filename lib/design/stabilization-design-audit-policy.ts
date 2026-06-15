import { auditEmptyState } from "@/lib/design/empty-state-audit-policy";
import { auditErrorState } from "@/lib/design/error-state-audit-policy";
import { auditFilterSearch } from "@/lib/design/filter-search-audit-policy";
import { auditFormFeedback } from "@/lib/design/form-feedback-audit-policy";
import { auditLoadingSkeleton } from "@/lib/design/loading-skeleton-audit-policy";
import { auditMetricCard } from "@/lib/design/metric-card-audit-policy";
import { auditPageLayout } from "@/lib/design/page-layout-audit-policy";
import { auditPageSection } from "@/lib/design/page-section-audit-policy";
import { auditPermissionDenied } from "@/lib/design/permission-denied-audit-policy";
import { auditRouteLoading } from "@/lib/design/route-loading-audit-policy";
import {
  STABILIZATION_DESIGN_PATTERNS_POLICY_ID,
  STABILIZATION_DESIGN_SUB_POLICIES,
} from "@/lib/design/stabilization-design-patterns";
import { auditTableCard } from "@/lib/design/table-card-audit-policy";

/**
 * DES-38 — capstone audit composing DES-27 through DES-37 stabilization policies.
 */

export const STABILIZATION_DESIGN_AUDIT_POLICY_ID = STABILIZATION_DESIGN_PATTERNS_POLICY_ID;

export type StabilizationDesignSubAuditResult = {
  taskId: string;
  policyId: string;
  passed: boolean;
  moduleCount: number;
};

export type StabilizationDesignAuditReport = {
  policyId: typeof STABILIZATION_DESIGN_AUDIT_POLICY_ID;
  subAudits: StabilizationDesignSubAuditResult[];
  passed: boolean;
};

const SUB_AUDIT_RUNNERS: Record<string, () => { policyId: string; passed: boolean; modules: unknown[] }> = {
  "DES-27": auditPageLayout,
  "DES-28": auditLoadingSkeleton,
  "DES-29": auditPageSection,
  "DES-30": auditFilterSearch,
  "DES-31": auditTableCard,
  "DES-32": auditFormFeedback,
  "DES-33": auditErrorState,
  "DES-34": auditEmptyState,
  "DES-35": auditMetricCard,
  "DES-36": auditRouteLoading,
  "DES-37": auditPermissionDenied,
};

export function auditStabilizationDesign(): StabilizationDesignAuditReport {
  const subAudits = STABILIZATION_DESIGN_SUB_POLICIES.map((entry) => {
    const run = SUB_AUDIT_RUNNERS[entry.id];
    const report = run!();
    return {
      taskId: entry.id,
      policyId: report.policyId,
      passed: report.passed,
      moduleCount: report.modules.length,
    };
  });

  return {
    policyId: STABILIZATION_DESIGN_AUDIT_POLICY_ID,
    subAudits,
    passed: subAudits.every((a) => a.passed),
  };
}
