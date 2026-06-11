import {
  SQUARE_POSITIONING_COMPARE_PATH,
  SQUARE_POSITIONING_PRIMARY_LINE,
} from "@/lib/marketing/square-positioning-policy";

export const SQUARE_POSITIONING_EYEBROW = "OS Kitchen vs Square" as const;

export const SQUARE_POSITIONING_SUBLINE =
  "Square optimizes for fast counter signup and payments ubiquity. OS Kitchen adds marketplace purchasing, invoice AI, multi-brand ops, and production truth — with published plans and a 14-day trial, not a six-month enterprise quote." as const;

export const SQUARE_POSITIONING_SQUARE_WINS =
  "Square wins on frictionless SMB signup, Cash App ecosystem, and simple counter-first cafés — say that aloud when the operator is payments-only today." as const;

export const SQUARE_POSITIONING_WEDGES = [
  {
    id: "depth_without_contracts",
    title: "Ops depth, self-serve signup",
    body: "Marketplace, KDS, production board, and invoice scanner in one tenant — no custom MSA to get started.",
  },
  {
    id: "published_pricing",
    title: "Published pricing tiers",
    body: "Starter $49 through Enterprise $499/mo on this site — compare before you talk to sales, cancel anytime.",
  },
  {
    id: "production_truth",
    title: "Food-specific fulfillment",
    body: "Meal prep routes, packing, and Integration Health — not a payments stack plus app marketplace sprawl.",
  },
] as const;

export const SQUARE_POSITIONING_CTA = {
  label: "Compare OS Kitchen vs Square",
  href: SQUARE_POSITIONING_COMPARE_PATH,
} as const;

export { SQUARE_POSITIONING_PRIMARY_LINE, SQUARE_POSITIONING_COMPARE_PATH };
