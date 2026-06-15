import { logger } from "@/lib/logger";

export type PagerDutySeverity = "critical" | "error" | "warning" | "info";

function routingKeyForSeverity(severity: PagerDutySeverity): string | null {
  if (severity === "critical") {
    return (
      process.env.PAGERDUTY_ROUTING_KEY_DLQ?.trim() ||
      process.env.PAGERDUTY_ROUTING_KEY?.trim() ||
      null
    );
  }
  if (severity === "warning") {
    return (
      process.env.PAGERDUTY_ROUTING_KEY_GA4_PARITY?.trim() ||
      process.env.PAGERDUTY_ROUTING_KEY_SRM?.trim() ||
      process.env.PAGERDUTY_ROUTING_KEY?.trim() ||
      null
    );
  }
  return process.env.PAGERDUTY_ROUTING_KEY?.trim() || null;
}

/** PagerDuty Events API v2 — optional alongside Slack webhooks. */
export async function sendPagerDutyEvent(input: {
  severity: PagerDutySeverity;
  summary: string;
  source?: string;
  customDetails?: Record<string, string | number | boolean | null>;
  dedupKey?: string;
}): Promise<void> {
  const routingKey = routingKeyForSeverity(input.severity);
  if (!routingKey) return;

  const body = {
    routing_key: routingKey,
    event_action: "trigger",
    dedup_key: input.dedupKey,
    payload: {
      summary: input.summary.slice(0, 1024),
      severity: input.severity,
      source: input.source ?? "kitchenos",
      custom_details: input.customDetails ?? {},
    },
  };

  try {
    const res = await fetch("https://events.pagerduty.com/v2/enqueue", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      logger.warn("pagerduty_event_failed", { status: res.status, severity: input.severity });
    }
  } catch (e) {
    logger.warn("pagerduty_event_error", { error: String(e), severity: input.severity });
  }
}
