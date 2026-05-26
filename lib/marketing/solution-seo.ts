import type { SolutionPageSlug } from "@/lib/demo-verticals";

export type SolutionSeoConfig = {
  metaTitle: string;
  metaDescription: string;
  keywords: string[];
  breadcrumbLabel: string;
};

/** Primary + secondary keywords per solution URL (US/CA B2B food ops). */
export const SOLUTION_SEO: Partial<Record<SolutionPageSlug, SolutionSeoConfig>> = {
  "meal-prep": {
    metaTitle: "Meal Prep Software — Weekly Menus, Production & Packing",
    metaDescription:
      "Meal prep software for weekly menus, preorder cutoffs, production quantities, packing labels, and pickup or delivery — without spreadsheet chaos.",
    keywords: [
      "meal prep software",
      "meal prep order management",
      "weekly meal prep software",
      "meal delivery software",
    ],
    breadcrumbLabel: "Meal prep",
  },
  catering: {
    metaTitle: "Catering Management Software — Quotes to Delivery",
    metaDescription:
      "Catering management software to turn quotes into production plans, packing sheets, and delivery routes for corporate and event catering.",
    keywords: [
      "catering management software",
      "catering order system",
      "event catering software",
      "catering production software",
    ],
    breadcrumbLabel: "Catering",
  },
  bakeries: {
    metaTitle: "Bakery Order Management Software — Preorders & Bake Schedules",
    metaDescription:
      "Bakery order management for preorders, bake schedules, packing, and pickup waves — built for wholesale and retail bakery operators.",
    keywords: [
      "bakery order management",
      "bakery production software",
      "wholesale bakery system",
      "bakery preorder software",
    ],
    breadcrumbLabel: "Bakeries",
  },
  restaurants: {
    metaTitle: "Restaurant POS & Kitchen Management Software | KitchenOS",
    metaDescription:
      "Restaurant POS with kitchen display, table management, and QR ordering. Replace fragmented tools with one platform. 14-day free trial.",
    keywords: [
      "restaurant POS software",
      "restaurant kitchen display",
      "table management software",
      "restaurant operations platform",
    ],
    breadcrumbLabel: "Restaurants",
  },
  bars: {
    metaTitle: "Bar POS with Tab Management | KitchenOS",
    metaDescription:
      "Bar POS with tab management, quick-order drinks, split bills, and kitchen display. Web-based — no proprietary hardware. Free trial.",
    keywords: ["bar POS", "bar tab software", "nightclub POS", "bar management software"],
    breadcrumbLabel: "Bars",
  },
  cafes: {
    metaTitle: "Café POS & Order-Ahead Software | KitchenOS",
    metaDescription:
      "Café POS with quick-order buttons, QR ordering, kitchen display, and pickup windows. Built for coffee bars and counter service.",
    keywords: ["cafe POS", "coffee shop POS", "cafe order ahead", "coffee bar software"],
    breadcrumbLabel: "Cafés",
  },
  "fast-casual": {
    metaTitle: "Fast-Casual POS & Kitchen Display | KitchenOS",
    metaDescription:
      "Fast-casual POS with quick-order buttons, KDS, and production board. High-throughput day-of service. 14-day free trial.",
    keywords: ["fast casual POS", "QSR software", "quick service restaurant POS", "kitchen display QSR"],
    breadcrumbLabel: "Fast-casual",
  },
  "ghost-kitchens": {
    metaTitle: "Ghost Kitchen & Multi-Brand Software | KitchenOS",
    metaDescription:
      "Operate virtual brands from one kitchen. Multi-brand command center, channel imports, KDS, and production. Honest integration maturity.",
    keywords: [
      "ghost kitchen software",
      "virtual brand management",
      "cloud kitchen POS",
      "multi brand restaurant software",
    ],
    breadcrumbLabel: "Ghost kitchens",
  },
};
