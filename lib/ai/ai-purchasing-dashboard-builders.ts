import type { PurchasingUrgency } from "@/lib/ai/ai-purchasing-types";
import type {
  AiPurchasingUiState,
  PurchasingAiDashboardPayload,
  PurchasingAiRow,
} from "@/lib/ai/ai-purchasing-dashboard-types";
import type { AiPurchasingResult } from "@/lib/ai/ai-purchasing-types";

export type DaysRemainingTone = "red" | "amber" | "yellow" | "green";

export function daysRemainingTone(
  daysRemaining: number | null,
  urgency: PurchasingUrgency,
): DaysRemainingTone {
  if (daysRemaining == null) return "green";
  if (urgency === "critical" || daysRemaining <= 1) return "red";
  if (urgency === "high" || daysRemaining <= 3) return "amber";
  if (urgency === "normal" || daysRemaining <= 7) return "yellow";
  return "green";
}

export const DAYS_TONE_CLASS: Record<DaysRemainingTone, string> = {
  red: "text-red-600 dark:text-red-400 bg-red-500/10 border-red-500/30",
  amber: "text-amber-700 dark:text-amber-400 bg-amber-500/10 border-amber-500/30",
  yellow: "text-yellow-700 dark:text-yellow-300 bg-yellow-500/10 border-yellow-500/30",
  green: "text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/30",
};

export const DAYS_TONE_DOT: Record<DaysRemainingTone, string> = {
  red: "bg-red-500",
  amber: "bg-amber-500",
  yellow: "bg-yellow-500",
  green: "bg-emerald-500",
};

export function buildPurchasingAiRows(
  result: AiPurchasingResult,
  uiState: AiPurchasingUiState,
): PurchasingAiRow[] {
  return result.recommendations.map((rec) => {
    const skip = uiState.skipped[rec.ingredientId];
    const overrideQty = uiState.quantityOverrides[rec.ingredientId];
    const orderQuantity = overrideQty ?? rec.bestSupplier.orderQuantity;

    return {
      ...rec,
      bestSupplier: {
        ...rec.bestSupplier,
        orderQuantity,
        orderTotal: Math.round(orderQuantity * rec.bestSupplier.unitCost * 100) / 100,
      },
      orderQuantity,
      skipped: Boolean(skip),
      skipReason: skip?.reason ?? null,
      daysTone: daysRemainingTone(rec.daysRemaining, rec.urgency),
    };
  });
}

export function buildPurchasingAiDashboardPayload(
  result: AiPurchasingResult,
  uiState: AiPurchasingUiState,
): PurchasingAiDashboardPayload {
  const rows = buildPurchasingAiRows(result, uiState);
  const activeRows = rows.filter((r) => !r.skipped);
  const skippedRows = rows.filter((r) => r.skipped);

  const activeSpend = activeRows.reduce((s, r) => s + r.bestSupplier.orderTotal, 0);
  const activeSavings = activeRows.reduce(
    (s, r) => s + (r.alternativeSupplier?.savingsPerOrder ?? 0),
    0,
  );

  return {
    ...result,
    summary: {
      ...result.summary,
      itemCount: activeRows.length,
      totalEstimatedSpend: Math.round(activeSpend * 100) / 100,
      totalPotentialSavings: Math.round(activeSavings * 100) / 100,
    },
    rows,
    activeRows,
    skippedRows,
  };
}

export function parseAiPurchasingUiState(raw: unknown): AiPurchasingUiState {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    return { skipped: {}, quantityOverrides: {} };
  }
  const obj = raw as Record<string, unknown>;
  const skippedRaw = obj.skipped;
  const overridesRaw = obj.quantityOverrides;
  const skipped: AiPurchasingUiState["skipped"] = {};
  const quantityOverrides: AiPurchasingUiState["quantityOverrides"] = {};

  if (skippedRaw && typeof skippedRaw === "object" && !Array.isArray(skippedRaw)) {
    for (const [key, val] of Object.entries(skippedRaw)) {
      if (val && typeof val === "object" && !Array.isArray(val)) {
        const entry = val as Record<string, unknown>;
        if (typeof entry.reason === "string") {
          skipped[key] = {
            reason: entry.reason,
            skippedAt: typeof entry.skippedAt === "string" ? entry.skippedAt : new Date().toISOString(),
          };
        }
      }
    }
  }

  if (overridesRaw && typeof overridesRaw === "object" && !Array.isArray(overridesRaw)) {
    for (const [key, val] of Object.entries(overridesRaw)) {
      const n = Number(val);
      if (Number.isFinite(n) && n > 0) quantityOverrides[key] = n;
    }
  }

  return { skipped, quantityOverrides };
}
