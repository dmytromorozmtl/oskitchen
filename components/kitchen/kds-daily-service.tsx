"use client";

import { useCallback, useEffect, useMemo, useRef, useState, useTransition, type ReactNode } from "react";

import {
  bumpDailyKdsOrderAction,
  fetchDailyKdsOrdersAction,
  recallDailyKdsOrderAction,
} from "@/actions/kitchen-daily-kds";
import { KdsQueueStatusStrip } from "@/components/kitchen/kds-queue-status-strip";
import {
  formatKdsElapsedClock,
  formatKdsTicketNumber,
  isKdsTicketOverdue,
  kdsTicketAgeClassName,
  partitionKdsQueue,
  summarizeKdsQueue,
} from "@/lib/kitchen/kds-queue-clarity-era18";
import {
  getKdsConnectionStatusLabel,
  getKdsPollIntervalMs,
  getKdsRealtimeChannelName,
  KDS_REALTIME_ORDERS_SCHEMA,
  KDS_REALTIME_ORDERS_TABLE,
} from "@/lib/kitchen/kds-realtime-smoke-policy";
import type { KdsDailyOrder } from "@/services/kitchen-screen/daily-kds-service";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

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

export function KdsDailyService({
  initialOrders,
  userId,
  canBump = true,
  canRecall = false,
}: {
  initialOrders: KdsDailyOrder[];
  userId: string;
  canBump?: boolean;
  canRecall?: boolean;
}) {
  const [orders, setOrders] = useState(initialOrders);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [realtimeConnected, setRealtimeConnected] = useState(false);
  const [pending, startBump] = useTransition();
  const [, startRefresh] = useTransition();
  const overdueAlertedRef = useRef<Set<string>>(new Set());

  const queueSummary = useMemo(() => summarizeKdsQueue(orders), [orders]);
  const { preparing, ready } = useMemo(() => partitionKdsQueue(orders), [orders]);

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
    let pollMs = getKdsPollIntervalMs(false);

    const channel = supabase
      .channel(getKdsRealtimeChannelName(userId))
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: KDS_REALTIME_ORDERS_SCHEMA,
          table: KDS_REALTIME_ORDERS_TABLE,
          filter: `user_id=eq.${userId}`,
        },
        () => {
          refresh();
        },
      )
      .subscribe((status) => {
        const live = status === "SUBSCRIBED";
        setRealtimeConnected(live);
        pollMs = getKdsPollIntervalMs(live);
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
        const next = prev.map((order) => ({
          ...order,
          elapsedSeconds: Math.floor((Date.now() - new Date(order.createdAt).getTime()) / 1000),
        }));
        if (soundEnabled) {
          for (const order of next) {
            if (isKdsTicketOverdue(order.elapsedSeconds) && !overdueAlertedRef.current.has(order.id)) {
              playOverdueAlert();
              overdueAlertedRef.current.add(order.id);
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
      if (res.ok) {
        setOrders((prev) =>
          prev.map((order) => (order.id === orderId ? { ...order, status: "READY" } : order)),
        );
      }
    });
  }

  function handleRecall(orderId: string) {
    startBump(async () => {
      const res = await recallDailyKdsOrderAction(orderId);
      if (res.ok) {
        setOrders((prev) =>
          prev.map((order) => (order.id === orderId ? { ...order, status: "PREPARING" } : order)),
        );
      }
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold">Kitchen Display</h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Prep line + expo — oldest tickets first
          </p>
        </div>
        <button
          type="button"
          onClick={() => setSoundEnabled((value) => !value)}
          aria-pressed={soundEnabled}
          aria-label={soundEnabled ? "Disable kitchen sound alerts" : "Enable kitchen sound alerts"}
          className={cn(
            "min-h-11 min-w-11 rounded-full border px-3 py-2 text-sm",
            soundEnabled
              ? "border-emerald-300 bg-emerald-100 text-emerald-700"
              : "bg-muted text-muted-foreground",
          )}
        >
          {soundEnabled ? "🔊 Sound ON" : "🔇 Sound OFF"}
        </button>
      </div>

      <KdsQueueStatusStrip
        summary={queueSummary}
        realtimeConnected={realtimeConnected}
        connectionLabel={getKdsConnectionStatusLabel(realtimeConnected)}
      />

      {orders.length === 0 ? (
        <div className="py-16 text-center text-muted-foreground">
          <p className="mb-4 text-4xl">🍽️</p>
          <p className="text-lg font-medium">No active orders</p>
          <p className="mt-1 text-sm">Waiting for new orders…</p>
        </div>
      ) : (
        <div className="space-y-6">
          {preparing.length > 0 ? (
            <KdsTicketSection title="On the line" count={preparing.length}>
              {preparing.map((order) => (
                <KdsTicketCard
                  key={order.id}
                  order={order}
                  canBump={canBump}
                  canRecall={false}
                  pending={pending}
                  onBump={handleBump}
                  onRecall={handleRecall}
                />
              ))}
            </KdsTicketSection>
          ) : null}

          {ready.length > 0 ? (
            <KdsTicketSection title="Expo / Ready" count={ready.length} tone="ready">
              {ready.map((order) => (
                <KdsTicketCard
                  key={order.id}
                  order={order}
                  canBump={false}
                  canRecall={canRecall}
                  pending={pending}
                  onBump={handleBump}
                  onRecall={handleRecall}
                />
              ))}
            </KdsTicketSection>
          ) : null}
        </div>
      )}
    </div>
  );
}

function KdsTicketSection({
  title,
  count,
  tone = "prep",
  children,
}: {
  title: string;
  count: number;
  tone?: "prep" | "ready";
  children: ReactNode;
}) {
  return (
    <section data-testid={`kds-section-${tone}`}>
      <div className="mb-3 flex items-baseline justify-between gap-2">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          {title}
        </h3>
        <span className="text-xs tabular-nums text-muted-foreground">{count}</span>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{children}</div>
    </section>
  );
}

function KdsTicketCard({
  order,
  canBump,
  canRecall,
  pending,
  onBump,
  onRecall,
}: {
  order: KdsDailyOrder;
  canBump: boolean;
  canRecall: boolean;
  pending: boolean;
  onBump: (orderId: string) => void;
  onRecall: (orderId: string) => void;
}) {
  const overdue = isKdsTicketOverdue(order.elapsedSeconds);
  const allergenConflict = Boolean(order.hasAllergenConflict);
  const ticketNumber = formatKdsTicketNumber(order.id);

  return (
    <div
      role="article"
      aria-label={`Order ${ticketNumber} ${order.customerName}${allergenConflict ? ", allergen conflict" : ""}${overdue ? ", overdue" : ""}`}
      data-testid={`kds-ticket-${order.id}`}
      className={cn(
        "rounded-xl border-l-4 bg-card p-4 shadow-sm transition-all",
        kdsTicketAgeClassName(order.elapsedSeconds),
        allergenConflict && "ring-2 ring-violet-600 dark:ring-violet-400",
        overdue && "animate-pulse ring-2 ring-rose-500 motion-reduce:animate-none",
      )}
    >
      <div className="mb-2 flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-xs font-bold uppercase tracking-wide text-muted-foreground">
              {ticketNumber}
            </span>
            {order.tableName ? (
              <span className="rounded-md bg-background px-2 py-0.5 text-xs font-semibold shadow-sm border">
                {order.tableName}
              </span>
            ) : null}
          </div>
          <span className="mt-1 block truncate text-lg font-bold">{order.customerName}</span>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1">
          {allergenConflict ? (
            <span
              className="rounded-full bg-violet-700 px-2 py-0.5 text-xs font-bold uppercase tracking-wide text-white"
              role="status"
            >
              Allergy alert
            </span>
          ) : null}
          {overdue ? (
            <span className="rounded-full bg-rose-600 px-2 py-0.5 text-xs font-bold uppercase tracking-wide text-white">
              Overdue
            </span>
          ) : null}
          <span className="font-mono text-sm tabular-nums text-muted-foreground">
            ⏱ {formatKdsElapsedClock(order.elapsedSeconds)}
          </span>
        </div>
      </div>
      <div className="mb-4 flex flex-wrap gap-1">
        {order.items.map((item, index) => (
          <span
            key={`${order.id}-${index}`}
            className="rounded-md border bg-background px-2 py-1 text-sm font-medium shadow-sm"
          >
            {item}
          </span>
        ))}
      </div>
      {canRecall ? (
        <button
          type="button"
          disabled={pending}
          onClick={() => onRecall(order.id)}
          aria-label={`Recall order ${ticketNumber} to prep`}
          className="min-h-11 w-full rounded-xl bg-amber-600 px-4 py-3 text-base font-bold text-white transition-all hover:bg-amber-700 active:scale-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-500 disabled:opacity-60"
        >
          Recall to prep
        </button>
      ) : canBump ? (
        <button
          type="button"
          disabled={pending}
          onClick={() => onBump(order.id)}
          aria-label={`Mark order ${ticketNumber} ready`}
          className="min-h-11 w-full rounded-xl bg-emerald-600 px-4 py-3 text-base font-bold text-white transition-all hover:bg-emerald-700 active:scale-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500 disabled:opacity-60"
        >
          BUMP — Ready!
        </button>
      ) : null}
    </div>
  );
}
