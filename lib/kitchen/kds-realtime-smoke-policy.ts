/**
 * KDS realtime / poll fallback smoke policy — Evolution Era 6 Cycle 2.
 *
 * Extends Era 4 staging smoke with unit-certified poll intervals and Supabase
 * channel naming. Does NOT certify rush-hour load, Realtime Playwright E2E,
 * or production-traffic Realtime reliability.
 */

export const KDS_REALTIME_SMOKE_POLICY_ID = "era6-kds-realtime-smoke-v1" as const;

/** Poll interval when Realtime is not SUBSCRIBED (kitchen must still refresh). */
export const KDS_POLL_FALLBACK_MS = 15_000 as const;

/** Slower poll when Realtime is live (safety net only). */
export const KDS_POLL_WHEN_REALTIME_LIVE_MS = 60_000 as const;

export const KDS_REALTIME_ORDERS_TABLE = "orders" as const;

export const KDS_REALTIME_ORDERS_SCHEMA = "public" as const;

export function getKdsPollIntervalMs(realtimeSubscribed: boolean): number {
  return realtimeSubscribed ? KDS_POLL_WHEN_REALTIME_LIVE_MS : KDS_POLL_FALLBACK_MS;
}

export function getKdsRealtimeChannelName(userId: string): string {
  return `kds-orders-${userId}`;
}

export function getKdsConnectionStatusLabel(realtimeSubscribed: boolean): string {
  return realtimeSubscribed
    ? "● Live (Supabase Realtime)"
    : "○ Polling fallback (15s)";
}

export const KDS_REALTIME_SMOKE_HONEST_SCOPE = {
  pollFallbackCertified: true,
  pollIntervalUnitTested: true,
  channelNamingUnitTested: true,
  extendsStagingSmoke: "era4-kds-staging-smoke-v1",
  realtimePlaywrightCertified: false,
  rushHourCertified: false,
  productionRealtimeTrafficCertified: false,
} as const;

export const KDS_REALTIME_SMOKE_AUTOMATED_STAGES = [
  "poll_interval_disconnected",
  "poll_interval_connected",
  "realtime_channel_per_user",
  "connection_status_label",
] as const;

export const KDS_REALTIME_FORBIDDEN_GTM_PHRASES = [
  "realtime E2E certified",
  "rush-hour KDS certified",
  "production Realtime certified",
  "always-on Supabase Realtime",
] as const;

export const KDS_REALTIME_SMOKE_CI_SCRIPTS = [
  "test:ci:kds-realtime-smoke",
  "test:ci:kds-realtime-smoke:cert",
] as const;

export const KDS_REALTIME_SMOKE_UNIT_TESTS = [
  "tests/unit/kds-realtime-smoke-policy.test.ts",
  "tests/unit/kds-realtime-smoke-wiring.test.ts",
] as const;

export const KDS_REALTIME_COMPONENT = "components/kitchen/kds-daily-service.tsx" as const;
