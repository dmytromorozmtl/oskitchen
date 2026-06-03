export type DynamicPricingWeather = "clear" | "rain" | "heat" | "cold";

export type DynamicPricingSignalKind = "time_of_day" | "weather" | "local_event" | "demand";

export type DynamicPricingSignal = {
  kind: DynamicPricingSignalKind;
  label: string;
  multiplier: number;
  detail: string;
};

export type DynamicPricingSuggestion = {
  productId: string;
  title: string;
  category: string;
  currentPrice: number;
  suggestedPrice: number;
  changePercent: number;
  confidence: "low" | "medium" | "high";
  signals: DynamicPricingSignal[];
  rationale: string;
};

export type DynamicPricingAbTest = {
  id: string;
  productId: string;
  productTitle: string;
  controlPrice: number;
  variantPrice: number;
  variantLabel: "A" | "B";
  status: "running" | "completed";
  startedAtIso: string;
  ordersControl: number;
  ordersVariant: number;
  revenueControl: number;
  revenueVariant: number;
};

export type DynamicPricingDashboard = {
  enabled: boolean;
  currency: string;
  timezone: string;
  weather: DynamicPricingWeather;
  activeSignals: DynamicPricingSignal[];
  suggestions: DynamicPricingSuggestion[];
  abTests: DynamicPricingAbTest[];
  summary: {
    itemsScanned: number;
    suggestionsCount: number;
    avgLiftPercent: number;
    runningExperiments: number;
  };
  scannedAt: string;
  honestyNote: string;
};

export type DynamicPricingStorage = {
  enabled: boolean;
  weatherOverride: DynamicPricingWeather | null;
  abTests: DynamicPricingAbTest[];
};
