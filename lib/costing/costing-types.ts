import type {
  BusinessType,
  ChannelFeeType,
  CostComponentType,
  CostingRunStatus,
  CostingRunType,
  ProductCategory,
  ProfitabilityWarningLevel,
} from "@prisma/client";

export type {
  BusinessType,
  ChannelFeeType,
  CostComponentType,
  CostingRunStatus,
  CostingRunType,
  ProductCategory,
  ProfitabilityWarningLevel,
};

/** JSON stored on {@link KitchenSettings.costingSettingsJson}. */
export type CostingSettingsJson = {
  defaultLaborRatePerMinute?: number;
  defaultPaymentProcessingPercent?: number;
  overheadPercentOfPrimeCost?: number;
  targetMarginPercent?: number;
  warningMarginPercent?: number;
  foodCostTargetPercent?: number | null;
  defaultChannelProvider?: string;
  enableOverheadInTotalCost?: boolean;
  roundingStyle?: "NONE" | "NEAREST_NICKEL" | "PSYCHOLOGICAL_99";
  minimumSuggestedPrice?: number;
};

export type CostingWarningReason = {
  code: string;
  message: string;
  severity?: "info" | "warn" | "risk";
};

export type CostingSourceSummary = {
  ingredientCostSource: "supplier_price_history" | "ingredient_card" | "mixed" | "unknown";
  laborSource: "labor_rate_table" | "settings_default" | "missing";
  packagingSource: "recipe_field" | "packaging_rules" | "mixed";
  channelFeeSource: "channel_fee_rule" | "none_configured";
  notes?: string[];
};

export type ScenarioInputJson = {
  salePrice?: number;
  ingredientCostDeltaPercent?: number;
  laborCostDeltaPercent?: number;
  packagingCostDeltaPercent?: number;
  platformFeePercent?: number | null;
  platformFixedFee?: number | null;
  discountPercent?: number;
  targetMarginPercent?: number | null;
  channelProvider?: string | null;
};

export type ScenarioResultJson = {
  salePrice: number;
  totalCost: number;
  grossMarginPercent: number;
  foodCostPercent: number;
  suggestedPrice: number | null;
  profitDeltaVsCurrent: number | null;
  warnings: CostingWarningReason[];
  comparedToRunId?: string | null;
};

export type CostComponentDraft = {
  type: CostComponentType;
  name: string;
  amount?: number | null;
  unit?: string | null;
  cost: number;
  source?: string | null;
};
