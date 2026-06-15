import type { DeliveryRouteStatus, DeliveryStopStatus } from "@prisma/client";

export const ROUTE_STATUSES = [
  "DRAFT",
  "PLANNED",
  "PACKING",
  "READY",
  "IN_PROGRESS",
  "OUT_FOR_DELIVERY",
  "PARTIALLY_COMPLETED",
  "COMPLETED",
  "FAILED",
  "CANCELLED",
] as const satisfies readonly DeliveryRouteStatus[];

export const STOP_STATUSES = [
  "PENDING",
  "PACKED",
  "READY",
  "LOADED",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
  "FAILED",
  "SKIPPED",
  "RETURNED",
] as const satisfies readonly DeliveryStopStatus[];

export const ROUTE_STATUS_LABEL: Record<DeliveryRouteStatus, string> = {
  DRAFT: "Draft",
  PLANNED: "Planned",
  PACKING: "Packing",
  READY: "Ready",
  IN_PROGRESS: "In progress",
  OUT_FOR_DELIVERY: "Out for delivery",
  PARTIALLY_COMPLETED: "Partially completed",
  COMPLETED: "Completed",
  FAILED: "Failed",
  CANCELLED: "Cancelled",
};

export const STOP_STATUS_LABEL: Record<DeliveryStopStatus, string> = {
  PENDING: "Pending",
  PACKED: "Packed",
  READY: "Ready",
  LOADED: "Loaded",
  OUT_FOR_DELIVERY: "Out for delivery",
  DELIVERED: "Delivered",
  FAILED: "Failed",
  SKIPPED: "Skipped",
  RETURNED: "Returned",
};

export const TERMINAL_STOP_STATUSES: readonly DeliveryStopStatus[] = [
  "DELIVERED",
  "FAILED",
  "SKIPPED",
  "RETURNED",
];

export function isTerminalStopStatus(s: DeliveryStopStatus): boolean {
  return TERMINAL_STOP_STATUSES.includes(s);
}

/**
 * Derive a route status from current stop statuses. Caller is responsible for
 * applying CANCELLED / DRAFT manually — those reflect intent, not progress.
 */
export function computeRouteStatusFromStops(
  current: DeliveryRouteStatus,
  stops: readonly { status: DeliveryStopStatus }[],
): DeliveryRouteStatus {
  if (current === "DRAFT" || current === "CANCELLED") return current;
  if (stops.length === 0) return current;

  const allDelivered = stops.every((s) => s.status === "DELIVERED");
  const allTerminal = stops.every((s) => isTerminalStopStatus(s.status));
  const anyOut = stops.some((s) => s.status === "OUT_FOR_DELIVERY" || s.status === "LOADED");
  const anyDelivered = stops.some((s) => s.status === "DELIVERED");
  const allReady = stops.every((s) => s.status === "READY" || s.status === "PACKED" || isTerminalStopStatus(s.status));
  const allPacked = stops.every((s) => s.status === "PACKED" || s.status === "READY" || isTerminalStopStatus(s.status));

  if (allDelivered) return "COMPLETED";
  if (allTerminal && anyDelivered) return "PARTIALLY_COMPLETED";
  if (allTerminal && !anyDelivered) return "FAILED";
  if (anyOut) return "OUT_FOR_DELIVERY";
  if (allReady) return "READY";
  if (allPacked) return "PACKING";
  return "PLANNED";
}

export function countStopBuckets(stops: readonly { status: DeliveryStopStatus }[]): {
  total: number;
  completed: number;
  failed: number;
  outForDelivery: number;
  ready: number;
  pending: number;
} {
  let completed = 0;
  let failed = 0;
  let outForDelivery = 0;
  let ready = 0;
  let pending = 0;
  for (const s of stops) {
    if (s.status === "DELIVERED") completed += 1;
    else if (s.status === "FAILED") failed += 1;
    else if (s.status === "OUT_FOR_DELIVERY" || s.status === "LOADED") outForDelivery += 1;
    else if (s.status === "READY" || s.status === "PACKED") ready += 1;
    else pending += 1;
  }
  return { total: stops.length, completed, failed, outForDelivery, ready, pending };
}
