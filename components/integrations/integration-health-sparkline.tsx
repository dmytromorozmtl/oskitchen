import {
  INTEGRATION_HEALTH_DASHBOARD_SPARKLINE_SIZE,
  INTEGRATION_HEALTH_DASHBOARD_SPARKLINE_TEST_ID,
} from "@/lib/design/integration-health-dashboard-policy";
import { cn } from "@/lib/utils";

type Props = {
  scores: number[];
  className?: string;
};

/** 7-day health score sparkline (P1-70). */
export function IntegrationHealthSparkline({ scores, className }: Props) {
  const { width, height } = INTEGRATION_HEALTH_DASHBOARD_SPARKLINE_SIZE;

  if (scores.length < 2) {
    return (
      <div
        className={cn("h-8 w-full rounded bg-muted/40", className)}
        data-testid={INTEGRATION_HEALTH_DASHBOARD_SPARKLINE_TEST_ID}
        aria-hidden
      />
    );
  }

  const max = Math.max(...scores, 100);
  const min = Math.min(...scores, 0);
  const range = Math.max(1, max - min);
  const step = width / (scores.length - 1);
  const points = scores
    .map((score, index) => {
      const x = index * step;
      const y = height - ((score - min) / range) * height;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className={cn("h-8 w-[72px] text-primary/70", className)}
      data-testid={INTEGRATION_HEALTH_DASHBOARD_SPARKLINE_TEST_ID}
      aria-hidden
    >
      <polyline fill="none" stroke="currentColor" strokeWidth="2" points={points} />
    </svg>
  );
}
