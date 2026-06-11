import {
  LIGHTSPEED_POSITIONING_COMPARE_PATH,
  LIGHTSPEED_POSITIONING_PRIMARY_LINE,
} from "@/lib/marketing/lightspeed-positioning-policy";

export const LIGHTSPEED_POSITIONING_EYEBROW = "OS Kitchen vs Lightspeed" as const;

export const LIGHTSPEED_POSITIONING_SUBLINE =
  "Lightspeed excels at hospitality POS and dining-room payments. OS Kitchen is built for food operators whose margin lives in production — meal prep, commissary, ghost kitchens, and multi-channel fulfillment after the sale." as const;

export const LIGHTSPEED_POSITIONING_LIGHTSPEED_WINS =
  "Lightspeed wins on traditional dining-room POS, table service, and hospitality payments — say that aloud for full-service restaurants optimizing the floor." as const;

export const LIGHTSPEED_POSITIONING_WEDGES = [
  {
    id: "production_native",
    title: "Production-first, not floor-first",
    body: "Native production board, packing, routes, and KDS — not spreadsheets plus POS add-ons.",
  },
  {
    id: "food_verticals",
    title: "Meal prep & ghost kitchen depth",
    body: "Weekly menus, commissary batches, multi-brand command center — workflows generic retail POS stacks bolt on.",
  },
  {
    id: "channel_truth",
    title: "Integration Health for food channels",
    body: "Shopify, WooCommerce, storefront — honest PASS/SKIPPED labels for channels food operators actually run.",
  },
] as const;

export const LIGHTSPEED_POSITIONING_CTA = {
  label: "Compare OS Kitchen vs Lightspeed",
  href: LIGHTSPEED_POSITIONING_COMPARE_PATH,
} as const;

export { LIGHTSPEED_POSITIONING_PRIMARY_LINE, LIGHTSPEED_POSITIONING_COMPARE_PATH };
