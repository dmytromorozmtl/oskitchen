import { totalRouteDistanceKm, type DispatchStopCandidate } from "@/lib/delivery/delivery-dispatch-optimization-policy";

/** Estimate remaining drive + stop service minutes for a route. */
export function estimateDeliveryMinutesRemaining(input: {
  distanceKm: number;
  pendingStops: number;
  avgSpeedKmh?: number;
  minutesPerStop?: number;
}): number {
  const speed = input.avgSpeedKmh ?? 35;
  const perStop = input.minutesPerStop ?? 5;
  const driveMinutes = speed > 0 ? (Math.max(0, input.distanceKm) / speed) * 60 : 0;
  return Math.round(driveMinutes + Math.max(0, input.pendingStops) * perStop);
}

export function computeRouteCompletionPct(completed: number, total: number): number {
  if (total <= 0) return 0;
  return Math.round((Math.max(0, completed) / total) * 100);
}

export function pendingStopCount(total: number, completed: number, failed: number): number {
  return Math.max(0, total - completed - failed);
}

export function estimateRemainingDistanceKm(
  stops: DispatchStopCandidate[],
  completedStopIds: ReadonlySet<string>,
): number {
  const pending = stops.filter((s) => !completedStopIds.has(s.stopId));
  return totalRouteDistanceKm(pending);
}

export function isRouteActivelyDelivering(status: string): boolean {
  return (
    status === "IN_PROGRESS" ||
    status === "OUT_FOR_DELIVERY" ||
    status === "PARTIALLY_COMPLETED" ||
    status === "READY"
  );
}
