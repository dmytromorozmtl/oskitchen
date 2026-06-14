import {
  buildVendorPriceChangeAlertDigest,
  buildVendorPriceChangeAlertsDemoRows,
  detectVendorPriceChangeAlerts,
  type VendorPriceChangeAlert,
  type VendorPriceChangeAlertDigest,
} from "@/lib/inventory/vendor-price-change-alerts-p2-67-builder";
import { VENDOR_PRICE_CHANGE_ALERTS_P2_67_DEFAULT_THRESHOLD_PCT } from "@/lib/inventory/vendor-price-change-alerts-p2-67-policy";
import { VENDOR_PRICE_CHANGE_ALERTS_P2_67_POLICY_ID } from "@/lib/inventory/vendor-price-change-alerts-p2-67-policy";
import { prisma } from "@/lib/prisma";

export type VendorPriceChangeAlertsSnapshot = {
  policyId: typeof VENDOR_PRICE_CHANGE_ALERTS_P2_67_POLICY_ID;
  mode: "live" | "demo";
  thresholdPct: number;
  analyzedAt: string;
  alerts: VendorPriceChangeAlert[];
  digest: VendorPriceChangeAlertDigest;
};

export async function loadVendorPriceChangeAlertsSnapshot(
  userId: string,
  thresholdPct = VENDOR_PRICE_CHANGE_ALERTS_P2_67_DEFAULT_THRESHOLD_PCT,
): Promise<VendorPriceChangeAlertsSnapshot> {
  try {
    const rows = await prisma.supplierPriceHistory.findMany({
      where: {
        ingredient: { userId },
        oldUnitCost: { not: null },
      },
      orderBy: { effectiveAt: "desc" },
      take: 200,
      select: {
        id: true,
        ingredientId: true,
        oldUnitCost: true,
        newUnitCost: true,
        effectiveAt: true,
        source: true,
        ingredient: { select: { name: true } },
        supplierItem: { select: { supplier: { select: { name: true } } } },
      },
    });

    if (rows.length > 0) {
      const mapped = rows.map((row) => ({
        id: row.id,
        ingredientId: row.ingredientId,
        ingredientName: row.ingredient.name,
        supplierName: row.supplierItem?.supplier.name ?? "Manual / catalog",
        oldUnitCost: row.oldUnitCost != null ? Number(row.oldUnitCost) : null,
        newUnitCost: Number(row.newUnitCost),
        effectiveAt: row.effectiveAt.toISOString(),
        source: row.source,
      }));

      const alerts = detectVendorPriceChangeAlerts(mapped, thresholdPct);

      return {
        policyId: VENDOR_PRICE_CHANGE_ALERTS_P2_67_POLICY_ID,
        mode: "live",
        thresholdPct,
        analyzedAt: new Date().toISOString(),
        alerts,
        digest: buildVendorPriceChangeAlertDigest(alerts),
      };
    }
  } catch {
    // Fall through to demo fixture
  }

  const demoAlerts = detectVendorPriceChangeAlerts(
    buildVendorPriceChangeAlertsDemoRows(),
    thresholdPct,
  );

  return {
    policyId: VENDOR_PRICE_CHANGE_ALERTS_P2_67_POLICY_ID,
    mode: "demo",
    thresholdPct,
    analyzedAt: new Date().toISOString(),
    alerts: demoAlerts,
    digest: buildVendorPriceChangeAlertDigest(demoAlerts),
  };
}
