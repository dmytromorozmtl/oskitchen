import type { ENTERPRISE_BRAND_LANES, ENTERPRISE_MULTI_BRAND_POLICY_ID } from "@/lib/enterprise/multi-brand-policy";

export type EnterpriseBrandLane = (typeof ENTERPRISE_BRAND_LANES)[number] | "E+";

export type EnterpriseBrandRank = {
  rank: number;
  lane: EnterpriseBrandLane;
  brandId: string;
  brandName: string;
  totalRevenue: number;
  thisMonthRevenue: number;
  thisMonthOrders: number;
  revenueShare: number;
  monthRevenueShare: number;
  totalOrders: number;
  avgOrderValue: number;
  activeProducts: number;
  status: "active" | "inactive";
};

export type EnterpriseBrandAlertSeverity = "warning" | "info";

export type EnterpriseBrandAlert = {
  id: string;
  brandId: string;
  brandName: string;
  severity: EnterpriseBrandAlertSeverity;
  message: string;
};

export type EnterpriseMultiBrandDashboard = {
  policyId: typeof ENTERPRISE_MULTI_BRAND_POLICY_ID;
  workspaceId: string;
  generatedAtIso: string;
  brands: EnterpriseBrandRank[];
  summary: {
    totalRevenue: number;
    totalOrders: number;
    monthRevenue: number;
    monthOrders: number;
    activeBrandCount: number;
    topBrandName: string | null;
    topBrandShare: number;
    avgOrderValue: number;
  };
  alerts: EnterpriseBrandAlert[];
  basePath: string;
};
