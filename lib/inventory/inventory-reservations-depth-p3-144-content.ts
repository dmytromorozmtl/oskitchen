import {
  INVENTORY_RESERVATIONS_DEPTH_P3_144_INVENTORY_CAPABILITY_COUNT,
  INVENTORY_RESERVATIONS_DEPTH_P3_144_INVENTORY_CAPABILITY_IDS,
  INVENTORY_RESERVATIONS_DEPTH_P3_144_RESERVATION_CAPABILITY_COUNT,
  INVENTORY_RESERVATIONS_DEPTH_P3_144_RESERVATION_CAPABILITY_IDS,
  INVENTORY_RESERVATIONS_DEPTH_P3_144_RESERVATIONS_ROUTE,
  INVENTORY_RESERVATIONS_DEPTH_P3_144_ROUTE,
  type InventoryDepthCapabilityId,
  type ReservationDepthCapabilityId,
} from "@/lib/inventory/inventory-reservations-depth-p3-144-policy";

export const INVENTORY_RESERVATIONS_DEPTH_P3_144_EYEBROW =
  "Lightspeed parity · inventory + reservations" as const;

export const INVENTORY_RESERVATIONS_DEPTH_P3_144_SUBLINE =
  "Nine shipped depth modules — five inventory control surfaces and four reservation host tools. BETA baseline until pilot variance and booking throughput are measured." as const;

export type InventoryDepthCapability = {
  id: InventoryDepthCapabilityId;
  label: string;
  route: string;
  testId: string;
  lightspeedTypical: string;
  osKitchenStatus: string;
};

export type ReservationDepthCapability = {
  id: ReservationDepthCapabilityId;
  label: string;
  route: string;
  testId: string;
  lightspeedTypical: string;
  osKitchenStatus: string;
};

export const INVENTORY_RESERVATIONS_DEPTH_P3_144_INVENTORY_CAPABILITIES: readonly InventoryDepthCapability[] =
  [
    {
      id: "stock_counts",
      label: "Stock counts",
      route: "/dashboard/inventory/counts",
      testId: "inventory-depth-stock-counts",
      lightspeedTypical: "Cycle counts + variance export",
      osKitchenStatus: "shipped",
    },
    {
      id: "receiving",
      label: "Receiving",
      route: "/dashboard/inventory/receiving",
      testId: "inventory-depth-receiving",
      lightspeedTypical: "PO receiving + cost updates",
      osKitchenStatus: "shipped",
    },
    {
      id: "variance",
      label: "Variance report",
      route: "/dashboard/inventory/variance-report",
      testId: "inventory-depth-variance",
      lightspeedTypical: "Expected vs actual shrinkage",
      osKitchenStatus: "shipped",
    },
    {
      id: "purchase_suggestions",
      label: "Purchase suggestions",
      route: "/dashboard/inventory/purchase-suggestions",
      testId: "inventory-depth-purchase-suggestions",
      lightspeedTypical: "Par-level reorder alerts",
      osKitchenStatus: "shipped",
    },
    {
      id: "pos_impacts",
      label: "POS depletion",
      route: "/dashboard/inventory/pos-impacts",
      testId: "inventory-depth-pos-impacts",
      lightspeedTypical: "Recipe depletion on sale",
      osKitchenStatus: "shipped",
    },
  ] as const;

export const INVENTORY_RESERVATIONS_DEPTH_P3_144_RESERVATION_CAPABILITIES: readonly ReservationDepthCapability[] =
  [
    {
      id: "calendar_host",
      label: "Host calendar",
      route: INVENTORY_RESERVATIONS_DEPTH_P3_144_RESERVATIONS_ROUTE,
      testId: "reservation-depth-calendar-host",
      lightspeedTypical: "Floor plan + host screen",
      osKitchenStatus: "shipped",
    },
    {
      id: "waitlist_sms",
      label: "Waitlist + SMS",
      route: INVENTORY_RESERVATIONS_DEPTH_P3_144_RESERVATIONS_ROUTE,
      testId: "reservation-depth-waitlist-sms",
      lightspeedTypical: "Quoted wait + guest SMS",
      osKitchenStatus: "shipped",
    },
    {
      id: "conflict_detection",
      label: "Conflict detection",
      route: INVENTORY_RESERVATIONS_DEPTH_P3_144_RESERVATIONS_ROUTE,
      testId: "reservation-depth-conflict-detection",
      lightspeedTypical: "Overlap guard on book",
      osKitchenStatus: "shipped",
    },
    {
      id: "public_booking",
      label: "Public booking widget",
      route: "/dashboard/storefront/reservations",
      testId: "reservation-depth-public-booking",
      lightspeedTypical: "Guest self-serve booking",
      osKitchenStatus: "shipped",
    },
  ] as const;

export function assertInventoryReservationsDepthCapabilityCounts(): boolean {
  return (
    INVENTORY_RESERVATIONS_DEPTH_P3_144_INVENTORY_CAPABILITIES.length ===
      INVENTORY_RESERVATIONS_DEPTH_P3_144_INVENTORY_CAPABILITY_COUNT &&
    INVENTORY_RESERVATIONS_DEPTH_P3_144_RESERVATION_CAPABILITIES.length ===
      INVENTORY_RESERVATIONS_DEPTH_P3_144_RESERVATION_CAPABILITY_COUNT &&
    INVENTORY_RESERVATIONS_DEPTH_P3_144_INVENTORY_CAPABILITY_IDS.length ===
      INVENTORY_RESERVATIONS_DEPTH_P3_144_INVENTORY_CAPABILITY_COUNT &&
    INVENTORY_RESERVATIONS_DEPTH_P3_144_RESERVATION_CAPABILITY_IDS.length ===
      INVENTORY_RESERVATIONS_DEPTH_P3_144_RESERVATION_CAPABILITY_COUNT
  );
}

export const INVENTORY_RESERVATIONS_DEPTH_P3_144_OPERATOR_LINKS = [
  { label: "Depth hub", href: INVENTORY_RESERVATIONS_DEPTH_P3_144_ROUTE },
  { label: "Reservations host", href: INVENTORY_RESERVATIONS_DEPTH_P3_144_RESERVATIONS_ROUTE },
  { label: "Inventory manager", href: "/dashboard/inventory/manager" },
] as const;
