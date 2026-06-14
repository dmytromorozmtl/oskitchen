import type { CompareRow } from "@/lib/marketing/compare-content";

/** LIVE-only OS Kitchen cells — no hardware rows (P1-23). */
export const HONEST_COMPARE_TOAST_ROWS: CompareRow[] = [
  {
    feature: "Kitchen display (KDS)",
    kitchenos: "✅ LIVE — real-time bump",
    competitorA: "✅ Native KDS",
    competitorB: "Add-on / paper",
  },
  {
    feature: "In-browser POS + checkout",
    kitchenos: "✅ LIVE — web terminal",
    competitorA: "✅ Mature floor POS",
    competitorB: "Fragmented",
  },
  {
    feature: "Owned storefront + preorders",
    kitchenos: "✅ LIVE — theme builder",
    competitorA: "✅ Via add-ons",
    competitorB: "Separate SaaS",
  },
  {
    feature: "Production & packing board",
    kitchenos: "✅ LIVE — batch + routes",
    competitorA: "❌ Not core Toast",
    competitorB: "Spreadsheets",
  },
  {
    feature: "Integration Health Center",
    kitchenos: "✅ LIVE — PASS/SKIPPED/FAILED",
    competitorA: "Varies by module",
    competitorB: "No equivalent",
  },
  {
    feature: "Table / QR ordering",
    kitchenos: "✅ LIVE — same ticket stream",
    competitorA: "✅ Mature floor plans",
    competitorB: "Limited",
  },
  {
    feature: "Delivery marketplace sync",
    kitchenos: "⚠️ SKIPPED until partner creds",
    competitorA: "✅ Partner network",
    competitorB: "Manual",
  },
];

export const HONEST_COMPARE_SQUARE_ROWS: CompareRow[] = [
  {
    feature: "Kitchen display (KDS)",
    kitchenos: "✅ LIVE — real-time bump",
    competitorA: "✅ Add-ons vary",
    competitorB: "Paper / none",
  },
  {
    feature: "In-browser POS + checkout",
    kitchenos: "✅ LIVE — web terminal",
    competitorA: "✅ Counter-first POS",
    competitorB: "Manual",
  },
  {
    feature: "Owned storefront + preorders",
    kitchenos: "✅ LIVE — native storefront",
    competitorA: "✅ Online store",
    competitorB: "Separate tool",
  },
  {
    feature: "Production & packing board",
    kitchenos: "✅ LIVE — batch planning",
    competitorA: "❌ Via third-party apps",
    competitorB: "Spreadsheets",
  },
  {
    feature: "Integration Health Center",
    kitchenos: "✅ LIVE — honest channel labels",
    competitorA: "App marketplace status",
    competitorB: "No equivalent",
  },
  {
    feature: "Meal prep / route planning",
    kitchenos: "✅ LIVE — cutoffs + routes",
    competitorA: "Limited native depth",
    competitorB: "Manual",
  },
  {
    feature: "Inventory costing (AVT)",
    kitchenos: "⚠️ BETA — verify in pilot",
    competitorA: "Basic inventory",
    competitorB: "None",
  },
];

export const HONEST_COMPARE_LIGHTSPEED_ROWS: CompareRow[] = [
  {
    feature: "Kitchen display (KDS)",
    kitchenos: "✅ LIVE — real-time bump",
    competitorA: "✅ KDS available",
    competitorB: "Paper / none",
  },
  {
    feature: "In-browser POS + checkout",
    kitchenos: "✅ LIVE — web terminal",
    competitorA: "✅ Strong floor POS",
    competitorB: "Varies",
  },
  {
    feature: "Production & batch planning",
    kitchenos: "✅ LIVE — production board",
    competitorA: "❌ Not native",
    competitorB: "Spreadsheets",
  },
  {
    feature: "Meal prep preorders",
    kitchenos: "✅ LIVE — weekly menus",
    competitorA: "Add-ons",
    competitorB: "None",
  },
  {
    feature: "Ghost kitchen multi-brand",
    kitchenos: "✅ LIVE — command center",
    competitorA: "Limited",
    competitorB: "None",
  },
  {
    feature: "Integration Health Center",
    kitchenos: "✅ LIVE — PASS/SKIPPED/FAILED",
    competitorA: "Varies",
    competitorB: "No equivalent",
  },
  {
    feature: "Recipe costing depth",
    kitchenos: "⚠️ BETA — costing module",
    competitorA: "Basic",
    competitorB: "Manual",
  },
];

export const HONEST_COMPARE_P1_23_METHODOLOGY =
  "OS Kitchen cells list LIVE capabilities only — BETA and SKIPPED features are labeled honestly, never marked as included. Competitor cells reflect typical public positioning; verify current plans with each vendor." as const;

export const HONEST_COMPARE_P1_23_DISCLAIMER_SUFFIX =
  "Hardware terminals and payment readers are out of scope on this page — compare operational software fit, not device bundles." as const;

export function honestCompareRowsForSlug(
  slug: "toast" | "square" | "lightspeed",
): CompareRow[] {
  if (slug === "toast") return HONEST_COMPARE_TOAST_ROWS;
  if (slug === "square") return HONEST_COMPARE_SQUARE_ROWS;
  return HONEST_COMPARE_LIGHTSPEED_ROWS;
}

/** Every OS Kitchen cell must be LIVE or explicitly BETA/SKIPPED — never fake green. */
export function validateHonestCompareKitchenOsCells(rows: CompareRow[]): boolean {
  return rows.every((row) => {
    const cell = row.kitchenos.trim();
    return (
      cell.includes("LIVE") ||
      cell.includes("BETA") ||
      cell.includes("SKIPPED") ||
      cell.startsWith("⚠️")
    );
  });
}
