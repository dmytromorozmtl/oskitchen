import type { BusinessType, KitchenTaskPriority, KitchenTaskType } from "@prisma/client";

import { newChecklistId, type TaskChecklistItem } from "@/lib/tasks/task-checklist";

export type BuiltInTaskTemplate = {
  slug: string;
  title: string;
  description: string;
  type: KitchenTaskType;
  priority: KitchenTaskPriority;
  assignedRole?: string;
  estimatedMinutes?: number;
  recurrenceRule?: string;
  checklist?: Array<Omit<TaskChecklistItem, "id">>;
  /** Business modes this template is most relevant to; empty = all. */
  businessModes?: readonly BusinessType[];
};

export const BUILT_IN_TASK_TEMPLATES: BuiltInTaskTemplate[] = [
  {
    slug: "daily-opening-checklist",
    title: "Daily opening checklist",
    description: "Front-of-house and kitchen open. Verify lights, temps, hand-wash, and POS / printer health.",
    type: "ADMIN",
    priority: "HIGH",
    assignedRole: "manager",
    estimatedMinutes: 20,
    recurrenceRule: "FREQ=DAILY",
    checklist: [
      { title: "Unlock + lights on", completed: false },
      { title: "Fridge / freezer temperatures logged", completed: false },
      { title: "POS + receipt printer test transaction", completed: false },
      { title: "Hand-wash station stocked", completed: false },
      { title: "Floor + counter sanitised", completed: false },
    ],
    businessModes: ["RESTAURANT", "CAFE", "BAR", "BAKERY", "MEAL_PREP", "GHOST_KITCHEN", "CLOUD_KITCHEN", "MULTI_BRAND"],
  },
  {
    slug: "daily-closing-checklist",
    title: "Daily closing checklist",
    description: "End-of-shift wrap: clean stations, log waste, lock cash, set alarm.",
    type: "CLEAN",
    priority: "HIGH",
    assignedRole: "manager",
    estimatedMinutes: 30,
    recurrenceRule: "FREQ=DAILY",
    checklist: [
      { title: "Stations broken down + sanitised", completed: false },
      { title: "Waste logged + bins out", completed: false },
      { title: "Cash drop completed", completed: false },
      { title: "Lights / equipment off", completed: false },
      { title: "Alarm set + doors locked", completed: false },
    ],
    businessModes: ["RESTAURANT", "CAFE", "BAR", "BAKERY"],
  },
  {
    slug: "cleaning-checklist",
    title: "Deep clean checklist",
    description: "Periodic deep clean for FOH + BOH.",
    type: "CLEAN",
    priority: "NORMAL",
    assignedRole: "staff",
    estimatedMinutes: 60,
    checklist: [
      { title: "Hood + filters", completed: false },
      { title: "Walk-in floor + shelves", completed: false },
      { title: "Bathrooms full sanitation", completed: false },
      { title: "Floor drains + grease trap", completed: false },
    ],
  },
  {
    slug: "weekly-inventory-count",
    title: "Weekly inventory count",
    description: "Count on-hand stock and reconcile against system.",
    type: "INVENTORY",
    priority: "NORMAL",
    assignedRole: "manager",
    estimatedMinutes: 90,
    recurrenceRule: "FREQ=WEEKLY",
    checklist: [
      { title: "Dry goods", completed: false },
      { title: "Walk-in fridge", completed: false },
      { title: "Freezer", completed: false },
      { title: "Bar / beverage", completed: false },
    ],
  },
  {
    slug: "supplier-price-review",
    title: "Monthly supplier price review",
    description: "Walk through recent invoices and renegotiate / swap items if margins slipped.",
    type: "PURCHASING",
    priority: "NORMAL",
    assignedRole: "owner",
    estimatedMinutes: 45,
    recurrenceRule: "FREQ=MONTHLY",
  },
  {
    slug: "menu-publish-reminder",
    title: "Weekly menu publish",
    description: "Confirm next week’s menu is published before the order cutoff.",
    type: "ADMIN",
    priority: "HIGH",
    assignedRole: "owner",
    estimatedMinutes: 15,
    recurrenceRule: "FREQ=WEEKLY",
    businessModes: ["MEAL_PREP", "CATERING", "BAKERY"],
  },
  {
    slug: "prep-batch-template",
    title: "Prep batch",
    description: "Reusable prep card — fill in recipe and yield.",
    type: "PREP",
    priority: "NORMAL",
    assignedRole: "kitchen",
    estimatedMinutes: 30,
  },
  {
    slug: "packing-wave",
    title: "Packing wave",
    description: "Pack a window of orders with labels and verification.",
    type: "PACK",
    priority: "HIGH",
    assignedRole: "packer",
    estimatedMinutes: 60,
    checklist: [
      { title: "Verify packing list against orders", completed: false },
      { title: "Print labels", completed: false },
      { title: "Pack + stage", completed: false },
      { title: "Run verification scan", completed: false },
    ],
  },
  {
    slug: "delivery-follow-up",
    title: "Delivery follow-up",
    description: "Failed or returned delivery — reach out and reschedule.",
    type: "FOLLOW_UP",
    priority: "HIGH",
    assignedRole: "manager",
    estimatedMinutes: 15,
  },
  {
    slug: "purchasing-shortage",
    title: "Purchasing shortage",
    description: "Inventory shortage detected — place PO or substitute.",
    type: "PURCHASING",
    priority: "URGENT",
    assignedRole: "manager",
    estimatedMinutes: 20,
  },
  {
    slug: "catering-event-prep",
    title: "Catering event prep",
    description: "Per-event task list — prep, packaging, loadout, delivery, setup.",
    type: "CATERING",
    priority: "HIGH",
    assignedRole: "manager",
    estimatedMinutes: 120,
    checklist: [
      { title: "Final headcount confirmed", completed: false },
      { title: "Menu signed off by client", completed: false },
      { title: "Prep complete", completed: false },
      { title: "Loadout packed", completed: false },
      { title: "Delivery + setup confirmed", completed: false },
    ],
    businessModes: ["CATERING"],
  },
  {
    slug: "bar-event-night",
    title: "Bar event night",
    description: "Pre-event bar setup, ice, garnish, glassware.",
    type: "BAR_PREP",
    priority: "HIGH",
    assignedRole: "staff",
    estimatedMinutes: 60,
    businessModes: ["BAR"],
  },
  {
    slug: "bakery-batch-day",
    title: "Bakery batch day",
    description: "Daily proofing, bake, and pickup prep.",
    type: "BAKERY_BATCH",
    priority: "HIGH",
    assignedRole: "kitchen",
    estimatedMinutes: 240,
    businessModes: ["BAKERY"],
  },
  {
    slug: "quality-check",
    title: "Quality check",
    description: "Allergen + nutrition spot check before service / pack.",
    type: "QUALITY_CHECK",
    priority: "HIGH",
    assignedRole: "manager",
    estimatedMinutes: 15,
  },
];

/** Materialise a built-in template's checklist with fresh ids. */
export function instantiateTemplateChecklist(t: BuiltInTaskTemplate): TaskChecklistItem[] {
  return (t.checklist ?? []).map((item) => ({
    id: newChecklistId(),
    title: item.title,
    completed: false,
    completedBy: null,
    completedAt: null,
  }));
}
