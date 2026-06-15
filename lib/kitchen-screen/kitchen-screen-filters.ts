import { isWorkLate } from "@/lib/production/production-status";
import { prioritySortScore } from "@/lib/production/production-priority";
import type { ProductionWorkPriority, ProductionWorkStatus } from "@prisma/client";

import type { KitchenScreenMode, KitchenWorkRowDTO } from "./kitchen-screen-types";

/** Slug → match station string on work items (case-insensitive, substring). */
export const KITCHEN_STATION_SLUGS = [
  { slug: "all", label: "All", match: () => true },
  { slug: "prep", label: "Prep", match: (s: string) => /prep|mise|cold prep/i.test(s) },
  { slug: "hot-line", label: "Hot line", match: (s: string) => /hot|line|grill|saute/i.test(s) },
  { slug: "cold-line", label: "Cold line", match: (s: string) => /cold|salad|sandwich/i.test(s) },
  { slug: "pastry", label: "Pastry", match: (s: string) => /pastry|dessert/i.test(s) },
  { slug: "bakery", label: "Bakery", match: (s: string) => /bake|oven|mix|proof/i.test(s) },
  { slug: "bar", label: "Bar", match: (s: string) => /^bar$/i.test(s) || /bar |bar prep/i.test(s) },
  { slug: "packing", label: "Packing", match: (s: string) => /pack|label/i.test(s) },
] as const;

export function normalizeKitchenStationSlug(raw: string | null | undefined): string | null {
  if (!raw || raw === "all") return null;
  const hit = KITCHEN_STATION_SLUGS.find((s) => s.slug === raw);
  return hit ? raw : null;
}

function stationMatchesSlug(station: string | null, slug: string | null): boolean {
  if (!slug) return true;
  const def = KITCHEN_STATION_SLUGS.find((s) => s.slug === slug);
  if (!def || def.slug === "all") return true;
  const key = (station ?? "").trim();
  if (!key) return slug === "prep";
  return def.match(key);
}

function isRushItem(w: KitchenWorkRowDTO, now: number): boolean {
  if (w.priority === "HIGH" || w.priority === "CRITICAL") return true;
  if (w.dueAt) {
    const due = new Date(w.dueAt).getTime();
    if (due < now) return true;
    if (due - now < 45 * 60 * 1000) return true;
  }
  return false;
}

export function filterKitchenWorkItems(
  items: KitchenWorkRowDTO[],
  opts: { stationSlug: string | null; mode: KitchenScreenMode; viewerStaffId: string | null },
): KitchenWorkRowDTO[] {
  const now = Date.now();
  let list = [...items];

  if (opts.stationSlug) {
    list = list.filter((w) => stationMatchesSlug(w.station, opts.stationSlug));
  }

  switch (opts.mode) {
    case "rush":
      list = list.filter((w) => isRushItem(w, now));
      break;
    case "packing":
      list = list.filter((w) => w.requiresPacking || w.status === "PACK_HANDOFF");
      break;
    case "my_tasks":
      if (opts.viewerStaffId) {
        list = list.filter((w) => w.assignedToId === opts.viewerStaffId);
      }
      break;
    case "bar_prep":
      list = list.filter((w) => stationMatchesSlug(w.station, "bar"));
      break;
    case "bakery_batch":
      list = list.filter((w) => stationMatchesSlug(w.station, "bakery"));
      break;
    case "meal_prep":
      list = list.filter((w) => w.requiresPacking || /portion|pack|meal/i.test(w.title));
      break;
    case "event":
    case "batch":
    case "station":
    case "all":
    default:
      break;
  }

  return list;
}

export function sortKitchenWorkQueue(items: KitchenWorkRowDTO[]): KitchenWorkRowDTO[] {
  return [...items].sort((a, b) => {
    const la = a.dueAt ? isWorkLate(new Date(a.dueAt), a.status as ProductionWorkStatus) : false;
    const lb = b.dueAt ? isWorkLate(new Date(b.dueAt), b.status as ProductionWorkStatus) : false;
    if (la !== lb) return la ? -1 : 1;
    const pa = prioritySortScore(a.priority as ProductionWorkPriority);
    const pb = prioritySortScore(b.priority as ProductionWorkPriority);
    if (pa !== pb) return pb - pa;
    const da = a.dueAt ? new Date(a.dueAt).getTime() : Number.MAX_SAFE_INTEGER;
    const db = b.dueAt ? new Date(b.dueAt).getTime() : Number.MAX_SAFE_INTEGER;
    return da - db;
  });
}

export function countLate(items: KitchenWorkRowDTO[]): number {
  return items.filter((w) => w.dueAt && isWorkLate(new Date(w.dueAt), w.status as ProductionWorkStatus)).length;
}

const VALID_MODES: readonly KitchenScreenMode[] = [
  "all",
  "station",
  "my_tasks",
  "rush",
  "packing",
  "event",
  "batch",
  "bar_prep",
  "bakery_batch",
  "meal_prep",
];

export function normalizeKitchenScreenMode(raw: string | null | undefined): KitchenScreenMode {
  if (raw && (VALID_MODES as readonly string[]).includes(raw)) return raw as KitchenScreenMode;
  return "all";
}

export function normalizeKitchenCardSize(raw: string | null | undefined): "large" | "compact" {
  return raw === "compact" ? "compact" : "large";
}
