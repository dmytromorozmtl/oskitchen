import {
  buildKdsMultiStationSnapshot,
  type KdsMultiStationSnapshot,
} from "@/lib/kitchen/kds-multi-station";
import {
  filterRegistryToCoreStations,
  MULTI_STATION_KDS_CORE_STATIONS,
} from "@/lib/kitchen/multi-station-kds-p2-90-core-stations";
import { MULTI_STATION_KDS_POLICY_ID } from "@/lib/kitchen/multi-station-kds-p2-90-policy";
import type { ProductionStationSnapshot } from "@/lib/kitchen/kds-production-view";
import { loadKdsStationRoutingRules } from "@/lib/kitchen/kds-station-routing-rules-storage";
import {
  loadActiveProductionWorkItems,
  loadKdsStationRegistry,
} from "@/services/kitchen/multi-station-service";

export type MultiStationKdsPilotSnapshot = {
  policyId: typeof MULTI_STATION_KDS_POLICY_ID;
  upstreamPolicyId: KdsMultiStationSnapshot["policyId"];
  coreStationCount: number;
  stations: ProductionStationSnapshot[];
  routedItemCount: number;
  bottleneckStation: string | null;
};

export async function loadMultiStationKdsPilotSnapshot(
  userId: string,
): Promise<MultiStationKdsPilotSnapshot> {
  const [fullRegistry, items, rules] = await Promise.all([
    loadKdsStationRegistry(userId),
    loadActiveProductionWorkItems(userId),
    loadKdsStationRoutingRules(userId),
  ]);

  const coreRegistry = filterRegistryToCoreStations(
    fullRegistry.length > 0 ? fullRegistry : [...MULTI_STATION_KDS_CORE_STATIONS],
  );

  const snapshot = buildKdsMultiStationSnapshot(items, coreRegistry, { rules });

  return {
    policyId: MULTI_STATION_KDS_POLICY_ID,
    upstreamPolicyId: snapshot.policyId,
    coreStationCount: coreRegistry.length,
    stations: snapshot.production.stations.filter((station) =>
      coreRegistry.some(
        (core) => core.name.toLowerCase() === station.station.toLowerCase(),
      ),
    ),
    routedItemCount: snapshot.routedItems.length,
    bottleneckStation: snapshot.production.bottleneckStation,
  };
}
