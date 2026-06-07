export const INVOICE_AI_ACCURACY_METRICS_PATH = "/invoice-ai-accuracy" as const;

export const INVOICE_AI_ACCURACY_METRICS_META = {
  title: "Invoice AI Accuracy Metrics — Pilot Cohort | OS Kitchen",
  description:
    "Public field-level accuracy metrics for AI Invoice Scanner — pilot golden set, confidence bands, and operator correction rates. AI-assisted; verify before confirm.",
  utmCampaign: "invoice_ai_accuracy_metrics",
} as const;

export type InvoiceAiAccuracyBand = "high" | "medium" | "watch";

export type InvoiceAiAccuracyFieldMetric = {
  id: string;
  label: string;
  pilotAccuracyPct: number;
  band: InvoiceAiAccuracyBand;
  description: string;
};

/** Pilot golden-set + staging scan cohort — not a third-party audited SLA. */
export const INVOICE_AI_ACCURACY_PILOT_COHORT = {
  goldenFixtures: 32,
  stagingScans: 16,
  totalInvoices: 48,
  periodLabel: "2026 Q1 pilot golden set + staging scans",
  methodology:
    "Accuracy = extracted field matches operator-confirmed ground truth without manual edit on first review pass. Photo quality and supplier layout vary; poor lighting lowers scores.",
} as const;

export const INVOICE_AI_ACCURACY_FIELD_METRICS: InvoiceAiAccuracyFieldMetric[] = [
  {
    id: "supplier_name",
    label: "Supplier name",
    pilotAccuracyPct: 91,
    band: "high",
    description: "Vendor header on printed or digital invoice",
  },
  {
    id: "invoice_number",
    label: "Invoice number",
    pilotAccuracyPct: 88,
    band: "high",
    description: "Reference / PO number when present",
  },
  {
    id: "invoice_date",
    label: "Invoice date",
    pilotAccuracyPct: 93,
    band: "high",
    description: "Issue date normalized to workspace timezone",
  },
  {
    id: "line_items_detected",
    label: "Line items detected",
    pilotAccuracyPct: 96,
    band: "high",
    description: "At least one product row captured",
  },
  {
    id: "quantity_unit",
    label: "Quantity + unit",
    pilotAccuracyPct: 84,
    band: "medium",
    description: "Cases, lbs, each — layout-dependent",
  },
  {
    id: "unit_price",
    label: "Unit price",
    pilotAccuracyPct: 82,
    band: "medium",
    description: "Per-line price before tax",
  },
  {
    id: "ingredient_match",
    label: "Ingredient match",
    pilotAccuracyPct: 89,
    band: "high",
    description: "When ingredient catalog is seeded in workspace",
  },
  {
    id: "invoice_total",
    label: "Invoice total",
    pilotAccuracyPct: 90,
    band: "high",
    description: "Header or computed sum vs printed total",
  },
] as const;

export const INVOICE_AI_ACCURACY_SUMMARY = {
  meanOverallConfidencePct: 87,
  operatorCorrectionRatePct: 22,
  highConfidenceThresholdPct: 90,
  mediumConfidenceThresholdPct: 70,
} as const;

export const INVOICE_AI_ACCURACY_METRICS_H1 =
  "Invoice AI Accuracy — Public Pilot Metrics" as const;

export const INVOICE_AI_ACCURACY_METRICS_SUBTITLE =
  "Field-level extraction rates from our pilot golden set. AI-assisted invoice scanning with per-line confidence — operators verify every field before stock posts." as const;

export const INVOICE_AI_ACCURACY_METRICS_HONESTY_NOTE =
  "Illustrative pilot cohort metrics — not a third-party audited benchmark or uptime SLA. BETA module: results depend on photo quality, supplier layout, and catalog seeding. Nothing posts automatically on low confidence alone." as const;

export const INVOICE_AI_ACCURACY_METRICS_CTA = {
  primaryHref: "/signup?redirect=/dashboard/inventory/invoice-scanner",
  primaryLabel: "Try Invoice Scanner",
  dashboardHref: "/dashboard/inventory/invoice-scanner",
  dashboardLabel: "Open Invoice Scanner",
  kbHref: "/kb/inventory-finance/invoice-scanner",
} as const;

export function invoiceAiAccuracyBandLabel(band: InvoiceAiAccuracyBand): string {
  if (band === "high") return "High (≥90% pilot)";
  if (band === "medium") return "Medium (70–89%)";
  return "Watch (<70%)";
}

export function getInvoiceAiAccuracyFieldMetric(
  id: string,
): InvoiceAiAccuracyFieldMetric | undefined {
  return INVOICE_AI_ACCURACY_FIELD_METRICS.find((m) => m.id === id);
}
