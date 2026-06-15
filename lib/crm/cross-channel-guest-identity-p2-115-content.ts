import {
  CROSS_CHANNEL_GUEST_IDENTITY_P2_115_CAPABILITY_COUNT,
  CROSS_CHANNEL_GUEST_IDENTITY_P2_115_ROUTE,
  CROSS_CHANNEL_GUEST_IDENTITY_P2_115_UNIFIED_ROUTE,
} from "@/lib/crm/cross-channel-guest-identity-p2-115-policy";

export const CROSS_CHANNEL_GUEST_IDENTITY_P2_115_EYEBROW =
  "Cross-channel guest identity · unified CRM" as const;

export const CROSS_CHANNEL_GUEST_IDENTITY_P2_115_HEADLINE =
  "One guest profile across POS, storefront, and delivery" as const;

export const CROSS_CHANNEL_GUEST_IDENTITY_P2_115_SUBLINE =
  "Three identity linkages — POS walk-in, storefront checkout, and delivery dispatch — merged by email and phone into a unified customer profile. BETA: verify dedupe rules per channel — typical directional identity match, not certified PII audit." as const;

export const CROSS_CHANNEL_GUEST_IDENTITY_P2_115_CAPABILITIES = [
  {
    id: "pos",
    label: "POS guest linkage",
    description:
      "Walk-in and terminal orders linked to KitchenCustomer when email or phone is captured at checkout.",
    module: "services/crm/guest-customer-service.ts",
    route: "/dashboard/pos/terminal",
  },
  {
    id: "storefront",
    label: "Storefront guest linkage",
    description:
      "Branded storefront orders backfill customer source STOREFRONT — unified with CRM profile.",
    module: "lib/crm/customer-sources.ts",
    route: "/dashboard/storefront",
  },
  {
    id: "delivery",
    label: "Delivery guest linkage",
    description:
      "Delivery and marketplace orders (DoorDash, Uber Eats) attributed via channel source hints.",
    module: "services/crm/unified-profile-service.ts",
    route: CROSS_CHANNEL_GUEST_IDENTITY_P2_115_ROUTE,
  },
] as const;

export const CROSS_CHANNEL_GUEST_IDENTITY_P2_115_OPERATOR_LINKS = [
  { label: "Unified profiles", href: CROSS_CHANNEL_GUEST_IDENTITY_P2_115_UNIFIED_ROUTE },
  { label: "Customers", href: "/dashboard/customers" },
  { label: "CRM automation", href: "/dashboard/crm/automation" },
] as const;

export {
  CROSS_CHANNEL_GUEST_IDENTITY_P2_115_CAPABILITY_COUNT,
  CROSS_CHANNEL_GUEST_IDENTITY_P2_115_ROUTE,
};
