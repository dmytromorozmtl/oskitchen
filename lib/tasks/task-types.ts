import type {
  BusinessType,
  KitchenTaskPriority,
  KitchenTaskSource,
  KitchenTaskStatus,
  KitchenTaskType,
} from "@prisma/client";

export const TASK_TYPE_VALUES = [
  "PREP",
  "COOK",
  "PACK",
  "CLEAN",
  "DELIVERY",
  "ADMIN",
  "PURCHASING",
  "INVENTORY",
  "CUSTOMER",
  "CATERING",
  "EVENT",
  "BAR_PREP",
  "CAFE_PREP",
  "BAKERY_BATCH",
  "MAINTENANCE",
  "TRAINING",
  "IMPLEMENTATION",
  "SUPPORT",
  "FOLLOW_UP",
  "QUALITY_CHECK",
  "LABELING",
] as const satisfies readonly KitchenTaskType[];

export const TASK_TYPE_LABEL: Record<KitchenTaskType, string> = {
  PREP: "Prep",
  COOK: "Cook",
  PACK: "Pack",
  CLEAN: "Clean",
  DELIVERY: "Delivery",
  ADMIN: "Admin",
  PURCHASING: "Purchasing",
  INVENTORY: "Inventory",
  CUSTOMER: "Customer",
  CATERING: "Catering",
  EVENT: "Event",
  BAR_PREP: "Bar prep",
  CAFE_PREP: "Café prep",
  BAKERY_BATCH: "Bakery batch",
  MAINTENANCE: "Maintenance",
  TRAINING: "Training",
  IMPLEMENTATION: "Implementation",
  SUPPORT: "Support",
  FOLLOW_UP: "Follow-up",
  QUALITY_CHECK: "Quality check",
  LABELING: "Labeling",
};

export function isTaskType(v: unknown): v is KitchenTaskType {
  return typeof v === "string" && (TASK_TYPE_VALUES as readonly string[]).includes(v);
}

/** Re-export priority values for consistent ordering across the UI. */
export const TASK_PRIORITY_VALUES = [
  "CRITICAL",
  "URGENT",
  "HIGH",
  "NORMAL",
  "MEDIUM",
  "LOW",
] as const satisfies readonly KitchenTaskPriority[];

export const TASK_PRIORITY_LABEL: Record<KitchenTaskPriority, string> = {
  CRITICAL: "Critical",
  URGENT: "Urgent",
  HIGH: "High",
  NORMAL: "Normal",
  MEDIUM: "Medium",
  LOW: "Low",
};

export function isTaskPriority(v: unknown): v is KitchenTaskPriority {
  return typeof v === "string" && (TASK_PRIORITY_VALUES as readonly string[]).includes(v);
}

export const TASK_SOURCE_VALUES = [
  "MANUAL",
  "PRODUCTION",
  "PACKING",
  "ROUTE",
  "PLAYBOOK",
  "ALERT",
  "IMPLEMENTATION",
  "STORE_FRONT",
  "SALES_CHANNEL",
  "PURCHASING",
  "CUSTOMER",
  "CATERING_QUOTE",
  "CALENDAR_EVENT",
] as const satisfies readonly KitchenTaskSource[];

export const TASK_SOURCE_LABEL: Record<KitchenTaskSource, string> = {
  MANUAL: "Manual",
  PRODUCTION: "Production",
  PACKING: "Packing",
  ROUTE: "Routes",
  PLAYBOOK: "Playbook",
  ALERT: "Alert",
  IMPLEMENTATION: "Implementation",
  STORE_FRONT: "Storefront",
  SALES_CHANNEL: "Sales channel",
  PURCHASING: "Purchasing",
  CUSTOMER: "Customer",
  CATERING_QUOTE: "Catering quote",
  CALENDAR_EVENT: "Calendar",
};

export function isTaskSource(v: unknown): v is KitchenTaskSource {
  return typeof v === "string" && (TASK_SOURCE_VALUES as readonly string[]).includes(v);
}

/** Map a task source to a deep-link target. Always returns a string href even when sourceId is null. */
export function hrefForTaskSource(
  source: KitchenTaskSource,
  sourceId: string | null,
): string {
  switch (source) {
    case "PRODUCTION":
      return "/dashboard/production";
    case "PACKING":
      return "/dashboard/packing";
    case "ROUTE":
      return sourceId ? `/dashboard/routes/${sourceId}` : "/dashboard/routes";
    case "PURCHASING":
      return "/dashboard/purchasing";
    case "CUSTOMER":
      return "/dashboard/customers";
    case "CATERING_QUOTE":
      return "/dashboard/catering";
    case "STORE_FRONT":
      return "/dashboard/storefront";
    case "SALES_CHANNEL":
      return "/dashboard/integrations";
    case "ALERT":
      return "/dashboard/alerts";
    case "IMPLEMENTATION":
      return "/dashboard/implementation";
    case "PLAYBOOK":
      return "/dashboard/playbooks";
    case "CALENDAR_EVENT":
      return "/dashboard/calendar";
    case "MANUAL":
    default:
      return "/dashboard/tasks";
  }
}

/** Per-business header copy + default task type for "New task". */
export function tasksTerminologyForMode(business: BusinessType | null | undefined): {
  title: string;
  subtitle: string;
  defaultType: KitchenTaskType;
} {
  switch (business) {
    case "RESTAURANT":
      return {
        title: "Staff tasks",
        subtitle: "Prep, opening / closing, cleaning, and admin work — everything that has to happen around service.",
        defaultType: "PREP",
      };
    case "CAFE":
      return {
        title: "Prep & staff tasks",
        subtitle: "Morning prep, pickup orders, baked-goods queues, and supplier reminders.",
        defaultType: "CAFE_PREP",
      };
    case "BAR":
      return {
        title: "Bar tasks",
        subtitle: "Garnish prep, station stock, event setup, and closing checklists.",
        defaultType: "BAR_PREP",
      };
    case "BAKERY":
      return {
        title: "Batch & staff tasks",
        subtitle: "Batch prep, proofing, pickup prep, and allergen label checks.",
        defaultType: "BAKERY_BATCH",
      };
    case "CATERING":
      return {
        title: "Event tasks",
        subtitle: "Event prep, client follow-up, loadout, and delivery/setup work.",
        defaultType: "CATERING",
      };
    case "MEAL_PREP":
      return {
        title: "Prep & packing tasks",
        subtitle: "Menu publish, prep, cook, pack, and route prep — generated from playbooks, production, and packing.",
        defaultType: "PREP",
      };
    case "GHOST_KITCHEN":
    case "CLOUD_KITCHEN":
    case "MULTI_BRAND":
      return {
        title: "Operations tasks",
        subtitle: "Brand production, channel sync follow-ups, packing, and delivery handoff.",
        defaultType: "PREP",
      };
    case "OTHER":
    case null:
    case undefined:
    default:
      return {
        title: "Staff tasks",
        subtitle: "Lightweight ops checklist that grows with the workspace — Kanban, calendar, recurring tasks, and integrations.",
        defaultType: "PREP",
      };
  }
}

export const TASK_STATUS_TODO_LIKE: readonly KitchenTaskStatus[] = ["OPEN", "TODO"];
export const TASK_STATUS_TERMINAL: readonly KitchenTaskStatus[] = ["DONE", "CANCELLED"];
