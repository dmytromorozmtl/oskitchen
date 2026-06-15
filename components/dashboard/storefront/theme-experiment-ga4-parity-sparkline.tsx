import type { Ga4ParityHistoryPoint } from "@/lib/storefront/ga4-parity-json";

const W = 240;
const H = 48;
const PAD = 4;

export function ThemeExperimentGa4ParitySparkline({
  history,
  days = 30,
}: {
  history: Ga4ParityHistoryPoint[];
  days?: number;
}) {
  const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
  const points = history
    .filter((p) => new Date(p.at).getTime() >= cutoff)
    .filter((p) => p.parityScorePp !== null)
    .slice(-40);

  if (points.length < 2) {
    return (
      <p className="text-xs text-muted-foreground">
        Parity trend ({days}d): not enough cron samples yet (runs every 6h).
      </p>
    );
  }

  const values = points.map((p) => p.parityScorePp as number);
  const max = Math.max(6, ...values);
  const min = 0;
  const range = max - min || 1;

  const coords = points.map((p, i) => {
    const x = PAD + (i / (points.length - 1)) * (W - PAD * 2);
    const y = H - PAD - (((p.parityScorePp as number) - min) / range) * (H - PAD * 2);
    return `${x},${y}`;
  });

  const thresholdY = H - PAD - ((3 - min) / range) * (H - PAD * 2);

  return (
    <div className="space-y-1">
      <p className="text-xs font-medium text-muted-foreground">Parity drift trend ({days}d, pp)</p>
      <svg viewBox={`0 0 ${W} ${H}`} className="h-12 w-full max-w-xs text-primary" aria-hidden>
        <line
          x1={PAD}
          x2={W - PAD}
          y1={thresholdY}
          y2={thresholdY}
          className="stroke-amber-500/60"
          strokeDasharray="3 3"
          strokeWidth="1"
        />
        <polyline
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinejoin="round"
          strokeLinecap="round"
          points={coords.join(" ")}
        />
      </svg>
      <p className="text-[10px] text-muted-foreground">Dashed line = 3 pp alert threshold</p>
    </div>
  );
}
