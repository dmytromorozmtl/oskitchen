/** Command-center tab ids (`?view=`). Shared by server pages and client UI — keep this file free of `"use client"`. */

export const PRODUCTION_VIEWS = [
  "board",
  "prep",
  "timeline",
  "stations",
  "batches",
  "orders",
  "ingredients",
  "reports",
] as const;

export type ProductionView = (typeof PRODUCTION_VIEWS)[number];

export function normalizeProductionView(v: string | null | undefined): ProductionView {
  if (v && (PRODUCTION_VIEWS as readonly string[]).includes(v)) return v as ProductionView;
  return "board";
}
