export type WeeklyReportWindow = {
  from: Date;
  to: Date;
  rangeLabel: string;
  weekKey: string;
};

function startOfUtcDay(date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

function addUtcDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setUTCDate(next.getUTCDate() + days);
  return next;
}

function formatShortDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}

function formatLongDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}

function isoWeekKey(date: Date): string {
  const thursday = addUtcDays(startOfUtcDay(date), 3 - ((date.getUTCDay() + 6) % 7));
  const yearStart = new Date(Date.UTC(thursday.getUTCFullYear(), 0, 1));
  const week = Math.ceil(((thursday.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return `${thursday.getUTCFullYear()}-W${String(week).padStart(2, "0")}`;
}

export function resolveWeeklyReportWindow(now = new Date()): WeeklyReportWindow {
  const to = startOfUtcDay(now);
  const from = addUtcDays(to, -7);
  const rangeLabel = `${formatShortDate(from)} – ${formatLongDate(addUtcDays(to, -1))}`;
  const weekKey = isoWeekKey(to);
  return { from, to, rangeLabel, weekKey };
}

export function buildScheduledReportDedupeKey(userId: string, weekKey: string): string {
  return `scheduled-report-p2-48-${userId}-${weekKey}`;
}

export function formatScheduledReportEmail(params: {
  businessName: string | null;
  rangeLabel: string;
  summaryLines: string[];
  reportsUrl: string;
}): { subject: string; text: string } {
  const name = params.businessName?.trim() || "your kitchen";
  return {
    subject: `[OS Kitchen] Weekly report — ${params.rangeLabel}`,
    text: [
      `Weekly report for ${name}`,
      `Range: ${params.rangeLabel}`,
      "",
      ...params.summaryLines,
      "",
      "Your PDF summary is attached.",
      "",
      `Open reports hub: ${params.reportsUrl}`,
      "",
      "Lightspeed parity — scheduled weekly digest. BETA directional reporting — not audited GL.",
    ].join("\n"),
  };
}

export function buildScheduledReportPdfRows(input: {
  title: string;
  rangeLabel: string;
  summary: { label: string; value: string }[];
  detailHead: string[];
  detailRows: (string | number)[][];
}): {
  title: string;
  subtitle: string;
  summaryHead: string[];
  summaryBody: string[][];
  detailHead: string[];
  detailBody: (string | number)[][];
} {
  return {
    title: input.title,
    subtitle: `OS Kitchen weekly report · ${input.rangeLabel}`,
    summaryHead: ["Metric", "Value"],
    summaryBody: input.summary.map((row) => [row.label, row.value]),
    detailHead: input.detailHead,
    detailBody: input.detailRows,
  };
}

export function resolveNextWeeklySendLabel(now = new Date()): string {
  const day = now.getUTCDay();
  const daysUntilMonday = day === 0 ? 1 : day === 1 ? 7 : 8 - day;
  const nextMonday = addUtcDays(startOfUtcDay(now), daysUntilMonday);
  return nextMonday.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}

export function isValidScheduledReportKey(key: string): boolean {
  return key === "executive_weekly_summary" || key === "revenue_report" || key === "orders_report";
}
