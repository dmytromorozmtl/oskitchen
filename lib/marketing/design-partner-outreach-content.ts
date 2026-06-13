/**
 * Blueprint P1-25 — 20 design partner outreach targets (Montreal + Canada).
 *
 * Status is always `research_target` until founder confirms first contact.
 * Do not claim these operators as customers, logos, or signed LOIs.
 */

export type DesignPartnerOutreachSegment =
  | "meal_prep"
  | "ghost_kitchen"
  | "commissary"
  | "multi_unit"
  | "catering";

export type DesignPartnerOutreachStatus = "research_target" | "contacted" | "declined";

export type DesignPartnerOutreachOperator = {
  id: string;
  name: string;
  city: string;
  province: string;
  segment: DesignPartnerOutreachSegment;
  icpFit: "high" | "medium";
  unitsEstimate: string;
  outreachHook: string;
  status: DesignPartnerOutreachStatus;
  notes: string;
};

export const DESIGN_PARTNER_OUTREACH_DISCLAIMER =
  "Internal research list only — not contacted unless status changes in CRM. No customer logos or KPI claims until a countersigned LOI is on file." as const;

export const DESIGN_PARTNER_OUTREACH_OPERATORS: DesignPartnerOutreachOperator[] = [
  {
    id: "goodfood-mtl",
    name: "Goodfood Market Corp",
    city: "Montreal",
    province: "QC",
    segment: "meal_prep",
    icpFit: "medium",
    unitsEstimate: "1 HQ + national fulfillment",
    outreachHook: "Weekly menu + subscription cutoffs — order hub + Integration Health for Shopify/Woo ingest",
    status: "research_target",
    notes: "Public TSX operator — likely too large for founding cohort; useful reference architecture call",
  },
  {
    id: "oatbox-mtl",
    name: "Oatbox",
    city: "Montreal",
    province: "QC",
    segment: "multi_unit",
    icpFit: "high",
    unitsEstimate: "10+ café locations",
    outreachHook: "Multi-location prep + retail SKU sync — Today Command Center for rush-hour visibility",
    status: "research_target",
    notes: "Montreal-founded chain — owner-operator feedback loop fits design partner profile",
  },
  {
    id: "mandys-mtl",
    name: "Mandy's Gourmet Salads",
    city: "Montreal",
    province: "QC",
    segment: "multi_unit",
    icpFit: "high",
    unitsEstimate: "15+ locations",
    outreachHook: "Salad prep scaling across locations — KDS + par-level signals without enterprise POS lock-in",
    status: "research_target",
    notes: "Strong Montreal brand — qualify for ≤5-location pilot scope before outreach",
  },
  {
    id: "copper-branch-mtl",
    name: "Copper Branch",
    city: "Montreal",
    province: "QC",
    segment: "multi_unit",
    icpFit: "medium",
    unitsEstimate: "40+ franchise locations",
    outreachHook: "Franchise ops truth — honest Integration Health instead of blanket connected tiles",
    status: "research_target",
    notes: "Montreal-origin QSR — franchisee subset may fit ≤5-location scope",
  },
  {
    id: "lov-mtl",
    name: "LOV Restaurants",
    city: "Montreal",
    province: "QC",
    segment: "multi_unit",
    icpFit: "high",
    unitsEstimate: "5–8 locations",
    outreachHook: "Plant-based multi-unit — channel orders into one kitchen screen",
    status: "research_target",
    notes: "Laval/Montreal footprint — good weekly feedback cadence candidate",
  },
  {
    id: "dynamite-cuisine-mtl",
    name: "Dynamite Cuisine",
    city: "Montreal",
    province: "QC",
    segment: "meal_prep",
    icpFit: "high",
    unitsEstimate: "1 commissary + delivery",
    outreachHook: "Weekly meal prep volume — preorder cutoff → production list → packing labels",
    status: "research_target",
    notes: "Local meal prep/catering operator — classic P1 ICP",
  },
  {
    id: "les-plats-du-chef-mtl",
    name: "Les Plats du Chef",
    city: "Montreal",
    province: "QC",
    segment: "meal_prep",
    icpFit: "high",
    unitsEstimate: "1 kitchen + subscription base",
    outreachHook: "Subscription meal prep — Shopify/Woo webhook → KDS without spreadsheet bridge",
    status: "research_target",
    notes: "Quebec meal delivery brand — verify current stack before demo",
  },
  {
    id: "cuisine-municipale-mtl",
    name: "Cuisine Collective (Montreal shared kitchen)",
    city: "Montreal",
    province: "QC",
    segment: "commissary",
    icpFit: "high",
    unitsEstimate: "1 hub, 20+ tenant brands",
    outreachHook: "Commissary tenant routing — multi-brand KDS + honest SKIPPED labels per tenant",
    status: "research_target",
    notes: "Shared kitchen / incubator archetype — confirm legal entity name before LOI",
  },
  {
    id: "foodlab-mtl",
    name: "FoodLab Montreal",
    city: "Montreal",
    province: "QC",
    segment: "commissary",
    icpFit: "high",
    unitsEstimate: "1 incubator + member brands",
    outreachHook: "Incubator cohort pilot — one OS for member order hub + integration health",
    status: "research_target",
    notes: "Food entrepreneur hub — outreach via program director not cold spam",
  },
  {
    id: "ghost-kitchen-mtl-archetype",
    name: "Montreal virtual-brand operator (multi-brand ghost kitchen)",
    city: "Montreal",
    province: "QC",
    segment: "ghost_kitchen",
    icpFit: "high",
    unitsEstimate: "1 kitchen, 3–6 delivery brands",
    outreachHook: "DoorDash/Uber SKIPPED honesty — see exactly why marketplace ingest failed",
    status: "research_target",
    notes: "Placeholder row — replace with named operator after LinkedIn/event research",
  },
  {
    id: "mtl-meal-prep-archetype",
    name: "Montreal Sunday-batch meal prep operator",
    city: "Montreal",
    province: "QC",
    segment: "meal_prep",
    icpFit: "high",
    unitsEstimate: "1 prep kitchen, 200–500 meals/week",
    outreachHook: "Sunday cutoff chaos — weekly menu publish + tray packing workflow",
    status: "research_target",
    notes: "ICP archetype from /meal-prep-software — fill name from MTL Food Entrepreneurs network",
  },
  {
    id: "mtl-catering-archetype",
    name: "Montreal corporate catering operator",
    city: "Montreal",
    province: "QC",
    segment: "catering",
    icpFit: "high",
    unitsEstimate: "1 kitchen, event + recurring B2B",
    outreachHook: "Quote-to-production — catering quotes module + KDS bump for event day",
    status: "research_target",
    notes: "Fill from Chamber of commerce / IFEQ member list",
  },
  {
    id: "fresh-city-tor",
    name: "Fresh City",
    city: "Toronto",
    province: "ON",
    segment: "meal_prep",
    icpFit: "medium",
    unitsEstimate: "1 hub + GTA delivery",
    outreachHook: "Organic meal prep subscription — integration health for storefront + fulfillment",
    status: "research_target",
    notes: "Toronto operator — Canada expansion row, Eastern timezone overlap",
  },
  {
    id: "chef-on-call-can",
    name: "Chef On Call",
    city: "Toronto",
    province: "ON",
    segment: "meal_prep",
    icpFit: "high",
    unitsEstimate: "Multi-city meal delivery",
    outreachHook: "Multi-city prep routing — workspace-per-hub with rollup Today view",
    status: "research_target",
    notes: "National meal delivery — qualify single-hub pilot scope first",
  },
  {
    id: "ghost-kitchen-brands-can",
    name: "Ghost Kitchen Brands (Canada)",
    city: "Toronto",
    province: "ON",
    segment: "ghost_kitchen",
    icpFit: "medium",
    unitsEstimate: "National virtual-brand portfolio",
    outreachHook: "Multi-brand order hub — Integration Health Center moat vs incumbent tiles",
    status: "research_target",
    notes: "Large portfolio — target single Canadian kitchen operator inside org",
  },
  {
    id: "kitchen-hub-tor",
    name: "Kitchen Hub",
    city: "Toronto",
    province: "ON",
    segment: "ghost_kitchen",
    icpFit: "high",
    unitsEstimate: "1–3 ghost kitchen sites",
    outreachHook: "Aggregator ingest → one KDS — webhook signature regression visibility",
    status: "research_target",
    notes: "Toronto ghost kitchen — verify current POS before outreach",
  },
  {
    id: "ottawa-meal-prep-archetype",
    name: "Ottawa-Gatineau meal prep operator",
    city: "Ottawa",
    province: "ON",
    segment: "meal_prep",
    icpFit: "high",
    unitsEstimate: "1 kitchen, bilingual menu",
    outreachHook: "Bilingual storefront + weekly prep — honest BETA labels for Quebec buyers",
    status: "research_target",
    notes: "National capital region — fill named operator from local food incubator",
  },
  {
    id: "quebec-city-catering",
    name: "Québec City catering / commissary operator",
    city: "Québec City",
    province: "QC",
    segment: "commissary",
    icpFit: "high",
    unitsEstimate: "1 hub, regional events",
    outreachHook: "French-first ops UI — commissary landing + production routing",
    status: "research_target",
    notes: "Quebec City row — confirm French UI priority in discovery call",
  },
  {
    id: "vancouver-meal-prep-archetype",
    name: "Vancouver BC meal prep operator",
    city: "Vancouver",
    province: "BC",
    segment: "meal_prep",
    icpFit: "high",
    unitsEstimate: "1 kitchen, West Coast delivery",
    outreachHook: "Pacific timezone pilot — Shopify ingest + KDS with SKIPPED marketplace honesty",
    status: "research_target",
    notes: "Western Canada row — note 3h timezone delta for weekly feedback cadence",
  },
  {
    id: "calgary-multi-brand",
    name: "Calgary multi-brand cloud kitchen operator",
    city: "Calgary",
    province: "AB",
    segment: "ghost_kitchen",
    icpFit: "high",
    unitsEstimate: "1 kitchen, 4+ virtual brands",
    outreachHook: "Alberta delivery mix — profit engine + channel commission comparison",
    status: "research_target",
    notes: "Prairie ghost kitchen archetype — replace with named operator from Alberta hospitality network",
  },
] as const;

export const DESIGN_PARTNER_OUTREACH_MONTREAL_OPERATORS =
  DESIGN_PARTNER_OUTREACH_OPERATORS.filter((op) => op.province === "QC");

export const DESIGN_PARTNER_OUTREACH_SEGMENT_COUNTS = {
  meal_prep: DESIGN_PARTNER_OUTREACH_OPERATORS.filter((op) => op.segment === "meal_prep")
    .length,
  ghost_kitchen: DESIGN_PARTNER_OUTREACH_OPERATORS.filter(
    (op) => op.segment === "ghost_kitchen",
  ).length,
  commissary: DESIGN_PARTNER_OUTREACH_OPERATORS.filter((op) => op.segment === "commissary")
    .length,
  multi_unit: DESIGN_PARTNER_OUTREACH_OPERATORS.filter((op) => op.segment === "multi_unit")
    .length,
  catering: DESIGN_PARTNER_OUTREACH_OPERATORS.filter((op) => op.segment === "catering")
    .length,
} as const;
