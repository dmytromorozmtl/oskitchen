export const OBSERVABILITY_SEVERITIES = ["info", "low", "medium", "high", "critical"] as const;
export type ObservabilitySeverity = (typeof OBSERVABILITY_SEVERITIES)[number];

export function maxSeverity(
  a: ObservabilitySeverity,
  b: ObservabilitySeverity,
): ObservabilitySeverity {
  const order: ObservabilitySeverity[] = ["info", "low", "medium", "high", "critical"];
  return order[Math.max(order.indexOf(a), order.indexOf(b))]!;
}

export function severityForModule(tag: string, hasError: boolean): ObservabilitySeverity {
  if (!hasError) return "info";
  if (tag === "WEBHOOKS" || tag === "BILLING") return "high";
  if (tag === "NOTIFICATIONS" || tag === "AUTOMATIONS") return "medium";
  return "low";
}
