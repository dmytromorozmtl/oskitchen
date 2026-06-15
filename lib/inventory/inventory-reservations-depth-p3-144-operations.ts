import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
  INVENTORY_RESERVATIONS_DEPTH_P3_144_INVENTORY_CAPABILITIES,
  INVENTORY_RESERVATIONS_DEPTH_P3_144_RESERVATION_CAPABILITIES,
} from "@/lib/inventory/inventory-reservations-depth-p3-144-content";
import {
  INVENTORY_RESERVATIONS_DEPTH_P3_144_COMPONENT,
  INVENTORY_RESERVATIONS_DEPTH_P3_144_INVENTORY_CAPABILITY_COUNT,
  INVENTORY_RESERVATIONS_DEPTH_P3_144_INVENTORY_CAPABILITY_IDS,
  INVENTORY_RESERVATIONS_DEPTH_P3_144_LEGACY_INVENTORY,
  INVENTORY_RESERVATIONS_DEPTH_P3_144_LEGACY_RESERVATIONS,
  INVENTORY_RESERVATIONS_DEPTH_P3_144_PAGE,
  INVENTORY_RESERVATIONS_DEPTH_P3_144_POLICY_ID,
  INVENTORY_RESERVATIONS_DEPTH_P3_144_RESERVATION_CAPABILITY_COUNT,
  INVENTORY_RESERVATIONS_DEPTH_P3_144_RESERVATION_CAPABILITY_IDS,
  INVENTORY_RESERVATIONS_DEPTH_P3_144_RESERVATIONS_ROUTE,
  INVENTORY_RESERVATIONS_DEPTH_P3_144_ROUTE,
} from "@/lib/inventory/inventory-reservations-depth-p3-144-policy";

export type DepthCapabilityRecord = {
  id: string;
  domain: "inventory" | "reservation";
  label: string;
  route: string;
  testId: string;
  status: string;
};

export type InventoryReservationsDepthRegistry = {
  version: string;
  policyId: typeof INVENTORY_RESERVATIONS_DEPTH_P3_144_POLICY_ID;
  updatedAt: string;
  honestyNote: string;
  competitor: string;
  inventoryCapabilityCount: number;
  reservationCapabilityCount: number;
  route: string;
  reservationsRoute: string;
  activePilotCount: number;
  capabilities: DepthCapabilityRecord[];
};

export function loadInventoryReservationsDepthRegistry(
  root = process.cwd(),
  artifactPath = "artifacts/inventory-reservations-depth-registry.json",
): InventoryReservationsDepthRegistry {
  const raw = readFileSync(join(root, artifactPath), "utf8");
  return JSON.parse(raw) as InventoryReservationsDepthRegistry;
}

export function validateInventoryReservationsDepthRegistry(
  registry: InventoryReservationsDepthRegistry,
): {
  valid: boolean;
  policyIdMatches: boolean;
  countsMatch: boolean;
  capabilitiesComplete: boolean;
  zeroActivePilots: boolean;
} {
  const policyIdMatches = registry.policyId === INVENTORY_RESERVATIONS_DEPTH_P3_144_POLICY_ID;

  const countsMatch =
    registry.inventoryCapabilityCount === INVENTORY_RESERVATIONS_DEPTH_P3_144_INVENTORY_CAPABILITY_COUNT &&
    registry.reservationCapabilityCount ===
      INVENTORY_RESERVATIONS_DEPTH_P3_144_RESERVATION_CAPABILITY_COUNT &&
    registry.route === INVENTORY_RESERVATIONS_DEPTH_P3_144_ROUTE &&
    registry.reservationsRoute === INVENTORY_RESERVATIONS_DEPTH_P3_144_RESERVATIONS_ROUTE;

  const expectedCapabilities = [
    ...INVENTORY_RESERVATIONS_DEPTH_P3_144_INVENTORY_CAPABILITIES.map((cap) => ({
      ...cap,
      domain: "inventory" as const,
    })),
    ...INVENTORY_RESERVATIONS_DEPTH_P3_144_RESERVATION_CAPABILITIES.map((cap) => ({
      ...cap,
      domain: "reservation" as const,
    })),
  ];

  const capabilitiesComplete =
    registry.capabilities.length === expectedCapabilities.length &&
    expectedCapabilities.every((expected, index) => {
      const record = registry.capabilities[index];
      return (
        record?.id === expected.id &&
        record.domain === expected.domain &&
        record.testId === expected.testId &&
        record.route === expected.route &&
        record.status === "shipped"
      );
    });

  const zeroActivePilots = registry.activePilotCount === 0;

  const valid = policyIdMatches && countsMatch && capabilitiesComplete && zeroActivePilots;

  return {
    valid,
    policyIdMatches,
    countsMatch,
    capabilitiesComplete,
    zeroActivePilots,
  };
}

export function checkInventoryReservationsDepthLiveWiring(root = process.cwd()): boolean {
  const componentPath = join(root, INVENTORY_RESERVATIONS_DEPTH_P3_144_COMPONENT);
  const pagePath = join(root, INVENTORY_RESERVATIONS_DEPTH_P3_144_PAGE);
  const inventoryPath = join(root, INVENTORY_RESERVATIONS_DEPTH_P3_144_LEGACY_INVENTORY);
  const reservationsPath = join(root, INVENTORY_RESERVATIONS_DEPTH_P3_144_LEGACY_RESERVATIONS);

  if (
    !existsSync(componentPath) ||
    !existsSync(pagePath) ||
    !existsSync(inventoryPath) ||
    !existsSync(reservationsPath)
  ) {
    return false;
  }

  const componentSource = readFileSync(componentPath, "utf8");
  const pageSource = readFileSync(pagePath, "utf8");
  const inventorySource = readFileSync(inventoryPath, "utf8");
  const reservationsSource = readFileSync(reservationsPath, "utf8");

  const componentWired =
    componentSource.includes("InventoryReservationsDepthPanel") &&
    componentSource.includes("inventory-reservations-depth") &&
    INVENTORY_RESERVATIONS_DEPTH_P3_144_INVENTORY_CAPABILITY_IDS.every((id) =>
      componentSource.includes(id),
    ) &&
    INVENTORY_RESERVATIONS_DEPTH_P3_144_RESERVATION_CAPABILITY_IDS.every((id) =>
      componentSource.includes(id),
    );

  const pageWired =
    pageSource.includes("InventoryReservationsDepthPanel") &&
    pageSource.includes("/dashboard/inventory/depth");

  const legacyServicesLinked =
    inventorySource.includes("summarizeInventoryCountVariance") &&
    reservationsSource.includes("detectReservationConflict");

  return componentWired && pageWired && legacyServicesLinked;
}
