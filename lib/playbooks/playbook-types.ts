import type { BusinessType, PlaybookType, PlaybookTriggerType } from "@prisma/client";

import type { PermissionKey } from "@/lib/permissions/permissions";

export type PlaybookCapability =
  | "playbooks.view"
  | "playbooks.run"
  | "playbooks.complete_step"
  | "playbooks.block_step"
  | "playbooks.generate_tasks"
  | "playbooks.create_custom"
  | "playbooks.edit"
  | "playbooks.archive"
  | "playbooks.read.reports";

export type PlaybookActorScope = {
  isOwner: boolean;
  role?: string | null;
  email?: string | null;
  granted?: ReadonlySet<PermissionKey>;
};

export type PlaybookModuleKey =
  | "today"
  | "orders"
  | "order_hub"
  | "menus"
  | "menu_planner"
  | "production"
  | "kitchen_screen"
  | "packing"
  | "packing_verify"
  | "routes"
  | "tasks"
  | "ingredient_demand"
  | "purchasing"
  | "costing"
  | "catering_quotes"
  | "customers"
  | "meal_plans"
  | "sales_channels"
  | "integrations"
  | "reports"
  | "labels"
  | "calendar"
  | "brands"
  | "locations";

export type PlaybookStepSeed = {
  title: string;
  description?: string;
  recommendedRole?: string;
  moduleKey?: PlaybookModuleKey;
  actionRoute?: string;
  estimatedMinutes?: number;
  required?: boolean;
  checklist?: string[];
  taskTemplate?: {
    title?: string;
    description?: string;
    priority?: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
    estimatedMinutes?: number;
  };
};

export type PlaybookTemplateSeed = {
  slug: string;
  title: string;
  description: string;
  type: PlaybookType;
  businessModes: BusinessType[];
  recommendedModules: PlaybookModuleKey[];
  defaultRoles: string[];
  triggerType: PlaybookTriggerType;
  recurrenceRule?: string;
  steps: PlaybookStepSeed[];
};
