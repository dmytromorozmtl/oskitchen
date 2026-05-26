"use client";

import { useCallback, useEffect, useRef, useState, useTransition } from "react";

import { bumpDailyKdsOrderAction, fetchDailyKdsOrdersAction } from "@/actions/kitchen-daily-kds";
import type { KdsDailyOrder } from "@/services/kitchen-screen/daily-kds-service";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

/** Seconds before ticket is considered overdue (default SLA). */
const KDS_OVERDUE_SECONDS = 900;

function playNewOrderChime() {
  try {
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = 880;
    gain.gain.value = 0.08;
    osc.start();
    osc.stop(ctx.currentTime + 0.15);
    void ctx.close();
  } catch {
    /* ignore — autoplay may be blocked */
  }
}

function playOverdueAlert() {
  try {
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = 440;
    gain.gain.value = 0.12;
    osc.start();
    osc.stop(ctx.currentTime + 0.35);
    setTimeout(() => {
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.frequency.value = 330;
      gain2.gain.value = 0.12;
      osc2.start();
      osc2.stop(ctx.currentTime + 0.35);
      void ctx.close();
    }, 400);
  } catch {
    /* ignore */
  }
}

function isOverdue(elapsedSeconds: number): boolean {
  return elapsedSeconds >= KDS_OVERDUE_SECONDS;
}

function getColor(elapsed: number): string {
  if (elapsed < 300) return "border-l-emerald-500 bg-emerald-50/80 dark:bg-emerald-950/30";
  if (elapsed < 600) return "border-l-amber-500 bg-amber-50/80 dark:bg-amber-950/30";
  if (elapsed < 1200) return "border-l-orange-500 bg-orange-50/80 dark:bg-orange-950/30";
  return "border-l-rose-500 bg-rose-50/80 dark:bg-rose-950/30";
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function KdsDailyService({
  initialOrders,
  userId,
}: {
  initialOrders: KdsDailyOrder[];
  userId: string;
}) {
  const [orders, setOrders] = useState(initialOrders);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [realtimeConnected, setRealtimeConnected] = useState(false);
  const [pending, startBump] = useTransition();
  const [, startRefresh] = useTransition();
  const overdueAlertedRef = useRef<Set<string>>(new Set());
  const refresh = useCallback(() => {
    startRefresh(async () => {
      const res = await fetchDailyKdsOrdersAction();
      if (!res.ok) return;
      setOrders((prev) => {
        if (soundEnabled && res.orders.length > prev.length) playNewOrderChime();
        return res.orders;
      });
    });
  }, [soundEnabled]);

  useEffect(() => {
    const supabase = createClient();
    let pollMs = 15_000;

    const channel = supabase
      .channel(`kds-orders-${userId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "orders",
          filter: `user_id=eq.${userId}`,
        },
        () => {
          refresh();
        },
      )
      .subscribe((status) => {
        const live = status === "SUBSCRIBED";
        setRealtimeConnected(live);
        pollMs = live ? 60_000 : 15_000;
      });

    const fallback = setInterval(refresh, pollMs);

    return () => {
      clearInterval(fallback);
      void supabase.removeChannel(channel);
    };
  }, [userId, refresh]);

  useEffect(() => {
    const tick = setInterval(() => {
      setOrders((prev) => {
        const next = prev.map((o) => ({
          ...o,
          elapsedSeconds: Math.floor((Date.now() - new Date(o.createdAt).getTime()) / 1000),
        }));
        if (soundEnabled) {
          for (const o of next) {
            if (isOverdue(o.elapsedSeconds) && !overdueAlertedRef.current.has(o.id)) {
              playOverdueAlert();
              overdueAlertedRef.current.add(o.id);
            }
          }
        }
        return next;
      });
    }, 1000);
    return () => clearInterval(tick);
  }, [soundEnabled]);

  function handleBump(orderId: string) {
    startBump(async () => {
      const res = await bumpDailyKdsOrderAction(orderId);
      if (res.ok) setOrders((prev) => prev.filter((o) => o.id !== orderId));
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-bold">Kitchen Display</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            {realtimeConnected ? "● Live (Supabase Realtime)" : "○ Polling fallback (15s)"}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setSoundEnabled((v) => !v)}
          aria-pressed={soundEnabled}
          aria-label={soundEnabled ? "Disable kitchen sound alerts" : "Enable kitchen sound alerts"}
          className={cn(
            "text-sm min-h-11 min-w-11 px-3 py-2 rounded-full border",
            soundEnabled
              ? "bg-emerald-100 text-emerald-700 border-emerald-300"
              : "bg-muted text-muted-foreground",
          )}
        >
          {soundEnabled ? "🔊 Sound ON" : "🔇 Sound OFF"}
        </button>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <p className="text-4xl mb-4">🍽️</p>
          <p className="text-lg font-medium">No active orders</p>
          <p className="text-sm mt-1">Waiting for new orders…</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {orders.map((order) => {
            const overdue = isOverdue(order.elapsedSeconds);
            return (
            <div
              key={order.id}
              role="article"
              aria-label={`Order ${order.customerName}${overdue ? ", overdue" : ""}`}
              className={cn(
                "rounded-xl border-l-4 bg-card p-4 shadow-sm transition-all",
                getColor(order.elapsedSeconds),
                overdue && "ring-2 ring-rose-500 animate-pulse motion-reduce:animate-none",
              )}
            >
              <div className="flex items-center justify-between mb-2 gap-2">
                <span className="font-bold text-lg">{order.customerName}</span>
                <div className="flex items-center gap-2 shrink-0">
                  {overdue ? (
                    <span className="rounded-full bg-rose-600 px-2 py-0.5 text-xs font-bold text-white uppercase tracking-wide">
                      Overdue
                    </span>
                  ) : null}
                  <span className="text-sm font-mono tabular-nums text-muted-foreground">
                    ⏱ {formatTime(order.elapsedSeconds)}
                  </span>
                </div>
              </div>
              <div className="flex flex-wrap gap-1 mb-4">
                {order.items.map((item, i) => (
                  <span
                    key={`${order.id}-${i}`}
                    className="bg-background px-2 py-1 rounded-md text-sm font-medium shadow-sm border"
                  >
                    {item}
                  </span>
                ))}
              </div>
              <button
                type="button"
                disabled={pending}
                onClick={() => handleBump(order.id)}
                aria-label={`Mark order ${order.customerName} ready and remove from KDS`}
                className="w-full min-h-11 rounded-xl bg-emerald-600 px-4 py-3 text-white font-bold text-base hover:bg-emerald-700 active:scale-95 transition-all disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500"
              >
                BUMP — Ready!
              </button>
            </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
