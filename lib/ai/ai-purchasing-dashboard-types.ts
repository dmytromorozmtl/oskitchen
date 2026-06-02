import type { AiPurchasingResult, PurchaseRecommendation } from "@/lib/ai/ai-purchasing-types";

export type AiPurchasingSkipEntry = {
  reason: string;
  skippedAt: string;
};

export type AiPurchasingUiState = {
  skipped: Record<string, AiPurchasingSkipEntry>;
  quantityOverrides: Record<string, number>;
};

export type PurchasingAiRow = PurchaseRecommendation & {
  orderQuantity: number;
  skipped: boolean;
  skipReason: string | null;
  daysTone: "red" | "amber" | "yellow" | "green";
};

export type PurchasingAiDashboardPayload = AiPurchasingResult & {
  rows: PurchasingAiRow[];
  activeRows: PurchasingAiRow[];
  skippedRows: PurchasingAiRow[];
};

export const EMPTY_AI_PURCHASING_UI_STATE: AiPurchasingUiState = {
  skipped: {},
  quantityOverrides: {},
};
