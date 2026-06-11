import { DEFAULT_KDS_STATIONS, type KdsStationDefinition } from "@/lib/kitchen/kds-multi-station-policy";
import {
  MULTI_STATION_KDS_POLICY_ID,
  MULTI_STATION_KDS_STATION_COUNT,
  MULTI_STATION_KDS_STATION_IDS,
  type MultiStationKdsStationId,
} from "@/lib/kitchen/multi-station-kds-p2-90-policy";

/** Blueprint P2-90 — six pilot KDS stations. */
export const MULTI_STATION_KDS_PACKING_STATION: KdsStationDefinition = {
  id: "packing",
  name: "Packing",
  foodType: "prep",
  keywords: ["pack", "bag", "label", "handoff", "delivery bag", "to-go"],
  sortOrder: 6,
};

export const MULTI_STATION_KDS_CORE_STATIONS: readonly KdsStationDefinition[] = [
  DEFAULT_KDS_STATIONS.find((s) => s.id === "grill")!,
  DEFAULT_KDS_STATIONS.find((s) => s.id === "fry")!,
  DEFAULT_KDS_STATIONS.find((s) => s.id === "cold")!,
  DEFAULT_KDS_STATIONS.find((s) => s.id === "bar")!,
  DEFAULT_KDS_STATIONS.find((s) => s.id === "expo")!,
  MULTI_STATION_KDS_PACKING_STATION,
];

export const MULTI_STATION_KDS_CORE_POLICY_ID = MULTI_STATION_KDS_POLICY_ID;

export function isMultiStationKdsCoreStationId(id: string): id is MultiStationKdsStationId {
  return (MULTI_STATION_KDS_STATION_IDS as readonly string[]).includes(id);
}

export function filterRegistryToCoreStations(
  registry: readonly KdsStationDefinition[],
): KdsStationDefinition[] {
  const byId = new Map(registry.map((station) => [station.id.toLowerCase(), station]));
  const byName = new Map(registry.map((station) => [station.name.toLowerCase(), station]));

  return MULTI_STATION_KDS_CORE_STATIONS.map((core) => {
    return (
      byId.get(core.id) ??
      byName.get(core.name.toLowerCase()) ?? {
        ...core,
      }
    );
  });
}

export function assertMultiStationKdsCoreRegistry(
  registry: readonly KdsStationDefinition[],
): boolean {
  return registry.length === MULTI_STATION_KDS_STATION_COUNT;
}
