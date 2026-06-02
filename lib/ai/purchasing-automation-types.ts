import type { PurchaseRecommendation } from "@/lib/ai/ai-purchasing-types";

export const AUTO_PURCHASE_MIN_CONFIDENCE = 0.85;
export const AUTO_PURCHASE_MAX_DAYS_REMAINING = 3;
export const AUTO_PURCHASE_AUTO_APPROVE_MAX = 500;

export type PurchasingAutomationSettings = {
  enabled: boolean;
  minConfidence: number;
  maxDaysRemaining: number;
  autoApproveMaxAmount: number;
  lastRunAt: string | null;
};

export type AutoPurchaseOrderResult = {
  poId: string;
  orderNumber: string;
  supplierName: string;
  total: number;
  status: "APPROVED" | "READY_FOR_REVIEW";
  autoApproved: boolean;
  lineCount: number;
  ingredientIds: string[];
};

export type AutoPurchaseResult = {
  workspaceId: string;
  ranAt: string;
  enabled: boolean;
  eligibleCount: number;
  orderedLineCount: number;
  skippedIneligibleCount: number;
  orders: AutoPurchaseOrderResult[];
  errors: string[];
  autoApprovedTotal: number;
  pendingApprovalTotal: number;
  aiAssisted: true;
};

export const DEFAULT_PURCHASING_AUTOMATION_SETTINGS: PurchasingAutomationSettings = {
  enabled: false,
  minConfidence: AUTO_PURCHASE_MIN_CONFIDENCE,
  maxDaysRemaining: AUTO_PURCHASE_MAX_DAYS_REMAINING,
  autoApproveMaxAmount: AUTO_PURCHASE_AUTO_APPROVE_MAX,
  lastRunAt: null,
};

export type AutoPurchaseEligibility = {
  eligible: boolean;
  reasons: string[];
};
