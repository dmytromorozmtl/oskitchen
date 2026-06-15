import Link from "next/link";

import {
  resolveSystemHealthMetricRowNextAction,
  type SystemHealthMetricId,
} from "@/lib/system-health/system-health-focus-era18";

export function SystemHealthMetricNextAction(props: {
  metricId: SystemHealthMetricId;
  value: number;
}) {
  const action = resolveSystemHealthMetricRowNextAction(props.metricId, props.value);

  if (!action) {
    return (
      <span className="text-sm text-muted-foreground" data-testid={`system-health-metric-clear-${props.metricId}`}>
        All clear
      </span>
    );
  }

  return (
    <Link
      href={action.href}
      data-testid={`system-health-metric-next-${props.metricId}`}
      className={
        action.tone === "urgent"
          ? "text-sm font-medium text-amber-800 underline-offset-4 hover:underline dark:text-amber-200"
          : "text-sm font-medium text-primary underline-offset-4 hover:underline"
      }
    >
      {action.label}
    </Link>
  );
}
