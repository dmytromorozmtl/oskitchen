/**
 * DES-38 — stabilization design system capstone (DES-27 through DES-37 registry).
 *
 * @see lib/design/stabilization-design-audit-policy.ts
 * @see docs/STABILIZATION_AUDIT.md
 */

export const STABILIZATION_DESIGN_PATTERNS_POLICY_ID =
  "stabilization-design-patterns-des38-v1" as const;

/** P2 stabilization design audits composed by DES-38 capstone. */
export const STABILIZATION_DESIGN_SUB_POLICIES = [
  { id: "DES-27", policyId: "page-layout-patterns-des27-v1", module: "page-layout-audit-policy" },
  { id: "DES-28", policyId: "loading-skeleton-patterns-des28-v1", module: "loading-skeleton-audit-policy" },
  { id: "DES-29", policyId: "page-section-patterns-des29-v1", module: "page-section-audit-policy" },
  { id: "DES-30", policyId: "filter-search-patterns-des30-v1", module: "filter-search-audit-policy" },
  { id: "DES-31", policyId: "table-card-patterns-des31-v1", module: "table-card-audit-policy" },
  { id: "DES-32", policyId: "form-feedback-patterns-des32-v1", module: "form-feedback-audit-policy" },
  { id: "DES-33", policyId: "error-state-patterns-des33-v1", module: "error-state-audit-policy" },
  { id: "DES-34", policyId: "empty-state-patterns-des34-v1", module: "empty-state-audit-policy" },
  { id: "DES-35", policyId: "metric-card-patterns-des35-v1", module: "metric-card-audit-policy" },
  { id: "DES-36", policyId: "route-loading-patterns-des36-v1", module: "route-loading-audit-policy" },
  { id: "DES-37", policyId: "permission-denied-patterns-des37-v1", module: "permission-denied-audit-policy" },
] as const;

export type StabilizationDesignSubPolicy = (typeof STABILIZATION_DESIGN_SUB_POLICIES)[number];
