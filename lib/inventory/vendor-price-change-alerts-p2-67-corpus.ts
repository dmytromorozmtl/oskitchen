import type { VendorPriceAlertCapability } from "@/lib/inventory/vendor-price-change-alerts-p2-67-policy";

export type VendorPriceChangeAlertScenarioP267 = {
  id: string;
  label: string;
  capabilities: VendorPriceAlertCapability[];
  thresholdPct: number;
  oldPrice: number;
  newPrice: number;
  supplierName: string;
  expectsAlert: boolean;
};

export function buildVendorPriceChangeAlertsCorpusP267(): VendorPriceChangeAlertScenarioP267[] {
  return [
    {
      id: "vpa-01-increase-sysco",
      label: "Sysco chicken breast +15% increase",
      capabilities: ["detect_price_increase", "supplier_scoped_alert"],
      thresholdPct: 5,
      oldPrice: 4.2,
      newPrice: 4.83,
      supplierName: "Sysco",
      expectsAlert: true,
    },
    {
      id: "vpa-02-decrease-usfoods",
      label: "US Foods olive oil -7% decrease",
      capabilities: ["detect_price_decrease", "supplier_scoped_alert"],
      thresholdPct: 5,
      oldPrice: 18.5,
      newPrice: 17.2,
      supplierName: "US Foods",
      expectsAlert: true,
    },
    {
      id: "vpa-03-threshold-boundary",
      label: "Exactly 5% change triggers alert",
      capabilities: ["threshold_pct_alert"],
      thresholdPct: 5,
      oldPrice: 10,
      newPrice: 10.5,
      supplierName: "Local Produce Co",
      expectsAlert: true,
    },
    {
      id: "vpa-04-below-threshold",
      label: "3% change below 5% threshold — no alert",
      capabilities: ["threshold_pct_alert"],
      thresholdPct: 5,
      oldPrice: 10,
      newPrice: 10.3,
      supplierName: "Sysco",
      expectsAlert: false,
    },
    {
      id: "vpa-05-high-severity",
      label: "25% spike — high severity classification",
      capabilities: ["severity_classification", "detect_price_increase"],
      thresholdPct: 5,
      oldPrice: 4,
      newPrice: 5,
      supplierName: "Restaurant Depot",
      expectsAlert: true,
    },
    {
      id: "vpa-06-ingredient-scoped",
      label: "Filter alerts by ingredient ID",
      capabilities: ["ingredient_scoped_alert"],
      thresholdPct: 5,
      oldPrice: 2.1,
      newPrice: 2.73,
      supplierName: "Local Produce Co",
      expectsAlert: true,
    },
    {
      id: "vpa-07-effective-date",
      label: "Track effective date on price change",
      capabilities: ["effective_date_tracking"],
      thresholdPct: 5,
      oldPrice: 5.6,
      newPrice: 7.0,
      supplierName: "Restaurant Depot",
      expectsAlert: true,
    },
    {
      id: "vpa-08-invoice-ocr-source",
      label: "Invoice OCR ingested price change",
      capabilities: ["detect_price_increase", "effective_date_tracking"],
      thresholdPct: 5,
      oldPrice: 12,
      newPrice: 13.8,
      supplierName: "Sysco",
      expectsAlert: true,
    },
    {
      id: "vpa-09-bulk-editor-source",
      label: "Bulk price editor change alert",
      capabilities: ["detect_price_decrease", "supplier_scoped_alert"],
      thresholdPct: 5,
      oldPrice: 8,
      newPrice: 7.2,
      supplierName: "US Foods",
      expectsAlert: true,
    },
    {
      id: "vpa-10-medium-severity",
      label: "12% increase — medium severity",
      capabilities: ["severity_classification"],
      thresholdPct: 5,
      oldPrice: 10,
      newPrice: 11.2,
      supplierName: "Sysco",
      expectsAlert: true,
    },
    {
      id: "vpa-11-digest-summary",
      label: "Multi-vendor digest aggregation",
      capabilities: ["alert_digest", "supplier_scoped_alert"],
      thresholdPct: 5,
      oldPrice: 3,
      newPrice: 3.6,
      supplierName: "Local Produce Co",
      expectsAlert: true,
    },
    {
      id: "vpa-12-full-flow",
      label: "Full MarginEdge parity alert flow",
      capabilities: [
        "detect_price_increase",
        "detect_price_decrease",
        "threshold_pct_alert",
        "supplier_scoped_alert",
        "ingredient_scoped_alert",
        "effective_date_tracking",
        "severity_classification",
        "alert_digest",
      ],
      thresholdPct: 5,
      oldPrice: 6,
      newPrice: 7.2,
      supplierName: "Restaurant Depot",
      expectsAlert: true,
    },
  ];
}
