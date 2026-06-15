/**
 * Floor plan realtime / poll fallback policy — mirrors KDS smoke policy.
 *
 * Does NOT certify rush-hour load, Realtime Playwright E2E, or production-traffic
 * Realtime reliability.
 */

export const FLOOR_PLAN_REALTIME_POLICY_ID = "floor-plan-realtime-v1" as const;

/** Poll interval when Realtime is not SUBSCRIBED. */
export const FLOOR_PLAN_POLL_FALLBACK_MS = 15_000 as const;

/** Slower poll when Realtime is live (safety net only). */
export const FLOOR_PLAN_POLL_WHEN_REALTIME_LIVE_MS = 60_000 as const;

export const FLOOR_PLAN_REALTIME_TABLE = "restaurant_tables" as const;

export const FLOOR_PLAN_REALTIME_SCHEMA = "public" as const;

export function getFloorPlanPollIntervalMs(realtimeSubscribed: boolean): number {
  return realtimeSubscribed
    ? FLOOR_PLAN_POLL_WHEN_REALTIME_LIVE_MS
    : FLOOR_PLAN_POLL_FALLBACK_MS;
}

export function getFloorPlanRealtimeChannelName(
  workspaceId: string | null,
  userId: string,
): string {
  const scope = workspaceId?.trim() || userId;
  return `floor-plan-${scope}`;
}

export function getFloorPlanRealtimeFilter(
  workspaceId: string | null,
  userId: string,
): string {
  if (workspaceId?.trim()) {
    return `workspace_id=eq.${workspaceId}`;
  }
  return `user_id=eq.${userId}`;
}

export function getFloorPlanConnectionStatusLabel(realtimeSubscribed: boolean): string {
  return realtimeSubscribed
    ? "● Live (Supabase Realtime)"
    : "○ Polling fallback (15s)";
}
