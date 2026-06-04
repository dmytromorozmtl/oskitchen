"use client";

import * as React from "react";
import { marginGaugeGradientStops } from "@/lib/design/color-tokens";
import { cn } from "@/lib/utils";

export function ProfitGauge({
  marginPercent,
  zone,
  className,
}: {
  marginPercent: number;
  zone: "green" | "yellow" | "red";
  className?: string;
}) {
  const clamped = Math.max(0, Math.min(100, marginPercent));
  const [animated, setAnimated] = React.useState(0);

  React.useEffect(() => {
    const t = requestAnimationFrame(() => setAnimated(clamped));
    return () => cancelAnimationFrame(t);
  }, [clamped]);

  const rotation = -90 + (animated / 100) * 180;
  const zoneColor =
    zone === "green"
      ? "text-emerald-500"
      : zone === "yellow"
        ? "text-amber-500"
        : "text-rose-500";

  return (
    <div
      className={cn("relative mx-auto flex h-40 w-48 items-end justify-center", className)}
      data-testid="profit-margin-gauge"
      aria-label={`Margin gauge ${clamped.toFixed(1)} percent`}
    >
      <svg viewBox="0 0 200 110" className="h-full w-full overflow-visible">
        <defs>
          <linearGradient id="gauge-green" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={marginGaugeGradientStops.green.start} />
            <stop offset="100%" stopColor={marginGaugeGradientStops.green.end} />
          </linearGradient>
          <linearGradient id="gauge-yellow" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={marginGaugeGradientStops.yellow.start} />
            <stop offset="100%" stopColor={marginGaugeGradientStops.yellow.end} />
          </linearGradient>
          <linearGradient id="gauge-red" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={marginGaugeGradientStops.red.start} />
            <stop offset="100%" stopColor={marginGaugeGradientStops.red.end} />
          </linearGradient>
        </defs>
        <path
          d="M 20 100 A 80 80 0 0 1 180 100"
          fill="none"
          stroke="currentColor"
          strokeWidth="14"
          className="text-muted/30"
          strokeLinecap="round"
        />
        <path
          d="M 20 100 A 80 80 0 0 1 180 100"
          fill="none"
          stroke={`url(#gauge-${zone})`}
          strokeWidth="14"
          strokeDasharray={`${(animated / 100) * 251} 251`}
          strokeLinecap="round"
        />
        <g transform={`rotate(${rotation} 100 100)`}>
          <line
            x1="100"
            y1="100"
            x2="100"
            y2="32"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            className={cn("transition-transform duration-700 ease-out", zoneColor)}
          />
          <circle cx="100" cy="100" r="6" className="fill-foreground" />
        </g>
      </svg>
      <div className="absolute bottom-0 text-center">
        <p className={cn("text-3xl font-bold tabular-nums", zoneColor)}>{clamped.toFixed(0)}%</p>
        <p className="text-xs text-muted-foreground">Margin</p>
      </div>
    </div>
  );
}
