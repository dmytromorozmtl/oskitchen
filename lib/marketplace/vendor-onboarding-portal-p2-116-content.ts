import {
  VENDOR_ONBOARDING_PORTAL_P2_116_CAPABILITY_COUNT,
  VENDOR_ONBOARDING_PORTAL_P2_116_ROUTE,
  VENDOR_ONBOARDING_PORTAL_P2_116_VENDOR_ROUTE,
} from "@/lib/marketplace/vendor-onboarding-portal-p2-116-policy";

export const VENDOR_ONBOARDING_PORTAL_P2_116_EYEBROW =
  "Vendor onboarding portal · marketplace supply" as const;

export const VENDOR_ONBOARDING_PORTAL_P2_116_HEADLINE =
  "Onboard suppliers with catalog, tiers, zones, cutoff, and MOQ" as const;

export const VENDOR_ONBOARDING_PORTAL_P2_116_SUBLINE =
  "Five onboarding blocks for marketplace vendors — catalog import, pricing tiers, delivery zones, order cutoff times, and minimum order quantity rules. BETA: verify fulfillment SLAs with each vendor — typical directional onboarding, not certified procurement audit." as const;

export const VENDOR_ONBOARDING_PORTAL_P2_116_CAPABILITIES = [
  {
    id: "catalog-import",
    label: "Catalog import",
    description: "Import SKUs via vendor cabinet — CSV/API paths wired to product review queue.",
    module: "services/marketplace/vendor-products-service.ts",
    route: `${VENDOR_ONBOARDING_PORTAL_P2_116_VENDOR_ROUTE}/products`,
  },
  {
    id: "pricing-tiers",
    label: "Pricing tiers",
    description: "Free, Growth, and Enterprise plan tiers with commission rates and volume pricing.",
    module: "lib/marketplace/vendor-settings-types.ts",
    route: `${VENDOR_ONBOARDING_PORTAL_P2_116_VENDOR_ROUTE}/settings`,
  },
  {
    id: "delivery-zones",
    label: "Delivery zones",
    description: "Configure service areas and regional delivery coverage in vendor profile settings.",
    module: "services/marketplace/vendor-settings-service.ts",
    route: VENDOR_ONBOARDING_PORTAL_P2_116_ROUTE,
  },
  {
    id: "cutoff-times",
    label: "Cutoff times",
    description: "Same-day order cutoff (HH:mm) enforced on marketplace checkout — per vendor policy.",
    module: "services/marketplace/vendor-registration-service.ts",
    route: VENDOR_ONBOARDING_PORTAL_P2_116_VENDOR_ROUTE,
  },
  {
    id: "moq",
    label: "Minimum order quantity",
    description: "MOQ and order increment per SKU — surfaced on catalog badges and compare filters.",
    module: "lib/marketplace/marketplace-catalog-ux-policy.ts",
    route: "/dashboard/marketplace/catalog",
  },
] as const;

export const VENDOR_ONBOARDING_PORTAL_P2_116_OPERATOR_LINKS = [
  { label: "Vendor cabinet", href: VENDOR_ONBOARDING_PORTAL_P2_116_VENDOR_ROUTE },
  { label: "Marketplace hub", href: "/dashboard/marketplace" },
  { label: "Auto vendor", href: "/dashboard/marketplace/auto-vendor" },
] as const;

export {
  VENDOR_ONBOARDING_PORTAL_P2_116_CAPABILITY_COUNT,
  VENDOR_ONBOARDING_PORTAL_P2_116_ROUTE,
};
