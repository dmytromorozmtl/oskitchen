import type { PurchaseRecommendation } from "@/lib/ai/ai-purchasing-types";
import type { PurchaseOrderStatus } from "@prisma/client";

import {
  AUTO_PURCHASE_AUTO_APPROVE_MAX,
  AUTO_PURCHASE_MAX_DAYS_REMAINING,
  AUTO_PURCHASE_MIN_CONFIDENCE,
  DEFAULT_PURCHASING_AUTOMATION_SETTINGS,
  type AutoPurchaseEligibility,
  type PurchasingAutomationSettings,
} from "@/lib/ai/purchasing-automation-types";

export type PoAutomationStatus = {
  status: PurchaseOrderStatus;
  approvalActions: { action: string; notes: string }[];
  autoApproved: boolean;
  requiresApproval: boolean;
};

export function parsePurchasingAutomationSettings(raw: unknown): PurchasingAutomationSettings {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    return { ...DEFAULT_PURCHASING_AUTOMATION_SETTINGS };
  }
  const obj = raw as Record<string, unknown>;
  return {
    enabled: obj.enabled === true,
    minConfidence:
      typeof obj.minConfidence === "number" && obj.minConfidence > 0
        ? obj.minConfidence
        : AUTO_PURCHASE_MIN_CONFIDENCE,
    maxDaysRemaining:
      typeof obj.maxDaysRemaining === "number" && obj.maxDaysRemaining > 0
        ? obj.maxDaysRemaining
        : AUTO_PURCHASE_MAX_DAYS_REMAINING,
    autoApproveMaxAmount:
      typeof obj.autoApproveMaxAmount === "number" && obj.autoApproveMaxAmount > 0
        ? obj.autoApproveMaxAmount
        : AUTO_PURCHASE_AUTO_APPROVE_MAX,
    lastRunAt: typeof obj.lastRunAt === "string" ? obj.lastRunAt : null,
  };
}

export function isEligibleForAutoPurchase(
  rec: Pick<
    PurchaseRecommendation,
    "ingredientId" | "confidence" | "daysRemaining" | "bestSupplier"
  >,
  input: {
    skippedIngredientIds: Set<string>;
    minConfidence?: number;
    maxDaysRemaining?: number;
  },
): AutoPurchaseEligibility {
  const minConfidence = input.minConfidence ?? AUTO_PURCHASE_MIN_CONFIDENCE;
  const maxDaysRemaining = input.maxDaysRemaining ?? AUTO_PURCHASE_MAX_DAYS_REMAINING;
  const reasons: string[] = [];

  if (input.skippedIngredientIds.has(rec.ingredientId)) {
    reasons.push("skipped_by_user");
  }
  if (rec.confidence <= minConfidence) {
    reasons.push(`confidence_${rec.confidence}_below_${minConfidence}`);
  }
  if (rec.daysRemaining == null) {
    reasons.push("no_usage_data");
  } else if (rec.daysRemaining >= maxDaysRemaining) {
    reasons.push(`days_remaining_${rec.daysRemaining}_gte_${maxDaysRemaining}`);
  }
  if (rec.bestSupplier.supplierId.startsWith("default-")) {
    reasons.push("no_supplier_catalog");
  }
  if (rec.bestSupplier.orderQuantity <= 0) {
    reasons.push("zero_order_quantity");
  }

  return { eligible: reasons.length === 0, reasons };
}

export function resolvePoAutomationStatus(
  subtotal: number,
  autoApproveMaxAmount = AUTO_PURCHASE_AUTO_APPROVE_MAX,
): PoAutomationStatus {
  if (subtotal <= autoApproveMaxAmount) {
    return {
      status: "APPROVED",
      autoApproved: true,
      requiresApproval: false,
      approvalActions: [
        { action: "CREATED_DRAFT", notes: "AI purchasing automation" },
        { action: "AUTO_APPROVED", notes: `Under $${autoApproveMaxAmount} auto-approve threshold` },
      ],
    };
  }

  return {
    status: "READY_FOR_REVIEW",
    autoApproved: false,
    requiresApproval: true,
    approvalActions: [
      { action: "CREATED_DRAFT", notes: "AI purchasing automation" },
      {
        action: "SUBMITTED",
        notes: `Total $${subtotal.toFixed(2)} exceeds $${autoApproveMaxAmount} — approval required`,
      },
    ],
  };
}

export function filterAutoPurchaseCandidates<T extends PurchaseRecommendation>(
  recommendations: T[],
  skippedIngredientIds: Set<string>,
  settings: Pick<PurchasingAutomationSettings, "minConfidence" | "maxDaysRemaining">,
): { eligible: T[]; ineligible: { rec: T; reasons: string[] }[] } {
  const eligible: T[] = [];
  const ineligible: { rec: T; reasons: string[] }[] = [];

  for (const rec of recommendations) {
    const check = isEligibleForAutoPurchase(rec, {
      skippedIngredientIds,
      minConfidence: settings.minConfidence,
      maxDaysRemaining: settings.maxDaysRemaining,
    });
    if (check.eligible) eligible.push(rec);
    else ineligible.push({ rec, reasons: check.reasons });
  }

  eligible.sort((a, b) => (a.daysRemaining ?? 999) - (b.daysRemaining ?? 999));

  return { eligible, ineligible };
}
