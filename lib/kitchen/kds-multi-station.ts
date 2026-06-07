import {
  buildProductionViewSnapshot,
  normalizeProductionStation,
  type ProductionViewSnapshot,
  type ProductionViewWorkItemInput,
} from "@/lib/kitchen/kds-production-view";
import {
  evaluateKdsStationRoutingRules,
  type KdsStationRoutingRule,
} from "@/lib/kitchen/kds-station-routing-rules-policy";
import {
  DEFAULT_KDS_STATIONS,
  KDS_CATEGORY_FOOD_TYPE_MAP,
  KDS_MULTI_STATION_MIN_STATIONS,
  KDS_MULTI_STATION_POLICY_ID,
  type KdsFoodType,
  type KdsStationDefinition,
} from "@/lib/kitchen/kds-multi-station-policy";

export type KdsRoutingReason = "assigned" | "rule" | "keyword" | "food_type" | "fallback";

export type KdsRoutedWorkItem = ProductionViewWorkItemInput & {
  routedStation: string;
  foodType: KdsFoodType;
  routingReason: KdsRoutingReason;
};

export type KdsMultiStationSnapshot = {
  policyId: typeof KDS_MULTI_STATION_POLICY_ID;
  stationCount: number;
  registry: KdsStationDefinition[];
  routedItems: KdsRoutedWorkItem[];
  production: ProductionViewSnapshot;
};

export function listDefaultKdsStations(): KdsStationDefinition[] {
  return [...DEFAULT_KDS_STATIONS];
}

export function mergeStationRegistry(
  configured: readonly Pick<KdsStationDefinition, "name" | "foodType" | "sortOrder">[],
): KdsStationDefinition[] {
  if (configured.length === 0) {
    return listDefaultKdsStations();
  }

  const byName = new Map(
    listDefaultKdsStations().map((station) => [station.name.toLowerCase(), station]),
  );

  const merged: KdsStationDefinition[] = configured.map((row, index) => {
    const key = row.name.trim().toLowerCase();
    const fallback = byName.get(key);
    return {
      id: fallback?.id ?? `custom-${index}`,
      name: row.name.trim(),
      foodType: row.foodType ?? fallback?.foodType ?? "prep",
      keywords: fallback?.keywords ?? [],
      sortOrder: row.sortOrder ?? index,
    };
  });

  for (const station of listDefaultKdsStations()) {
    if (!merged.some((row) => row.name.toLowerCase() === station.name.toLowerCase())) {
      merged.push(station);
    }
  }

  return merged.sort((a, b) => a.sortOrder - b.sortOrder);
}

function stationByFoodType(
  registry: readonly KdsStationDefinition[],
  foodType: KdsFoodType,
): KdsStationDefinition {
  return (
    registry.find((station) => station.foodType === foodType) ??
    registry.find((station) => station.foodType === "prep") ??
    registry[0]!
  );
}

function stationByKeyword(
  registry: readonly KdsStationDefinition[],
  title: string,
): KdsStationDefinition | null {
  const haystack = title.toLowerCase();
  for (const station of registry) {
    if (station.keywords.some((keyword) => haystack.includes(keyword))) {
      return station;
    }
  }
  return null;
}

export function resolveKdsFoodTypeFromCategory(category: string | null | undefined): KdsFoodType {
  const key = category?.trim().toUpperCase() ?? "OTHER";
  return KDS_CATEGORY_FOOD_TYPE_MAP[key] ?? "prep";
}

export function routeKdsWorkItemToStation(
  item: ProductionViewWorkItemInput & { productCategory?: string | null; productId?: string | null },
  registry: readonly KdsStationDefinition[],
  rules?: readonly KdsStationRoutingRule[],
): KdsRoutedWorkItem {
  const assigned = item.station?.trim();
  if (assigned) {
    const match =
      registry.find((station) => station.name.toLowerCase() === assigned.toLowerCase()) ??
      registry.find((station) => station.foodType === assigned.toLowerCase());
    return {
      ...item,
      routedStation: assigned,
      foodType: match?.foodType ?? resolveKdsFoodTypeFromCategory(item.productCategory),
      routingReason: "assigned",
    };
  }

  if (rules?.length) {
    const ruleMatch = evaluateKdsStationRoutingRules(
      {
        id: item.id,
        title: item.title,
        productId: item.productId ?? null,
        productCategory: item.productCategory ?? null,
      },
      rules,
    );
    if (ruleMatch) {
      const station =
        registry.find(
          (row) => row.name.toLowerCase() === ruleMatch.stationName.toLowerCase(),
        ) ?? registry.find((row) => row.foodType === foodTypeForStationName(ruleMatch.stationName));
      return {
        ...item,
        routedStation: ruleMatch.stationName,
        foodType: station?.foodType ?? resolveKdsFoodTypeFromCategory(item.productCategory),
        routingReason: "rule",
      };
    }
  }

  const keywordMatch = stationByKeyword(registry, item.title);
  if (keywordMatch) {
    return {
      ...item,
      routedStation: keywordMatch.name,
      foodType: keywordMatch.foodType,
      routingReason: "keyword",
    };
  }

  const foodType = resolveKdsFoodTypeFromCategory(item.productCategory);
  const typeMatch = stationByFoodType(registry, foodType);
  return {
    ...item,
    routedStation: typeMatch.name,
    foodType: typeMatch.foodType,
    routingReason: "food_type",
  };
}

function foodTypeForStationName(name: string): KdsFoodType | undefined {
  return DEFAULT_KDS_STATIONS.find(
    (station) => station.name.toLowerCase() === name.trim().toLowerCase(),
  )?.foodType;
}

export function applyKdsMultiStationRouting(
  items: readonly (ProductionViewWorkItemInput & { productCategory?: string | null; productId?: string | null })[],
  registry: readonly KdsStationDefinition[],
  rules?: readonly KdsStationRoutingRule[],
): KdsRoutedWorkItem[] {
  return items.map((item) => routeKdsWorkItemToStation(item, registry, rules));
}

function emptyStationSnapshot(station: string) {
  return {
    station,
    activeItems: 0,
    inProgressItems: 0,
    queuedItems: 0,
    overdueItems: 0,
    loadScore: 0,
    loadPercent: 0,
    estimatedClearMinutes: 0,
    avgWaitMinutes: 0,
    isBottleneck: false,
    items: [],
  };
}

export function mergeRegistryStationsIntoSnapshot(
  snapshot: ProductionViewSnapshot,
  registry: readonly KdsStationDefinition[],
): ProductionViewSnapshot {
  const byName = new Map(snapshot.stations.map((station) => [station.station, station]));
  const merged = registry.map((def) => byName.get(def.name) ?? emptyStationSnapshot(def.name));

  for (const station of snapshot.stations) {
    if (!merged.some((row) => row.station === station.station)) {
      merged.push(station);
    }
  }

  merged.sort((a, b) => b.loadScore - a.loadScore);
  const bottleneck = merged.find((station) => station.activeItems > 0) ?? null;
  for (const station of merged) {
    station.isBottleneck = bottleneck?.station === station.station;
  }

  return {
    ...snapshot,
    bottleneckStation: bottleneck?.station ?? snapshot.bottleneckStation,
    stations: merged,
  };
}

export function buildKdsMultiStationSnapshot(
  items: readonly (ProductionViewWorkItemInput & { productCategory?: string | null; productId?: string | null })[],
  registry: readonly KdsStationDefinition[],
  options?: { now?: Date; rules?: readonly KdsStationRoutingRule[] },
): KdsMultiStationSnapshot {
  const routedItems = applyKdsMultiStationRouting(items, registry, options?.rules);
  const routedForProduction: ProductionViewWorkItemInput[] = routedItems.map((item) => ({
    ...item,
    station: item.routedStation,
  }));

  const production = mergeRegistryStationsIntoSnapshot(
    buildProductionViewSnapshot(routedForProduction, options),
    registry,
  );

  return {
    policyId: KDS_MULTI_STATION_POLICY_ID,
    stationCount: registry.length,
    registry: [...registry],
    routedItems,
    production,
  };
}

export function assertKdsMultiStationRegistry(registry: readonly KdsStationDefinition[]): boolean {
  return registry.length >= KDS_MULTI_STATION_MIN_STATIONS;
}

export function normalizeKdsStationFoodType(type: string | null | undefined): KdsFoodType {
  const key = type?.trim().toLowerCase() as KdsFoodType | undefined;
  if (key && DEFAULT_KDS_STATIONS.some((station) => station.foodType === key)) {
    return key;
  }
  return "prep";
}
