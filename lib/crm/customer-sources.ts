import type { CustomerSource } from "@prisma/client";

export type OrderOriginHint =
  | "storefront"
  | "manual"
  | "channel.woocommerce"
  | "channel.shopify"
  | "channel.ubereats"
  | "import"
  | "catering"
  | "event"
  | "phone"
  | "email"
  | "bar"
  | "bakery"
  | "meal_plan"
  | "unknown";

const HINT_TO_SOURCE: Record<OrderOriginHint, CustomerSource> = {
  storefront: "STOREFRONT",
  manual: "MANUAL",
  "channel.woocommerce": "WOO_COMMERCE",
  "channel.shopify": "SHOPIFY",
  "channel.ubereats": "UBER_EATS",
  import: "IMPORT",
  catering: "CATERING_QUOTE",
  event: "EVENT_INQUIRY",
  phone: "PHONE_ORDER",
  email: "EMAIL_ORDER",
  bar: "BAR_EVENT_INQUIRY",
  bakery: "BAKERY_PREORDER",
  meal_plan: "MEAL_PLAN",
  unknown: "CHANNEL_OTHER",
};

export function customerSourceFromHint(hint: OrderOriginHint | null | undefined): CustomerSource {
  if (!hint) return "MANUAL";
  return HINT_TO_SOURCE[hint] ?? "CHANNEL_OTHER";
}

export function customerSourceFromChannelProvider(provider: string | null | undefined): CustomerSource {
  const p = (provider ?? "").toLowerCase();
  if (p.includes("woo")) return "WOO_COMMERCE";
  if (p.includes("shopify")) return "SHOPIFY";
  if (p.includes("uber")) return "UBER_EATS";
  if (p.length === 0) return "MANUAL";
  return "CHANNEL_OTHER";
}
