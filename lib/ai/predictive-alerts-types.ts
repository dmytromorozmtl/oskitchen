export type PredictiveAlertType =
  | "inventory_shortage"
  | "labor_gap"
  | "margin_decline"
  | "demand_surge";

export type PredictiveAlertSeverity = "critical" | "warning" | "info";

/** Proactive AI-assisted alert — deterministic prediction with explicit confidence. */
export type PredictiveAlert = {
  id: string;
  type: PredictiveAlertType;
  severity: PredictiveAlertSeverity;
  title: string;
  description: string;
  /** Estimated dollar impact if unaddressed. */
  impact: number;
  /** 0–1 confidence in the prediction. */
  confidence: number;
  suggestedAction: string;
  expiresAt: Date;
};
