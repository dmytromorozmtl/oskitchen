import type { CopilotSourceDefinition, CopilotSourceKey } from "@/lib/ai/copilot-types";

/**
 * Registry of data sources the copilot may *summarise*. The copilot
 * never touches raw rows from these sources without going through the
 * `services/ai/copilot-context-service`, which enforces row caps and
 * redaction levels from this registry.
 */
export const COPILOT_SOURCE_REGISTRY: Record<CopilotSourceKey, CopilotSourceDefinition> = {
  orders: {
    key: "orders",
    label: "Orders",
    description: "Active orders, statuses, totals, and channel attribution.",
    allowedRoles: ["owner", "manager", "admin", "accountant", "sales", "kitchen_lead"],
    piiLevel: "MEDIUM",
    maxRows: 50,
    recommendedRedaction: "PII_REDACTED",
  },
  channels: {
    key: "channels",
    label: "Sales channels",
    description: "Integration connections (Shopify, Square, etc.) and their auth status.",
    allowedRoles: ["owner", "manager", "admin"],
    piiLevel: "LOW",
    maxRows: 25,
    recommendedRedaction: "OPERATIONAL_SUMMARY",
  },
  webhooks: {
    key: "webhooks",
    label: "Webhook health",
    description: "Recent webhook attempts, retries, and failures.",
    allowedRoles: ["owner", "manager", "admin"],
    piiLevel: "LOW",
    maxRows: 25,
    recommendedRedaction: "OPERATIONAL_SUMMARY",
  },
  production: {
    key: "production",
    label: "Production",
    description: "Production batches and item completion in the window.",
    allowedRoles: ["owner", "manager", "admin", "kitchen_lead", "kitchen"],
    piiLevel: "NONE",
    maxRows: 50,
    recommendedRedaction: "OPERATIONAL_SUMMARY",
  },
  kitchen: {
    key: "kitchen",
    label: "Kitchen screen",
    description: "Open / overdue kitchen tasks.",
    allowedRoles: ["owner", "manager", "admin", "kitchen_lead", "kitchen"],
    piiLevel: "NONE",
    maxRows: 100,
    recommendedRedaction: "OPERATIONAL_SUMMARY",
  },
  packing: {
    key: "packing",
    label: "Packing",
    description: "Packing batches, packed-vs-total items, exceptions.",
    allowedRoles: ["owner", "manager", "admin", "kitchen_lead", "packer", "packing"],
    piiLevel: "NONE",
    maxRows: 50,
    recommendedRedaction: "OPERATIONAL_SUMMARY",
  },
  packing_verification: {
    key: "packing_verification",
    label: "Packing verification",
    description: "Scan events flagged as exceptions.",
    allowedRoles: ["owner", "manager", "admin", "kitchen_lead", "packer", "packing"],
    piiLevel: "NONE",
    maxRows: 50,
    recommendedRedaction: "OPERATIONAL_SUMMARY",
  },
  routes: {
    key: "routes",
    label: "Routes & stops",
    description: "Delivery routes, stops, and FAILED stop counts.",
    allowedRoles: ["owner", "manager", "admin", "driver", "dispatcher"],
    piiLevel: "MEDIUM",
    maxRows: 50,
    staleDataWarning: "Driver app GPS is not used here — addresses come from the order record.",
    recommendedRedaction: "PII_REDACTED",
  },
  tasks: {
    key: "tasks",
    label: "Tasks",
    description: "Operational tasks across the platform.",
    allowedRoles: ["owner", "manager", "admin", "kitchen_lead", "kitchen", "sales"],
    piiLevel: "LOW",
    maxRows: 100,
    recommendedRedaction: "OPERATIONAL_SUMMARY",
  },
  customers: {
    key: "customers",
    label: "Customer CRM",
    description: "VIPs, at-risk customers, repeat / new counts.",
    allowedRoles: ["owner", "manager", "admin", "sales"],
    piiLevel: "HIGH",
    maxRows: 25,
    recommendedRedaction: "PII_REDACTED",
  },
  meal_plans: {
    key: "meal_plans",
    label: "Meal plans",
    description: "Active meal plans, cycles, recurring revenue estimate.",
    allowedRoles: ["owner", "manager", "admin", "sales"],
    piiLevel: "MEDIUM",
    maxRows: 50,
    recommendedRedaction: "PII_REDACTED",
  },
  catering: {
    key: "catering",
    label: "Catering quotes",
    description: "Quote pipeline, overdue follow-ups, accepted revenue.",
    allowedRoles: ["owner", "manager", "admin", "sales"],
    piiLevel: "MEDIUM",
    maxRows: 25,
    recommendedRedaction: "PII_REDACTED",
  },
  inventory_demand: {
    key: "inventory_demand",
    label: "Ingredient demand",
    description: "Open shortages, imminent shortages.",
    allowedRoles: ["owner", "manager", "admin", "kitchen_lead"],
    piiLevel: "NONE",
    maxRows: 50,
    recommendedRedaction: "OPERATIONAL_SUMMARY",
  },
  purchasing: {
    key: "purchasing",
    label: "Purchasing",
    description: "Open / draft / stale purchase orders.",
    allowedRoles: ["owner", "manager", "admin"],
    piiLevel: "LOW",
    maxRows: 25,
    recommendedRedaction: "OPERATIONAL_SUMMARY",
  },
  costing: {
    key: "costing",
    label: "Costing & margin",
    description: "Latest costing run, margin medians, items at risk.",
    allowedRoles: ["owner", "manager", "admin", "accountant"],
    piiLevel: "NONE",
    maxRows: 50,
    recommendedRedaction: "OPERATIONAL_SUMMARY",
  },
  analytics: {
    key: "analytics",
    label: "Analytics",
    description: "Window KPIs, channel mix, top products.",
    allowedRoles: ["owner", "manager", "admin", "accountant", "sales"],
    piiLevel: "LOW",
    maxRows: 50,
    recommendedRedaction: "OPERATIONAL_SUMMARY",
  },
  forecast: {
    key: "forecast",
    label: "Forecast",
    description: "Recent forecast runs and key notes.",
    allowedRoles: ["owner", "manager", "admin"],
    piiLevel: "NONE",
    maxRows: 25,
    recommendedRedaction: "OPERATIONAL_SUMMARY",
  },
  audit: {
    key: "audit",
    label: "Audit log",
    description: "Recent copilot audit events.",
    allowedRoles: ["owner", "manager", "admin"],
    piiLevel: "LOW",
    maxRows: 25,
    recommendedRedaction: "OPERATIONAL_SUMMARY",
  },
};

export const COPILOT_SOURCE_KEYS = Object.keys(COPILOT_SOURCE_REGISTRY) as CopilotSourceKey[];

export function isAllowedSourceForRole(key: CopilotSourceKey, role: string | null | undefined, isOwner: boolean): boolean {
  if (isOwner) return true;
  const def = COPILOT_SOURCE_REGISTRY[key];
  if (!def) return false;
  const r = (role ?? "").toLowerCase();
  return def.allowedRoles.includes("owner") && isOwner ? true : def.allowedRoles.includes(r);
}
