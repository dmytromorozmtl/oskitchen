import {
  MARGINEDGE_POSITIONING_COMPARE_PATH,
  MARGINEDGE_POSITIONING_PRIMARY_LINE,
} from "@/lib/marketing/marginedge-positioning-policy";

export const MARGINEDGE_POSITIONING_EYEBROW = "OS Kitchen vs MarginEdge" as const;

export const MARGINEDGE_POSITIONING_SUBLINE =
  "MarginEdge built a category around invoice capture and food-cost analytics. OS Kitchen ships invoice AI inside a full operating system — POS, KDS, production, storefront, and marketplace — so scanned invoices feed live ops, not a standalone AP silo." as const;

export const MARGINEDGE_POSITIONING_MARGINEDGE_WINS =
  "MarginEdge wins on dedicated invoice OCR depth, price-variance alerts, and AP workflows when invoice automation is the only buying criteria — say that aloud in finance-led evaluations." as const;

export const MARGINEDGE_POSITIONING_WEDGES = [
  {
    id: "feature_not_product",
    title: "Invoice AI inside the OS",
    body: "Scan → PO → inventory inside one tenant — BETA invoice scanner as a module, not a separate SKU beside your POS.",
  },
  {
    id: "ops_native",
    title: "Ops-native costing",
    body: "Food cost signals tied to today's tickets, production board, and KDS — not exports to a back-office-only dashboard.",
  },
  {
    id: "full_stack",
    title: "Full stack included",
    body: "POS, KDS, storefront, and B2B marketplace purchasing — MarginEdge-style invoice capture without stacking another vendor.",
  },
] as const;

export const MARGINEDGE_POSITIONING_CTA = {
  label: "Compare OS Kitchen vs MarginEdge",
  href: MARGINEDGE_POSITIONING_COMPARE_PATH,
} as const;

export { MARGINEDGE_POSITIONING_PRIMARY_LINE, MARGINEDGE_POSITIONING_COMPARE_PATH };
