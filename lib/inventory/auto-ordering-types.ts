import type { PurchasingUrgency } from "@/lib/ai/ai-purchasing-types";

export type AutoOrderingSignalType = "weather" | "holiday" | "trend";

export type AutoOrderingSignal = {
  type: AutoOrderingSignalType;
  label: string;
  multiplier: number;
};

export type AutoOrderingSettings = {
  enabled: boolean;
  useWeatherSignals: boolean;
  useHolidaySignals: boolean;
  useTrendSignals: boolean;
  minConfidence: number;
  lastRunAt: string | null;
};

export type AutoOrderingProposal = {
  ingredientId: string;
  ingredientName: string;
  unit: string;
  baseQuantity: number;
  adjustedQuantity: number;
  estimatedTotal: number;
  urgency: PurchasingUrgency;
  confidence: number;
  supplierName: string;
  supplierId: string;
  signals: AutoOrderingSignal[];
  combinedMultiplier: number;
  suggestedAction: string;
};

export type AutoOrderingRunResult = {
  workspaceId: string;
  ranAt: string;
  dryRun: boolean;
  proposalCount: number;
  ordersCreated: number;
  poIds: string[];
  errors: string[];
};

export type AutoOrderingDashboard = {
  workspaceId: string;
  analyzedAt: string;
  settings: AutoOrderingSettings;
  horizonDays: number;
  networkSignals: AutoOrderingSignal[];
  proposals: AutoOrderingProposal[];
  summary: {
    proposalCount: number;
    criticalCount: number;
    estimatedSpend: number;
    averageMultiplier: number;
  };
  aiAssisted: true;
};

export const DEFAULT_AUTO_ORDERING_SETTINGS: AutoOrderingSettings = {
  enabled: false,
  useWeatherSignals: true,
  useHolidaySignals: true,
  useTrendSignals: true,
  minConfidence: 0.75,
  lastRunAt: null,
};
