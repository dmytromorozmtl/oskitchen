/** Canonical usage / growth telemetry event names (subset — extend as product evolves). */
export const GROWTH_USAGE_EVENTS = {
  PAGE_VIEW: "page_view",
  MODULE_OPEN: "module_open",
  FIRST_MENU: "first_menu_created",
  FIRST_ORDER: "first_order_created",
  FIRST_PRODUCTION: "first_production_completed",
  FIRST_PACKING: "first_packing_exported",
  FIRST_INTEGRATION: "first_integration_connected",
  STOREFRONT_PUBLISH: "storefront_published",
} as const;

export const GROWTH_LIFECYCLE_STAGES = [
  "VISITOR",
  "LEAD",
  "MQL",
  "SQL",
  "DEMO_SCHEDULED",
  "TRIAL_STARTED",
  "ACTIVATED",
  "PAYING",
  "EXPANSION",
  "AT_RISK",
  "CHURNED",
] as const;

export type GrowthLifecycleStage = (typeof GROWTH_LIFECYCLE_STAGES)[number];
