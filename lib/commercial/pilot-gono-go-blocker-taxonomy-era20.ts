/**
 * Era 20 — GO/NO-GO blocker taxonomy for honest pilot execution tracking.
 */

import type { PilotGoNoGoEvidenceGate, PilotGoNoGoSummary } from "@/lib/commercial/pilot-gono-go-summary";

export const PILOT_GONOGO_BLOCKER_TAXONOMY_ERA20_POLICY_ID =
  "era20-pilot-gono-go-blocker-taxonomy-v1" as const;

export type PilotGoNoGoBlockerCategory =
  | "ops_credential"
  | "proof_artifact"
  | "engineering_tier"
  | "staging_tier"
  | "operator_tier"
  | "claims_enforcement"
  | "icp_qualification"
  | "customer_prospect"
  | "documentation"
  | "product"
  | "unknown";

export type PilotGoNoGoCategorizedBlocker = {
  blocker: string;
  category: PilotGoNoGoBlockerCategory;
  owner: "ops" | "engineering" | "gtm" | "legal" | "product";
  nextAction: string;
};

const BLOCKER_RULES: readonly {
  pattern: RegExp;
  category: PilotGoNoGoBlockerCategory;
  owner: PilotGoNoGoCategorizedBlocker["owner"];
  nextAction: string;
}[] = [
  {
    pattern: /P0 staging|SSO IdP|GitHub first-green|channel live smoke/i,
    category: "ops_credential",
    owner: "ops",
    nextAction: "Configure 11 P0 env vars — docs/era18-p0-staging-proof-ops-checklist.md",
  },
  {
    pattern: /Tier 0 engineering/i,
    category: "engineering_tier",
    owner: "engineering",
    nextAction: "npm run smoke:pilot-tier-preflight — fix tier0 FAILED steps",
  },
  {
    pattern: /Tier 1 staging/i,
    category: "staging_tier",
    owner: "ops",
    nextAction: "verify:staging-env or record SKIPPED WITH REASON in preflight artifact",
  },
  {
    pattern: /Tier 2 operator golden path/i,
    category: "operator_tier",
    owner: "ops",
    nextAction: "Execute 45–60 min staging checklist — smoke:pilot-operator-golden-path",
  },
  {
    pattern: /role checklists/i,
    category: "operator_tier",
    owner: "gtm",
    nextAction: "Complete role checklists; PILOT_GONOGO_ROLE_CHECKLISTS_COMPLETE=1",
  },
  {
    pattern: /forbidden-claims/i,
    category: "claims_enforcement",
    owner: "gtm",
    nextAction: "MARKETING_CLAIMS_STRICT=1 npm run smoke:pilot-forbidden-claims-enforcement",
  },
  {
    pattern: /ICP qualification/i,
    category: "icp_qualification",
    owner: "gtm",
    nextAction: "Set PILOT_GONOGO_ICP_INPUT_JSON from config/commercial/pilot-icp-qualified-example.template.json",
  },
  {
    pattern: /metrics baseline not captured/i,
    category: "documentation",
    owner: "gtm",
    nextAction: "npm run smoke:pilot-metrics-baseline after Week 1 kickoff",
  },
  {
    pattern: /rollback drill incomplete/i,
    category: "operator_tier",
    owner: "ops",
    nextAction: "npm run smoke:pilot-rollback-drill — tabletop before kickoff",
  },
  {
    pattern: /LOI|customer on record/i,
    category: "customer_prospect",
    owner: "legal",
    nextAction: "Sign LOI then set PILOT_GONOGO_CUSTOMER_NAME + PILOT_GONOGO_LOI_SIGNED_DATE",
  },
  {
    pattern: /Staging URL not recorded/i,
    category: "documentation",
    owner: "ops",
    nextAction: "Record staging URL in golden path sign-off template",
  },
  {
    pattern: /SSO pilot_ready gate/i,
    category: "proof_artifact",
    owner: "ops",
    nextAction: "smoke:enterprise-sso-idp-staging PASS or exclude SSO from contract",
  },
];

export function categorizePilotGoNoGoBlocker(blocker: string): PilotGoNoGoCategorizedBlocker {
  for (const rule of BLOCKER_RULES) {
    if (rule.pattern.test(blocker)) {
      return {
        blocker,
        category: rule.category,
        owner: rule.owner,
        nextAction: rule.nextAction,
      };
    }
  }
  return {
    blocker,
    category: "unknown",
    owner: "product",
    nextAction: "Triage in docs/era20-pilot-gono-go-blocker-playbook-2026-05-28.md",
  };
}

export function buildPilotGoNoGoBlockerTaxonomy(
  summary: Pick<PilotGoNoGoSummary, "blockers" | "warnings" | "evidenceGates">,
): {
  policyId: typeof PILOT_GONOGO_BLOCKER_TAXONOMY_ERA20_POLICY_ID;
  categorizedBlockers: PilotGoNoGoCategorizedBlocker[];
  categorizedWarnings: PilotGoNoGoCategorizedBlocker[];
  failedGates: PilotGoNoGoEvidenceGate[];
} {
  return {
    policyId: PILOT_GONOGO_BLOCKER_TAXONOMY_ERA20_POLICY_ID,
    categorizedBlockers: summary.blockers.map(categorizePilotGoNoGoBlocker),
    categorizedWarnings: summary.warnings.map(categorizePilotGoNoGoBlocker),
    failedGates: summary.evidenceGates.filter((gate) => !gate.pass),
  };
}

export function formatPilotGoNoGoBlockerTaxonomyLines(
  taxonomy: ReturnType<typeof buildPilotGoNoGoBlockerTaxonomy>,
): string[] {
  const lines = [`Blocker taxonomy (${taxonomy.policyId}):`];
  for (const item of taxonomy.categorizedBlockers) {
    lines.push(`  [${item.category}] (${item.owner}) ${item.blocker}`);
    lines.push(`    → ${item.nextAction}`);
  }
  if (taxonomy.failedGates.length > 0) {
    lines.push("", "Failed evidence gates:");
    for (const gate of taxonomy.failedGates) {
      lines.push(`  - ${gate.label}: ${gate.reason}`);
    }
  }
  return lines;
}
