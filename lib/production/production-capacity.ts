import type { WorkItemKpiInput } from "@/lib/production/production-aggregation";

const OVERLOAD_RATIO = 8;

/** Simple overload heuristic: many open tasks vs nominal station capacity. */
export function stationOverloadWarnings(
  stationLoad: [string, number][],
  capacityUnitsByStation: Record<string, number> | null,
): { station: string; count: number; overloaded: boolean }[] {
  return stationLoad.map(([station, count]) => {
    const cap = capacityUnitsByStation?.[station] ?? OVERLOAD_RATIO;
    return { station, count, overloaded: count > cap };
  });
}

export function overloadFromItems(items: WorkItemKpiInput[]): { station: string; count: number; overloaded: boolean }[] {
  const map = new Map<string, number>();
  for (const i of items) {
    if (i.status === "DONE" || i.status === "CANCELLED") continue;
    const s = (i.station?.trim() || "Unassigned").slice(0, 64);
    map.set(s, (map.get(s) ?? 0) + 1);
  }
  const pairs = [...map.entries()].sort((a, b) => b[1] - a[1]);
  return stationOverloadWarnings(pairs, null);
}
