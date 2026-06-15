/**
 * Commercial pilot path step catalog — cycle-free export for linear guard + master path.
 * Steps 11–16 use inline doc paths to avoid era23/era24 UI import cycles.
 */
import { COMMERCIAL_GO_CLOSURE_STEP3_DOC } from "@/lib/commercial/commercial-go-closure-phases-era21";
import { CONTINUOUS_IMPROVEMENT_LOOP_STEP10_DOC } from "@/lib/commercial/continuous-improvement-loop-phases-era22";
import { MARKET_LEADER_POSITIONING_STEP8_DOC } from "@/lib/commercial/market-leader-positioning-phases-era21";
import { MONTH2_MARKET_READINESS_STEP5_DOC } from "@/lib/commercial/month2-market-readiness-phases-era21";
import { P0_OPS_VAULT_ERA21_DAY0_DOC } from "@/lib/commercial/p0-ops-vault-era21-policy";
import { PILOT_WEEK1_EXECUTION_STEP4_DOC } from "@/lib/commercial/pilot-week1-execution-phases-era21";
import { SCALE_READINESS_STEP6_DOC } from "@/lib/commercial/scale-readiness-phases-era21";
import { SERIES_A_PARTNER_EXPANSION_STEP7_DOC } from "@/lib/commercial/series-a-partner-expansion-phases-era21";
import { SUSTAINED_OPERATIONAL_EXCELLENCE_STEP9_DOC } from "@/lib/commercial/sustained-operational-excellence-phases-era21";
import { LINEAR_PATH_PERMANENTLY_CLOSED_STEP16_DOC } from "@/lib/commercial/linear-path-permanently-closed-phases-era24";
import { TIER2_STAGING_GOLDEN_PATH_ERA21_STEP2_DOC } from "@/lib/commercial/tier2-staging-golden-path-era21-policy";

export const COMMERCIAL_PILOT_PATH_STEP_CATALOG_ERA24_POLICY_ID =
  "era24-commercial-pilot-path-step-catalog-v1" as const;

export type CommercialPilotPathStepKind = "gate" | "informational";

export type CommercialPilotPathStepDef = {
  step: number;
  id: string;
  label: string;
  policyId: string;
  docPath: string;
  kind: CommercialPilotPathStepKind;
  validateCommand: string;
  platformAnchor?: string;
};

export const COMMERCIAL_PILOT_PATH_STEP_CATALOG: readonly CommercialPilotPathStepDef[] = [
  {
    step: 1,
    id: "p0_ops_vault",
    label: "P0 ops vault — Day 0 credentials",
    policyId: "era21-p0-ops-vault-v1",
    docPath: P0_OPS_VAULT_ERA21_DAY0_DOC,
    kind: "gate",
    validateCommand: "npm run ops:validate-p0-vault-env",
  },
  {
    step: 2,
    id: "tier2_golden_path",
    label: "Tier 2 staging golden path",
    policyId: "era21-tier2-staging-golden-path-v1",
    docPath: TIER2_STAGING_GOLDEN_PATH_ERA21_STEP2_DOC,
    kind: "gate",
    validateCommand: "npm run ops:validate-tier2-golden-path-env",
  },
  {
    step: 3,
    id: "commercial_go_closure",
    label: "Commercial GO closure",
    policyId: "era21-commercial-go-closure-v1",
    docPath: COMMERCIAL_GO_CLOSURE_STEP3_DOC,
    kind: "gate",
    validateCommand: "npm run ops:validate-commercial-go-closure-env",
  },
  {
    step: 4,
    id: "pilot_week1_execution",
    label: "Pilot Week 1 execution",
    policyId: "era21-pilot-week1-execution-v1",
    docPath: PILOT_WEEK1_EXECUTION_STEP4_DOC,
    kind: "gate",
    validateCommand: "npm run ops:validate-pilot-week1-env",
  },
  {
    step: 5,
    id: "month2_market_readiness",
    label: "Month 2 market readiness",
    policyId: "era21-month2-market-readiness-v1",
    docPath: MONTH2_MARKET_READINESS_STEP5_DOC,
    kind: "gate",
    validateCommand: "npm run ops:validate-month2-market-readiness-env",
  },
  {
    step: 6,
    id: "scale_readiness",
    label: "Scale readiness",
    policyId: "era21-scale-readiness-v1",
    docPath: SCALE_READINESS_STEP6_DOC,
    kind: "gate",
    validateCommand: "npm run ops:validate-scale-readiness-env",
  },
  {
    step: 7,
    id: "series_a_partner_expansion",
    label: "Series A partner expansion",
    policyId: "era21-series-a-partner-expansion-v1",
    docPath: SERIES_A_PARTNER_EXPANSION_STEP7_DOC,
    kind: "gate",
    validateCommand: "npm run ops:validate-series-a-partner-expansion-env",
  },
  {
    step: 8,
    id: "market_leader_positioning",
    label: "Market leader positioning",
    policyId: "era21-market-leader-positioning-v1",
    docPath: MARKET_LEADER_POSITIONING_STEP8_DOC,
    kind: "gate",
    validateCommand: "npm run ops:validate-market-leader-positioning-env",
  },
  {
    step: 9,
    id: "sustained_operational_excellence",
    label: "Sustained operational excellence",
    policyId: "era21-sustained-operational-excellence-v1",
    docPath: SUSTAINED_OPERATIONAL_EXCELLENCE_STEP9_DOC,
    kind: "gate",
    validateCommand: "npm run ops:validate-sustained-operational-excellence-env",
  },
  {
    step: 10,
    id: "continuous_improvement_loop",
    label: "Continuous improvement loop",
    policyId: "era22-continuous-improvement-loop-v1",
    docPath: CONTINUOUS_IMPROVEMENT_LOOP_STEP10_DOC,
    kind: "informational",
    validateCommand: "npm run ops:validate-continuous-improvement-loop",
    platformAnchor: "#continuous-improvement-loop",
  },
  {
    step: 11,
    id: "sustained_product_evolution",
    label: "Sustained product evolution",
    policyId: "era23-sustained-product-evolution-v1",
    docPath: "docs/next-step-11-sustained-product-evolution-2026-05-28.md",
    kind: "informational",
    validateCommand: "npm run ops:validate-sustained-product-evolution",
    platformAnchor: "#sustained-product-evolution",
  },
  {
    step: 12,
    id: "maintenance_mode",
    label: "Maintenance mode — path terminus UI",
    policyId: "era24-maintenance-mode-v1",
    docPath: "docs/next-step-12-commercial-pilot-path-complete-2026-05-28.md",
    kind: "informational",
    validateCommand: "npm run ops:validate-maintenance-mode",
    platformAnchor: "#maintenance-mode",
  },
  {
    step: 13,
    id: "engineering_path_terminus",
    label: "Engineering path terminus — master orchestration",
    policyId: "era24-engineering-path-terminus-v1",
    docPath: "docs/next-step-13-engineering-path-terminus-2026-05-28.md",
    kind: "informational",
    validateCommand: "npm run ops:validate-commercial-pilot-path",
    platformAnchor: "#engineering-path-terminus",
  },
  {
    step: 14,
    id: "post_terminus_steady_state",
    label: "Post-terminus steady state — repeat forever",
    policyId: "era24-post-terminus-steady-state-v1",
    docPath: "docs/next-step-14-post-terminus-era-charter-process-2026-05-28.md",
    kind: "informational",
    validateCommand: "npm run ops:validate-steady-state-operator-loop",
    platformAnchor: "#post-terminus-steady-state",
  },
  {
    step: 15,
    id: "commercial_pilot_path_absolute_end",
    label: "Commercial pilot path — absolute end",
    policyId: "era24-commercial-pilot-path-absolute-end-v1",
    docPath: "docs/next-step-15-commercial-pilot-path-absolute-end-2026-05-28.md",
    kind: "informational",
    validateCommand: "npm run ops:validate-commercial-pilot-path-absolute-end",
    platformAnchor: "#commercial-pilot-path-absolute-end",
  },
  {
    step: 16,
    id: "linear_path_permanently_closed",
    label: "Linear path permanently closed — doc chain terminus",
    policyId: "era24-linear-path-permanently-closed-v1",
    docPath: LINEAR_PATH_PERMANENTLY_CLOSED_STEP16_DOC,
    kind: "informational",
    validateCommand: "npm run ops:validate-linear-path-permanently-closed",
    platformAnchor: "#linear-path-permanently-closed",
  },
] as const;
