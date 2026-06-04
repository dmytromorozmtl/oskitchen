/**
 * COMP-03 — competitor intelligence completion capstone registry (COMP-01, COMP-02).
 *
 * @see lib/competitor/competitor-completion-capstone-audit-policy.ts
 */

export const COMPETITOR_COMPLETION_CAPSTONE_POLICY_ID =
  "competitor-completion-capstone-comp03-v1" as const;

/** Top-level competitor capstones composed by COMP-03 completion audit. */
export const COMPETITOR_COMPLETION_CAPSTONE_SUB_POLICIES = [
  {
    id: "COMP-01",
    policyId: "competitor-p0-intelligence-comp01-v1",
    surface: "P0 intelligence (comparison, tracker, battle cards, gap matrix, Toast wedge)",
  },
  {
    id: "COMP-02",
    policyId: "competitor-leapfrog-gap-closure-comp02-v1",
    surface: "Leapfrog roadmap + v12 gap-closure + forensic audit + Era 19 scorecard",
  },
] as const;
