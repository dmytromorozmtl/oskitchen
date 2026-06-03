import type { calculateRoyalties } from "@/services/franchise/franchise-service";

export type FranchiseRoyaltyPeriod = "month" | "quarter";

export type MenuEnforcementMode = "strict" | "guided";

export type FranchiseBrandStatus = "compliant" | "review" | "non_compliant";

export type FranchiseBrandControl = {
  brandName: string | null;
  logoUrl: string | null;
  brandColor: string | null;
  tagline: string | null;
  enforcementMode: MenuEnforcementMode;
};

export type FranchiseMenuEnforcement = {
  mode: MenuEnforcementMode;
  lockedMenuItems: string[];
  requiredItemCount: number;
};

export type FranchiseSuiteSettings = {
  brandControl: FranchiseBrandControl;
  menuEnforcement: FranchiseMenuEnforcement;
  updatedAt?: string;
};

export type FranchiseUnitRow = {
  franchiseId: string;
  franchiseName: string;
  franchiseeId: string;
  status: string;
  royaltyRate: number;
  totalRevenue: number;
  royaltyAmount: number;
  menuCompliancePercent: number;
  missingMenuItems: string[];
  brandStatus: FranchiseBrandStatus;
};

export type FranchiseSuiteDashboard = {
  workspaceId: string;
  analyzedAt: string;
  period: FranchiseRoyaltyPeriod;
  since: string;
  royalties: Awaited<ReturnType<typeof calculateRoyalties>>;
  brandControl: FranchiseBrandControl;
  menuEnforcement: FranchiseMenuEnforcement;
  units: FranchiseUnitRow[];
  summary: {
    franchiseCount: number;
    totalRoyalties: number;
    averageMenuCompliance: number;
    unitsNeedingReview: number;
  };
};

export const DEFAULT_FRANCHISE_SUITE_SETTINGS: FranchiseSuiteSettings = {
  brandControl: {
    brandName: null,
    logoUrl: null,
    brandColor: null,
    tagline: null,
    enforcementMode: "guided",
  },
  menuEnforcement: {
    mode: "guided",
    lockedMenuItems: [],
    requiredItemCount: 0,
  },
};
