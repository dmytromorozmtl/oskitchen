import type {
  KitchenTwinConfig,
  SimulationMenuMixItem,
  SimulationParams,
  SimulationResult,
} from "@/lib/ai/digital-twin-types";

const BASE_SERVICE_MINUTES = 4;

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

function normalizeMenuMix(items: SimulationMenuMixItem[]): SimulationMenuMixItem[] {
  const filtered = items.filter((i) => i.percentage > 0 && i.item.trim());
  if (filtered.length === 0) return [{ item: "Default item", percentage: 100 }];
  const total = filtered.reduce((s, i) => s + i.percentage, 0);
  if (total <= 0) return [{ item: filtered[0]!.item, percentage: 100 }];
  return filtered.map((i) => ({ item: i.item, percentage: (i.percentage / total) * 100 }));
}

function pickMenuItem(mix: SimulationMenuMixItem[], orderIndex: number): string {
  let cursor = orderIndex % 100;
  for (const entry of mix) {
    cursor -= entry.percentage;
    if (cursor < 0) return entry.item;
  }
  return mix[mix.length - 1]?.item ?? "Item";
}

/** Map menu item label to a primary station (deterministic hash). */
export function routeItemToPrimaryStation(item: string, stationNames: string[]): string {
  if (stationNames.length === 0) return "Kitchen";
  let hash = 0;
  for (let i = 0; i < item.length; i++) hash = (hash + item.charCodeAt(i) * (i + 1)) % 9973;
  return stationNames[hash % stationNames.length]!;
}

export function defaultStationRoute(stationNames: string[]): string[] {
  if (stationNames.length <= 3) return [...stationNames];
  const prep = stationNames.find((s) => /prep|cold|salad/i.test(s)) ?? stationNames[0]!;
  const hot = stationNames.find((s) => /hot|grill|line|fry/i.test(s)) ?? stationNames[Math.floor(stationNames.length / 2)]!;
  const pack = stationNames.find((s) => /pack|expo|finish/i.test(s)) ?? stationNames[stationNames.length - 1]!;
  return [...new Set([prep, hot, pack])];
}

function serviceMinutes(stationName: string, config: KitchenTwinConfig): number {
  const station = config.stations.find((s) => s.name === stationName);
  const capacity = Math.max(station?.capacity ?? 1, 1);
  const staffAtStation = config.staff.filter((s) => s.station === stationName);
  const staffCount = Math.max(staffAtStation.length, 1);
  const avgEfficiency =
    staffAtStation.length > 0
      ? staffAtStation.reduce((sum, s) => sum + s.efficiency, 0) / staffAtStation.length
      : 0.75;
  const equipment = config.equipment.find((e) => e.station === stationName);
  const throughput = Math.max(equipment?.throughput ?? 1, 0.25);

  return BASE_SERVICE_MINUTES / (capacity * staffCount * avgEfficiency * throughput);
}

export function runDiscreteEventSimulation(input: {
  config: KitchenTwinConfig;
  orderCount: number;
  timeWindow: number;
  menuMix: SimulationMenuMixItem[];
}): SimulationResult {
  const { config, orderCount, timeWindow } = input;
  const mix = normalizeMenuMix(input.menuMix);
  const stationNames = config.stations.map((s) => s.name);
  const route = defaultStationRoute(stationNames);

  const freeAt = new Map<string, number>();
  const waitTotals = new Map<string, number>();
  const waitCounts = new Map<string, number>();
  const waitMax = new Map<string, number>();
  const busyMinutes = new Map<string, number>();

  for (const name of stationNames) {
    const stationConfig = config.stations.find((s) => s.name === name);
    const backlogTickets = Math.max(stationConfig?.currentLoad ?? 0, 0);
    const seededBusy =
      backlogTickets > 0 ? backlogTickets * serviceMinutes(name, config) : 0;
    freeAt.set(name, seededBusy);
    waitTotals.set(name, 0);
    waitCounts.set(name, 0);
    waitMax.set(name, 0);
    busyMinutes.set(name, seededBusy);
  }

  const count = Math.max(orderCount, 0);
  const window = Math.max(timeWindow, 1);

  for (let i = 0; i < count; i++) {
    const arrival = (i / Math.max(count, 1)) * window;
    const item = pickMenuItem(mix, i);
    const primary = routeItemToPrimaryStation(item, stationNames);
    const orderRoute = route.includes(primary) ? route : [primary, ...route.filter((s) => s !== primary)];

    let cursor = arrival;
    for (const stationName of orderRoute) {
      const stationFree = freeAt.get(stationName) ?? 0;
      const start = Math.max(cursor, stationFree);
      const wait = Math.max(0, start - cursor);
      const service = serviceMinutes(stationName, config);

      waitTotals.set(stationName, (waitTotals.get(stationName) ?? 0) + wait);
      waitCounts.set(stationName, (waitCounts.get(stationName) ?? 0) + 1);
      waitMax.set(stationName, Math.max(waitMax.get(stationName) ?? 0, wait));
      busyMinutes.set(stationName, (busyMinutes.get(stationName) ?? 0) + service);

      const finish = start + service;
      freeAt.set(stationName, finish);
      cursor = finish;
    }
  }

  const waitTimes = stationNames.map((station) => {
    const n = waitCounts.get(station) ?? 0;
    const total = waitTotals.get(station) ?? 0;
    return {
      station,
      avgWait: n > 0 ? round2(total / n) : 0,
      maxWait: round2(waitMax.get(station) ?? 0),
    };
  });

  const stationUtilization = stationNames.map((station) => {
    const busy = busyMinutes.get(station) ?? 0;
    const cap = Math.max(config.stations.find((s) => s.name === station)?.capacity ?? 1, 1);
    return {
      station,
      utilization: round2(Math.min(1, busy / (window * cap))),
    };
  });

  const bottleneck = waitTimes.reduce(
    (best, cur) => (cur.avgWait > best.avgWait ? cur : best),
    waitTimes[0] ?? { station: stationNames[0] ?? "Kitchen", avgWait: 0, maxWait: 0 },
  );

  const totalTime = round2(Math.max(...[...freeAt.values()], 0));
  const recommendations = generateRecommendations({
    config,
    bottleneck,
    waitTimes,
    stationUtilization,
    orderCount: count,
    timeWindow: window,
  });

  const confidence =
    count >= 40 && config.staff.length >= 2 ? 0.84 : count >= 15 ? 0.72 : 0.58;

  return {
    bottleneckStation: bottleneck.station,
    bottleneckDelay: bottleneck.maxWait,
    totalTime,
    stationUtilization,
    waitTimes,
    recommendations,
    aiAssisted: true,
    confidence,
  };
}

function generateRecommendations(input: {
  config: KitchenTwinConfig;
  bottleneck: { station: string; avgWait: number; maxWait: number };
  waitTimes: { station: string; avgWait: number; maxWait: number }[];
  stationUtilization: { station: string; utilization: number }[];
  orderCount: number;
  timeWindow: number;
}): string[] {
  const recs: string[] = [];
  recs.push(
    "AI-assisted simulation — validate against live KDS before changing staffing.",
  );

  if (input.bottleneck.maxWait >= 10) {
    const staffHere = input.config.staff.filter((s) => s.station === input.bottleneck.station).length;
    recs.push(
      `Add staff at ${input.bottleneck.station} (avg wait ${input.bottleneck.avgWait.toFixed(1)} min, max ${input.bottleneck.maxWait.toFixed(1)} min). Currently ${staffHere} assigned.`,
    );
  }

  const overloaded = input.stationUtilization.filter((s) => s.utilization >= 0.85);
  for (const s of overloaded) {
    if (s.station === input.bottleneck.station) continue;
    recs.push(`${s.station} utilization ${(s.utilization * 100).toFixed(0)}% — consider prep ahead or equipment check.`);
  }

  const underused = input.stationUtilization.filter((s) => s.utilization < 0.35 && input.orderCount >= 10);
  if (underused.length > 0 && input.bottleneck.maxWait >= 5) {
    recs.push(
      `Cross-train crew from ${underused[0]!.station} to support ${input.bottleneck.station}.`,
    );
  }

  if (input.orderCount / Math.max(input.timeWindow / 60, 0.5) > 25) {
    recs.push("Order rate exceeds ~25/hr — open a second hot line or throttle online channels.");
  }

  if (recs.length === 1) {
    recs.push("Kitchen balance looks acceptable for this scenario — monitor during actual service.");
  }

  return recs.slice(0, 5);
}

export function simulateKitchen(config: KitchenTwinConfig, params: SimulationParams): SimulationResult {
  return runDiscreteEventSimulation({
    config,
    orderCount: params.orderCount,
    timeWindow: params.timeWindow,
    menuMix: params.menuMix,
  });
}

export function generateOrders(
  orderCount: number,
  timeWindow: number,
  menuMix: SimulationMenuMixItem[],
): { item: string; arrivalMinute: number }[] {
  const mix = normalizeMenuMix(menuMix);
  const orders: { item: string; arrivalMinute: number }[] = [];
  for (let i = 0; i < orderCount; i++) {
    orders.push({
      item: pickMenuItem(mix, i),
      arrivalMinute: round2((i / Math.max(orderCount, 1)) * timeWindow),
    });
  }
  return orders;
}
