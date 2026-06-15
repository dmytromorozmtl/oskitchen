import type { StaffRoleType, UserRole } from "@prisma/client";

import { hasPermission } from "@/lib/permissions/guards";
import type { PermissionKey } from "@/lib/permissions/permissions";

export type OperatorHomePersona = "owner" | "manager" | "cashier" | "kitchen";

export type OperatorHomeAction = {
  id: string;
  label: string;
  description: string;
  href: string;
  requiredPermission?: PermissionKey;
  primary?: boolean;
};

export const OPERATOR_HOME_PERSONA_LABEL: Record<Exclude<OperatorHomePersona, "owner">, string> = {
  cashier: "Cashier",
  kitchen: "Kitchen",
  manager: "Manager",
};

export const OPERATOR_HOME_PERSONA_HEADLINE: Record<Exclude<OperatorHomePersona, "owner">, string> = {
  cashier: "Start a sale — everything else is one tap away.",
  kitchen: "Tickets and production — stay on the line.",
  manager: "Run the shift — ops, POS, and exceptions in one place.",
};

const KITCHEN_STAFF_ROLES = new Set<StaffRoleType>([
  "KITCHEN_LEAD",
  "PREP_COOK",
  "LINE_COOK",
  "PACKER",
]);

const OPERATOR_HOME_ACTION_CATALOG: Record<
  Exclude<OperatorHomePersona, "owner">,
  readonly OperatorHomeAction[]
> = {
  cashier: [
    {
      id: "pos-terminal",
      label: "POS Terminal",
      description: "Ring counter sales with large tap targets.",
      href: "/dashboard/pos/terminal",
      requiredPermission: "pos.access",
      primary: true,
    },
    {
      id: "pos-hub",
      label: "POS hub",
      description: "Transactions, receipts, and registers.",
      href: "/dashboard/pos",
      requiredPermission: "pos.access",
    },
    {
      id: "orders",
      label: "Orders",
      description: "Look up and update open orders.",
      href: "/dashboard/orders",
      requiredPermission: "orders.manage",
    },
    {
      id: "today",
      label: "Today",
      description: "See what needs attention right now.",
      href: "/dashboard/today",
    },
  ],
  kitchen: [
    {
      id: "kds",
      label: "Kitchen display",
      description: "Bump, recall, and station filters.",
      href: "/dashboard/kitchen",
      requiredPermission: "kitchen.view",
      primary: true,
    },
    {
      id: "kds-tablet",
      label: "KDS tablet",
      description: "Fullscreen line-friendly ticket view.",
      href: "/dashboard/kitchen/tablet",
      requiredPermission: "kitchen.view",
    },
    {
      id: "production",
      label: "Production",
      description: "Prep board and production runs.",
      href: "/dashboard/production",
      requiredPermission: "production.manage",
    },
    {
      id: "order-hub",
      label: "Order hub",
      description: "Cross-channel queue and stuck orders.",
      href: "/dashboard/order-hub",
      requiredPermission: "orders.manage",
    },
    {
      id: "packing",
      label: "Packing",
      description: "Fulfillment checklist and waves.",
      href: "/dashboard/packing",
      requiredPermission: "packing.manage",
    },
  ],
  manager: [
    {
      id: "integration-health",
      label: "Integration health",
      description: "Channel sync status, last errors, and webhook backlog.",
      href: "/dashboard/integration-health",
    },
    {
      id: "today",
      label: "Today",
      description: "Operational command center for the shift.",
      href: "/dashboard/today",
      primary: true,
    },
    {
      id: "pos",
      label: "POS",
      description: "Terminal, shifts, discounts, and receipts.",
      href: "/dashboard/pos",
      requiredPermission: "pos.access",
    },
    {
      id: "orders",
      label: "Orders",
      description: "Lifecycle, exceptions, and manual orders.",
      href: "/dashboard/orders",
      requiredPermission: "orders.manage",
    },
    {
      id: "production",
      label: "Production",
      description: "Calendar, board, and prep planning.",
      href: "/dashboard/production",
      requiredPermission: "production.manage",
    },
    {
      id: "reports",
      label: "Reports",
      description: "Shift summaries and operational exports.",
      href: "/dashboard/reports",
    },
    {
      id: "staff",
      label: "Staff",
      description: "Roles, invites, and schedules.",
      href: "/dashboard/staff",
      requiredPermission: "staff.manage",
    },
  ],
};

export function resolveOperatorHomePersona(input: {
  workspaceRole: UserRole;
  staffRoleType: StaffRoleType | null;
  granted: ReadonlySet<PermissionKey>;
  platformBypass: boolean;
}): OperatorHomePersona {
  if (input.platformBypass || input.workspaceRole === "OWNER") {
    return "owner";
  }

  const staff = input.staffRoleType;
  if (staff === "MANAGER") return "manager";
  if (staff && KITCHEN_STAFF_ROLES.has(staff)) return "kitchen";
  if (staff === "CUSTOMER_SERVICE" || staff === "CATERING_COORDINATOR") {
    return hasPosCheckoutAccess(input.granted) ? "cashier" : "manager";
  }

  const kitchenFirst =
    hasKitchenAccess(input.granted) && !hasPosCheckoutAccess(input.granted);
  if (kitchenFirst) return "kitchen";

  if (hasManagerSignals(input.granted)) return "manager";
  if (hasPosCheckoutAccess(input.granted)) return "cashier";
  if (hasKitchenAccess(input.granted)) return "kitchen";

  return "manager";
}

function hasPosCheckoutAccess(granted: ReadonlySet<PermissionKey>): boolean {
  return hasPermission(granted, "pos.checkout") || hasPermission(granted, "pos.access");
}

function hasKitchenAccess(granted: ReadonlySet<PermissionKey>): boolean {
  return (
    hasPermission(granted, "kitchen.view") ||
    hasPermission(granted, "kitchen.bump") ||
    hasPermission(granted, "production.manage")
  );
}

function hasManagerSignals(granted: ReadonlySet<PermissionKey>): boolean {
  return (
    hasPermission(granted, "pos.discount.apply") ||
    hasPermission(granted, "staff.manage") ||
    hasPermission(granted, "pos.shift.close")
  );
}

export function listOperatorHomeActions(
  persona: Exclude<OperatorHomePersona, "owner">,
  granted: ReadonlySet<PermissionKey>,
): OperatorHomeAction[] {
  return OPERATOR_HOME_ACTION_CATALOG[persona].filter(
    (action) => !action.requiredPermission || hasPermission(granted, action.requiredPermission),
  );
}

export function pickOperatorHomePrimaryAction(
  actions: readonly OperatorHomeAction[],
): OperatorHomeAction | null {
  return actions.find((action) => action.primary) ?? actions[0] ?? null;
}

/** Owner dashboard command center — unchanged from Era 17 role navigation. */
export const OWNER_DEFAULT_LANDING_PATH = "/dashboard/today" as const;

/** Staff hub when persona primary is unavailable (permissions). */
export const OPERATOR_HOME_HUB_PATH = "/dashboard" as const;

/** Resolve post-login landing from Era 18 persona + RBAC-filtered primary action. */
export function resolveOperatorDefaultLandingPath(input: {
  persona: OperatorHomePersona;
  granted: ReadonlySet<PermissionKey>;
}): string {
  if (input.persona === "owner") {
    return OWNER_DEFAULT_LANDING_PATH;
  }

  const actions = listOperatorHomeActions(input.persona, input.granted);
  const primary = pickOperatorHomePrimaryAction(actions);
  return primary?.href ?? OPERATOR_HOME_HUB_PATH;
}
