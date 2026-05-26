import type {
  BusinessType,
  GoLiveReadinessStatus,
  ImplementationChecklistPriority,
  ImplementationChecklistStatus,
  ImplementationPhaseKey,
  ImplementationPhaseStatus,
  ImplementationStatus,
} from "@prisma/client";

export type ImplementationActorScope = {
  isOwner: boolean;
  role?: string | null;
  email?: string | null;
};

export type ImplementationCapability =
  | "implementation.view"
  | "implementation.create"
  | "implementation.edit"
  | "implementation.assign"
  | "implementation.complete_checklist"
  | "implementation.generate_tasks"
  | "implementation.run_readiness"
  | "implementation.go_live"
  | "implementation.reports";

export type ImplementationModuleKey =
  | "storefront"
  | "orders"
  | "menus"
  | "production"
  | "packing"
  | "routes"
  | "crm"
  | "purchasing"
  | "analytics"
  | "costing"
  | "catering"
  | "meal_plans"
  | "integrations"
  | "import_center"
  | "training"
  | "reports";

export type ImplementationDataset =
  | "customers"
  | "orders"
  | "menu_items"
  | "ingredients"
  | "recipes"
  | "suppliers"
  | "nutrition"
  | "product_mappings"
  | "brands"
  | "locations";

export type ImplementationIntegrationKey =
  | "shopify"
  | "woocommerce"
  | "uber_eats"
  | "uber_direct"
  | "storefront_native"
  | "webhooks"
  | "email";

export type ImplementationSystem =
  | "shopify"
  | "woocommerce"
  | "spreadsheets"
  | "pos"
  | "manual"
  | "doordash"
  | "uber"
  | "other";

export type FulfillmentType = "pickup" | "delivery" | "shipping" | "dinein" | "catering" | "meal_prep";

export type ChecklistSeed = {
  title: string;
  description?: string;
  phaseKey: ImplementationPhaseKey;
  priority: ImplementationChecklistPriority;
  moduleKey?: ImplementationModuleKey;
  actionRoute?: string;
  requiredForGoLive?: boolean;
};

export type ChecklistTemplateSeed = {
  key: string;
  label: string;
  businessTypes: BusinessType[];
  items: ChecklistSeed[];
};

export type ReadinessCategory =
  | "workspace_setup"
  | "business_mode"
  | "locations"
  | "brands"
  | "menus_items"
  | "storefront"
  | "orders"
  | "production"
  | "packing"
  | "routes"
  | "sales_channels"
  | "imports"
  | "staff"
  | "training"
  | "reports"
  | "billing_settings";

export type ReadinessCheckResult = {
  category: ReadinessCategory;
  title: string;
  required: boolean;
  status: GoLiveReadinessStatus;
  explanation: string;
  actionRoute?: string;
  resultJson?: Record<string, unknown>;
};

export type ReadinessSnapshot = {
  score: number;
  band: "blocked" | "needs_work" | "ready";
  blockers: string[];
  warnings: string[];
  checkedAt: string;
  checks: ReadinessCheckResult[];
};

export type ImplementationProjectSummary = {
  id: string;
  businessName: string;
  businessType: string | null;
  status: ImplementationStatus;
  assignedOwner: string | null;
  targetGoLiveDate: Date | null;
  readinessScore: number | null;
  blockerCount: number;
  tasksCompleted: number;
  tasksTotal: number;
};

export type ImplementationCheckListItemView = {
  id: string;
  title: string;
  description: string | null;
  status: ImplementationChecklistStatus;
  priority: ImplementationChecklistPriority;
  moduleKey: string | null;
  actionRoute: string | null;
  requiredForGoLive: boolean;
  blockerReason: string | null;
  assignedToId: string | null;
  dueAt: Date | null;
  taskId: string | null;
  phaseKey: ImplementationPhaseKey | null;
  completedAt: Date | null;
};

export type ImplementationPhaseView = {
  id: string;
  key: ImplementationPhaseKey;
  name: string;
  status: ImplementationPhaseStatus;
  sortOrder: number;
  dueDate: Date | null;
  completedAt: Date | null;
  notes: string | null;
};

export const PHASE_DEFINITIONS: Array<{
  key: ImplementationPhaseKey;
  name: string;
  sortOrder: number;
}> = [
  { key: "DISCOVERY", name: "Discovery", sortOrder: 1 },
  { key: "WORKSPACE_SETUP", name: "Workspace setup", sortOrder: 2 },
  { key: "DATA_MIGRATION", name: "Data migration", sortOrder: 3 },
  { key: "INTEGRATIONS", name: "Integrations", sortOrder: 4 },
  { key: "STOREFRONT_SETUP", name: "Storefront setup", sortOrder: 5 },
  { key: "OPERATIONS_SETUP", name: "Operations setup", sortOrder: 6 },
  { key: "TRAINING", name: "Training", sortOrder: 7 },
  { key: "UAT", name: "UAT / Testing", sortOrder: 8 },
  { key: "GO_LIVE", name: "Go-live", sortOrder: 9 },
  { key: "POST_LAUNCH", name: "Post-launch support", sortOrder: 10 },
];

export const READINESS_CATEGORY_LABEL: Record<ReadinessCategory, string> = {
  workspace_setup: "Workspace setup",
  business_mode: "Business mode",
  locations: "Locations",
  brands: "Brands",
  menus_items: "Menus / items",
  storefront: "Storefront",
  orders: "Orders",
  production: "Production",
  packing: "Packing",
  routes: "Routes",
  sales_channels: "Sales channels",
  imports: "Imports",
  staff: "Staff",
  training: "Training",
  reports: "Reports",
  billing_settings: "Billing & settings",
};

export const READINESS_BAND_LABEL: Record<ReadinessSnapshot["band"], string> = {
  blocked: "Blocked",
  needs_work: "Needs work",
  ready: "Ready",
};

export const IMPLEMENTATION_MODULES: Array<{
  key: ImplementationModuleKey;
  label: string;
}> = [
  { key: "storefront", label: "Storefront" },
  { key: "orders", label: "Orders" },
  { key: "menus", label: "Menus" },
  { key: "production", label: "Production" },
  { key: "packing", label: "Packing" },
  { key: "routes", label: "Routes" },
  { key: "crm", label: "CRM" },
  { key: "purchasing", label: "Purchasing" },
  { key: "analytics", label: "Analytics" },
  { key: "costing", label: "Costing" },
  { key: "catering", label: "Catering" },
  { key: "meal_plans", label: "Meal Plans" },
];

export const IMPLEMENTATION_DATASETS: Array<{
  key: ImplementationDataset;
  label: string;
  importType?: string;
  templateRoute?: string;
}> = [
  { key: "customers", label: "Customers", importType: "CUSTOMERS", templateRoute: "/dashboard/import-center" },
  { key: "orders", label: "Orders", importType: "ORDERS", templateRoute: "/dashboard/import-center" },
  { key: "menu_items", label: "Menu items", importType: "PRODUCTS", templateRoute: "/dashboard/import-center" },
  { key: "ingredients", label: "Ingredients", importType: "INGREDIENTS", templateRoute: "/dashboard/import-center" },
  { key: "recipes", label: "Recipes", templateRoute: "/dashboard/recipes" },
  { key: "suppliers", label: "Suppliers", templateRoute: "/dashboard/purchasing" },
  { key: "nutrition", label: "Nutrition / allergens", templateRoute: "/dashboard/nutrition" },
  { key: "product_mappings", label: "Product mappings", templateRoute: "/dashboard/product-mapping" },
  { key: "brands", label: "Brands", templateRoute: "/dashboard/brands" },
  { key: "locations", label: "Locations", templateRoute: "/dashboard/locations" },
];

export const IMPLEMENTATION_INTEGRATIONS: Array<{
  key: ImplementationIntegrationKey;
  label: string;
  provider?: string;
  setupRoute: string;
  placeholder?: boolean;
}> = [
  { key: "shopify", label: "Shopify", provider: "SHOPIFY", setupRoute: "/dashboard/integrations" },
  { key: "woocommerce", label: "WooCommerce", provider: "WOOCOMMERCE", setupRoute: "/dashboard/integrations" },
  { key: "uber_eats", label: "Uber Eats", setupRoute: "/dashboard/integrations", placeholder: true },
  { key: "uber_direct", label: "Uber Direct", setupRoute: "/dashboard/integrations", placeholder: true },
  { key: "storefront_native", label: "KitchenOS Storefront", setupRoute: "/dashboard/storefront" },
  { key: "webhooks", label: "Webhooks", setupRoute: "/dashboard/integrations" },
  {
    key: "email",
    label: "Email / notifications",
    setupRoute: "/dashboard/notifications/settings",
  },
];

export const FULFILLMENT_TYPES: Array<{ key: FulfillmentType; label: string }> = [
  { key: "pickup", label: "Pickup" },
  { key: "delivery", label: "Local delivery" },
  { key: "shipping", label: "Shipping" },
  { key: "dinein", label: "Dine-in" },
  { key: "catering", label: "Catering / events" },
  { key: "meal_prep", label: "Meal prep / subscriptions" },
];

export const CURRENT_SYSTEMS: Array<{ key: ImplementationSystem; label: string }> = [
  { key: "shopify", label: "Shopify" },
  { key: "woocommerce", label: "WooCommerce" },
  { key: "spreadsheets", label: "Spreadsheets" },
  { key: "pos", label: "POS" },
  { key: "manual", label: "Manual" },
  { key: "doordash", label: "DoorDash" },
  { key: "uber", label: "Uber Eats" },
  { key: "other", label: "Other" },
];

export type UATScenario = {
  key: string;
  title: string;
  description: string;
  module: ImplementationModuleKey;
  actionRoute?: string;
};

export const UAT_SCENARIOS: UATScenario[] = [
  { key: "create_order", title: "Create order", description: "Create a manual order from CRM and confirm it appears on the Orders board.", module: "orders", actionRoute: "/dashboard/orders" },
  { key: "import_order", title: "Import order", description: "Run a sample order import in the Import Center.", module: "orders", actionRoute: "/dashboard/import-center" },
  { key: "publish_menu", title: "Publish menu", description: "Publish a menu and verify it appears on the storefront.", module: "menus", actionRoute: "/dashboard/menus" },
  { key: "production_workflow", title: "Production workflow", description: "Run a production day end-to-end with at least one task.", module: "production", actionRoute: "/dashboard/production" },
  { key: "packing_verify", title: "Packing verify", description: "Print a label, scan it, and confirm the packing flow completes.", module: "packing", actionRoute: "/dashboard/packing" },
  { key: "route_delivery", title: "Route delivery", description: "Build a delivery route and confirm it dispatches.", module: "routes", actionRoute: "/dashboard/routes" },
  { key: "storefront_preorder", title: "Storefront preorder", description: "Place a preorder on the storefront with pickup windows.", module: "storefront", actionRoute: "/dashboard/storefront" },
  { key: "catering_quote", title: "Catering quote", description: "Convert a catering quote into a confirmed event.", module: "catering", actionRoute: "/dashboard/catering" },
  { key: "meal_plan_draft", title: "Meal plan draft order", description: "Generate a meal plan draft order.", module: "meal_plans", actionRoute: "/dashboard/meal-plans" },
  { key: "report_export", title: "Report export", description: "Export a CSV report from the Reporting Center.", module: "reports", actionRoute: "/dashboard/reports" },
];

export type TrainingTrack = {
  role: string;
  label: string;
  modules: ImplementationModuleKey[];
};

export const TRAINING_TRACKS: TrainingTrack[] = [
  { role: "owner_admin", label: "Owner / admin", modules: ["orders", "menus", "analytics", "reports"] },
  { role: "manager", label: "Manager", modules: ["orders", "production", "packing", "reports"] },
  { role: "kitchen_lead", label: "Kitchen lead", modules: ["production", "menus"] },
  { role: "packer", label: "Packer", modules: ["packing"] },
  { role: "driver", label: "Driver", modules: ["routes"] },
  { role: "customer_service", label: "Customer service", modules: ["crm", "orders"] },
  { role: "purchasing", label: "Purchasing", modules: ["purchasing"] },
  { role: "sales_catering", label: "Sales / catering", modules: ["catering", "crm"] },
];
