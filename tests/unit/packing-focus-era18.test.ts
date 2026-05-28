import { describe, expect, it } from "vitest";

import {
  PACKING_FOCUS_ERA18_POLICY_ID,
  PACKING_FOCUS_ERA18_PROOF_STATUS,
  PACKING_VERIFY_ROUTE,
} from "@/lib/packing/packing-focus-era18-policy";
import {
  buildPackingFocusSnapshot,
  packingTaskAnchor,
  pickPackingAttentionItems,
  resolvePackingTaskRowNextAction,
  shouldShowPackingAttentionStrip,
  summarizePackingFocus,
} from "@/lib/packing/packing-focus-era18";

const tasks = [
  {
    id: "task-1",
    title: "Meal prep box",
    status: "QUEUED" as const,
    customerName: "Alex",
    requiresLabel: true,
    requiresNutritionLabel: false,
    requiresAllergenCheck: true,
    labelPrintedAt: null,
    fulfillmentType: "PICKUP" as const,
  },
  {
    id: "task-2",
    title: "Catering tray",
    status: "PACKED" as const,
    customerName: "Sam",
    requiresLabel: false,
    requiresNutritionLabel: false,
    requiresAllergenCheck: false,
    labelPrintedAt: null,
    fulfillmentType: "DELIVERY" as const,
  },
  {
    id: "task-3",
    title: "Verified line",
    status: "VERIFIED" as const,
    customerName: "Jordan",
    requiresLabel: false,
    requiresNutritionLabel: false,
    requiresAllergenCheck: false,
    labelPrintedAt: "2026-05-28T10:00:00.000Z",
    fulfillmentType: "PICKUP" as const,
  },
] as const;

describe("packing focus era18", () => {
  it("locks era18 packing focus policy id", () => {
    expect(PACKING_FOCUS_ERA18_POLICY_ID).toBe("era18-packing-focus-v1");
    expect(PACKING_FOCUS_ERA18_PROOF_STATUS).toBe("packing_focus_attention_wired");
    expect(PACKING_VERIFY_ROUTE).toBe("/dashboard/packing/verify");
  });

  it("builds focus snapshot for allergen, labels, queue, and verify gaps", () => {
    expect(buildPackingFocusSnapshot(tasks)).toEqual({
      allergenOpenCount: 1,
      labelsMissingCount: 1,
      queuedCount: 1,
      packedUnverifiedCount: 1,
    });
  });

  it("prioritizes allergen and label attention items", () => {
    const focus = buildPackingFocusSnapshot(tasks);
    const items = pickPackingAttentionItems(tasks, focus);

    expect(items[0]?.id).toBe("allergen-open");
    expect(items.some((item) => item.id === "labels-missing")).toBe(true);
    expect(items.some((item) => item.id === "verify-pending")).toBe(true);
    expect(items[0]?.href).toBe(packingTaskAnchor("task-1"));
  });

  it("shows attention strip when open signals exist", () => {
    expect(shouldShowPackingAttentionStrip(buildPackingFocusSnapshot(tasks))).toBe(true);
    expect(shouldShowPackingAttentionStrip(buildPackingFocusSnapshot([tasks[2]]))).toBe(false);
  });

  it("summarizes urgent packing focus", () => {
    const focus = buildPackingFocusSnapshot(tasks);
    expect(
      summarizePackingFocus(focus, { allergenChecksOpen: 1, labelsMissing: 1 }).hasUrgent,
    ).toBe(true);
  });

  it("resolves row next actions for allergen, label, and verify tasks", () => {
    expect(resolvePackingTaskRowNextAction(tasks[0])).toEqual({
      label: "Open verify — allergen",
      href: PACKING_VERIFY_ROUTE,
      tone: "urgent",
    });

    expect(resolvePackingTaskRowNextAction(tasks[1])).toEqual({
      label: "Complete verify",
      href: PACKING_VERIFY_ROUTE,
      tone: "urgent",
    });

    expect(resolvePackingTaskRowNextAction(tasks[2])).toBeNull();
  });
});
