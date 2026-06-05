"use client";

import Link from "next/link";
import { Activity, AlertTriangle, Terminal } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type {
  CommandCenterSnapshot,
  CommandCenterTicker,
  CommandCenterTickerTone,
} from "@/lib/command-center/command-center-types";
import { dashboardChromeButtonClass } from "@/lib/design/mobile-first-redesign-patterns";
import { cn } from "@/lib/utils";

type Props = {
  snapshot: CommandCenterSnapshot;
};

function tickerToneClass(tone: CommandCenterTickerTone): string {
  switch (tone) {
    case "positive":
      return "text-emerald-400";
    case "negative":
      return "text-red-400";
    case "warning":
      return "text-amber-400";
    default:
      return "text-slate-200";
  }
}

function TickerCell({ ticker }: { ticker: CommandCenterTicker }) {
  const content = (
    <div className="min-w-0 rounded border border-slate-700/80 bg-slate-900/80 px-3 py-2 transition-colors hover:border-slate-500">
      <div className="flex items-center justify-between gap-2">
        <span className="font-mono text-[10px] font-semibold uppercase tracking-wider text-slate-500">
          {ticker.symbol}
        </span>
        {ticker.tone !== "neutral" ? (
          <span className={cn("h-1.5 w-1.5 rounded-full", ticker.tone === "positive" ? "bg-emerald-400" : ticker.tone === "warning" ? "bg-amber-400" : "bg-red-400")} />
        ) : null}
      </div>
      <p className={cn("mt-1 truncate font-mono text-sm font-semibold tabular-nums", tickerToneClass(ticker.tone))}>
        {ticker.value}
      </p>
      <p className="truncate text-[10px] text-slate-500">{ticker.label}</p>
      {ticker.hint ? <p className="truncate text-[10px] text-slate-600">{ticker.hint}</p> : null}
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
    <div
      className="space-y-4 rounded-xl border border-slate-800 bg-slate-950 p-4 font-mono text-slate-200 shadow-2xl sm:p-6"
      data-testid="command-center-panel"
    >
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-2">
          <Terminal className="h-5 w-5 text-emerald-400" />
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">OS Kitchen Terminal</p>
            <h2 className="text-lg font-semibold text-slate-100">{snapshot.workspaceLabel}</h2>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-[10px] uppercase tracking-wider text-slate-500">
          <Badge variant="outline" className="rounded-full border-slate-700 bg-slate-900 text-slate-400">
            {snapshot.rangeLabel}
          </Badge>
          <Badge variant="outline" className="rounded-full border-slate-700 bg-slate-900 text-slate-400">
            {snapshot.summary.tickerCount} tickers
          </Badge>
          <Badge variant="outline" className="rounded-full border-slate-700 bg-slate-900 text-slate-400">
            {generated}
          </Badge>
        </div>
      </div>

      <div className="grid gap-4">
        {snapshot.lanes.map((lane) => (
          <section key={lane.id}>
            <div className="mb-2 flex items-center gap-2">
              <Activity className="h-3.5 w-3.5 text-emerald-500" />
              <h3 className="text-xs font-semibold uppercase tracking-[0.25em] text-emerald-500/90">
                {lane.label}
              </h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {lane.tickers.map((ticker) => (
                <TickerCell key={ticker.id} ticker={ticker} />
              ))}
            </div>
          </section>
        ))}
      </div>

      <section className="border-t border-slate-800 pt-4">
        <div className="mb-2 flex items-center gap-2">
          <AlertTriangle className="h-3.5 w-3.5 text-amber-400" />
          <h3 className="text-xs font-semibold uppercase tracking-[0.25em] text-amber-400/90">
            ALERTS · {snapshot.summary.alertCount}
          </h3>
        </div>
        {snapshot.alerts.length === 0 ? (
          <p className="text-xs text-slate-600">No active alerts — all lanes nominal.</p>
        ) : (
          <div className="space-y-2">
            {snapshot.alerts.map((alert) => (
              <div
                key={alert.id}
                className={cn(
                  "flex flex-wrap items-start justify-between gap-2 rounded border px-3 py-2 text-xs",
                  alert.severity === "critical"
                    ? "border-red-900/60 bg-red-950/30"
                    : alert.severity === "warning"
                      ? "border-amber-900/50 bg-amber-950/20"
                      : "border-slate-800 bg-slate-900/50",
                )}
              >
                <div>
                  <p className="font-semibold text-slate-200">{alert.title}</p>
                  <p className="text-slate-500">{alert.detail}</p>
                </div>
                <Button
                  asChild
                  variant="outline"
                  className={cn(
                    dashboardChromeButtonClass,
                    "h-auto min-h-11 border-slate-700 bg-slate-900 px-3 text-[10px]",
                  )}
                >
                  <Link href={alert.href}>Open</Link>
                </Button>
              </div>
            ))}
          </div>
        )}
      </section>

      <div className="flex flex-wrap gap-2 border-t border-slate-800 pt-4 text-[10px] text-slate-600">
        <Link href="/dashboard/executive" className="hover:text-emerald-400">
          Executive
        </Link>
        <span>·</span>
        <Link href="/dashboard/analytics/suite" className="hover:text-emerald-400">
          Analytics Suite
        </Link>
        <span>·</span>
        <Link href="/dashboard/today" className="hover:text-emerald-400">
          Today
        </Link>
      </div>
    </div>
  );
}
