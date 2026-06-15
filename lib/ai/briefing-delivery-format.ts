import type { DailyBriefing } from "@/lib/ai/restaurant-brain-types";
import type { PredictiveAlert } from "@/lib/ai/predictive-alerts-types";
import { countCriticalAiBriefingAlerts } from "@/lib/ai/restaurant-brain-ui-summary";

function fmtMoney(n: number): string {
  return `$${n.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
}

function fmtPct(confidence: number): string {
  return `${Math.round(confidence * 100)}%`;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function sectionBlock(title: string, lines: string[]): string {
  if (lines.length === 0) {
    return `<h3 style="margin:16px 0 8px;font-size:15px;">${escapeHtml(title)}</h3><p style="color:#666;margin:0;">No items flagged.</p>`;
  }
  const items = lines.map((line) => `<li style="margin-bottom:6px;">${escapeHtml(line)}</li>`).join("");
  return `<h3 style="margin:16px 0 8px;font-size:15px;">${escapeHtml(title)}</h3><ul style="margin:0;padding-left:20px;">${items}</ul>`;
}

function briefingDateLabel(timestamp: string, options?: Intl.DateTimeFormatOptions): string {
  return new Date(timestamp).toLocaleDateString(undefined, options);
}

export function formatBriefingEmail(briefing: DailyBriefing, alerts: PredictiveAlert[]): string {
  const dateLabel = briefingDateLabel(briefing.timestamp, {
    weekday: "long",
    month: "short",
    day: "numeric",
  });
  const criticalCount = countCriticalAiBriefingAlerts(briefing);
  const criticalAlerts = alerts.filter((a) => a.severity === "critical");

  const inventoryLines = briefing.inventoryAlerts.slice(0, 8).map(
    (a) => `${a.item}: ${a.message} (confidence ${fmtPct(a.confidence)})`,
  );
  const laborLines = briefing.laborInsights.slice(0, 6).map(
    (l) => `${l.shift} — ${l.message} (impact ${fmtMoney(l.impact)})`,
  );
  const menuLines = briefing.menuInsights.slice(0, 6).map(
    (m) => `${m.item}: margin ${m.margin.toFixed(1)}% — ${m.recommendation}`,
  );
  const profitLines = briefing.profitInsights.slice(0, 5).map(
    (p) => `${p.factor}: ${p.recommendation}`,
  );
  const alertLines = alerts.slice(0, 8).map(
    (a) => `[${a.severity}] ${a.title}: ${a.suggestedAction} (impact ${fmtMoney(a.impact)})`,
  );

  const forecast = briefing.weeklyForecast;

  return `<!DOCTYPE html>
<html>
<body style="font-family:system-ui,-apple-system,sans-serif;line-height:1.5;color:#111;max-width:640px;margin:0 auto;padding:24px;">
  <p style="font-size:12px;color:#666;margin:0 0 8px;">AI-assisted briefing · confidence ${fmtPct(briefing.overallConfidence)}</p>
  <h1 style="font-size:22px;margin:0 0 4px;">OS Kitchen Daily Briefing</h1>
  <p style="margin:0 0 16px;color:#444;">${escapeHtml(dateLabel)}</p>
  ${
    criticalCount > 0 || criticalAlerts.length > 0
      ? `<div style="background:#fef2f2;border:1px solid #fecaca;border-radius:8px;padding:12px 16px;margin-bottom:16px;">
          <strong style="color:#b91c1c;">${criticalCount + criticalAlerts.length} critical item(s)</strong>
          <p style="margin:8px 0 0;font-size:14px;color:#7f1d1d;">Review inventory, labor, and predictive alerts in the dashboard.</p>
        </div>`
      : ""
  }
  <p style="margin:0 0 16px;"><strong>Forecast:</strong> ${fmtMoney(forecast.predictedRevenue)} revenue · ${forecast.predictedOrders} orders (confidence ${fmtPct(forecast.confidence)})</p>
  ${sectionBlock("Inventory", inventoryLines)}
  ${sectionBlock("Labor", laborLines)}
  ${sectionBlock("Menu profitability", menuLines)}
  ${sectionBlock("Profit drivers", profitLines)}
  ${sectionBlock("Predictive alerts", alertLines)}
  <hr style="border:none;border-top:1px solid #eee;margin:24px 0;" />
  <p style="font-size:12px;color:#888;margin:0;">Suggestions are AI-assisted from your operational data — verify before purchasing or scheduling changes. <a href="https://app.os-kitchen.com/dashboard/today">Open Today dashboard</a></p>
</body>
</html>`;
}

export function formatBriefingEmailSubject(briefing: DailyBriefing): string {
  return `OS Kitchen Daily Briefing — ${briefingDateLabel(briefing.timestamp)}`;
}

export function formatBriefingEmailText(briefing: DailyBriefing, alerts: PredictiveAlert[]): string {
  const html = formatBriefingEmail(briefing, alerts);
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function formatCriticalAlertsSms(alerts: PredictiveAlert[]): string {
  const critical = alerts.filter((a) => a.severity === "critical");
  if (critical.length === 0) {
    return "OS Kitchen: No critical AI alerts right now.";
  }
  const top = critical.slice(0, 3);
  const lines = top.map((a) => `${a.title} (${fmtMoney(a.impact)})`);
  const suffix = critical.length > 3 ? ` +${critical.length - 3} more` : "";
  return `OS Kitchen CRITICAL (${critical.length}): ${lines.join("; ")}${suffix}. Open Today dashboard.`;
}

export function pickCriticalAlertsForSms(
  alerts: PredictiveAlert[],
  criticalOnly: boolean,
): PredictiveAlert[] {
  if (criticalOnly) return alerts.filter((a) => a.severity === "critical");
  return alerts.filter((a) => a.severity === "critical" || a.severity === "warning");
}
