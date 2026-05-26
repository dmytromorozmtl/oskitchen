import type { ModuleRegistryEntry } from "@/lib/modules/module-registry";

/** Canonical sidebar / IA buckets (aligned with product nav). */
export type ModuleNavGroupId =
  | "Today"
  | "Orders & Sales"
  | "Menus"
  | "Kitchen"
  | "Inventory & Cost"
  | "Fulfillment"
  | "Customers & Events"
  | "Insights"
  | "Setup & Rollout"
  | "Admin"
  | "Internal";

const CATEGORY_MAP: Record<ModuleRegistryEntry["category"], ModuleNavGroupId> = {
  today: "Today",
  orders: "Orders & Sales",
  menu: "Menus",
  kitchen: "Kitchen",
  inventory: "Inventory & Cost",
  fulfillment: "Fulfillment",
  customers: "Customers & Events",
  insights: "Insights",
  ops: "Setup & Rollout",
  admin: "Admin",
  internal: "Internal",
};

export function moduleNavGroup(entry: ModuleRegistryEntry): ModuleNavGroupId {
  return CATEGORY_MAP[entry.category];
}

export function modulePublicMeta(entry: ModuleRegistryEntry) {
  return {
    key: entry.key,
    canonicalLabel: entry.label,
    shortDescription: entry.description,
    longDescription: entry.description,
    route: entry.pathPrefixes[0]!,
    navGroup: moduleNavGroup(entry),
    internalOnly: entry.internalOnly,
    superAdminOnly: entry.superAdminOnly,
    beta: entry.isBeta,
    placeholder: entry.isPlaceholder,
    requiredPlan: entry.requiredPlan,
    requiredFeature: entry.requiredFeature,
  };
}
