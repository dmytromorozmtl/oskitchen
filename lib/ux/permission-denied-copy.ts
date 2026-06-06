/**
 * Standard permission-denied copy — Evolution Era 17 Workstream H Cycle 33.
 */

import type { PermissionKey } from "@/lib/permissions/permissions";

export type PermissionDeniedSurfaceId =
  | "pos_terminal"
  | "pos_tablet"
  | "pos_mobile"
  | "pos_hub"
  | "pos_layout"
  | "kds"
  | "order_hub"
  | "integration_health"
  | "reports_hub"
  | "inventory_operations"
  | "launch_wizard"
  | "implementation_hub"
  | "staff_hub"
  | "go_live_hub"
  | "crm_customers"
  | "billing_hub"
  | "copilot_hub"
  | "copilot_chat"
  | "copilot_audit"
  | "copilot_settings"
  | "packing_command"
  | "packing_verify"
  | "production_calendar"
  | "production_board"
  | "qr_codes"
  | "marketplace_hub"
  | "settings_workspace";

export type PermissionDeniedSurfaceDef = {
  id: PermissionDeniedSurfaceId;
  title: string;
  permissionKey: PermissionKey;
  primaryHref: string;
  primaryLabel: string;
  secondaryHref?: string;
  secondaryLabel?: string;
};

export const PERMISSION_DENIED_SURFACES: Record<
  PermissionDeniedSurfaceId,
  PermissionDeniedSurfaceDef
> = {
  pos_terminal: {
    id: "pos_terminal",
    title: "POS terminal",
    permissionKey: "pos.access",
    primaryHref: "/dashboard/pos",
    primaryLabel: "Back to POS hub",
  },
  pos_tablet: {
    id: "pos_tablet",
    title: "POS tablet",
    permissionKey: "pos.access",
    primaryHref: "/dashboard/pos",
    primaryLabel: "Back to POS hub",
  },
  pos_mobile: {
    id: "pos_mobile",
    title: "POS mobile",
    permissionKey: "pos.access",
    primaryHref: "/dashboard/pos",
    primaryLabel: "Back to POS hub",
  },
  pos_hub: {
    id: "pos_hub",
    title: "POS workspace",
    permissionKey: "pos.access",
    primaryHref: "/dashboard",
    primaryLabel: "Back to dashboard",
  },
  pos_layout: {
    id: "pos_layout",
    title: "POS workspace",
    permissionKey: "pos.access",
    primaryHref: "/dashboard/today",
    primaryLabel: "Back to Today",
  },
  kds: {
    id: "kds",
    title: "Kitchen display",
    permissionKey: "kitchen.view",
    primaryHref: "/dashboard/today",
    primaryLabel: "Back to Today",
  },
  order_hub: {
    id: "order_hub",
    title: "Order hub",
    permissionKey: "orders.manage",
    primaryHref: "/dashboard/today",
    primaryLabel: "Back to Today",
    secondaryHref: "/dashboard/kitchen",
    secondaryLabel: "Open kitchen",
  },
  integration_health: {
    id: "integration_health",
    title: "Integration health",
    permissionKey: "integrations.read",
    primaryHref: "/dashboard/today",
    primaryLabel: "Back to Today",
    secondaryHref: "/dashboard/sales-channels/connected",
    secondaryLabel: "Sales channels",
  },
  reports_hub: {
    id: "reports_hub",
    title: "Reports",
    permissionKey: "reports.read.operations",
    primaryHref: "/dashboard/today",
    primaryLabel: "Back to Today",
  },
  inventory_operations: {
    id: "inventory_operations",
    title: "Inventory",
    permissionKey: "production.manage",
    primaryHref: "/dashboard/today",
    primaryLabel: "Back to Today",
    secondaryHref: "/dashboard/production",
    secondaryLabel: "Open production",
  },
  launch_wizard: {
    id: "launch_wizard",
    title: "Launch wizard",
    permissionKey: "workspace.view",
    primaryHref: "/dashboard/today",
    primaryLabel: "Back to Today",
    secondaryHref: "/dashboard/implementation",
    secondaryLabel: "Implementation hub",
  },
  implementation_hub: {
    id: "implementation_hub",
    title: "Implementation",
    permissionKey: "workspace.view",
    primaryHref: "/dashboard/today",
    primaryLabel: "Back to Today",
    secondaryHref: "/dashboard/launch-wizard",
    secondaryLabel: "Launch wizard",
  },
  staff_hub: {
    id: "staff_hub",
    title: "Staff",
    permissionKey: "staff.manage",
    primaryHref: "/dashboard/today",
    primaryLabel: "Back to Today",
    secondaryHref: "/dashboard/training",
    secondaryLabel: "Training",
  },
  go_live_hub: {
    id: "go_live_hub",
    title: "Go-live",
    permissionKey: "workspace.view",
    primaryHref: "/dashboard/today",
    primaryLabel: "Back to Today",
    secondaryHref: "/dashboard/launch-wizard",
    secondaryLabel: "Launch wizard",
  },
  crm_customers: {
    id: "crm_customers",
    title: "Customers",
    permissionKey: "customers.read",
    primaryHref: "/dashboard/today",
    primaryLabel: "Back to Today",
    secondaryHref: "/dashboard/order-hub",
    secondaryLabel: "Order hub",
  },
  billing_hub: {
    id: "billing_hub",
    title: "Billing",
    permissionKey: "billing.view",
    primaryHref: "/dashboard/today",
    primaryLabel: "Back to Today",
    secondaryHref: "/dashboard/settings",
    secondaryLabel: "Settings",
  },
  copilot_hub: {
    id: "copilot_hub",
    title: "AI Operations Copilot",
    permissionKey: "workspace.view",
    primaryHref: "/dashboard/today",
    primaryLabel: "Back to Today",
    secondaryHref: "/dashboard/order-hub",
    secondaryLabel: "Order hub",
  },
  copilot_chat: {
    id: "copilot_chat",
    title: "Copilot chat",
    permissionKey: "workspace.view",
    primaryHref: "/dashboard/copilot",
    primaryLabel: "Back to copilot",
    secondaryHref: "/dashboard/today",
    secondaryLabel: "Back to Today",
  },
  copilot_audit: {
    id: "copilot_audit",
    title: "Copilot audit log",
    permissionKey: "workspace.view",
    primaryHref: "/dashboard/copilot",
    primaryLabel: "Back to copilot",
    secondaryHref: "/dashboard/today",
    secondaryLabel: "Back to Today",
  },
  copilot_settings: {
    id: "copilot_settings",
    title: "Copilot settings",
    permissionKey: "workspace.view",
    primaryHref: "/dashboard/copilot",
    primaryLabel: "Back to copilot",
    secondaryHref: "/dashboard/today",
    secondaryLabel: "Back to Today",
  },
  packing_command: {
    id: "packing_command",
    title: "Packing command center",
    permissionKey: "packing.manage",
    primaryHref: "/dashboard/today",
    primaryLabel: "Back to Today",
    secondaryHref: "/dashboard/kitchen",
    secondaryLabel: "Open kitchen",
  },
  packing_verify: {
    id: "packing_verify",
    title: "Packing verification",
    permissionKey: "packing.manage",
    primaryHref: "/dashboard/today",
    primaryLabel: "Back to Today",
    secondaryHref: "/dashboard/kitchen",
    secondaryLabel: "Open kitchen",
  },
  production_calendar: {
    id: "production_calendar",
    title: "Production calendar",
    permissionKey: "production.manage",
    primaryHref: "/dashboard/today",
    primaryLabel: "Back to Today",
    secondaryHref: "/dashboard/production",
    secondaryLabel: "Open production board",
  },
  production_board: {
    id: "production_board",
    title: "Production board",
    permissionKey: "production.manage",
    primaryHref: "/dashboard/today",
    primaryLabel: "Back to Today",
    secondaryHref: "/dashboard/production/calendar",
    secondaryLabel: "Open calendar",
  },
  qr_codes: {
    id: "qr_codes",
    title: "QR table ordering",
    permissionKey: "products.edit",
    primaryHref: "/dashboard/today",
    primaryLabel: "Back to Today",
    secondaryHref: "/dashboard/products",
    secondaryLabel: "Open products",
  },
  marketplace_hub: {
    id: "marketplace_hub",
    title: "Marketplace",
    permissionKey: "marketplace:read",
    primaryHref: "/dashboard/today",
    primaryLabel: "Back to Today",
    secondaryHref: "/dashboard/order-hub",
    secondaryLabel: "Order hub",
  },
  settings_workspace: {
    id: "settings_workspace",
    title: "Workspace settings",
    permissionKey: "workspace.settings",
    primaryHref: "/dashboard/today",
    primaryLabel: "Back to Today",
    secondaryHref: "/dashboard/settings",
    secondaryLabel: "Open settings",
  },
};

export function buildPermissionDeniedDescription(permissionKey: PermissionKey): string {
  return `You do not have permission for this workspace surface (${permissionKey}). Ask a workspace owner to update your role.`;
}

export function resolvePermissionDeniedSurface(
  surfaceId: PermissionDeniedSurfaceId,
): PermissionDeniedSurfaceDef & { description: string } {
  const surface = PERMISSION_DENIED_SURFACES[surfaceId];
  return {
    ...surface,
    description: buildPermissionDeniedDescription(surface.permissionKey),
  };
}
