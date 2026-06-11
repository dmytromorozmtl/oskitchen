"use client";

import Link from "next/link";
import { Activity, AlertTriangle, LayoutDashboard } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type {
  CommandCenterSnapshot,
  CommandCenterTicker,
  CommandCenterTickerTone,
} from "@/lib/command-center/command-center-types";
import {
  COMMAND_CENTER_BRAND_ALERT_NEGATIVE_CLASS,
  COMMAND_CENTER_BRAND_ALERT_NEUTRAL_CLASS,
  COMMAND_CENTER_BRAND_ALERT_POSITIVE_CLASS,
  COMMAND_CENTER_BRAND_ALERT_ROW_CRITICAL_CLASS,
  COMMAND_CENTER_BRAND_ALERT_ROW_NEUTRAL_CLASS,
  COMMAND_CENTER_BRAND_ALERT_ROW_WARNING_CLASS,
  COMMAND_CENTER_BRAND_ALERT_WARNING_CLASS,
  COMMAND_CENTER_BRAND_FOOTER_LINK_CLASS,
  COMMAND_CENTER_BRAND_LANE_TITLE_CLASS,
  COMMAND_CENTER_BRAND_PANEL_CLASS,
  COMMAND_CENTER_BRAND_PANEL_TEST_ID,
  COMMAND_CENTER_BRAND_TICKER_CELL_CLASS,
  COMMAND_CENTER_BRAND_TICKER_LABEL_CLASS,
  COMMAND_CENTER_BRAND_TICKER_SYMBOL_CLASS,
  COMMAND_CENTER_BRAND_TICKER_VALUE_CLASS,
} from "@/lib/design/command-center-brand-policy";
import { cn } from "@/lib/utils";

type Props = {
  snapshot: CommandCenterSnapshot;
};

function tickerToneClass(tone: CommandCenterTickerTone): string {
  switch (tone) {
    case "positive":
      return COMMAND_CENTER_BRAND_ALERT_POSITIVE_CLASS;
    case "negative":
      return COMMAND_CENTER_BRAND_ALERT_NEGATIVE_CLASS;
    case "warning":
      return COMMAND_CENTER_BRAND_ALERT_WARNING_CLASS;
    default:
      return COMMAND_CENTER_BRAND_ALERT_NEUTRAL_CLASS;
  }
}

function TickerCell({ ticker }: { ticker: CommandCenterTicker }) {
  const content = (
    <div className={COMMAND_CENTER_BRAND_TICKER_CELL_CLASS}>
      <div className="flex items-center justify-between gap-2">
        <span className={COMMAND_CENTER_BRAND_TICKER_SYMBOL_CLASS}>{ticker.symbol}</span>
        {ticker.tone !== "neutral" ? (
          <span
            className={cn(
              "h-1.5 w-1.5 rounded-full",
              ticker.tone === "positive"
                ? "bg-emerald-500"
                : ticker.tone === "warning"
                  ? "bg-amber-500"
                  : "bg-red-500",
            )}
          />
        ) : null}
      </div>
      <p className={cn(COMMAND_CENTER_BRAND_TICKER_VALUE_CLASS, tickerToneClass(ticker.tone))}>
        {ticker.value}
      </p>
      <p className={COMMAND_CENTER_BRAND_TICKER_LABEL_CLASS}>{ticker.label}</p>
      {ticker.hint ? <p className={COMMAND_CENTER_BRAND_TICKER_LABEL_CLASS}>{ticker.hint}</p> : null}
    </div>
  );

  if (ticker.href) {
    return (
      <Link href={ticker.href} className="block min-w-[140px] flex-1">
        {content}
      </Link>
    );
  }
  return <div className="min-w-[140px] flex-1">{content}</div>;
}

export function CommandCenterPanel({ snapshot }: Props) {
  const generated = new Date(snapshot.generatedAtIso).toLocaleString();

  return (
    <div className={COMMAND_CENTER_BRAND_PANEL_CLASS} data-testid={COMMAND_CENTER_BRAND_PANEL_TEST_ID}>
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/70 pb-4">
        <div className="flex items-center gap-2">
          <LayoutDashboard className="h-5 w-5 text-muted-foreground" aria-hidden />
          <div>
            <p className={COMMAND_CENTER_BRAND_LANE_TITLE_CLASS}>Operations overview</p>
            <h2 className="text-lg font-semibold tracking-tight">{snapshot.workspaceLabel}</h2>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary" className="rounded-full">
            {snapshot.rangeLabel}
          </Badge>
          <Badge variant="outline" className="rounded-full tabular-nums">
            {snapshot.summary.tickerCount} signals
          </Badge>
          <Badge variant="outline" className="rounded-full tabular-nums">
            {generated}
          </Badge>
        </div>
      </div>

      <div className="grid gap-4">
        {snapshot.lanes.map((lane) => (
          <section key={lane.id}>
            <div className="mb-2 flex items-center gap-2">
              <Activity className="h-4 w-4 text-muted-foreground" aria-hidden />
              <h3 className={COMMAND_CENTER_BRAND_LANE_TITLE_CLASS}>{lane.label}</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {lane.tickers.map((ticker) => (
                <TickerCell key={ticker.id} ticker={ticker} />
              ))}
            </div>
          </section>
        ))}
      </div>

      <section className="border-t border-border/70 pt-4">
        <div className="mb-2 flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" aria-hidden />
          <h3 className={COMMAND_CENTER_BRAND_LANE_TITLE_CLASS}>
            Alerts · {snapshot.summary.alertCount}
          </h3>
        </div>
        {snapshot.alerts.length === 0 ? (
          <p className="text-sm text-muted-foreground">No active alerts — all lanes nominal.</p>
        ) : (
          <div className="space-y-2">
            {snapshot.alerts.map((alert) => (
              <div
                key={alert.id}
                className={cn(
                  "flex flex-wrap items-start justify-between gap-2 text-sm",
                  alert.severity === "critical"
                    ? COMMAND_CENTER_BRAND_ALERT_ROW_CRITICAL_CLASS
                    : alert.severity === "warning"
                      ? COMMAND_CENTER_BRAND_ALERT_ROW_WARNING_CLASS
                      : COMMAND_CENTER_BRAND_ALERT_ROW_NEUTRAL_CLASS,
                )}
              >
                <div>
                  <p className="font-medium">{alert.title}</p>
                  <p className="text-muted-foreground">{alert.detail}</p>
                </div>
                <Button asChild variant="outline" size="sm" className="rounded-full">
                  <Link href={alert.href}>Open</Link>
                </Button>
              </div>
            ))}
          </div>
        )}
      </section>

      <div className="flex flex-wrap gap-2 border-t border-border/70 pt-4 text-xs text-muted-foreground">
        <Link href="/dashboard/executive" className={COMMAND_CENTER_BRAND_FOOTER_LINK_CLASS}>
          Executive
        </Link>
        <span>·</span>
        <Link href="/dashboard/analytics/suite" className={COMMAND_CENTER_BRAND_FOOTER_LINK_CLASS}>
          Analytics Suite
        </Link>
        <span>·</span>
        <Link href="/dashboard/today" className={COMMAND_CENTER_BRAND_FOOTER_LINK_CLASS}>
          Today
        </Link>
      </div>
    </div>
  );
}
