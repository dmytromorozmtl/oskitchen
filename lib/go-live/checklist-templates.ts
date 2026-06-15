import type { BusinessType, GoLiveBlockerSeverity, GoLiveLaunchStage } from "@prisma/client";

export type ChecklistTemplate = {
  key: string;
  title: string;
  description: string;
  stage: GoLiveLaunchStage;
  category: string;
  required: boolean;
  autoValidated: boolean;
  weight: number;
  blockerSeverity?: GoLiveBlockerSeverity;
  actionRoute?: string;
  /** Limit to these business types only (if absent, included for all). */
  businessTypes?: BusinessType[];
};

export const CORE_CHECKLIST: ChecklistTemplate[] = [
  { key: "business_profile", title: "Business profile", description: "Confirm business name, type, contact details, and time zone.", stage: "DISCOVERY", category: "operations", required: true, autoValidated: true, weight: 3, blockerSeverity: "CRITICAL", actionRoute: "/dashboard/settings" },
  { key: "fulfillment_rules", title: "Fulfillment rules", description: "Pickup windows, delivery zones, and lead times defined.", stage: "DISCOVERY", category: "operations", required: true, autoValidated: true, weight: 2, blockerSeverity: "HIGH_RISK", actionRoute: "/dashboard/storefront" },
  { key: "support_contact", title: "Support contact confirmed", description: "Customer support contact is documented for the first 7 days.", stage: "DISCOVERY", category: "operations", required: false, autoValidated: false, weight: 1, actionRoute: "/help" },

  { key: "data_migration_plan", title: "Data migration plan", description: "Decide which historical data to bring in via Import Center.", stage: "DATA_MIGRATION", category: "operations", required: false, autoValidated: false, weight: 1, actionRoute: "/dashboard/import-center" },
  { key: "customers_imported", title: "Customers imported", description: "Customer base imported with no duplicates flagged.", stage: "DATA_MIGRATION", category: "crm", required: false, autoValidated: true, weight: 1, actionRoute: "/dashboard/import-center" },

  { key: "menu_setup", title: "Menu set up", description: "Active menu with at least one published product.", stage: "CATALOG_SETUP", category: "catalog", required: true, autoValidated: true, weight: 4, blockerSeverity: "CRITICAL", actionRoute: "/dashboard/menus" },
  { key: "products_present", title: "Products created", description: "All sale items live in the catalog.", stage: "CATALOG_SETUP", category: "catalog", required: true, autoValidated: true, weight: 4, blockerSeverity: "CRITICAL", actionRoute: "/dashboard/products" },
  { key: "product_mapping", title: "External products mapped", description: "All external SKUs from connected channels are mapped.", stage: "CATALOG_SETUP", category: "mapping", required: false, autoValidated: true, weight: 3, blockerSeverity: "CRITICAL", actionRoute: "/dashboard/product-mapping/unmapped" },
  { key: "storefront_published", title: "Storefront published", description: "Custom domain + SSL confirmed; storefront accepts orders.", stage: "CATALOG_SETUP", category: "storefront", required: false, autoValidated: true, weight: 2, actionRoute: "/dashboard/storefront" },

  { key: "channels_connected", title: "Sales channels connected", description: "At least one external channel configured.", stage: "CHANNEL_INTEGRATIONS", category: "integrations", required: false, autoValidated: true, weight: 2, actionRoute: "/dashboard/sales-channels" },
  { key: "webhooks_healthy", title: "Webhooks healthy", description: "Webhook endpoints respond and signatures verify.", stage: "CHANNEL_INTEGRATIONS", category: "integrations", required: false, autoValidated: true, weight: 2, blockerSeverity: "HIGH_RISK", actionRoute: "/dashboard/sales-channels" },

  { key: "test_order", title: "Test order created", description: "An end-to-end test order has been completed in OS Kitchen.", stage: "PRODUCTION_VALIDATION", category: "kitchen", required: true, autoValidated: true, weight: 3, blockerSeverity: "CRITICAL", actionRoute: "/dashboard/orders/new" },
  { key: "production_runs", title: "Production sheet verified", description: "A production batch has been processed without errors.", stage: "PRODUCTION_VALIDATION", category: "production", required: true, autoValidated: true, weight: 4, blockerSeverity: "CRITICAL", actionRoute: "/dashboard/production" },

  { key: "packing_validated", title: "Packing labels tested", description: "Packing verification ran successfully.", stage: "PACKING_VALIDATION", category: "packing", required: false, autoValidated: true, weight: 3, blockerSeverity: "HIGH_RISK", actionRoute: "/dashboard/packing" },
  { key: "labels_printed", title: "Labels printed", description: "Label printing tested for at least one product.", stage: "PACKING_VALIDATION", category: "packing", required: false, autoValidated: true, weight: 2, actionRoute: "/dashboard/packing" },

  { key: "delivery_routes", title: "Delivery routes prepared", description: "Routes / drivers configured for the first day.", stage: "DELIVERY_VALIDATION", category: "routes", required: false, autoValidated: true, weight: 2, actionRoute: "/dashboard/delivery" },

  { key: "staff_active", title: "Staff active", description: "Staff accounts exist with assigned roles.", stage: "STAFF_TRAINING", category: "staffing", required: true, autoValidated: true, weight: 3, blockerSeverity: "CRITICAL", actionRoute: "/dashboard/staff" },
  { key: "staff_trained", title: "Staff trained", description: "Training completions recorded for the first cohort.", stage: "STAFF_TRAINING", category: "staffing", required: false, autoValidated: true, weight: 2, actionRoute: "/dashboard/training" },

  { key: "billing_configured", title: "Billing configured", description: "Stripe customer and at least one payment method.", stage: "FINANCIAL_VALIDATION", category: "billing", required: true, autoValidated: true, weight: 4, blockerSeverity: "CRITICAL", actionRoute: "/dashboard/billing" },
  { key: "analytics_firing", title: "Analytics events firing", description: "Storefront and OS Kitchen analytics produce events.", stage: "FINANCIAL_VALIDATION", category: "analytics", required: false, autoValidated: true, weight: 1, blockerSeverity: "HIGH_RISK", actionRoute: "/dashboard/analytics" },
  { key: "backup_export", title: "Backup / export reviewed", description: "Workspace export downloaded and stored safely.", stage: "FINANCIAL_VALIDATION", category: "operations", required: false, autoValidated: false, weight: 1, actionRoute: "/dashboard/import-export" },

  { key: "lunch_rush_sim", title: "Lunch rush simulation passed", description: "Lunch rush simulation completed with PASSED or WARNING.", stage: "SIMULATION", category: "kitchen", required: false, autoValidated: false, weight: 2, actionRoute: "/dashboard/go-live/simulations" },

  { key: "soft_launch_window", title: "Soft launch window scheduled", description: "Decide who gets access during the soft launch.", stage: "SOFT_LAUNCH", category: "operations", required: false, autoValidated: false, weight: 1 },

  { key: "ownership_approval", title: "Ownership sign-off", description: "Owner / ED signs the launch.", stage: "FULL_GO_LIVE", category: "ownership", required: true, autoValidated: false, weight: 3, blockerSeverity: "CRITICAL", actionRoute: "/dashboard/go-live/approvals" },
  { key: "post_launch_monitoring_setup", title: "Post-launch monitoring set up", description: "Owner and on-call assigned for 7 days post-launch.", stage: "POST_LAUNCH_MONITORING", category: "operations", required: false, autoValidated: false, weight: 1, actionRoute: "/dashboard/go-live/monitoring" },
];

export const BUSINESS_TYPE_EXTRAS: Partial<Record<BusinessType, ChecklistTemplate[]>> = {
  MEAL_PREP: [
    { key: "meal_prep_routes", title: "Weekly route plan", description: "Weekly delivery route prepared and assigned to drivers.", stage: "DELIVERY_VALIDATION", category: "routes", required: true, autoValidated: false, weight: 2, blockerSeverity: "HIGH_RISK", actionRoute: "/dashboard/delivery" },
    { key: "nutrition_labels", title: "Nutrition labels confirmed", description: "Nutrition + allergen labels validated for each product.", stage: "PACKING_VALIDATION", category: "packing", required: false, autoValidated: false, weight: 2, actionRoute: "/dashboard/products" },
  ],
  CATERING: [
    { key: "catering_quote_pipeline", title: "Catering quote pipeline", description: "Catering quote-to-order flow tested.", stage: "PRODUCTION_VALIDATION", category: "kitchen", required: false, autoValidated: false, weight: 2, actionRoute: "/dashboard/catering" },
  ],
  GHOST_KITCHEN: [
    { key: "multi_brand_sync", title: "Multi-brand catalog sync", description: "All brands have working catalog sync.", stage: "CHANNEL_INTEGRATIONS", category: "integrations", required: true, autoValidated: false, weight: 3, blockerSeverity: "HIGH_RISK", actionRoute: "/dashboard/sales-channels" },
  ],
  BAKERY: [
    { key: "preorder_windows", title: "Preorder windows configured", description: "Preorder windows align with prep capacity.", stage: "DISCOVERY", category: "operations", required: false, autoValidated: false, weight: 1 },
  ],
  CAFE: [
    { key: "morning_rush_sim", title: "Morning rush simulation", description: "Run a morning rush simulation before launch.", stage: "SIMULATION", category: "kitchen", required: false, autoValidated: false, weight: 1, actionRoute: "/dashboard/go-live/simulations" },
  ],
};

export function templatesFor(businessType: BusinessType | null): ChecklistTemplate[] {
  const extras = businessType ? BUSINESS_TYPE_EXTRAS[businessType] ?? [] : [];
  return [...CORE_CHECKLIST, ...extras];
}
