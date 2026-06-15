/**
 * COMP-02 — competitor leapfrog and gap-closure capstone registry.
 *
 * @see lib/competitor/competitor-leapfrog-gap-closure-audit-policy.ts
 */

export const COMPETITOR_LEAPFROG_GAP_CLOSURE_POLICY_ID =
  "competitor-leapfrog-gap-closure-comp02-v1" as const;

/** Leapfrog strategy + honest gap-closure program surfaces composed by COMP-02. */
export const COMPETITOR_LEAPFROG_GAP_CLOSURE_SUB_POLICIES = [
  {
    id: "COMP-01",
    policyId: "competitor-p0-intelligence-comp01-v1",
    surface: "P0 competitor intelligence capstone (COMP-01)",
  },
  {
    id: "COMP-02a",
    policyId: "competitor-leapfrog-roadmap-era17-v1",
    surface: "docs/competitor-leapfrog-roadmap-2026-05-28.md",
  },
  {
    id: "COMP-02b",
    policyId: "competitor-gap-closure-program-v12-v1",
    surface: "docs/competitor-gap-closure-v12.md",
  },
  {
    id: "COMP-02c",
    policyId: "competitor-forensic-audit-sales-safe-v1",
    surface: "artifacts/competitor-audit-report.md",
  },
  {
    id: "COMP-02d",
    policyId: "competitor-gap-audit-post-era19-v1",
    surface: "docs/competitor-gap-audit-post-era19-2026-05-28.md",
  },
  {
    id: "COMP-02e",
    policyId: "competitor-gap-roadmap-product-v1",
    surface: "docs/product/competitor-gap-roadmap.md",
  },
] as const;
