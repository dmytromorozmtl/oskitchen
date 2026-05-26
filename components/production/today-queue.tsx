"use client";

import { useEffect, useState, useTransition } from "react";
import { AlertTriangle, Clock, RefreshCw, User } from "lucide-react";

import { fetchTodayQueueAction } from "@/actions/production-daily-queue";
import type { TodayOrderItem } from "@/services/production/daily-queue-service";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const priorityColors = {
  high: "border-l-rose-500 bg-rose-50/80 dark:bg-rose-950/30",
  normal: "border-l-amber-500 bg-amber-50/80 dark:bg-amber-950/30",
  low: "border-l-emerald-500 bg-emerald-50/80 dark:bg-emerald-950/30",
} as const;

const priorityLabels = {
  high: "Urgent",
  normal: "Soon",
  low: "New",
} as const;

export function TodayQueue({ initialOrders }: { initialOrders: TodayOrderItem[] }) {
  const [orders, setOrders] = useState(initialOrders);
  const [pending, startRefresh] = useTransition();

  function refresh() {
    startRefresh(async () => {
      const res = await fetchTodayQueueAction();
      if (res.ok) setOrders(res.orders);
    });
  }

  useEffect(() => {
    const id = setInterval(refresh, 15000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (orders.length === 0) {
    return (
      <div className="space-y-4">
        <div className="text-center py-16 text-muted-foreground">
          <p className="text-lg font-medium mb-2">No orders yet today</p>
          <p className="text-sm">Orders will appear here as they come in.</p>
        </div>
        <div className="flex justify-center">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="rounded-full"
            onClick={refresh}
            disabled={pending}
          >
            <RefreshCw className={cn("h-4 w-4 mr-2", pending && "animate-spin")} />
            Refresh
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="rounded-full"
          onClick={refresh}
          disabled={pending}
        >
          <RefreshCw className={cn("h-4 w-4 mr-2", pending && "animate-spin")} />
          Refresh
        </Button>
      </div>
      <div className="space-y-3">
        {orders.map((order) => (
          <div
            key={order.id}
            className={cn(
              "rounded-xl border-l-4 bg-card p-4 shadow-sm transition-all hover:shadow-md",
              priorityColors[order.priority],
            )}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="font-semibold">{order.customerName}</span>
                {order.hasAllergenConflict ? (
                  <span title="Allergen conflict">
                    <AlertTriangle className="h-4 w-4 text-rose-600" />
                  </span>
                ) : null}
                {order.tableName ? (
                  <span className="text-xs text-muted-foreground">· Table {order.tableName}</span>
                ) : null}
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    "text-xs font-medium px-2 py-0.5 rounded-full",
                    order.priority === "high" && "bg-rose-100 text-rose-700",
                    order.priority === "normal" && "bg-amber-100 text-amber-700",
                    order.priority === "low" && "bg-emerald-100 text-emerald-700",
                  )}
                >
                  {priorityLabels[order.priority]}
                </span>
                <Clock className="h-3 w-3 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">
                  {new Date(order.createdAt).toLocaleTimeString()}
                </span>
              </div>
            </div>
            <div className="flex flex-wrap gap-1">
              {order.items.map((item, i) => (
                <span key={`${order.id}-${i}`} className="text-sm bg-muted px-2 py-0.5 rounded-md">
                  {item}
                </span>
              ))}
            </div>
            <p className="mt-2 text-[11px] uppercase tracking-wide text-muted-foreground">{order.status}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
