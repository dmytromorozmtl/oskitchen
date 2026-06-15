import {
  COMMISSION_FREE_ORDERING_P2_113_MESSAGE_COUNT,
  COMMISSION_FREE_ORDERING_P2_113_OWN_CHANNEL_ROUTE,
  COMMISSION_FREE_ORDERING_P2_113_ROUTE,
  COMMISSION_FREE_ORDERING_P2_113_STOREFRONT_ROUTE,
} from "@/lib/marketing/commission-free-ordering-p2-113-policy";

export const COMMISSION_FREE_ORDERING_P2_113_EYEBROW =
  "Commission-free ordering · storefront + Stripe" as const;

export const COMMISSION_FREE_ORDERING_P2_113_HEADLINE =
  "Direct orders on your storefront — no OS Kitchen order commission" as const;

export const COMMISSION_FREE_ORDERING_P2_113_SUBLINE =
  "Three messaging blocks for operators and guests — storefront copy, Stripe fee disclosure, and marketplace comparison. BETA: verify Stripe rates and marketplace contracts — typical directional savings, not certified financial audit." as const;

export const COMMISSION_FREE_ORDERING_P2_113_MESSAGES = [
  {
    id: "storefront",
    label: "Storefront messaging",
    description:
      "Guest-facing copy: order on your branded storefront with 0% OS Kitchen take on the order subtotal.",
    module: "app/dashboard/storefront/ordering/page.tsx",
    route: COMMISSION_FREE_ORDERING_P2_113_STOREFRONT_ROUTE,
  },
  {
    id: "stripe",
    label: "Stripe fee disclosure",
    description:
      "Transparent card processing — typical ~2.9% + $0.30 per successful charge via Stripe; no hidden marketplace middleman.",
    module: "lib/storefront/stripe-readiness.ts",
    route: COMMISSION_FREE_ORDERING_P2_113_ROUTE,
  },
  {
    id: "compare",
    label: "Marketplace comparison",
    description:
      "Contrast 15–30% marketplace commission vs payment-processing-only on owned channel — directional, not guaranteed savings.",
    module: "lib/marketing/own-your-channel-upsell-content.ts",
    route: COMMISSION_FREE_ORDERING_P2_113_OWN_CHANNEL_ROUTE,
  },
] as const;

export const COMMISSION_FREE_ORDERING_P2_113_OPERATOR_LINKS = [
  { label: "Storefront ordering", href: COMMISSION_FREE_ORDERING_P2_113_STOREFRONT_ROUTE },
  { label: "Own your channel", href: COMMISSION_FREE_ORDERING_P2_113_OWN_CHANNEL_ROUTE },
  { label: "Commission comparison", href: "/commission-comparison" },
] as const;

export { COMMISSION_FREE_ORDERING_P2_113_MESSAGE_COUNT, COMMISSION_FREE_ORDERING_P2_113_ROUTE };
