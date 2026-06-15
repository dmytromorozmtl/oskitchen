import {
  MARKETPLACE_COMMISSION_MODEL_P2_118_CAPABILITY_COUNT,
  MARKETPLACE_COMMISSION_MODEL_P2_118_PLATFORM_ANALYTICS_ROUTE,
  MARKETPLACE_COMMISSION_MODEL_P2_118_ROUTE,
  MARKETPLACE_COMMISSION_MODEL_P2_118_VENDOR_ROUTE,
} from "@/lib/marketplace/marketplace-commission-model-p2-118-policy";

export const MARKETPLACE_COMMISSION_MODEL_P2_118_EYEBROW =
  "Marketplace monetization · BETA" as const;

export const MARKETPLACE_COMMISSION_MODEL_P2_118_HEADLINE =
  "Commission, featured placement, lead fees, and transaction fees" as const;

export const MARKETPLACE_COMMISSION_MODEL_P2_118_SUBLINE =
  "Four revenue levers for the B2B marketplace — vendor commission by plan tier, paid featured slots, buyer lead fees on first PO, and per-order transaction fees via Stripe Connect. BETA: verify rates with finance — typical directional model, not certified revenue audit." as const;

export const MARKETPLACE_COMMISSION_MODEL_P2_118_CAPABILITIES = [
  {
    id: "vendor-commission",
    label: "Vendor commission",
    description:
      "Plan-tier take rate on GMV — Free 5%, Growth 3.5%, Enterprise 2% — settled via vendor transactions.",
    module: "services/marketplace/platform-marketplace-analytics-service.ts",
    route: MARKETPLACE_COMMISSION_MODEL_P2_118_PLATFORM_ANALYTICS_ROUTE,
  },
  {
    id: "featured-placement",
    label: "Featured placement",
    description:
      "Weekly homepage and category slots vendors purchase — revenue tracked separately from order commission.",
    module: "services/marketplace/featured-service.ts",
    route: MARKETPLACE_COMMISSION_MODEL_P2_118_VENDOR_ROUTE,
  },
  {
    id: "lead-fee",
    label: "Lead fee",
    description:
      "Flat fee when a new buyer submits their first marketplace PO — directional buyer acquisition charge.",
    module: "services/marketplace/platform-marketplace-analytics-service.ts",
    route: MARKETPLACE_COMMISSION_MODEL_P2_118_PLATFORM_ANALYTICS_ROUTE,
  },
  {
    id: "transaction-fee",
    label: "Transaction fee",
    description:
      "Stripe Connect application fee on checkout capture — commissionAmount recorded per vendorTransaction.",
    module: "services/marketplace/checkout-service.ts",
    route: MARKETPLACE_COMMISSION_MODEL_P2_118_VENDOR_ROUTE,
  },
] as const;

export const MARKETPLACE_COMMISSION_MODEL_P2_118_OPERATOR_LINKS = [
  { label: "Platform analytics", href: MARKETPLACE_COMMISSION_MODEL_P2_118_PLATFORM_ANALYTICS_ROUTE },
  { label: "Vendor cabinet", href: MARKETPLACE_COMMISSION_MODEL_P2_118_VENDOR_ROUTE },
  { label: "Marketplace hub", href: "/dashboard/marketplace" },
] as const;

export {
  MARKETPLACE_COMMISSION_MODEL_P2_118_CAPABILITY_COUNT,
  MARKETPLACE_COMMISSION_MODEL_P2_118_ROUTE,
};
