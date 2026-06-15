import {
  MARKETPLACE_TRUST_P2_120_CAPABILITY_COUNT,
  MARKETPLACE_TRUST_P2_120_ORDERS_ROUTE,
  MARKETPLACE_TRUST_P2_120_PUBLIC_TRUST_ROUTE,
  MARKETPLACE_TRUST_P2_120_QUALITY_ROUTE,
  MARKETPLACE_TRUST_P2_120_ROUTE,
  MARKETPLACE_TRUST_P2_120_VENDORS_ROUTE,
} from "@/lib/marketplace/marketplace-trust-p2-120-policy";

export const MARKETPLACE_TRUST_P2_120_EYEBROW = "Marketplace trust · BETA" as const;

export const MARKETPLACE_TRUST_P2_120_HEADLINE =
  "Verified vendors, SLA signals, reviews, and dispute resolution" as const;

export const MARKETPLACE_TRUST_P2_120_SUBLINE =
  "Four trust pillars for B2B procurement — platform-verified vendor badge, delivery SLA scores, post-order reviews, and platform dispute resolution. BETA: verify trust claims with ops — typical directional signals, not certified audit or escrow guarantee." as const;

export const MARKETPLACE_TRUST_P2_120_CAPABILITIES = [
  {
    id: "verified-badge",
    label: "Verified vendor badge",
    description:
      "Vendors with platform approval and Stripe Connect verification — verifiedAt timestamp on approved profiles.",
    module: "services/marketplace/platform-vendor-moderation-service.ts",
    route: MARKETPLACE_TRUST_P2_120_VENDORS_ROUTE,
  },
  {
    id: "sla",
    label: "SLA",
    description:
      "Delivery score averages and on-time fulfillment signals from completed PO reviews — directional SLA proxy.",
    module: "services/marketplace/quality-scoring.ts",
    route: MARKETPLACE_TRUST_P2_120_QUALITY_ROUTE,
  },
  {
    id: "reviews",
    label: "Reviews",
    description:
      "Post-delivery buyer reviews on quality, accuracy, delivery, and packaging — one review per completed PO.",
    module: "services/marketplace/marketplace-vendors-service.ts",
    route: MARKETPLACE_TRUST_P2_120_VENDORS_ROUTE,
  },
  {
    id: "dispute-resolution",
    label: "Dispute resolution",
    description:
      "Platform-mediated dispute workflow — open cases route through admin review, not vendor-only DMs.",
    module: "services/marketplace/platform-dispute-resolution-service.ts",
    route: MARKETPLACE_TRUST_P2_120_ORDERS_ROUTE,
  },
] as const;

export const MARKETPLACE_TRUST_P2_120_OPERATOR_LINKS = [
  { label: "My vendors", href: MARKETPLACE_TRUST_P2_120_VENDORS_ROUTE },
  { label: "Quality scoring", href: MARKETPLACE_TRUST_P2_120_QUALITY_ROUTE },
  { label: "Trust page", href: MARKETPLACE_TRUST_P2_120_PUBLIC_TRUST_ROUTE },
] as const;

export { MARKETPLACE_TRUST_P2_120_CAPABILITY_COUNT, MARKETPLACE_TRUST_P2_120_ROUTE };
