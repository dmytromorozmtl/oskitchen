/**
 * Pure helpers for expo mode (Blueprint P2-93).
 */

import { isKdsTicketReady } from "@/lib/kitchen/kds-queue-clarity-era18";

export const EXPO_READY_WORK_STATUSES = new Set(["READY", "PACK_HANDOFF", "DONE"]);

export type ExpoWorkItemInput = {
  orderId: string | null;
  title: string;
  status: string;
  station: string | null;
};

export type ExpoOrderLineItem = {
  title: string;
  isReady: boolean;
  station: string;
};

export type ExpoHandoffChecklistItem = {
  id: string;
  label: string;
  required: boolean;
  checked: boolean;
};

export type ExpoOrderSnapshot = {
  orderId: string;
  customerName: string;
  status: string;
  elapsedSeconds: number;
  completenessPercent: number;
  isComplete: boolean;
  expectedCount: number;
  readyCount: number;
  missingItems: string[];
  lineItems: ExpoOrderLineItem[];
  handoffChecklist: ExpoHandoffChecklistItem[];
  canHandoff: boolean;
  hasAllergenConflict: boolean;
};

export type ExpoModeReport = {
  queueCount: number;
  completeCount: number;
  incompleteCount: number;
  orders: ExpoOrderSnapshot[];
};

export const EXPO_HANDOFF_CHECKLIST_TEMPLATE = [
  { id: "all-items-present", label: "All items on pass", required: true },
  { id: "utensils-napkins", label: "Utensils & napkins", required: true },
  { id: "sauce-condiments", label: "Sauces & condiments", required: false },
  { id: "allergen-verified", label: "Allergen flag verified", required: true },
  { id: "bag-sealed", label: "Bag sealed / labeled", required: true },
  { id: "runner-called", label: "Runner or pickup notified", required: true },
] as const;

export function isExpoWorkItemReady(status: string): boolean {
  return EXPO_READY_WORK_STATUSES.has(status.toUpperCase());
}

function normalizeTitle(title: string): string {
  return title.trim().toLowerCase();
}

export function buildExpoLineItems(
  expectedItems: readonly string[],
  workItems: readonly ExpoWorkItemInput[],
  orderStatus: string,
): ExpoOrderLineItem[] {
  if (isKdsTicketReady(orderStatus)) {
    return expectedItems.map((title) => ({
      title,
      isReady: true,
      station: "expo",
    }));
  }

  const workByTitle = new Map<string, ExpoWorkItemInput>();
  for (const item of workItems) {
    workByTitle.set(normalizeTitle(item.title), item);
  }

  return expectedItems.map((title) => {
    const match = workByTitle.get(normalizeTitle(title));
    if (match) {
      return {
        title,
        isReady: isExpoWorkItemReady(match.status),
        station: match.station?.trim() || "prep",
      };
    }
    return { title, isReady: false, station: "unknown" };
  });
}

export function computeExpoCompleteness(lineItems: readonly ExpoOrderLineItem[]): {
  completenessPercent: number;
  isComplete: boolean;
  expectedCount: number;
  readyCount: number;
  missingItems: string[];
} {
  const expectedCount = lineItems.length;
  if (expectedCount === 0) {
    return {
      completenessPercent: 100,
      isComplete: true,
      expectedCount: 0,
      readyCount: 0,
      missingItems: [],
    };
  }

  const readyCount = lineItems.filter((item) => item.isReady).length;
  const missingItems = lineItems.filter((item) => !item.isReady).map((item) => item.title);
  const completenessPercent = Math.round((readyCount / expectedCount) * 100);

  return {
    completenessPercent,
    isComplete: readyCount === expectedCount,
    expectedCount,
    readyCount,
    missingItems,
  };
}

export function buildExpoHandoffChecklist(input: {
  isComplete: boolean;
  hasAllergenConflict: boolean;
}): ExpoHandoffChecklistItem[] {
  return EXPO_HANDOFF_CHECKLIST_TEMPLATE.map((item) => {
    let checked = false;
    if (item.id === "all-items-present") checked = input.isComplete;
    if (item.id === "allergen-verified") checked = input.isComplete && !input.hasAllergenConflict;

    return {
      id: item.id,
      label: item.label,
      required: item.required,
      checked,
    };
  });
}

export function canExpoHandoff(checklist: readonly ExpoHandoffChecklistItem[]): boolean {
  const autoChecked = checklist.filter((item) => item.checked);
  const requiredAuto = checklist.filter((item) => item.required && item.checked);
  return autoChecked.length >= 2 && requiredAuto.some((item) => item.id === "all-items-present");
}

export function buildExpoOrderSnapshot(input: {
  orderId: string;
  customerName: string;
  status: string;
  elapsedSeconds: number;
  items: readonly string[];
  workItems: readonly ExpoWorkItemInput[];
  hasAllergenConflict?: boolean;
}): ExpoOrderSnapshot {
  const lineItems = buildExpoLineItems(input.items, input.workItems, input.status);
  const completeness = computeExpoCompleteness(lineItems);
  const handoffChecklist = buildExpoHandoffChecklist({
    isComplete: completeness.isComplete,
    hasAllergenConflict: input.hasAllergenConflict ?? false,
  });

  return {
    orderId: input.orderId,
    customerName: input.customerName,
    status: input.status,
    elapsedSeconds: input.elapsedSeconds,
    hasAllergenConflict: input.hasAllergenConflict ?? false,
    ...completeness,
    lineItems,
    handoffChecklist,
    canHandoff: completeness.isComplete && canExpoHandoff(handoffChecklist),
  };
}

export function buildExpoModeReport(
  orders: readonly {
    id: string;
    customerName: string;
    status: string;
    elapsedSeconds: number;
    items: string[];
    hasAllergenConflict?: boolean;
  }[],
  workItems: readonly ExpoWorkItemInput[],
): ExpoModeReport {
  const workByOrder = new Map<string, ExpoWorkItemInput[]>();
  for (const item of workItems) {
    if (!item.orderId) continue;
    const existing = workByOrder.get(item.orderId) ?? [];
    existing.push(item);
    workByOrder.set(item.orderId, existing);
  }

  const snapshots = orders.map((order) =>
    buildExpoOrderSnapshot({
      orderId: order.id,
      customerName: order.customerName,
      status: order.status,
      elapsedSeconds: order.elapsedSeconds,
      items: order.items,
      workItems: workByOrder.get(order.id) ?? [],
      hasAllergenConflict: order.hasAllergenConflict,
    }),
  );

  const completeCount = snapshots.filter((snapshot) => snapshot.isComplete).length;

  return {
    queueCount: snapshots.length,
    completeCount,
    incompleteCount: snapshots.length - completeCount,
    orders: snapshots.sort((left, right) => {
      if (left.isComplete !== right.isComplete) return left.isComplete ? 1 : -1;
      return right.elapsedSeconds - left.elapsedSeconds;
    }),
  };
}
