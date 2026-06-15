/**
 * Pure helpers for packing verification (Blueprint P2-94).
 */

import {
  buildPackingFocusSnapshot,
  isPackingAllergenOpen,
  isPackingLabelMissing,
  type PackingFocusSnapshot,
  type PackingTaskFocus,
} from "@/lib/packing/packing-focus-era18";

export const PACKING_SCAN_TOKEN_MIN_LENGTH = 8 as const;
export const PACKING_SCAN_TOKEN_MAX_LENGTH = 128 as const;

export type PackingScanTokenValidation =
  | { ok: true; token: string }
  | { ok: false; reason: string };

export type DeliveryBagChecklistItem = {
  id: string;
  label: string;
  required: boolean;
  checked: boolean;
};

export type PackingAllergenRow = {
  taskId: string;
  title: string;
  customerName: string;
  allergenSummary: string | null;
  status: string;
};

export type PackingVerificationTaskSnapshot = {
  taskId: string;
  title: string;
  customerName: string;
  fulfillmentType: "PICKUP" | "DELIVERY";
  status: string;
  labelMissing: boolean;
  allergenOpen: boolean;
  deliveryBagChecklist: DeliveryBagChecklistItem[];
  bagReady: boolean;
};

export type PackingVerificationReport = {
  focus: PackingFocusSnapshot;
  taskCount: number;
  deliveryCount: number;
  labelsMissingCount: number;
  allergenOpenCount: number;
  bagReadyCount: number;
  allergenRows: PackingAllergenRow[];
  tasks: PackingVerificationTaskSnapshot[];
};

export const DELIVERY_BAG_CHECKLIST_TEMPLATE = [
  { id: "qr-label-scanned", label: "QR / label scanned", required: true },
  { id: "allergens-verified", label: "Allergens verified on bag", required: true },
  { id: "item-count-match", label: "Item count matches ticket", required: true },
  { id: "bag-sealed", label: "Bag sealed", required: true },
  { id: "delivery-label", label: "Delivery label applied", required: true },
  { id: "utensils-napkins", label: "Utensils & napkins (if requested)", required: false },
] as const;

export function validatePackingScanToken(raw: string): PackingScanTokenValidation {
  const token = raw.trim();
  if (token.length < PACKING_SCAN_TOKEN_MIN_LENGTH) {
    return { ok: false, reason: "Token too short — scan or enter full pack label." };
  }
  if (token.length > PACKING_SCAN_TOKEN_MAX_LENGTH) {
    return { ok: false, reason: "Token too long." };
  }
  return { ok: true, token };
}

export function buildDeliveryBagChecklist(task: {
  fulfillmentType: "PICKUP" | "DELIVERY";
  labelPrintedAt: string | null;
  status: string;
  requiresAllergenCheck: boolean;
  verifiedAt: string | null;
}): DeliveryBagChecklistItem[] {
  const labelScanned = Boolean(task.labelPrintedAt);
  const allergenVerified =
    !task.requiresAllergenCheck ||
    task.status === "VERIFIED" ||
    task.status === "HANDED_OFF";
  const itemCounted = task.status === "PACKED" || task.status === "VERIFIED" || task.status === "HANDED_OFF";
  const bagSealed = task.status === "VERIFIED" || task.status === "HANDED_OFF";
  const deliveryLabel = task.fulfillmentType === "DELIVERY" ? bagSealed : labelScanned;

  const autoChecks: Record<string, boolean> = {
    "qr-label-scanned": labelScanned,
    "allergens-verified": allergenVerified,
    "item-count-match": itemCounted,
    "bag-sealed": bagSealed,
    "delivery-label": deliveryLabel,
    "utensils-napkins": false,
  };

  return DELIVERY_BAG_CHECKLIST_TEMPLATE.map((item) => ({
    id: item.id,
    label: item.label,
    required: item.required,
    checked: autoChecks[item.id] ?? false,
  }));
}

export function isDeliveryBagReady(checklist: readonly DeliveryBagChecklistItem[]): boolean {
  return checklist.filter((item) => item.required).every((item) => item.checked);
}

export function buildPackingAllergenRows(
  tasks: readonly (PackingTaskFocus & { allergenSummary?: string | null })[],
): PackingAllergenRow[] {
  return tasks
    .filter((task) => isPackingAllergenOpen(task))
    .map((task) => ({
      taskId: task.id,
      title: task.title,
      customerName: task.customerName,
      allergenSummary: task.allergenSummary ?? null,
      status: task.status,
    }));
}

export function buildPackingVerificationTaskSnapshot(input: {
  taskId: string;
  title: string;
  customerName: string;
  fulfillmentType: "PICKUP" | "DELIVERY";
  status: string;
  requiresLabel: boolean;
  requiresNutritionLabel: boolean;
  requiresAllergenCheck: boolean;
  labelPrintedAt: string | null;
  verifiedAt: string | null;
}): PackingVerificationTaskSnapshot {
  const focusTask: PackingTaskFocus = {
    id: input.taskId,
    title: input.title,
    status: input.status as PackingTaskFocus["status"],
    customerName: input.customerName,
    requiresLabel: input.requiresLabel,
    requiresNutritionLabel: input.requiresNutritionLabel,
    requiresAllergenCheck: input.requiresAllergenCheck,
    labelPrintedAt: input.labelPrintedAt,
    fulfillmentType: input.fulfillmentType,
  };

  const deliveryBagChecklist = buildDeliveryBagChecklist({
    fulfillmentType: input.fulfillmentType,
    labelPrintedAt: input.labelPrintedAt,
    status: input.status,
    requiresAllergenCheck: input.requiresAllergenCheck,
    verifiedAt: input.verifiedAt,
  });

  return {
    taskId: input.taskId,
    title: input.title,
    customerName: input.customerName,
    fulfillmentType: input.fulfillmentType,
    status: input.status,
    labelMissing: isPackingLabelMissing(focusTask),
    allergenOpen: isPackingAllergenOpen(focusTask),
    deliveryBagChecklist,
    bagReady: isDeliveryBagReady(deliveryBagChecklist),
  };
}

export function buildPackingVerificationReport(
  tasks: readonly (PackingTaskFocus & {
    allergenSummary?: string | null;
    verifiedAt?: string | null;
  })[],
): PackingVerificationReport {
  const focus = buildPackingFocusSnapshot(tasks);
  const snapshots = tasks.map((task) =>
    buildPackingVerificationTaskSnapshot({
      taskId: task.id,
      title: task.title,
      customerName: task.customerName,
      fulfillmentType: task.fulfillmentType,
      status: task.status,
      requiresLabel: task.requiresLabel,
      requiresNutritionLabel: task.requiresNutritionLabel,
      requiresAllergenCheck: task.requiresAllergenCheck,
      labelPrintedAt: task.labelPrintedAt,
      verifiedAt: task.verifiedAt ?? null,
    }),
  );

  return {
    focus,
    taskCount: tasks.length,
    deliveryCount: tasks.filter((task) => task.fulfillmentType === "DELIVERY").length,
    labelsMissingCount: focus.labelsMissingCount,
    allergenOpenCount: focus.allergenOpenCount,
    bagReadyCount: snapshots.filter((row) => row.bagReady).length,
    allergenRows: buildPackingAllergenRows(tasks),
    tasks: snapshots.sort((left, right) => {
      if (left.allergenOpen !== right.allergenOpen) return left.allergenOpen ? -1 : 1;
      if (left.labelMissing !== right.labelMissing) return left.labelMissing ? -1 : 1;
      return left.title.localeCompare(right.title);
    }),
  };
}
