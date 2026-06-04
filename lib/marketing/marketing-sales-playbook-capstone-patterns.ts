/**
 * MKT-41 — marketing sales playbook capstone registry.
 *
 * @see lib/marketing/marketing-sales-playbook-capstone-audit-policy.ts
 */

export const MARKETING_SALES_PLAYBOOK_CAPSTONE_POLICY_ID =
  "marketing-sales-playbook-capstone-mkt41-v1" as const;

/** Sales motion hub + closing toolkit composed by MKT-41 capstone. */
export const MARKETING_SALES_PLAYBOOK_CAPSTONE_SUB_POLICIES = [
  {
    id: "sales-playbook-hub",
    policyId: "sales-playbook-hub-mkt41-v1",
    surface: "docs/SALES_PLAYBOOK.md",
  },
  {
    id: "gtm-sales-playbook",
    policyId: "gtm-sales-playbook-mkt41-v1",
    surface: "docs/GTM_SALES_PLAYBOOK.md",
  },
  {
    id: "MKT-21",
    policyId: "discovery-call-script-mkt21-v1",
    surface: "docs/discovery-call-script.md",
  },
  {
    id: "MKT-22",
    policyId: "demo-script-15min-mkt22-v1",
    surface: "docs/demo-script-15min.md",
  },
  {
    id: "MKT-23",
    policyId: "objection-handling-mkt23-v1",
    surface: "docs/objection-handling.md",
  },
  {
    id: "MKT-40",
    policyId: "marketing-claims-governance-capstone-mkt40-v1",
    surface: "claims governance + MKT-39 stabilization",
  },
] as const;
