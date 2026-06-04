import type { RichSolutionLanding } from "@/lib/marketing/solution-landing-content";
import {
  MARKETING_AI_MOATS_BLOCK,
  MARKETING_B2B_MARKETPLACE_BLOCK,
} from "@/lib/marketing/platform-differentiators-content";

export { MARKETING_AI_MOATS_BLOCK as SHOPIFY_AI_MOATS_BLOCK, MARKETING_B2B_MARKETPLACE_BLOCK as SHOPIFY_MARKETPLACE_BLOCK };

/** Hero badge for Shopify bundle landing — exported for tests. */
export const SHOPIFY_BUNDLE_BADGE = "Shopify + Kitchen OS" as const;

/** Hero headline — exported for tests. */
export const SHOPIFY_BUNDLE_HEADLINE =
  "Your Shopify store. Your kitchen. One operating system." as const;

export const SHOPIFY_BUNDLE_SUBHEADLINE =
  "Connect Shopify orders to production, packing, POS, and POS-scoped inventory hooks — without replacing your storefront." as const;

export const SHOPIFY_BUNDLE_TRUST_LINE =
  "Custom app integration (beta) — not listed on Shopify App Store yet. Honest scope on every claim." as const;

export const SHOPIFY_PAIN_POINTS = [
  {
    title: "Shopify handles checkout — not your kitchen",
    description:
      "Online orders land in Shopify Admin while your team runs production, KDS, and pickup from spreadsheets or a separate POS.",
  },
  {
    title: "Inventory drifts between channels",
    description:
      "Shopify counts diverge from counter sales and wholesale. Overselling happens before anyone notices.",
  },
  {
    title: "Wholesale B2B lives in another tool",
    description:
      "Net-terms invoices, credit limits, and collections sit outside your kitchen workflow — finance chases AR while ops chases tickets.",
  },
] as const;

export const SHOPIFY_SOLUTION_POINTS = [
  {
    title: "One Order Hub for every channel",
    description:
      "Shopify webhooks promote orders into the same spine as POS, catering, and storefront — visible in Order Hub, KDS, and packing.",
  },
  {
    title: "POS-scoped inventory hooks",
    description:
      "Kitchen master spine with Shopify pull/compare paths, conflict queue, and health dashboard — BETA maturity; not unified depletion across all channels.",
  },
  {
    title: "Optional B2B AR command center",
    description:
      "Aging, credit limits, auto-reminders, and pay links for Shopify Markets B2B when the feature flag is enabled.",
  },
] as const;

export const SHOPIFY_BUNDLE_FEATURES = [
  {
    title: "Shopify order ingest",
    description:
      "Signed webhooks for order create/update — promoted into OS Kitchen with channel metadata and audit trail.",
  },
  {
    title: "Product mapping",
    description:
      "Map Shopify SKUs to kitchen products and modifiers — resolve conflicts before they hit production.",
  },
  {
    title: "Inventory compare & sync (BETA)",
    description:
      "Shopify pull/push with health dashboard and reconciliation email when configured — POS-scoped depletion certified; cross-channel unification not a sales claim.",
  },
  {
    title: "POS + pickup desk",
    description:
      "Counter sales and Shopify pickup orders share the same production and packing queues.",
  },
  {
    title: "Shopify Markets (beta)",
    description:
      "Market-aware routing and webhook registry for multi-market operators — scope documented in dashboard.",
  },
  {
    title: "B2B receivables (optional)",
    description:
      "Consolidated AR aging, credit utilization, and dunning when SHOPIFY_MARKETS_B2B_AR_DASHBOARD is enabled.",
  },
] as const;

export const SHOPIFY_BUNDLE_TESTIMONIAL = {
  quote:
    "We kept Shopify for online sales but stopped copying orders into a second system. Shopify tickets show up next to counter sales — inventory finally matches what the kitchen sees.",
  attribution: "Multi-channel meal prep operator",
  context: "Pilot feedback — composite from early Shopify integrations",
} as const;

export const SHOPIFY_BUNDLE_COMPARISON: NonNullable<RichSolutionLanding["comparison"]> = {
  title: "Shopify POS vs OS Kitchen bundle",
  competitorALabel: "Shopify POS",
  competitorBLabel: "Shopify + spreadsheet",
  rows: [
    {
      feature: "Kitchen display & production",
      kitchenos: "✅ KDS + production queues",
      competitorA: "❌",
      competitorB: "Manual",
    },
    {
      feature: "Cross-channel inventory",
      kitchenos: "BETA — POS + Shopify compare",
      competitorA: "Shopify-only",
      competitorB: "Spreadsheet",
    },
    {
      feature: "B2B wholesale AR",
      kitchenos: "✅ Optional AR dashboard",
      competitorA: "Shopify Plus only",
      competitorB: "Separate ERP",
    },
    {
      feature: "Catering & meal prep workflows",
      kitchenos: "✅ Same order spine",
      competitorA: "Limited",
      competitorB: "Not included",
    },
    {
      feature: "Setup pattern",
      kitchenos: "Custom app (beta)",
      competitorA: "Native POS",
      competitorB: "Manual export",
    },
  ],
};

export const SHOPIFY_BUNDLE_FAQ = [
  {
    q: "Is this a Shopify App Store listing?",
    a: "Not yet. OS Kitchen connects via a custom app today — merchants paste an Admin API token and webhook secret. OAuth and App Store submission are on the roadmap; we do not claim marketplace approval until audit passes.",
  },
  {
    q: "Do I need to replace Shopify for online sales?",
    a: "No. Keep your Shopify storefront and checkout. OS Kitchen ingests orders and runs kitchen, inventory, and ops workflows on the same spine as POS and catering.",
  },
  {
    q: "What about inventory sync?",
    a: "Inventory compare and selective sync paths are BETA — enable per channel in dashboard after integration health review. POS-scoped depletion is the certified claim today; we do not sell unified cross-channel stock without pilot proof.",
  },
  {
    q: "Is B2B wholesale included?",
    a: "Shopify Markets B2B AR is optional and feature-flagged. When enabled, receivables aging, credit limits, and auto-reminders live at /dashboard/receivables.",
  },
] as const;

export const SHOPIFY_BUNDLE_CTA = {
  title: "Connect Shopify to your kitchen",
  subtitle:
    "Book a 15-minute fit call for Shopify meal prep and catering brands — or start a trial and run the 5-step pilot wizard with Integration Health visible from day one.",
} as const;
