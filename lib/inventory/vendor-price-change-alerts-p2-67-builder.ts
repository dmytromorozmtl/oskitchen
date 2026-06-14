import { VENDOR_PRICE_CHANGE_ALERTS_P2_67_DEFAULT_THRESHOLD_PCT } from "@/lib/inventory/vendor-price-change-alerts-p2-67-policy";

export type VendorPriceChangeAlertSeverity = "low" | "medium" | "high";

export type VendorPriceChangeAlertType = "increase" | "decrease";

export type VendorPriceChangeAlert = {
  alertId: string;
  ingredientId: string;
  ingredientName: string;
  supplierName: string;
  previousPrice: number;
  newPrice: number;
  changePercent: number;
  effectiveDate: string;
  severity: VendorPriceChangeAlertSeverity;
  alertType: VendorPriceChangeAlertType;
  source: string;
};

export type VendorPriceChangeAlertDigest = {
  totalAlerts: number;
  increaseCount: number;
  decreaseCount: number;
  highSeverityCount: number;
  avgChangePercent: number;
  suppliersAffected: number;
  ingredientsAffected: number;
};

export type VendorPriceHistoryRow = {
  id: string;
  ingredientId: string;
  ingredientName: string;
  supplierName: string;
  oldUnitCost: number | null;
  newUnitCost: number;
  effectiveAt: string;
  source: string;
};

function round1(value: number): number {
  return Math.round(value * 10) / 10;
}

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

export function computePriceChangePercent(
  newPrice: number,
  previousPrice: number | null,
): number | null {
  if (previousPrice == null || previousPrice <= 0) return null;
  return round1(((newPrice - previousPrice) / previousPrice) * 100);
}

export function classifyAlertSeverity(absChangePercent: number): VendorPriceChangeAlertSeverity {
  if (absChangePercent >= 20) return "high";
  if (absChangePercent >= 10) return "medium";
  return "low";
}

export function buildVendorPriceChangeAlert(
  row: VendorPriceHistoryRow,
  thresholdPct = VENDOR_PRICE_CHANGE_ALERTS_P2_67_DEFAULT_THRESHOLD_PCT,
): VendorPriceChangeAlert | null {
  const changePercent = computePriceChangePercent(row.newUnitCost, row.oldUnitCost);
  if (changePercent == null || Math.abs(changePercent) < thresholdPct) return null;

  const alertType: VendorPriceChangeAlertType = changePercent > 0 ? "increase" : "decrease";

  return {
    alertId: row.id,
    ingredientId: row.ingredientId,
    ingredientName: row.ingredientName,
    supplierName: row.supplierName,
    previousPrice: round2(row.oldUnitCost ?? 0),
    newPrice: round2(row.newUnitCost),
    changePercent,
    effectiveDate: row.effectiveAt.slice(0, 10),
    severity: classifyAlertSeverity(Math.abs(changePercent)),
    alertType,
    source: row.source,
  };
}

export function detectVendorPriceChangeAlerts(
  rows: VendorPriceHistoryRow[],
  thresholdPct = VENDOR_PRICE_CHANGE_ALERTS_P2_67_DEFAULT_THRESHOLD_PCT,
): VendorPriceChangeAlert[] {
  return rows
    .map((row) => buildVendorPriceChangeAlert(row, thresholdPct))
    .filter((alert): alert is VendorPriceChangeAlert => alert != null)
    .sort(
      (a, b) =>
        b.effectiveDate.localeCompare(a.effectiveDate) ||
        Math.abs(b.changePercent) - Math.abs(a.changePercent),
    );
}

export function filterAlertsBySupplier(
  alerts: VendorPriceChangeAlert[],
  supplierName: string,
): VendorPriceChangeAlert[] {
  const normalized = supplierName.trim().toLowerCase();
  return alerts.filter((a) => a.supplierName.toLowerCase() === normalized);
}

export function filterAlertsByIngredient(
  alerts: VendorPriceChangeAlert[],
  ingredientId: string,
): VendorPriceChangeAlert[] {
  return alerts.filter((a) => a.ingredientId === ingredientId);
}

export function buildVendorPriceChangeAlertDigest(
  alerts: VendorPriceChangeAlert[],
): VendorPriceChangeAlertDigest {
  const increaseCount = alerts.filter((a) => a.alertType === "increase").length;
  const decreaseCount = alerts.filter((a) => a.alertType === "decrease").length;
  const highSeverityCount = alerts.filter((a) => a.severity === "high").length;
  const avgChangePercent =
    alerts.length === 0
      ? 0
      : round1(alerts.reduce((sum, a) => sum + Math.abs(a.changePercent), 0) / alerts.length);

  return {
    totalAlerts: alerts.length,
    increaseCount,
    decreaseCount,
    highSeverityCount,
    avgChangePercent,
    suppliersAffected: new Set(alerts.map((a) => a.supplierName)).size,
    ingredientsAffected: new Set(alerts.map((a) => a.ingredientId)).size,
  };
}

export function buildVendorPriceChangeAlertsDemoRows(): VendorPriceHistoryRow[] {
  return [
    {
      id: "demo-1",
      ingredientId: "ing-chicken",
      ingredientName: "Chicken breast",
      supplierName: "Sysco",
      oldUnitCost: 4.2,
      newUnitCost: 4.83,
      effectiveAt: "2026-06-10T00:00:00.000Z",
      source: "invoice_ocr",
    },
    {
      id: "demo-2",
      ingredientId: "ing-oil",
      ingredientName: "Olive oil",
      supplierName: "US Foods",
      oldUnitCost: 18.5,
      newUnitCost: 17.2,
      effectiveAt: "2026-06-09T00:00:00.000Z",
      source: "bulk_price_editor",
    },
    {
      id: "demo-3",
      ingredientId: "ing-tomato",
      ingredientName: "Roma tomatoes",
      supplierName: "Local Produce Co",
      oldUnitCost: 2.1,
      newUnitCost: 2.73,
      effectiveAt: "2026-06-08T00:00:00.000Z",
      source: "receiving",
    },
    {
      id: "demo-4",
      ingredientId: "ing-flour",
      ingredientName: "All-purpose flour",
      supplierName: "Sysco",
      oldUnitCost: 0.85,
      newUnitCost: 0.88,
      effectiveAt: "2026-06-07T00:00:00.000Z",
      source: "bulk_price_editor",
    },
    {
      id: "demo-5",
      ingredientId: "ing-cheese",
      ingredientName: "Mozzarella",
      supplierName: "Restaurant Depot",
      oldUnitCost: 5.6,
      newUnitCost: 7.0,
      effectiveAt: "2026-06-06T00:00:00.000Z",
      source: "invoice_ocr",
    },
  ];
}
