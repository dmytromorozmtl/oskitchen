import type { StaffRoleType } from "@prisma/client";

/**
 * Declarative capability keys for documentation + future server-side enforcement layers.
 * Today, many routes still rely on owner/staff checks — treat this matrix as the target contract.
 */
export const CAPABILITY = {
  ordersRead: "orders:read",
  ordersWrite: "orders:write",
  ordersCancel: "orders:cancel",
  posOperate: "pos:operate",
  posCloseShift: "pos:close_shift",
  posManage: "pos:manage",
  productionRun: "production:run",
  kitchenView: "kitchen:view",
  kitchenBump: "kitchen:bump",
  packingVerify: "packing:verify",
  routesAssign: "routes:assign",
  inventoryRead: "inventory:read",
  inventoryWrite: "inventory:write",
  staffManage: "staff:manage",
  billingManage: "billing:manage",
  integrationsManage: "integrations:manage",
  exportsSensitive: "exports:sensitive",
  impersonationRequest: "platform:impersonation",
} as const;

export type CapabilityKey = (typeof CAPABILITY)[keyof typeof CAPABILITY];

/** Default capability bundles by staff template (CUSTOM falls back to VIEWER). */
export const STAFF_TEMPLATE_CAPABILITIES: Record<StaffRoleType, readonly CapabilityKey[]> = {
  OWNER: Object.values(CAPABILITY) as CapabilityKey[],
  MANAGER: [
    CAPABILITY.ordersRead,
    CAPABILITY.ordersWrite,
    CAPABILITY.posOperate,
    CAPABILITY.posCloseShift,
    CAPABILITY.posManage,
    CAPABILITY.productionRun,
    CAPABILITY.kitchenView,
    CAPABILITY.kitchenBump,
    CAPABILITY.packingVerify,
    CAPABILITY.routesAssign,
    CAPABILITY.inventoryRead,
    CAPABILITY.inventoryWrite,
    CAPABILITY.staffManage,
    CAPABILITY.integrationsManage,
    CAPABILITY.exportsSensitive,
  ],
  KITCHEN_LEAD: [
    CAPABILITY.ordersRead,
    CAPABILITY.productionRun,
    CAPABILITY.kitchenView,
    CAPABILITY.kitchenBump,
    CAPABILITY.packingVerify,
    CAPABILITY.inventoryRead,
  ],
  PREP_COOK: [CAPABILITY.ordersRead, CAPABILITY.productionRun, CAPABILITY.kitchenView, CAPABILITY.kitchenBump],
  LINE_COOK: [CAPABILITY.ordersRead, CAPABILITY.productionRun, CAPABILITY.kitchenView, CAPABILITY.kitchenBump],
  PACKER: [CAPABILITY.ordersRead, CAPABILITY.packingVerify],
  DRIVER: [CAPABILITY.ordersRead, CAPABILITY.routesAssign],
  CUSTOMER_SERVICE: [CAPABILITY.ordersRead, CAPABILITY.ordersWrite, CAPABILITY.posOperate],
  CATERING_COORDINATOR: [CAPABILITY.ordersRead, CAPABILITY.ordersWrite, CAPABILITY.posOperate],
  PURCHASING: [
    CAPABILITY.ordersRead,
    CAPABILITY.inventoryRead,
    CAPABILITY.inventoryWrite,
    CAPABILITY.exportsSensitive,
  ],
  INVENTORY: [CAPABILITY.inventoryRead, CAPABILITY.inventoryWrite],
  ACCOUNTING: [CAPABILITY.ordersRead, CAPABILITY.exportsSensitive],
  MARKETING: [CAPABILITY.ordersRead],
  VIEWER: [CAPABILITY.ordersRead, CAPABILITY.inventoryRead],
  CUSTOM: [CAPABILITY.ordersRead],
};

export const PLATFORM_ROLE_LABELS = [
  "PLATFORM_FOUNDER",
  "PLATFORM_SUPERADMIN",
  "PLATFORM_ADMIN",
  "PLATFORM_SUPPORT_ADMIN",
  "PLATFORM_BILLING_ADMIN",
  "PLATFORM_DEVELOPER_ADMIN",
  "PLATFORM_READONLY_AUDITOR",
] as const;
