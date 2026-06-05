import type { AI_INVENTORY_MANAGER_POLICY_ID } from "@/lib/ai/inventory-manager-policy";

export type InventorySignalSeverity = "critical" | "high" | "normal" | "low";

export type WasteSignal = {
  reason: string;
  eventCount: number;
  totalCost: number;
  severity: InventorySignalSeverity;
  recommendation: string;
};

export type TheftSignal = {
  productId: string;
  productName: string;
  theftScore: number;
  variancePercent: number;
  estimatedExposure: number;
  period: string;
  severity: InventorySignalSeverity;
  recommendation: string;
};

export type ShrinkageSignal = {
  countId: string;
  countDateIso: string;
  shrinkCost: number;
  linesWithVariance: number;
  severity: InventorySignalSeverity;
  recommendation: string;
};

export type InventoryManagerDailyBrief = {
  generatedAtIso: string;
  headline: string;
  executiveSummary: string;
  bullets: string[];
  wasteCost30d: number;
  theftAlertCount: number;
  shrinkageCost30d: number;
};

export type InventoryManagerSnapshot = {
  policyId: typeof AI_INVENTORY_MANAGER_POLICY_ID;
  workspaceId: string;
  generatedAtIso: string;
  windowDays: number;
  wasteSignals: WasteSignal[];
  theftSignals: TheftSignal[];
  shrinkageSignals: ShrinkageSignal[];
  dailyBrief: InventoryManagerDailyBrief;
  summary: {
    totalWasteCost: number;
    totalTheftExposure: number;
    totalShrinkageCost: number;
    alertCount: number;
    confidence: number;
  };
  aiAssisted: true;
};
