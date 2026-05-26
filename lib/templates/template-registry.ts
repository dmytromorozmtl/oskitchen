import type { WorkspaceTemplateSeed } from "@/lib/templates/template-types";

/**
 * Workspace template registry. These are the canonical descriptions
 * of every system template. `services/templates/template-service.ts`
 * upserts them into the `workspace_templates` table on first read so
 * applications can reliably FK to a `templateKey`.
 *
 * The legacy list at `lib/business-templates.ts` is kept intact for
 * backward compatibility with landing pages.
 */
export const WORKSPACE_TEMPLATE_REGISTRY: WorkspaceTemplateSeed[] = [
  {
    key: "restaurant-starter",
    title: "Restaurant starter",
    description:
      "Service-first orders, prep, costing, and integrations for table-service restaurants.",
    category: "WORKSPACE_STARTER",
    businessModes: ["RESTAURANT"],
    primaryBusinessMode: "RESTAURANT",
    version: "1",
    demoSlug: "restaurant",
    setupTimeMinutes: 8,
    whatItConfigures: [
      "Sets business mode to Restaurant (if not already set)",
      "Pins Orders, Menus, Production, Tasks, Costing, Analytics",
      "Seeds Restaurant Daily Prep and Café-style opening playbooks",
      "Creates 5 setup tasks (menu, integrations, costing, staff, go-live)",
    ],
    whatItDoesNot: [
      "Does not create real orders or customers",
      "Does not change pricing or tax settings",
      "Does not modify any module that is already disabled",
    ],
    warnings: [
      "If a business mode is already set, you must explicitly allow overwrite.",
    ],
    sections: {
      modulePins: [
        { moduleKey: "orders", pinned: true },
        { moduleKey: "menus", pinned: true },
        { moduleKey: "production", pinned: true },
        { moduleKey: "tasks", pinned: true },
        { moduleKey: "purchasing", pinned: true },
        { moduleKey: "costing", pinned: true },
        { moduleKey: "analytics", pinned: true },
      ],
      playbookSlugs: ["restaurant-daily-prep"],
      setupTasks: [
        { title: "Add your menu items", actionRoute: "/dashboard/products", priority: "HIGH" },
        { title: "Connect a sales channel", actionRoute: "/dashboard/sales-channels", priority: "MEDIUM" },
        { title: "Set base costing assumptions", actionRoute: "/dashboard/costing", priority: "MEDIUM" },
        { title: "Invite kitchen staff", actionRoute: "/dashboard/staff", priority: "MEDIUM" },
        { title: "Run the Restaurant Daily Prep playbook", actionRoute: "/dashboard/playbooks", priority: "LOW" },
      ],
      sampleMenuCategories: ["Appetizers", "Mains", "Sides", "Desserts", "Drinks"],
    },
  },
  {
    key: "cafe-starter",
    title: "Café starter",
    description: "Specials, retail pickup, CRM, and light production for coffee-first cafés.",
    category: "WORKSPACE_STARTER",
    businessModes: ["CAFE"],
    primaryBusinessMode: "CAFE",
    version: "1",
    demoSlug: "cafe",
    setupTimeMinutes: 7,
    whatItConfigures: [
      "Sets business mode to Café (if not already set)",
      "Pins Menus, Storefront, Production, Tasks, Purchasing, CRM",
      "Seeds Café Morning Setup playbook",
      "Creates 5 setup tasks",
    ],
    whatItDoesNot: [
      "Does not create real orders or customers",
      "Does not change brand colors or domain",
    ],
    warnings: [],
    sections: {
      modulePins: [
        { moduleKey: "menus", pinned: true },
        { moduleKey: "storefront", pinned: true },
        { moduleKey: "production", pinned: true },
        { moduleKey: "tasks", pinned: true },
        { moduleKey: "purchasing", pinned: true },
        { moduleKey: "customers", pinned: true },
      ],
      playbookSlugs: ["cafe-morning-setup"],
      setupTasks: [
        { title: "Publish today's specials", actionRoute: "/dashboard/menus", priority: "HIGH" },
        { title: "Connect online pickup channel", actionRoute: "/dashboard/sales-channels", priority: "MEDIUM" },
        { title: "Stock par sheet — milk, syrups, cups", actionRoute: "/dashboard/purchasing", priority: "MEDIUM" },
        { title: "Set up CRM for loyalty notes", actionRoute: "/dashboard/customers", priority: "LOW" },
        { title: "Walk through Café Morning Setup", actionRoute: "/dashboard/playbooks", priority: "LOW" },
      ],
      sampleMenuCategories: ["Coffee", "Tea", "Pastries", "Sandwiches", "Specials"],
    },
  },
  {
    key: "bar-starter",
    title: "Bar starter",
    description: "Drinks menu, events, costing, and staff tasks for bars and lounges.",
    category: "WORKSPACE_STARTER",
    businessModes: ["BAR"],
    primaryBusinessMode: "BAR",
    version: "1",
    demoSlug: "bar",
    setupTimeMinutes: 7,
    whatItConfigures: [
      "Sets business mode to Bar",
      "Pins Menus, Catering quotes, Costing, Tasks, Calendar",
      "Seeds Bar Event Night playbook",
      "Creates 5 setup tasks",
    ],
    whatItDoesNot: [
      "Does not make legal/compliance claims (responsible service stays your responsibility)",
    ],
    warnings: [],
    sections: {
      modulePins: [
        { moduleKey: "menus", pinned: true },
        { moduleKey: "catering-quotes", pinned: true },
        { moduleKey: "costing", pinned: true },
        { moduleKey: "tasks", pinned: true },
        { moduleKey: "calendar", pinned: true },
      ],
      playbookSlugs: ["bar-event-night"],
      setupTasks: [
        { title: "Build your drinks menu", actionRoute: "/dashboard/menus", priority: "HIGH" },
        { title: "Add private booking templates", actionRoute: "/dashboard/catering-quotes", priority: "MEDIUM" },
        { title: "Set ice/garnish par sheet", actionRoute: "/dashboard/purchasing", priority: "MEDIUM" },
        { title: "Calendar private events", actionRoute: "/dashboard/calendar", priority: "LOW" },
        { title: "Walk through Bar Event Night", actionRoute: "/dashboard/playbooks", priority: "LOW" },
      ],
      sampleMenuCategories: ["Cocktails", "Beer", "Wine", "Non-Alcoholic", "Happy Hour"],
    },
  },
  {
    key: "bakery-starter",
    title: "Bakery starter",
    description: "Preorder windows, batch production, labels, routes for bakeries.",
    category: "WORKSPACE_STARTER",
    businessModes: ["BAKERY"],
    primaryBusinessMode: "BAKERY",
    version: "1",
    demoSlug: "bakery",
    setupTimeMinutes: 9,
    whatItConfigures: [
      "Sets business mode to Bakery",
      "Pins Menus, Storefront, Production, Packing, Labels, Routes",
      "Seeds Bakery Preorder Day playbook",
      "Creates 5 setup tasks",
    ],
    whatItDoesNot: [
      "Does not auto-generate nutrition labels (run them from the Labels module)",
    ],
    warnings: [],
    sections: {
      modulePins: [
        { moduleKey: "menus", pinned: true },
        { moduleKey: "storefront", pinned: true },
        { moduleKey: "production", pinned: true },
        { moduleKey: "packing", pinned: true },
        { moduleKey: "nutrition-labels", pinned: true },
        { moduleKey: "routes", pinned: true },
      ],
      playbookSlugs: ["bakery-preorder-day"],
      setupTasks: [
        { title: "Define preorder windows", actionRoute: "/dashboard/menus", priority: "HIGH" },
        { title: "Build batch production templates", actionRoute: "/dashboard/production", priority: "MEDIUM" },
        { title: "Print allergen/nutrition labels", actionRoute: "/dashboard/nutrition-labels", priority: "MEDIUM" },
        { title: "Set pickup slots / routes", actionRoute: "/dashboard/routes", priority: "MEDIUM" },
        { title: "Walk through Bakery Preorder Day", actionRoute: "/dashboard/playbooks", priority: "LOW" },
      ],
      sampleMenuCategories: ["Bread", "Pastries", "Cakes", "Cookies", "Custom Orders"],
    },
  },
  {
    key: "catering-starter",
    title: "Catering starter",
    description: "Quotes, calendar, production, logistics for event-driven kitchens.",
    category: "WORKSPACE_STARTER",
    businessModes: ["CATERING"],
    primaryBusinessMode: "CATERING",
    version: "1",
    demoSlug: "catering",
    setupTimeMinutes: 10,
    whatItConfigures: [
      "Sets business mode to Catering",
      "Pins Catering quotes, CRM, Calendar, Production, Packing, Routes, Reports",
      "Seeds Catering Event Workflow playbook",
      "Creates 5 setup tasks",
    ],
    whatItDoesNot: [
      "Does not create live quotes or customer records",
    ],
    warnings: [],
    sections: {
      modulePins: [
        { moduleKey: "catering-quotes", pinned: true },
        { moduleKey: "customers", pinned: true },
        { moduleKey: "calendar", pinned: true },
        { moduleKey: "production", pinned: true },
        { moduleKey: "packing", pinned: true },
        { moduleKey: "routes", pinned: true },
        { moduleKey: "reports", pinned: true },
      ],
      playbookSlugs: ["catering-event-workflow"],
      setupTasks: [
        { title: "Build menu packages (Corporate / Buffet / Boxed)", actionRoute: "/dashboard/menus", priority: "HIGH" },
        { title: "Set quote terms and deposit rules", actionRoute: "/dashboard/catering-quotes", priority: "MEDIUM" },
        { title: "Import or invite first customers", actionRoute: "/dashboard/customers", priority: "MEDIUM" },
        { title: "Open the event calendar", actionRoute: "/dashboard/calendar", priority: "LOW" },
        { title: "Walk through Catering Event Workflow", actionRoute: "/dashboard/playbooks", priority: "LOW" },
      ],
      sampleMenuCategories: ["Corporate Lunch", "Buffet", "Boxed Meals", "Beverages", "Add-ons"],
    },
  },
  {
    key: "meal-prep-starter",
    title: "Meal prep starter",
    description: "Weekly menus, packing, nutrition labels, routes for meal-prep kitchens.",
    category: "WORKSPACE_STARTER",
    businessModes: ["MEAL_PREP"],
    primaryBusinessMode: "MEAL_PREP",
    version: "1",
    demoSlug: "meal-prep",
    setupTimeMinutes: 10,
    whatItConfigures: [
      "Sets business mode to Meal prep",
      "Pins Menus, Meal plans, Production, Packing, Labels, Routes, CRM",
      "Seeds Meal Prep Weekly Cycle playbook",
      "Creates 5 setup tasks",
    ],
    whatItDoesNot: [
      "Does not enroll real subscribers or charge anyone",
    ],
    warnings: [],
    sections: {
      modulePins: [
        { moduleKey: "menus", pinned: true },
        { moduleKey: "meal-plans", pinned: true },
        { moduleKey: "production", pinned: true },
        { moduleKey: "packing", pinned: true },
        { moduleKey: "nutrition-labels", pinned: true },
        { moduleKey: "routes", pinned: true },
        { moduleKey: "customers", pinned: true },
      ],
      playbookSlugs: ["meal-prep-weekly-cycle"],
      setupTasks: [
        { title: "Define weekly menu cutoff", actionRoute: "/dashboard/menus", priority: "HIGH" },
        { title: "Build meal plan packages", actionRoute: "/dashboard/meal-plans", priority: "MEDIUM" },
        { title: "Set packing verify defaults", actionRoute: "/dashboard/packing/verify", priority: "MEDIUM" },
        { title: "Plan first route", actionRoute: "/dashboard/routes", priority: "MEDIUM" },
        { title: "Walk through Meal Prep Weekly Cycle", actionRoute: "/dashboard/playbooks", priority: "LOW" },
      ],
      sampleMenuCategories: ["Meals", "Bowls", "Salads", "Soups", "Snacks"],
    },
  },
  {
    key: "ghost-kitchen-starter",
    title: "Ghost kitchen starter",
    description: "Brands, order hub, integrations, analytics for delivery-only ops.",
    category: "WORKSPACE_STARTER",
    businessModes: ["GHOST_KITCHEN", "CLOUD_KITCHEN", "MULTI_BRAND"],
    primaryBusinessMode: "GHOST_KITCHEN",
    version: "1",
    demoSlug: "ghost-kitchen",
    setupTimeMinutes: 12,
    whatItConfigures: [
      "Sets business mode to Ghost kitchen",
      "Pins Brands, Order hub, Sales channels, Production, Packing verify, Analytics",
      "Seeds Ghost Kitchen Rush playbook",
      "Creates 6 setup tasks",
    ],
    whatItDoesNot: [
      "Does not connect any aggregator on your behalf",
    ],
    warnings: [
      "Recommended only after at least one Brand exists.",
    ],
    sections: {
      modulePins: [
        { moduleKey: "brands", pinned: true },
        { moduleKey: "order-hub", pinned: true },
        { moduleKey: "sales-channels", pinned: true },
        { moduleKey: "production", pinned: true },
        { moduleKey: "packing-verify", pinned: true },
        { moduleKey: "analytics", pinned: true },
      ],
      playbookSlugs: ["ghost-kitchen-rush"],
      setupTasks: [
        { title: "Create your first brand", actionRoute: "/dashboard/brands", priority: "HIGH" },
        { title: "Connect aggregator channels", actionRoute: "/dashboard/sales-channels", priority: "HIGH" },
        { title: "Map products to channel SKUs", actionRoute: "/dashboard/products", priority: "MEDIUM" },
        { title: "Set packing verify SLA", actionRoute: "/dashboard/packing/verify", priority: "MEDIUM" },
        { title: "Review integration health", actionRoute: "/dashboard/integrations", priority: "MEDIUM" },
        { title: "Walk through Ghost Kitchen Rush", actionRoute: "/dashboard/playbooks", priority: "LOW" },
      ],
      sampleMenuCategories: ["Burgers", "Bowls", "Sides", "Drinks", "Combos"],
    },
  },
];

export function findTemplateByKey(key: string): WorkspaceTemplateSeed | undefined {
  return WORKSPACE_TEMPLATE_REGISTRY.find((t) => t.key === key);
}

export function templatesForBusinessMode(
  mode: string | null | undefined,
): WorkspaceTemplateSeed[] {
  if (!mode) return WORKSPACE_TEMPLATE_REGISTRY;
  return WORKSPACE_TEMPLATE_REGISTRY.filter((t) =>
    t.businessModes.includes(mode as never),
  );
}
