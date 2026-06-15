import type {
  FRANCHISE_COMPLIANCE_CHECK_IDS,
  FRANCHISE_ROLLOUT_PHASES,
  FRANCHISE_SUITE_2_POLICY_ID,
} from "@/lib/enterprise/franchise-suite-2-policy";
import type { FranchiseUnitRow } from "@/lib/enterprise/franchise-types";

export type FranchiseRolloutPhase = (typeof FRANCHISE_ROLLOUT_PHASES)[number];

export type FranchiseComplianceCheckId = (typeof FRANCHISE_COMPLIANCE_CHECK_IDS)[number];

export type FranchiseComplianceCheck = {
  id: FranchiseComplianceCheckId;
  label: string;
  passed: boolean;
  detail: string;
};

export type FranchiseUnitRollout = {
  franchiseId: string;
  franchiseName: string;
  phase: FranchiseRolloutPhase;
  phaseLabel: string;
  progressPercent: number;
  nextStep: string;
  complianceChecks: FranchiseComplianceCheck[];
  passedCheckCount: number;
  totalCheckCount: number;
};

export type FranchiseRoyaltyInsights = {
  totalRevenue: number;
  totalRoyalties: number;
  effectiveRoyaltyRatePct: number | null;
  averageRoyaltyPerUnit: number;
  unitsWithRevenue: number;
  topRoyaltyUnitId: string | null;
  topRoyaltyUnitName: string | null;
  topRoyaltyAmount: number;
};

export type FranchiseSuiteDashboardV2 = {
  policyId: typeof FRANCHISE_SUITE_2_POLICY_ID;
  royaltyInsights: FranchiseRoyaltyInsights;
  rolloutByPhase: Record<FranchiseRolloutPhase, number>;
  unitRollouts: FranchiseUnitRollout[];
  compliancePassRate: number;
  certifiedUnitCount: number;
};

export type FranchiseSuiteV2Input = {
  units: FranchiseUnitRow[];
  totalRoyalties: number;
  hasBrandKit: boolean;
};
