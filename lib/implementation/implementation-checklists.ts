import type { BusinessType } from "@prisma/client";

import type {
  ChecklistSeed,
  ChecklistTemplateSeed,
} from "@/lib/implementation/implementation-types";

const SHARED_DISCOVERY: ChecklistSeed[] = [
  {
    title: "Run discovery call",
    description: "Confirm business model, current tools, volumes, and target go-live window.",
    phaseKey: "DISCOVERY",
    priority: "HIGH",
    requiredForGoLive: true,
  },
  {
    title: "Document business profile",
    description: "Capture brand count, locations, fulfillment types, weekly volume.",
    phaseKey: "DISCOVERY",
    priority: "MEDIUM",
    requiredForGoLive: false,
  },
];

const SHARED_WORKSPACE: ChecklistSeed[] = [
  {
    title: "Confirm business mode",
    description: "Lock the workspace business mode under Settings → Business mode.",
    phaseKey: "WORKSPACE_SETUP",
    priority: "HIGH",
    moduleKey: "menus",
    actionRoute: "/dashboard/settings",
    requiredForGoLive: true,
  },
  {
    title: "Configure locations",
    description: "Add every kitchen / pickup site under Locations.",
    phaseKey: "WORKSPACE_SETUP",
    priority: "MEDIUM",
    moduleKey: "menus",
    actionRoute: "/dashboard/locations",
    requiredForGoLive: false,
  },
];

const SHARED_MIGRATION: ChecklistSeed[] = [
  {
    title: "Plan data migration scope",
    description: "Decide which datasets to import (customers, menu items, ingredients...).",
    phaseKey: "DATA_MIGRATION",
    priority: "HIGH",
    moduleKey: "import_center",
    actionRoute: "/dashboard/import-center",
    requiredForGoLive: true,
  },
  {
    title: "Validate sample CSVs",
    description: "Upload sample CSVs through the Import Center and resolve row errors.",
    phaseKey: "DATA_MIGRATION",
    priority: "HIGH",
    moduleKey: "import_center",
    actionRoute: "/dashboard/import-center",
    requiredForGoLive: true,
  },
];

const SHARED_INTEGRATIONS: ChecklistSeed[] = [
  {
    title: "Connect sales channels",
    description: "Set up the integrations the business uses today (Shopify, WooCommerce, etc.).",
    phaseKey: "INTEGRATIONS",
    priority: "HIGH",
    moduleKey: "integrations",
    actionRoute: "/dashboard/integrations",
    requiredForGoLive: false,
  },
];

const SHARED_TRAINING: ChecklistSeed[] = [
  {
    title: "Schedule role-based training",
    description: "Plan training for owners, managers, kitchen, packing, drivers.",
    phaseKey: "TRAINING",
    priority: "MEDIUM",
    moduleKey: "training",
    actionRoute: "/dashboard/training",
    requiredForGoLive: true,
  },
];

const SHARED_UAT: ChecklistSeed[] = [
  {
    title: "Run UAT scenarios",
    description: "Walk through the UAT scenarios with the customer.",
    phaseKey: "UAT",
    priority: "HIGH",
    requiredForGoLive: true,
  },
];

const SHARED_GO_LIVE: ChecklistSeed[] = [
  {
    title: "Confirm go-live date and owner",
    description: "Lock launch date / time, primary owner, and escalation contact.",
    phaseKey: "GO_LIVE",
    priority: "CRITICAL",
    requiredForGoLive: true,
  },
  {
    title: "Run go-live readiness check",
    description: "Trigger the readiness engine and address all required failures.",
    phaseKey: "GO_LIVE",
    priority: "CRITICAL",
    actionRoute: "/dashboard/go-live",
    requiredForGoLive: true,
  },
];

const SHARED_POST_LAUNCH: ChecklistSeed[] = [
  {
    title: "Schedule post-launch review",
    description: "Plan a 7-day and 30-day review with the customer.",
    phaseKey: "POST_LAUNCH",
    priority: "MEDIUM",
    requiredForGoLive: false,
  },
];

function withShared(extra: ChecklistSeed[]): ChecklistSeed[] {
  return [
    ...SHARED_DISCOVERY,
    ...SHARED_WORKSPACE,
    ...SHARED_MIGRATION,
    ...extra,
    ...SHARED_INTEGRATIONS,
    ...SHARED_TRAINING,
    ...SHARED_UAT,
    ...SHARED_GO_LIVE,
    ...SHARED_POST_LAUNCH,
  ];
}

export const CHECKLIST_TEMPLATES: ChecklistTemplateSeed[] = [
  {
    key: "restaurant",
    label: "Restaurant",
    businessTypes: ["RESTAURANT"],
    items: withShared([
      { title: "Configure menu items", description: "Build the restaurant menu in KitchenOS.", phaseKey: "OPERATIONS_SETUP", priority: "HIGH", moduleKey: "menus", actionRoute: "/dashboard/menus", requiredForGoLive: true },
      { title: "Set up orders", description: "Configure ordering channels and order types.", phaseKey: "OPERATIONS_SETUP", priority: "HIGH", moduleKey: "orders", actionRoute: "/dashboard/orders", requiredForGoLive: true },
      { title: "Set up production", description: "Confirm production board defaults.", phaseKey: "OPERATIONS_SETUP", priority: "MEDIUM", moduleKey: "production", actionRoute: "/dashboard/production" },
      { title: "Set up staff", description: "Invite staff and assign roles.", phaseKey: "OPERATIONS_SETUP", priority: "MEDIUM", moduleKey: "training", actionRoute: "/dashboard/staff", requiredForGoLive: true },
      { title: "Test pickup / delivery", description: "Run end-to-end test orders for pickup and delivery.", phaseKey: "UAT", priority: "HIGH" },
    ]),
  },
  {
    key: "cafe",
    label: "Café",
    businessTypes: ["CAFE"],
    items: withShared([
      { title: "Configure daily specials", description: "Define recurring daily specials.", phaseKey: "OPERATIONS_SETUP", priority: "MEDIUM", moduleKey: "menus", actionRoute: "/dashboard/menus" },
      { title: "Configure pickup settings", description: "Set pickup windows, prep time, and locations.", phaseKey: "OPERATIONS_SETUP", priority: "HIGH", moduleKey: "storefront", actionRoute: "/dashboard/storefront", requiredForGoLive: true },
      { title: "Production checklist", description: "Daily production checklist for café staff.", phaseKey: "OPERATIONS_SETUP", priority: "MEDIUM", moduleKey: "production" },
      { title: "Staff tasks", description: "Set up recurring staff tasks.", phaseKey: "OPERATIONS_SETUP", priority: "LOW", moduleKey: "training" },
    ]),
  },
  {
    key: "bar",
    label: "Bar",
    businessTypes: ["BAR"],
    items: withShared([
      { title: "Configure drinks menu", description: "Build the drinks menu in KitchenOS.", phaseKey: "OPERATIONS_SETUP", priority: "HIGH", moduleKey: "menus", actionRoute: "/dashboard/menus", requiredForGoLive: true },
      { title: "Event workflow", description: "Configure private event / catering workflow.", phaseKey: "OPERATIONS_SETUP", priority: "MEDIUM", moduleKey: "catering", actionRoute: "/dashboard/catering" },
      { title: "Staff tasks", description: "Set up recurring bar staff tasks.", phaseKey: "OPERATIONS_SETUP", priority: "LOW", moduleKey: "training" },
    ]),
  },
  {
    key: "bakery",
    label: "Bakery",
    businessTypes: ["BAKERY"],
    items: withShared([
      { title: "Configure preorder storefront", description: "Set preorder windows and cutoffs.", phaseKey: "STOREFRONT_SETUP", priority: "HIGH", moduleKey: "storefront", actionRoute: "/dashboard/storefront", requiredForGoLive: true },
      { title: "Batch production", description: "Configure batch production for daily bake.", phaseKey: "OPERATIONS_SETUP", priority: "HIGH", moduleKey: "production", actionRoute: "/dashboard/production", requiredForGoLive: true },
      { title: "Configure labels", description: "Set up nutrition / allergen labels.", phaseKey: "OPERATIONS_SETUP", priority: "MEDIUM", moduleKey: "packing", actionRoute: "/dashboard/nutrition" },
      { title: "Pickup windows", description: "Confirm pickup windows and locations.", phaseKey: "STOREFRONT_SETUP", priority: "MEDIUM", moduleKey: "storefront", actionRoute: "/dashboard/storefront" },
    ]),
  },
  {
    key: "catering",
    label: "Catering",
    businessTypes: ["CATERING"],
    items: withShared([
      { title: "Configure quote workflow", description: "Configure catering quote workflow and approval.", phaseKey: "OPERATIONS_SETUP", priority: "HIGH", moduleKey: "catering", actionRoute: "/dashboard/catering", requiredForGoLive: true },
      { title: "Set up CRM", description: "Set up CRM for repeat catering customers.", phaseKey: "OPERATIONS_SETUP", priority: "HIGH", moduleKey: "crm", actionRoute: "/dashboard/crm", requiredForGoLive: true },
      { title: "Production / loadout", description: "Configure production day and loadout checklist.", phaseKey: "OPERATIONS_SETUP", priority: "HIGH", moduleKey: "production", actionRoute: "/dashboard/production" },
      { title: "Routes", description: "Configure delivery / loadout routes.", phaseKey: "OPERATIONS_SETUP", priority: "MEDIUM", moduleKey: "routes", actionRoute: "/dashboard/routes" },
    ]),
  },
  {
    key: "meal_prep",
    label: "Meal Prep",
    businessTypes: ["MEAL_PREP"],
    items: withShared([
      { title: "Configure weekly menus", description: "Set up weekly meal menus.", phaseKey: "OPERATIONS_SETUP", priority: "HIGH", moduleKey: "menus", actionRoute: "/dashboard/menus", requiredForGoLive: true },
      { title: "Nutrition labels", description: "Configure nutrition / allergen labels.", phaseKey: "OPERATIONS_SETUP", priority: "HIGH", moduleKey: "packing", actionRoute: "/dashboard/nutrition", requiredForGoLive: true },
      { title: "Packing verify", description: "Test packing verification flow.", phaseKey: "UAT", priority: "HIGH", moduleKey: "packing", actionRoute: "/dashboard/packing" },
      { title: "Routes", description: "Configure delivery routes.", phaseKey: "OPERATIONS_SETUP", priority: "MEDIUM", moduleKey: "routes", actionRoute: "/dashboard/routes" },
      { title: "Meal plans", description: "Set up subscription meal plans.", phaseKey: "OPERATIONS_SETUP", priority: "HIGH", moduleKey: "meal_plans", actionRoute: "/dashboard/meal-plans" },
    ]),
  },
  {
    key: "ghost_kitchen",
    label: "Ghost Kitchen",
    businessTypes: ["GHOST_KITCHEN", "MULTI_BRAND"],
    items: withShared([
      { title: "Configure brands", description: "Configure every virtual brand.", phaseKey: "OPERATIONS_SETUP", priority: "HIGH", moduleKey: "menus", actionRoute: "/dashboard/brands", requiredForGoLive: true },
      { title: "Sales channels", description: "Connect every active sales channel.", phaseKey: "INTEGRATIONS", priority: "HIGH", moduleKey: "integrations", actionRoute: "/dashboard/integrations", requiredForGoLive: true },
      { title: "Order hub", description: "Confirm the unified order hub.", phaseKey: "OPERATIONS_SETUP", priority: "HIGH", moduleKey: "orders", actionRoute: "/dashboard/orders" },
      { title: "Product mapping", description: "Resolve product mappings across sales channels.", phaseKey: "DATA_MIGRATION", priority: "HIGH", moduleKey: "import_center", actionRoute: "/dashboard/product-mapping", requiredForGoLive: true },
      { title: "Packing verify", description: "Confirm packing flow for multi-brand kitchen.", phaseKey: "UAT", priority: "HIGH", moduleKey: "packing", actionRoute: "/dashboard/packing" },
    ]),
  },
];

export function checklistTemplateFor(businessType: BusinessType | null | undefined): ChecklistTemplateSeed {
  if (!businessType) return CHECKLIST_TEMPLATES[0];
  const direct = CHECKLIST_TEMPLATES.find((tpl) => tpl.businessTypes.includes(businessType));
  if (direct) return direct;
  return CHECKLIST_TEMPLATES[0];
}
