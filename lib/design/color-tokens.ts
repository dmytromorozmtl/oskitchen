/**
 * Canonical OS Kitchen color tokens — map UI/chart colors to `app/globals.css` CSS variables.
 * Prefer Tailwind semantic utilities in JSX; use these for Recharts/SVG/inline styles.
 */

export const colorVar = {
  accent: "var(--color-accent)",
  accentHover: "var(--color-accent-hover)",
  accentLight: "var(--color-accent-light)",
  accent2: "var(--color-accent-2)",
  success: "var(--color-success)",
  warning: "var(--color-warning)",
  error: "var(--color-error)",
  info: "var(--color-info)",
  text: "var(--color-text)",
  textSecondary: "var(--color-text-secondary)",
  textMuted: "var(--color-text-muted)",
  bg: "var(--color-bg)",
  bgSecondary: "var(--color-bg-secondary)",
  border: "var(--color-border)",
} as const;

/** Eight-series Recharts palette aligned to brand + semantic status hues. */
export const chartSeriesColors = [
  colorVar.accent,
  colorVar.info,
  colorVar.success,
  colorVar.warning,
  colorVar.error,
  colorVar.accent2,
  "var(--color-info)",
  colorVar.textMuted,
] as const;

export function chartSeriesColor(index: number): string {
  return chartSeriesColors[index % chartSeriesColors.length]!;
}

export function chartSeriesFill(color: string, alphaHex = "33"): string {
  if (color.startsWith("var(")) return color;
  return `${color}${alphaHex}`;
}

/** Recharts axis/grid chrome — works in light and dark dashboard shells. */
export const chartAxisChrome = {
  gridStroke: "hsl(var(--border))",
  tickFill: colorVar.textMuted,
  tooltipBackground: "hsl(var(--card))",
  tooltipBorder: "hsl(var(--border))",
} as const;

/** Integration Health landing illustration — status rows (MKT-06 / DES-21). */
export const integrationHealthStatusColors = {
  healthy: {
    background: "color-mix(in srgb, var(--color-success) 15%, transparent)",
    border: "color-mix(in srgb, var(--color-success) 35%, transparent)",
    icon: colorVar.success,
  },
  degraded: {
    background: "color-mix(in srgb, var(--color-warning) 12%, transparent)",
    border: "color-mix(in srgb, var(--color-warning) 35%, transparent)",
    icon: colorVar.warning,
  },
  actionRequired: {
    background: "color-mix(in srgb, var(--color-error) 10%, transparent)",
    border: "color-mix(in srgb, var(--color-error) 30%, transparent)",
    icon: colorVar.error,
  },
} as const;

/** Profit margin gauge SVG gradient stops. */
export const marginGaugeGradientStops = {
  green: { start: colorVar.success, end: "color-mix(in srgb, var(--color-success) 65%, white)" },
  yellow: { start: colorVar.warning, end: "color-mix(in srgb, var(--color-warning) 65%, white)" },
  red: { start: colorVar.error, end: "color-mix(in srgb, var(--color-error) 65%, white)" },
} as const;

/** Benchmark radar series colors. */
export const benchmarkRadarColors = {
  you: colorVar.success,
  industry: colorVar.textMuted,
  topQuartile: colorVar.info,
  trendLine: colorVar.info,
} as const;

export type ColorVarKey = keyof typeof colorVar;
