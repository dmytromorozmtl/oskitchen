/**
 * PM-04 — customer success + GTM intelligence capstone registry.
 *
 * @see lib/pm/pm-customer-gtm-capstone-audit-policy.ts
 */

export const PM_CUSTOMER_GTM_CAPSTONE_POLICY_ID = "pm-customer-gtm-capstone-pm04-v1" as const;

/** CS + competitive GTM surfaces composed by PM-04 capstone. */
export const PM_CUSTOMER_GTM_CAPSTONE_SUB_POLICIES = [
  {
    id: "customer-success-playbook",
    policyId: "customer-success-playbook-v1",
    surface: "docs/customer-success-playbook.md",
  },
  {
    id: "sales-demo-environment",
    policyId: "sales-demo-environment-v1",
    surface: "docs/sales-demo-environment.md",
  },
  {
    id: "competitor-comparison",
    policyId: "competitor-comparison-honest-v1",
    surface: "docs/competitor-comparison-honest.md",
  },
  {
    id: "competitor-tracker",
    policyId: "competitor-feature-tracker-v1",
    surface: "artifacts/competitor-feature-tracker.json",
  },
  {
    id: "PM-03",
    policyId: "pm-ops-governance-capstone-pm03-v1",
    surface: "ops governance + PM-02 GO/NO-GO chain",
  },
] as const;
