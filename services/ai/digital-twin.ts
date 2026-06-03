import { defaultFilters } from "@/lib/analytics/filters";
import { mergeSettingsCenter } from "@/lib/settings/settings-defaults";
import type {
  KitchenSimulation,
  KitchenTwinConfig,
  DigitalTwinDashboardPayload,
  SimulationMenuMixItem,
  SimulationParams,
  SimulationResult,
  TwinEquipment,
  TwinStaff,
  TwinStation,
} from "@/lib/ai/digital-twin-types";
import { simulateKitchen } from "@/lib/ai/digital-twin-simulation";
import { applyDigitalTwinConfidenceCap } from "@/lib/ai/digital-twin-data-gate";
import { prisma } from "@/lib/prisma";
import { resolveOwnerWorkspaceId, resolveWorkspaceOwnerUserId } from "@/lib/scope/resolve-owner-workspace-id";
import { resolveOwnerScopedWhere } from "@/lib/scope/workspace-resource-scope";
import { loadDigitalTwinDataGate } from "@/services/ai/digital-twin-data-gate-service";
import { loadExecutiveOverview } from "@/services/executive/executive-dashboard-service";

export type { KitchenSimulation, SimulationParams, SimulationResult, KitchenTwinConfig, DigitalTwinDashboardPayload } from "@/lib/ai/digital-twin-types";

const DEFAULT_STATIONS = ["Cold prep", "Hot line", "Grill", "Pack"];

const EQUIPMENT_BY_STATION: Record<string, string> = {
  grill: "Grill",
  hot: "Flat top",
  fry: "Fryer",
  cold: "Prep bench",
  prep: "Prep bench",
  pack: "Expo screen",
  expo: "Expo screen",
  bakery: "Oven",
};

function inferEquipmentName(stationName: string): string {
  const lower = stationName.toLowerCase();
  for (const [key, label] of Object.entries(EQUIPMENT_BY_STATION)) {
    if (lower.includes(key)) return label;
  }
  return `${stationName} station`;
}

function inferThroughput(stationName: string): number {
  const lower = stationName.toLowerCase();
  if (lower.includes("grill") || lower.includes("hot")) return 1.15;
  if (lower.includes("fry")) return 1.05;
  if (lower.includes("pack") || lower.includes("expo")) return 1.25;
  return 1;
}

function buildDefaultConfig(): KitchenTwinConfig {
  const stations: TwinStation[] = DEFAULT_STATIONS.map((name, i) => ({
    name,
    capacity: i === 1 || i === 2 ? 2 : 1,
    currentLoad: 0,
  }));
  const staff: TwinStaff[] = stations.slice(0, 3).map((s) => ({
    name: `${s.name} lead`,
    station: s.name,
    efficiency: 0.85,
  }));
  const equipment: TwinEquipment[] = stations.map((s) => ({
    name: inferEquipmentName(s.name),
    station: s.name,
    throughput: inferThroughput(s.name),
  }));
  return { stations, staff, equipment };
}

async function loadKitchenTwinConfig(userId: string): Promise<KitchenTwinConfig> {
  const stationScope = await resolveOwnerScopedWhere(userId);
  const [dbStations, kitchen, activeStaff, todayShifts] = await Promise.all([
    prisma.productionStation.findMany({
      where: { AND: [stationScope, { active: true }] },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      take: 20,
    }),
    prisma.kitchenSettings.findUnique({
      where: { userId },
      select: { settingsCenterJson: true },
    }),
    prisma.staffMember.findMany({
      where: { userId, status: "ACTIVE" },
      select: { id: true, name: true, roleType: true },
      take: 30,
    }),
    prisma.staffShift.findMany({
      where: {
        userId,
        shiftDate: {
          gte: new Date(new Date().setHours(0, 0, 0, 0)),
          lt: new Date(new Date().setHours(23, 59, 59, 999)),
        },
      },
      include: { staffMember: { select: { name: true, roleType: true } } },
      take: 50,
    }),
  ]);

  const settings = mergeSettingsCenter(kitchen?.settingsCenterJson ?? null);
  const stationNames =
    dbStations.length > 0
      ? dbStations.map((s) => s.name)
      : settings.operations.stations.length > 0
        ? settings.operations.stations
        : DEFAULT_STATIONS;

  const stations: TwinStation[] =
    dbStations.length > 0
      ? dbStations.map((s) => ({
          name: s.name,
          capacity: Math.max(s.capacityUnits, 1),
          currentLoad: 0,
        }))
      : stationNames.map((name) => ({
          name,
          capacity: /hot|grill|line/i.test(name) ? 2 : 1,
          currentLoad: 0,
        }));

  const staff: TwinStaff[] = [];
  const shiftStaff = todayShifts.map((shift) => shift.staffMember);
  const roster = shiftStaff.length > 0 ? shiftStaff : activeStaff;

  roster.forEach((member, index) => {
    const station = stations[index % stations.length]!;
    const role = "roleType" in member ? member.roleType : "LINE_COOK";
    const efficiency =
      role === "KITCHEN_LEAD" || role === "MANAGER" ? 0.92 : role === "LINE_COOK" ? 0.88 : 0.8;
    staff.push({
      name: member.name,
      station: station.name,
      efficiency,
    });
  });

  if (staff.length === 0) {
    for (const station of stations.slice(0, Math.min(3, stations.length))) {
      staff.push({ name: `${station.name} (default)`, station: station.name, efficiency: 0.75 });
    }
  }

  const equipment: TwinEquipment[] = stations.map((s) => ({
    name: inferEquipmentName(s.name),
    station: s.name,
    throughput: inferThroughput(s.name),
  }));

  return { stations, staff, equipment };
}

/**
 * Restaurant Digital Twin — discrete-event kitchen simulation.
 * Loads stations from ProductionStation / settings, staff from today's shifts, then simulates order flow.
 */
export async function createDigitalTwin(workspaceId: string): Promise<KitchenSimulation> {
  const ownerUserId = await resolveWorkspaceOwnerUserId(workspaceId);
  if (!ownerUserId) {
    throw new Error(`Workspace not found: ${workspaceId}`);
  }

  const config = await loadKitchenTwinConfig(ownerUserId).catch(() => buildDefaultConfig());

  return {
    config,
    simulate(params: SimulationParams): SimulationResult {
      return simulateKitchen(config, params);
    },
  };
}

export async function createDigitalTwinForUser(userId: string): Promise<KitchenSimulation> {
  const workspaceId = await resolveOwnerWorkspaceId(userId);
  if (!workspaceId) throw new Error(`No workspace for user: ${userId}`);
  return createDigitalTwin(workspaceId);
}

/** Run a scenario without retaining twin state — convenience for API/actions. */
export async function runKitchenSimulation(
  workspaceId: string,
  params: SimulationParams,
): Promise<SimulationResult> {
  const ownerUserId = await resolveWorkspaceOwnerUserId(workspaceId);
  if (!ownerUserId) {
    throw new Error(`Workspace not found: ${workspaceId}`);
  }

  const [twin, dataGate] = await Promise.all([
    createDigitalTwin(workspaceId),
    loadDigitalTwinDataGate(ownerUserId),
  ]);
  const raw = twin.simulate(params);
  return applyDigitalTwinConfidenceCap(raw, dataGate);
}

/** Menu mix from recent order volume — for what-if scenario defaults. */
export async function loadHistoricalMenuMix(userId: string): Promise<SimulationMenuMixItem[]> {
  const overview = await loadExecutiveOverview({ userId }, defaultFilters());
  if (overview.topProducts.length === 0) {
    return [{ item: "House favorite", percentage: 100 }];
  }
  const totalQty = overview.topProducts.reduce((s, p) => s + p.quantity, 0);
  if (totalQty <= 0) {
    return overview.topProducts.slice(0, 5).map((p) => ({
      item: p.title,
      percentage: 100 / Math.min(overview.topProducts.length, 5),
    }));
  }
  return overview.topProducts.slice(0, 6).map((p) => ({
    item: p.title,
    percentage: (p.quantity / totalQty) * 100,
  }));
}

/** Server-rendered bundle for the Digital Twin analytics page. */
export async function loadDigitalTwinDashboard(workspaceId: string): Promise<DigitalTwinDashboardPayload> {
  const ownerUserId = await resolveWorkspaceOwnerUserId(workspaceId);
  if (!ownerUserId) {
    throw new Error(`Workspace not found: ${workspaceId}`);
  }

  const [twin, defaultMenuMix, dataGate] = await Promise.all([
    createDigitalTwin(workspaceId),
    loadHistoricalMenuMix(ownerUserId),
    loadDigitalTwinDataGate(ownerUserId),
  ]);

  const initialResult = applyDigitalTwinConfidenceCap(
    twin.simulate({
      orderCount: 60,
      timeWindow: 60,
      menuMix: defaultMenuMix,
    }),
    dataGate,
  );

  return {
    config: twin.config,
    defaultMenuMix,
    initialResult,
    dataGate,
  };
}
