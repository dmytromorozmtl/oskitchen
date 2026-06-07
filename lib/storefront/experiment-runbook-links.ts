import { experimentTraceUrl } from "@/lib/observability/experiment-otel-url";

/** Deep links and runbook hints for PagerDuty / Slack experiment incidents. */
export function experimentRunbookLinks(input: { storeSlug: string; traceId?: string | null }) {
  const base = (process.env.NEXT_PUBLIC_APP_URL ?? process.env.APP_URL ?? "").replace(/\/$/, "");
  const advancedPath = "/dashboard/storefront/advanced";
  const seoPath = "/dashboard/storefront/seo";

  return {
    advanced_dashboard: base ? `${base}${advancedPath}` : advancedPath,
    seo_ga4_property: base ? `${base}${seoPath}` : seoPath,
    edge_sync_runbook: "npm run ops:edge-sync-runbook",
    phase_h_checklist: "npm run ops:phase-h-prod-wiring",
    game_day_drill: "npm run ops:game-day-experiment-drill",
    store_slug: input.storeSlug,
    ...(input.traceId && experimentTraceUrl(input.traceId)
      ? { experiment_trace: experimentTraceUrl(input.traceId)! }
      : {}),
  } satisfies Record<string, string>;
}

export function pagerDutyCustomDetailsWithRunbooks(
  storeSlug: string,
  details: Record<string, string | number | boolean | null>,
  traceId?: string | null,
): Record<string, string | number | boolean | null> {
  const links = experimentRunbookLinks({ storeSlug, traceId });
  return {
    ...details,
    runbook_advanced: links.advanced_dashboard,
    runbook_edge_sync: links.edge_sync_runbook,
    runbook_phase_h: links.phase_h_checklist,
    ...(traceId ? { trace_id: traceId } : {}),
    ...(links.experiment_trace ? { experiment_trace_url: links.experiment_trace } : {}),
  };
}
