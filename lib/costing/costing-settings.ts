import type { CostingSettingsJson } from "./costing-types";

export const DEFAULT_CHANNEL_PROVIDER = "STOREFRONT";

export type MergedCostingSettings = {
  defaultLaborRatePerMinute: number;
  defaultPaymentProcessingPercent: number;
  overheadPercentOfPrimeCost: number;
  targetMarginPercent: number;
  warningMarginPercent: number;
  foodCostTargetPercent: number | null;
  defaultChannelProvider: string;
  enableOverheadInTotalCost: boolean;
  roundingStyle: "NONE" | "NEAREST_NICKEL" | "PSYCHOLOGICAL_99";
  minimumSuggestedPrice: number;
};

/** Legacy app default was ~$21/hr → $0.35/min when no table exists. */
export const DEFAULT_LABOR_RATE_PER_MINUTE = 0.35;

/** Percent fields are 0–100 (e.g. 65 = 65% target gross margin). Payment processing is a 0–1 fraction (e.g. 0.029 = 2.9%). */
export const DEFAULT_MERGED_COSTING_SETTINGS: MergedCostingSettings = {
  defaultLaborRatePerMinute: DEFAULT_LABOR_RATE_PER_MINUTE,
  defaultPaymentProcessingPercent: 0.029,
  overheadPercentOfPrimeCost: 0,
  targetMarginPercent: 65,
  warningMarginPercent: 55,
  foodCostTargetPercent: 32,
  defaultChannelProvider: DEFAULT_CHANNEL_PROVIDER,
  enableOverheadInTotalCost: false,
  roundingStyle: "PSYCHOLOGICAL_99",
  minimumSuggestedPrice: 0,
};

function num(v: unknown, fallback: number): number {
  return typeof v === "number" && Number.isFinite(v) ? v : fallback;
}

function str(v: unknown, fallback: string): string {
  return typeof v === "string" && v.trim().length > 0 ? v.trim() : fallback;
}

export function parseCostingSettingsJson(raw: unknown): CostingSettingsJson {
  if (!raw || typeof raw !== "object") return {};
  const o = raw as Record<string, unknown>;
  return {
    defaultLaborRatePerMinute: typeof o.defaultLaborRatePerMinute === "number" ? o.defaultLaborRatePerMinute : undefined,
    defaultPaymentProcessingPercent:
      typeof o.defaultPaymentProcessingPercent === "number" ? o.defaultPaymentProcessingPercent : undefined,
    overheadPercentOfPrimeCost: typeof o.overheadPercentOfPrimeCost === "number" ? o.overheadPercentOfPrimeCost : undefined,
    targetMarginPercent: typeof o.targetMarginPercent === "number" ? o.targetMarginPercent : undefined,
    warningMarginPercent: typeof o.warningMarginPercent === "number" ? o.warningMarginPercent : undefined,
    foodCostTargetPercent:
      o.foodCostTargetPercent === null
        ? null
        : typeof o.foodCostTargetPercent === "number"
          ? o.foodCostTargetPercent
          : undefined,
    defaultChannelProvider: typeof o.defaultChannelProvider === "string" ? o.defaultChannelProvider : undefined,
    enableOverheadInTotalCost: typeof o.enableOverheadInTotalCost === "boolean" ? o.enableOverheadInTotalCost : undefined,
    roundingStyle:
      o.roundingStyle === "NONE" || o.roundingStyle === "NEAREST_NICKEL" || o.roundingStyle === "PSYCHOLOGICAL_99"
        ? o.roundingStyle
        : undefined,
    minimumSuggestedPrice: typeof o.minimumSuggestedPrice === "number" ? o.minimumSuggestedPrice : undefined,
  };
}

export function mergeCostingSettings(
  json: unknown | null | undefined,
  overrides?: Partial<MergedCostingSettings>,
): MergedCostingSettings {
  const parsed = parseCostingSettingsJson(json);
  const base = DEFAULT_MERGED_COSTING_SETTINGS;
  return {
    defaultLaborRatePerMinute: num(parsed.defaultLaborRatePerMinute, base.defaultLaborRatePerMinute),
    defaultPaymentProcessingPercent: num(
      parsed.defaultPaymentProcessingPercent,
      base.defaultPaymentProcessingPercent,
    ),
    overheadPercentOfPrimeCost: num(parsed.overheadPercentOfPrimeCost, base.overheadPercentOfPrimeCost),
    targetMarginPercent: num(parsed.targetMarginPercent, base.targetMarginPercent),
    warningMarginPercent: num(parsed.warningMarginPercent, base.warningMarginPercent),
    foodCostTargetPercent:
      parsed.foodCostTargetPercent === undefined
        ? base.foodCostTargetPercent
        : parsed.foodCostTargetPercent === null
          ? null
          : num(parsed.foodCostTargetPercent, base.foodCostTargetPercent ?? 0.32),
    defaultChannelProvider: str(parsed.defaultChannelProvider, base.defaultChannelProvider),
    enableOverheadInTotalCost:
      typeof parsed.enableOverheadInTotalCost === "boolean" ? parsed.enableOverheadInTotalCost : base.enableOverheadInTotalCost,
    roundingStyle: parsed.roundingStyle ?? base.roundingStyle,
    minimumSuggestedPrice: num(parsed.minimumSuggestedPrice, base.minimumSuggestedPrice),
    ...overrides,
  };
}
