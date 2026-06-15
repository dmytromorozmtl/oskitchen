import type { KdsRealtimeTransport } from "@/services/kds-websocket";

export type KdsRealtimeBadgeMode = "LIVE" | "POLLING";

export type KdsRealtimeStatusMeta = {
  mode: KdsRealtimeBadgeMode;
  label: string;
  detail: string;
  dotClass: string;
  badgeClass: string;
  textClass: string;
  pulse: boolean;
};

export function getKdsRealtimeBadgeMode(isLive: boolean): KdsRealtimeBadgeMode {
  return isLive ? "LIVE" : "POLLING";
}

export function getKdsRealtimeStatusMeta(input: {
  isLive: boolean;
  transport: KdsRealtimeTransport;
  reconnectAttempt?: number;
}): KdsRealtimeStatusMeta {
  const mode = getKdsRealtimeBadgeMode(input.isLive);
  const reconnecting = !input.isLive && input.transport === "supabase" && (input.reconnectAttempt ?? 0) > 0;

  if (mode === "LIVE") {
    return {
      mode,
      label: "LIVE",
      detail: "Supabase Realtime connected",
      dotClass: "bg-emerald-500",
      badgeClass:
        "border-emerald-300 bg-emerald-50 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-200",
      textClass: "text-emerald-700 dark:text-emerald-400",
      pulse: true,
    };
  }

  if (reconnecting) {
    return {
      mode: "POLLING",
      label: "POLLING",
      detail: `Reconnecting (${input.reconnectAttempt}) — 15s poll active`,
      dotClass: "bg-amber-500",
      badgeClass:
        "border-amber-300 bg-amber-50 text-amber-900 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-100",
      textClass: "text-amber-700 dark:text-amber-400",
      pulse: true,
    };
  }

  if (input.transport === "polling") {
    return {
      mode: "POLLING",
      label: "POLLING",
      detail: "Polling fallback (15s) — Realtime disabled",
      dotClass: "bg-slate-400",
      badgeClass: "border-border bg-muted text-muted-foreground",
      textClass: "text-muted-foreground",
      pulse: false,
    };
  }

  return {
    mode: "POLLING",
    label: "POLLING",
    detail: "Polling fallback (15s) — waiting for Realtime",
    dotClass: "bg-amber-500",
    badgeClass:
      "border-amber-300 bg-amber-50 text-amber-900 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-100",
    textClass: "text-amber-700 dark:text-amber-400",
    pulse: true,
  };
}

/** Tailwind classes for a newly arrived ticket entrance animation. */
export const KDS_NEW_TICKET_ANIMATION_CLASS =
  "motion-safe:animate-[kds-ticket-enter_600ms_ease-out]" as const;

export const KDS_KITCHEN_DASHBOARD_ROUTE = "/dashboard/kitchen" as const;
