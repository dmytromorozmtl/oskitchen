import {
  MARKETMAN_POSITIONING_COMPARE_PATH,
  MARKETMAN_POSITIONING_PRIMARY_LINE,
} from "@/lib/marketing/marketman-positioning-policy";

export const MARKETMAN_POSITIONING_EYEBROW = "OS Kitchen vs MarketMan" as const;

export const MARKETMAN_POSITIONING_SUBLINE =
  "MarketMan leads on invoice OCR and vendor item masters for back-office inventory. OS Kitchen is a full operating system — POS, KDS, production, storefront, and B2B marketplace purchasing in one tenant graph." as const;

export const MARKETMAN_POSITIONING_MARKETMAN_WINS =
  "MarketMan wins on mature invoice OCR, supplier charts, and accounting-grade actual-vs-theoretical costing — say that aloud when inventory back-office is the only buying criteria." as const;

export const MARKETMAN_POSITIONING_WEDGES = [
  {
    id: "full_os",
    title: "Full OS, not inventory-only",
    body: "POS, KDS, production board, storefront, and order hub — not a back-office bolt-on beside your POS stack.",
  },
  {
    id: "marketplace",
    title: "Marketplace included",
    body: "Compare suppliers, build carts, and create POs inside OS Kitchen — BETA marketplace, not a separate procurement SaaS.",
  },
  {
    id: "order_driven",
    title: "Order-driven demand",
    body: "Shortage signals tied to today's tickets and production line — not periodic counts disconnected from rush hour.",
  },
] as const;

export const MARKETMAN_POSITIONING_CTA = {
  label: "Compare OS Kitchen vs MarketMan",
  href: MARKETMAN_POSITIONING_COMPARE_PATH,
} as const;

export { MARKETMAN_POSITIONING_PRIMARY_LINE, MARKETMAN_POSITIONING_COMPARE_PATH };
