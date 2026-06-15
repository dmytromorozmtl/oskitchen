import type { PackingTaskStatus } from "@prisma/client";

import { PACKING_VERIFY_ROUTE } from "@/lib/packing/packing-focus-era18-policy";
import type { PackingKpis } from "@/lib/packing/packing-kpis";

export type PackingTaskFocus = {
  id: string;
  title: string;
  status: PackingTaskStatus;
  customerName: string;
  requiresLabel: boolean;
  requiresNutritionLabel: boolean;
  requiresAllergenCheck: boolean;
  labelPrintedAt: string | null;
  fulfillmentType: "PICKUP" | "DELIVERY";
};

export type PackingFocusSnapshot = {
  allergenOpenCount: number;
  labelsMissingCount: number;
  queuedCount: number;
  packedUnverifiedCount: number;
};

export type PackingAttentionItem = {
  id: string;
  title: string;
  detail: string;
  href: string;
  priority: number;
  tone: "urgent" | "normal";
};

export type PackingTaskRowNextAction = {
  label: string;
  href: string;
  tone: "urgent" | "normal";
};

const ACTIVE_STATUSES = new Set<PackingTaskStatus>(["QUEUED", "IN_PROGRESS"]);

export function packingTaskAnchor(taskId: string): string {
  return `#packing-task-${taskId}`;
}

export function isPackingLabelMissing(task: Pick<PackingTaskFocus, "requiresLabel" | "requiresNutritionLabel" | "labelPrintedAt">): boolean {
  return (task.requiresLabel || task.requiresNutritionLabel) && !task.labelPrintedAt;
}

export function isPackingAllergenOpen(
  task: Pick<PackingTaskFocus, "requiresAllergenCheck" | "status">,
): boolean {
  return (
    task.requiresAllergenCheck &&
    task.status !== "VERIFIED" &&
    task.status !== "HANDED_OFF" &&
    task.status !== "CANCELLED"
  );
}

export function buildPackingFocusSnapshot(
  tasks: readonly PackingTaskFocus[],
): PackingFocusSnapshot {
  let allergenOpenCount = 0;
  let labelsMissingCount = 0;
  let queuedCount = 0;
  let packedUnverifiedCount = 0;

  for (const task of tasks) {
    if (isPackingAllergenOpen(task)) allergenOpenCount += 1;
    if (isPackingLabelMissing(task) && ACTIVE_STATUSES.has(task.status)) labelsMissingCount += 1;
    if (ACTIVE_STATUSES.has(task.status)) queuedCount += 1;
    if (task.status === "PACKED") packedUnverifiedCount += 1;
  }

  return {
    allergenOpenCount,
    labelsMissingCount,
    queuedCount,
    packedUnverifiedCount,
  };
}

export function summarizePackingFocus(
  focus: PackingFocusSnapshot,
  kpis: Pick<PackingKpis, "allergenChecksOpen" | "labelsMissing">,
): { totalSignals: number; hasUrgent: boolean } {
  const totalSignals =
    (focus.allergenOpenCount > 0 ? 1 : 0) +
    (focus.labelsMissingCount > 0 ? 1 : 0) +
    (focus.queuedCount > 0 ? 1 : 0) +
    (focus.packedUnverifiedCount > 0 ? 1 : 0);

  const hasUrgent =
    kpis.allergenChecksOpen > 0 ||
    kpis.labelsMissing > 0 ||
    focus.allergenOpenCount > 0 ||
    focus.labelsMissingCount > 0;

  return { totalSignals, hasUrgent };
}

function firstAllergenTask(tasks: readonly PackingTaskFocus[]): PackingTaskFocus | null {
  return tasks.find((task) => isPackingAllergenOpen(task)) ?? null;
}

function firstLabelMissingTask(tasks: readonly PackingTaskFocus[]): PackingTaskFocus | null {
  return tasks.find((task) => isPackingLabelMissing(task) && ACTIVE_STATUSES.has(task.status)) ?? null;
}

function firstQueuedTask(tasks: readonly PackingTaskFocus[]): PackingTaskFocus | null {
  return tasks.find((task) => ACTIVE_STATUSES.has(task.status)) ?? null;
}

function firstPackedUnverifiedTask(tasks: readonly PackingTaskFocus[]): PackingTaskFocus | null {
  return tasks.find((task) => task.status === "PACKED") ?? null;
}

/** Packing command center — allergen, labels, and verify gaps first. */
export function pickPackingAttentionItems(
  tasks: readonly PackingTaskFocus[],
  focus: PackingFocusSnapshot,
): PackingAttentionItem[] {
  const items: PackingAttentionItem[] = [];

  if (focus.allergenOpenCount > 0) {
    const allergen = firstAllergenTask(tasks);
    items.push({
      id: "allergen-open",
      title: `${focus.allergenOpenCount} allergen check${focus.allergenOpenCount === 1 ? "" : "s"} open`,
      detail: allergen
        ? `${allergen.title} for ${allergen.customerName} — verify allergens before handoff.`
        : "Allergen verification required before packed lines can ship.",
      href: allergen ? packingTaskAnchor(allergen.id) : PACKING_VERIFY_ROUTE,
      priority: 4,
      tone: "urgent",
    });
  }

  if (focus.labelsMissingCount > 0) {
    const missing = firstLabelMissingTask(tasks);
    items.push({
      id: "labels-missing",
      title: `${focus.labelsMissingCount} label${focus.labelsMissingCount === 1 ? "" : "s"} not logged`,
      detail: missing
        ? `${missing.title} needs a printed label before pack-out completes.`
        : "Log label prints for compliance-oriented pack lines.",
      href: missing ? packingTaskAnchor(missing.id) : "#packing-queue",
      priority: 3,
      tone: "urgent",
    });
  }

  if (focus.packedUnverifiedCount > 0) {
    const packed = firstPackedUnverifiedTask(tasks);
    items.push({
      id: "verify-pending",
      title: `${focus.packedUnverifiedCount} packed line${focus.packedUnverifiedCount === 1 ? "" : "s"} awaiting verify`,
      detail: packed
        ? `${packed.title} is packed — run packing verify before handoff.`
        : "Open packing verify to complete QC sign-off.",
      href: packed ? packingTaskAnchor(packed.id) : PACKING_VERIFY_ROUTE,
      priority: 2,
      tone: "urgent",
    });
  }

  if (focus.queuedCount > 0 && items.length < 4) {
    const queued = firstQueuedTask(tasks);
    items.push({
      id: "queue-backlog",
      title: `${focus.queuedCount} line${focus.queuedCount === 1 ? "" : "s"} in pack queue`,
      detail: queued
        ? `Next up: ${queued.title} for ${queued.customerName}.`
        : "Work the queue oldest-first before pickup windows close.",
      href: queued ? packingTaskAnchor(queued.id) : "#packing-queue",
      priority: 1,
      tone: focus.allergenOpenCount > 0 ? "normal" : "urgent",
    });
  }

  return items.sort((a, b) => b.priority - a.priority).slice(0, 4);
}

export function shouldShowPackingAttentionStrip(
  focus: PackingFocusSnapshot,
): boolean {
  return (
    focus.allergenOpenCount > 0 ||
    focus.labelsMissingCount > 0 ||
    focus.queuedCount > 0 ||
    focus.packedUnverifiedCount > 0
  );
}

/** Row-level next action for packing task cards. */
export function resolvePackingTaskRowNextAction(
  task: PackingTaskFocus,
): PackingTaskRowNextAction | null {
  if (task.status === "VERIFIED" || task.status === "HANDED_OFF" || task.status === "CANCELLED") {
    return null;
  }

  if (isPackingAllergenOpen(task)) {
    return { label: "Open verify — allergen", href: PACKING_VERIFY_ROUTE, tone: "urgent" };
  }

  if (isPackingLabelMissing(task) && ACTIVE_STATUSES.has(task.status)) {
    return { label: "Log label print", href: packingTaskAnchor(task.id), tone: "urgent" };
  }

  if (task.status === "PACKED") {
    return { label: "Complete verify", href: PACKING_VERIFY_ROUTE, tone: "urgent" };
  }

  if (ACTIVE_STATUSES.has(task.status)) {
    return { label: "Pack this line", href: packingTaskAnchor(task.id), tone: "normal" };
  }

  return null;
}
