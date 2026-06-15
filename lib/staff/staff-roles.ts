import type { StaffRoleType } from "@prisma/client";

export type StaffArea =
  | "orders"
  | "production"
  | "kitchen_screen"
  | "packing"
  | "routes"
  | "tasks"
  | "crm"
  | "costing"
  | "analytics"
  | "billing"
  | "settings"
  | "staff"
  | "training";

export type StaffAreaPermission = "none" | "view" | "edit" | "admin";

export type StaffRoleDefinition = {
  key: StaffRoleType;
  label: string;
  description: string;
  permissions: Record<StaffArea, StaffAreaPermission>;
  systemRole: true;
};

const ALL_AREAS: StaffArea[] = [
  "orders", "production", "kitchen_screen", "packing", "routes", "tasks",
  "crm", "costing", "analytics", "billing", "settings", "staff", "training",
];

function fromOverrides(overrides: Partial<Record<StaffArea, StaffAreaPermission>>): Record<StaffArea, StaffAreaPermission> {
  const result = {} as Record<StaffArea, StaffAreaPermission>;
  for (const area of ALL_AREAS) {
    result[area] = overrides[area] ?? "none";
  }
  return result;
}

export const SYSTEM_ROLES: StaffRoleDefinition[] = [
  {
    key: "OWNER",
    label: "Owner / Admin",
    description: "Full workspace access.",
    systemRole: true,
    permissions: fromOverrides({
      orders: "admin", production: "admin", kitchen_screen: "admin",
      packing: "admin", routes: "admin", tasks: "admin", crm: "admin",
      costing: "admin", analytics: "admin", billing: "admin",
      settings: "admin", staff: "admin", training: "admin",
    }),
  },
  {
    key: "MANAGER",
    label: "Manager",
    description: "Day-to-day operations: orders, kitchen, packing, routes, tasks, training, staff.",
    systemRole: true,
    permissions: fromOverrides({
      orders: "edit", production: "edit", kitchen_screen: "edit",
      packing: "edit", routes: "edit", tasks: "edit", crm: "edit",
      costing: "view", analytics: "view", billing: "view",
      settings: "view", staff: "edit", training: "edit",
    }),
  },
  {
    key: "KITCHEN_LEAD",
    label: "Kitchen lead",
    description: "Production board, kitchen screen, packing handoff, kitchen tasks.",
    systemRole: true,
    permissions: fromOverrides({
      orders: "view", production: "edit", kitchen_screen: "edit",
      packing: "view", tasks: "edit", training: "view", staff: "view",
    }),
  },
  {
    key: "PREP_COOK",
    label: "Prep cook",
    description: "Production board view + own kitchen tasks.",
    systemRole: true,
    permissions: fromOverrides({
      production: "view", kitchen_screen: "view", tasks: "edit", training: "view",
    }),
  },
  {
    key: "LINE_COOK",
    label: "Line cook",
    description: "Kitchen screen + own kitchen tasks.",
    systemRole: true,
    permissions: fromOverrides({
      production: "view", kitchen_screen: "view", tasks: "edit", training: "view",
    }),
  },
  {
    key: "PACKER",
    label: "Packer",
    description: "Packing batches, verification, labels.",
    systemRole: true,
    permissions: fromOverrides({
      packing: "edit", tasks: "edit", training: "view",
    }),
  },
  {
    key: "DRIVER",
    label: "Driver",
    description: "Delivery routes assigned to the driver.",
    systemRole: true,
    permissions: fromOverrides({
      routes: "edit", tasks: "edit", training: "view",
    }),
  },
  {
    key: "CUSTOMER_SERVICE",
    label: "Customer service",
    description: "Orders, CRM, customer-facing tasks.",
    systemRole: true,
    permissions: fromOverrides({
      orders: "edit", crm: "edit", tasks: "edit", training: "view",
    }),
  },
  {
    key: "CATERING_COORDINATOR",
    label: "Catering coordinator",
    description: "Catering quotes, production, packing, routes.",
    systemRole: true,
    permissions: fromOverrides({
      orders: "edit", production: "edit", packing: "edit", routes: "edit",
      tasks: "edit", crm: "edit", training: "view",
    }),
  },
  {
    key: "PURCHASING",
    label: "Purchasing",
    description: "Costing, suppliers, inventory.",
    systemRole: true,
    permissions: fromOverrides({
      costing: "edit", tasks: "edit", training: "view",
    }),
  },
  {
    key: "INVENTORY",
    label: "Inventory",
    description: "Costing and inventory operations.",
    systemRole: true,
    permissions: fromOverrides({
      costing: "edit", tasks: "edit", training: "view",
    }),
  },
  {
    key: "ACCOUNTING",
    label: "Accounting",
    description: "Billing, analytics, costing.",
    systemRole: true,
    permissions: fromOverrides({
      billing: "edit", analytics: "view", costing: "view", training: "view",
    }),
  },
  {
    key: "MARKETING",
    label: "Marketing",
    description: "CRM, analytics, storefront content (read-only on operations).",
    systemRole: true,
    permissions: fromOverrides({
      crm: "edit", analytics: "view", training: "view",
    }),
  },
  {
    key: "VIEWER",
    label: "Viewer",
    description: "Read-only access to operations dashboards.",
    systemRole: true,
    permissions: fromOverrides({
      orders: "view", production: "view", kitchen_screen: "view",
      packing: "view", routes: "view", tasks: "view", crm: "view",
      analytics: "view", training: "view",
    }),
  },
  {
    key: "CUSTOM",
    label: "Custom",
    description: "Permissions defined via a custom role.",
    systemRole: true,
    permissions: fromOverrides({}),
  },
];

export const SYSTEM_ROLE_BY_KEY: Record<StaffRoleType, StaffRoleDefinition> = Object.fromEntries(
  SYSTEM_ROLES.map((r) => [r.key, r]),
) as Record<StaffRoleType, StaffRoleDefinition>;

export function canActOn(area: StaffArea, permission: StaffAreaPermission): "view" | "edit" | "admin" | null {
  if (permission === "none") return null;
  if (permission === "view") return "view";
  if (permission === "edit") return "edit";
  return "admin";
}
