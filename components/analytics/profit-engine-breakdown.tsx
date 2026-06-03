"use client";

import * as React from "react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { cn } from "@/lib/utils";
import type { ProfitEngineSnapshot } from "@/services/analytics/profit-engine-service";

type TabId = "table" | "server" | "channel" | "order";

function BreakdownTable({
  rows,
  currency,
  emptyLabel,
}: {
  rows: ProfitEngineSnapshot["byTable"];
  currency: string;
  emptyLabel: string;
}) {
  if (rows.length === 0) {
    return <p className="text-sm text-muted-foreground">{emptyLabel}</p>;
  }
  return (
    <div className="space-y-2 text-sm">
      {rows.map((row) => (
        <div
          key={row.id}
          className="flex items-center justify-between gap-2 rounded-lg border border-border/60 px-3 py-2"
        >
          <div className="min-w-0">
            <p className="truncate font-medium">{row.label}</p>
            <p className="text-xs text-muted-foreground">
              {row.orderCount} order{row.orderCount === 1 ? "" : "s"} ·{" "}
              {formatCurrency(row.profit, currency)} profit
            </p>
          </div>
          <Badge
            variant={row.marginPercent >= 40 ? "secondary" : "outline"}
            className={cn("shrink-0 tabular-nums", row.marginPercent < 40 && "text-amber-700")}
          >
            {row.marginPercent}%
          </Badge>
        </div>
      ))}
    </div>
  );
}

export function ProfitEngineBreakdown({
  initial,
  currency = "USD",
}: {
  initial: ProfitEngineSnapshot;
  currency?: string;
}) {
  const [data, setData] = React.useState(initial);
  const [tab, setTab] = React.useState<TabId>("table");

  const refresh = React.useCallback(async () => {
    const res = await fetch("/api/analytics/profit-engine");
    if (res.ok) {
      const json = (await res.json()) as ProfitEngineSnapshot;
      setData(json);
    }
  }, []);

  React.useEffect(() => {
    const id = setInterval(() => void refresh(), data.refreshSeconds * 1000);
    return () => clearInterval(id);
  }, [refresh, data.refreshSeconds]);

  const tabs: { id: TabId; label: string }[] = [
    { id: "table", label: "Table" },
    { id: "server", label: "Server" },
    { id: "channel", label: "Channel" },
    { id: "order", label: "Orders" },
  ];

  const activeRows =
    tab === "table"
      ? data.byTable
      : tab === "server"
        ? data.byServer
        : tab === "channel"
          ? data.byChannel
          : data.byOrder;

  return (
    <section className="space-y-3" data-testid="profit-engine-breakdown">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-sm font-semibold">Profit engine</h2>
        <p className="text-xs text-muted-foreground">
          Updates every {data.refreshSeconds}s ·{" "}
          {new Date(data.updatedAtIso).toLocaleTimeString([], {
            hour: "numeric",
            minute: "2-digit",
            second: "2-digit",
          })}
        </p>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            data-testid={`profit-engine-tab-${t.id}`}
            className={cn(
              "rounded-full px-3 py-1 text-xs font-medium transition-colors",
              tab === t.id
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80",
            )}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm capitalize">
            By {tab === "order" ? "recent order" : tab}
          </CardTitle>
        </CardHeader>
        <CardContent data-testid="profit-engine-rows">
          <BreakdownTable
            rows={activeRows}
            currency={currency}
            emptyLabel="No orders yet today for this view."
          />
        </CardContent>
      </Card>
    </section>
  );
}
