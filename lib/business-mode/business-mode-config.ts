import type { BusinessType } from "@prisma/client";

import { getBusinessModeExperience } from "@/lib/business-mode-registry";
import type { ModuleKey } from "@/lib/modules/module-registry";

/**
 * Strategic / marketing modes from audits may not match Prisma `BusinessType` 1:1.
 * Use aliases instead of widening the DB enum without a migration.
 */
export const STRATEGIC_BUSINESS_MODE_ALIASES = {
  /** Treat commissary operators like cloud-kitchen throughput until a dedicated enum exists. */
  COMMISSARY: "CLOUD_KITCHEN",
  /** Manual-first intake — maps to generic OTHER with copy tuned in docs. */
  MANUAL_ONLY: "OTHER",
} as const satisfies Record<string, BusinessType>;

export type StrategicBusinessModeAlias = keyof typeof STRATEGIC_BUSINESS_MODE_ALIASES;

export function resolveStrategicBusinessMode(input: string | null | undefined): BusinessType {
  const s = String(input ?? "").trim().toUpperCase();
  if (s in STRATEGIC_BUSINESS_MODE_ALIASES) {
    return STRATEGIC_BUSINESS_MODE_ALIASES[s as StrategicBusinessModeAlias];
  }
  const allowed: BusinessType[] = [
    "MEAL_PREP",
    "CATERING",
    "GHOST_KITCHEN",
    "CLOUD_KITCHEN",
    "MULTI_BRAND",
    "BAKERY",
    "RESTAURANT",
    "CAFE",
    "BAR",
    "OTHER",
  ];
  if (allowed.includes(s as BusinessType)) return s as BusinessType;
  return "MEAL_PREP";
}

export type BusinessModeModulePlan = {
  businessType: BusinessType;
  recommended: readonly ModuleKey[];
  optional: readonly ModuleKey[];
  hiddenByDefault: readonly ModuleKey[];
  setupSteps: readonly string[];
  primaryKpis: readonly string[];
  defaultOrderTypes: readonly string[];
};

export function getBusinessModeModulePlan(businessType: BusinessType | null | undefined): BusinessModeModulePlan {
  const exp = getBusinessModeExperience(businessType);
  const mode = exp.businessModeKey;
  const setupSteps =
    mode === "MEAL_PREP"
      ? (["Publish weekly menu", "Enable storefront or import channel", "Configure packing labels & routes"] as const)
      : mode === "CAFE" || mode === "RESTAURANT"
        ? (["Configure POS registers", "Publish menu", "Connect kitchen screen"] as const)
        : mode === "CATERING"
          ? (["Catering quote templates", "Event calendar", "Production + loadout checklist"] as const)
          : mode === "GHOST_KITCHEN" || mode === "CLOUD_KITCHEN" || mode === "MULTI_BRAND"
            ? (["Brands & catalogs", "Sales channels + mapping", "Order hub triage"] as const)
            : (["Menus", "Orders", "Fulfillment defaults"] as const);

  const primaryKpis =
    mode === "MEAL_PREP"
      ? (["Cutoff adherence", "Pack completion", "Route on-time", "Unmapped SKUs"] as const)
      : mode === "GHOST_KITCHEN" || mode === "MULTI_BRAND"
        ? (["Channel errors", "Brand mix", "Prep backlog", "Webhook failures"] as const)
        : (["Orders today", "POS throughput", "Kitchen backlog", "Delivery SLA"] as const);

  const defaultOrderTypes =
    mode === "MEAL_PREP"
      ? (["Preorder", "Subscription cycle", "Manual"] as const)
      : mode === "BAKERY"
        ? (["Preorder pickup", "POS walk-in"] as const)
        : mode === "CATERING"
          ? (["Quote → event order", "Manual"] as const)
          : (["POS sale", "Manual", "Storefront"] as const);

  return {
    businessType: mode,
    recommended: exp.defaultModuleKeys,
    optional: exp.recommendedModuleKeys,
    hiddenByDefault: exp.hiddenByDefaultModuleKeys,
    setupSteps,
    primaryKpis,
    defaultOrderTypes,
  };
}
