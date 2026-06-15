import type { LocationStatus } from "@prisma/client";

import {
  MULTI_LOCATION_MAP_PIN_TEST_ID_PREFIX,
  multiLocationFloorPlanHref,
} from "@/lib/enterprise/multi-location-map-view-policy";
import type { LocationAnalyticsRow } from "@/services/analytics/multi-location-analytics";

export type MultiLocationMapPin = {
  locationId: string;
  name: string;
  status: LocationStatus;
  revenue: number;
  orders: number;
  revenueShare: number | null;
  xPercent: number;
  yPercent: number;
  floorPlanHref: string;
  locationHref: string;
  pinTestId: string;
};

function gridPosition(index: number, total: number): { xPercent: number; yPercent: number } {
  if (total <= 0) return { xPercent: 50, yPercent: 50 };
  const cols = Math.max(1, Math.ceil(Math.sqrt(total)));
  const rows = Math.ceil(total / cols);
  const col = index % cols;
  const row = Math.floor(index / cols);
  const xPad = 100 / (cols + 1);
  const yPad = 100 / (rows + 1);
  return {
    xPercent: xPad + col * xPad,
    yPercent: yPad + row * yPad,
  };
}

/** Deterministic network map pins from location analytics rows. */
export function buildMultiLocationMapPins(
  locations: readonly LocationAnalyticsRow[],
): MultiLocationMapPin[] {
  const sorted = [...locations].sort((a, b) => b.revenue - a.revenue || a.locationName.localeCompare(b.locationName));

  return sorted.map((row, index) => {
    const { xPercent, yPercent } = gridPosition(index, sorted.length);
    return {
      locationId: row.locationId,
      name: row.locationName,
      status: row.status,
      revenue: row.revenue,
      orders: row.orders,
      revenueShare: row.revenueShare,
      xPercent,
      yPercent,
      floorPlanHref: multiLocationFloorPlanHref(row.locationId),
      locationHref: `/dashboard/locations/${row.locationId}`,
      pinTestId: `${MULTI_LOCATION_MAP_PIN_TEST_ID_PREFIX}${row.locationId}`,
    };
  });
}

export function findMultiLocationMapPin(
  pins: readonly MultiLocationMapPin[],
  locationId: string | null | undefined,
): MultiLocationMapPin | null {
  if (!locationId) return null;
  return pins.find((pin) => pin.locationId === locationId) ?? null;
}

export function multiLocationMapSwitcherOptions(
  pins: readonly MultiLocationMapPin[],
): Array<{ id: string; name: string }> {
  return pins.map((pin) => ({ id: pin.locationId, name: pin.name }));
}
