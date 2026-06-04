"use client";

import { useCallback, useEffect, useMemo, useRef, useState, useTransition, type ReactNode } from "react";
import { ChefHat } from "lucide-react";

import {
  bumpDailyKdsOrderAction,
  fetchDailyKdsOrdersAction,
  recallDailyKdsOrderAction,
} from "@/actions/kitchen-daily-kds";
import { KdsBumpNextStrip } from "@/components/kitchen/kds-bump-next-strip";
import { KdsPriorityLaneStrip } from "@/components/kitchen/kds-priority-lane-strip";
import { KdsQueueStatusStrip } from "@/components/kitchen/kds-queue-status-strip";
import { KdsRecallNextStrip } from "@/components/kitchen/kds-recall-next-strip";
import { QrOrderTicketBadge } from "@/components/kitchen/qr-order-ticket";
import { VoiceOrderTicketBadge } from "@/components/kitchen/voice-order-ticket";
import { KdsTicketAttentionStrip } from "@/components/kitchen/kds-ticket-attention-strip";
import { KdsTicketRowNextAction } from "@/components/kitchen/kds-ticket-row-next-action";
import { EmptyState } from "@/components/ui/empty-state";
import {
  pickKdsBumpNextTicket,
  shouldShowKdsBumpNextHero,
  shouldShowKdsRecallNextHero,
} from "@/lib/kitchen/kds-bump-next-era18";
import {
  buildKdsTicketFocusSnapshot,
  shouldShowKdsTicketAttentionStrip,
} from "@/lib/kitchen/kds-ticket-focus-era18";
import {
  buildKdsPriorityLaneItems,
  partitionKdsQueueByPriority,
  shouldShowKdsPriorityLane,
} from "@/lib/kitchen/kds-priority-lane-era19";
import {
  formatKdsElapsedClock,
  formatKdsTicketNumber,
  isKdsTicketOverdue,
  kdsTicketAgeClassName,
  summarizeKdsQueue,
} from "@/lib/kitchen/kds-queue-clarity-era18";
import { useKdsRealtime } from "@/hooks/use-kds-realtime";
import { KDS_NEW_TICKET_ANIMATION_CLASS } from "@/lib/kitchen/kds-realtime-ui";
import {
  playKdsNewOrderChime,
  playKdsOverdueAlert,
} from "@/lib/kitchen/kds-realtime-sounds";
import type { KdsRealtimeSloSnapshot } from "@/lib/kitchen/kds-realtime-slo-metrics";
import type { KdsDailyOrder } from "@/services/kitchen-screen/daily-kds-service";
import type { KdsRealtimeTransport } from "@/services/kds-websocket";
import { cn } from "@/lib/utils";

export type KdsDailyServiceRealtimeProps = {
  isLive: boolean;
  transport: KdsRealtimeTransport;
  connectionLabel: string;
  reconnectAttempt: number;
  slo?: KdsRealtimeSloSnapshot;
};

export function KdsDailyService({
  initialOrders,
  userId,
  canBump = true,
  canRecall = false,
  soundEnabled: soundEnabledProp,
  refreshSignal = 0,
  realtime: realtimeProp,
  hideSoundToggle = false,
}: {
  initialOrders: KdsDailyOrder[];
  userId: string;
  canBump?: boolean;
  canRecall?: boolean;
  soundEnabled?: boolean;
  refreshSignal?: number;
  realtime?: KdsDailyServiceRealtimeProps;
  hideSoundToggle?: boolean;
}) {
  const [orders, setOrders] = useState(initialOrders);
  const [internalSoundEnabled, setInternalSoundEnabled] = useState(true);
  const soundEnabled = soundEnabledProp ?? internalSoundEnabled;
  const [pendingOrderId, setPendingOrderId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [, startBump] = useTransition();
  const [, startRefresh] = useTransition();
  const overdueAlertedRef = useRef<Set<string>>(new Set());
  const [recentArrivals, setRecentArrivals] = useState<Set<string>>(() => new Set());

  const queueSummary = useMemo(() => summarizeKdsQueue(orders), [orders]);
  const { preparing, ready } = useMemo(() => partitionKdsQueueByPriority(orders), [orders]);
  const priorityLaneItems = useMemo(
    () => buildKdsPriorityLaneItems(preparing, ready),
    [preparing, ready],
  );
  const showPriorityLane = shouldShowKdsPriorityLane(orders);
  const bumpNextTicket = useMemo(() => pickKdsBumpNextTicket(preparing), [preparing]);
  const showBumpNextHero = shouldShowKdsBumpNextHero({
    canBump,
    preparingCount: preparing.length,
  });
  const showRecallNextHero = shouldShowKdsRecallNextHero({
    canRecall,
    readyCount: ready.length,
  });
  const ticketFocus = useMemo(() => buildKdsTicketFocusSnapshot(orders), [orders]);
  const showTicketAttentionStrip = shouldShowKdsTicketAttentionStrip(ticketFocus, queueSummary);

  const refresh = useCallback(() => {
    startRefresh(async () => {
      const res = await fetchDailyKdsOrdersAction();
      if (!res.ok) return;
      setOrders((prev) => {
        const prevIds = new Set(prev.map((o) => o.id));
        const arrivals = res.orders.filter((o) => !prevIds.has(o.id)).map((o) => o.id);
        if (arrivals.length > 0) {
          setRecentArrivals((current) => {
            const next = new Set(current);
            for (const id of arrivals) next.add(id);
            return next;
          });
          window.setTimeout(() => {
            setRecentArrivals((current) => {
              const next = new Set(current);
              for (const id of arrivals) next.delete(id);
              return next;
            });
          }, 700);
        }
        if (soundEnabled && res.orders.length > prev.length) playKdsNewOrderChime();
        return res.orders;
      });
    });
  }, [soundEnabled]);

  const internalRealtime = useKdsRealtime({
    userId,
    onRefresh: refresh,
    enabled: !realtimeProp,
  });

  const realtime: KdsDailyServiceRealtimeProps = realtimeProp ?? {
    isLive: internalRealtime.isLive,
    transport: internalRealtime.transport,
    connectionLabel: internalRealtime.connectionLabel,
    reconnectAttempt: internalRealtime.reconnectAttempt,
    slo: internalRealtime.slo,
  };

  useEffect(() => {
    if (refreshSignal === 0) return;
    refresh();
  }, [refresh, refreshSignal]);

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
              playKdsOverdueAlert();
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
    setActionError(null);
    setPendingOrderId(orderId);
    startBump(async () => {
      const res = await bumpDailyKdsOrderAction(orderId);
      setPendingOrderId(null);
      if (res.ok) {
        setOrders((prev) =>
          prev.map((order) => (order.id === orderId ? { ...order, status: "READY" } : order)),
        );
      } else {
        setActionError(res.error ?? "Could not bump order. Try again or check permissions.");
      }
    });
  }

  function handleRecall(orderId: string) {
    setActionError(null);
    setPendingOrderId(orderId);
    startBump(async () => {
      const res = await recallDailyKdsOrderAction(orderId);
      setPendingOrderId(null);
      if (res.ok) {
        setOrders((prev) =>
          prev.map((order) => (order.id === orderId ? { ...order, status: "PREPARING" } : order)),
        );
      } else {
        setActionError(res.error ?? "Could not recall order. Try again or check permissions.");
      }
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold">Kitchen Display</h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Prep line + expo — allergen and overdue tickets sorted first
          </p>
        </div>
        <button
          type="button"
          onClick={() => setInternalSoundEnabled((value) => !value)}
          aria-pressed={soundEnabled}
          aria-label={soundEnabled ? "Disable kitchen sound alerts" : "Enable kitchen sound alerts"}
          className={cn(
            "min-h-11 min-w-11 rounded-full border px-3 py-2 text-sm",
            soundEnabled
              ? "border-emerald-300 bg-emerald-100 text-emerald-700"
              : "bg-muted text-muted-foreground",
            hideSoundToggle && "hidden",
          )}
        >
          {soundEnabled ? "🔊 Sound ON" : "🔇 Sound OFF"}
        </button>
      </div>

      <KdsQueueStatusStrip
        summary={queueSummary}
        realtimeConnected={realtime.isLive}
        connectionLabel={realtime.connectionLabel}
        transport={realtime.transport}
        reconnectAttempt={realtime.reconnectAttempt}
        slo={realtime.slo}
        showConnectionBar={!hideSoundToggle}
      />

      {actionError ? (
        <div
          role="alert"
          data-testid="kds-action-error"
          className="rounded-xl border border-rose-300 bg-rose-50 px-4 py-3 text-sm text-rose-900 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-100"
        >
          {actionError}
        </div>
      ) : null}

      {showPriorityLane ? <KdsPriorityLaneStrip items={priorityLaneItems} /> : null}

      {showTicketAttentionStrip ? (
        <KdsTicketAttentionStrip
          focus={ticketFocus}
          preparing={preparing}
          ready={ready}
        />
      ) : null}

      {showBumpNextHero && bumpNextTicket ? (
        <KdsBumpNextStrip
          ticket={bumpNextTicket}
          pending={pendingOrderId !== null}
          onBump={handleBump}
        />
      ) : null}

      {showRecallNextHero ? (
        <KdsRecallNextStrip
          ready={ready}
          pending={pendingOrderId !== null}
          onRecall={handleRecall}
        />
      ) : null}

      {orders.length === 0 ? (
        <EmptyState
          icon={ChefHat}
          variant="inline"
          title="No active tickets"
          description="Kitchen display tickets appear here when POS, storefront, or channel orders enter production."
          primaryLabel="Open production board"
          primaryHref="/dashboard/production"
          secondaryLabel="Order Hub"
          secondaryHref="/dashboard/order-hub"
          showDemoLink={false}
        />
      ) : (
        <div className="space-y-6">
          {preparing.length > 0 ? (
            <KdsTicketSection title="On the line" count={preparing.length}>
              {preparing.map((order) => (
                <KdsTicketCard
                  key={order.id}
                  order={order}
                  isNew={recentArrivals.has(order.id)}
                  canBump={canBump}
                  canRecall={false}
                  pending={pendingOrderId !== null}
                  pendingOrderId={pendingOrderId}
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
                  isNew={recentArrivals.has(order.id)}
                  canBump={false}
                  canRecall={canRecall}
                  pending={pendingOrderId !== null}
                  pendingOrderId={pendingOrderId}
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
  isNew = false,
  canBump,
  canRecall,
  pending,
  pendingOrderId,
  onBump,
  onRecall,
}: {
  order: KdsDailyOrder;
  isNew?: boolean;
  canBump: boolean;
  canRecall: boolean;
  pending: boolean;
  pendingOrderId: string | null;
  onBump: (orderId: string) => void;
  onRecall: (orderId: string) => void;
}) {
  const overdue = isKdsTicketOverdue(order.elapsedSeconds);
  const allergenConflict = Boolean(order.hasAllergenConflict);
  const ticketNumber = formatKdsTicketNumber(order.id);
  const isPending = pending && pendingOrderId === order.id;
  const isBlocked = pending && pendingOrderId !== order.id;

  return (
    <div
      id={`kds-ticket-${order.id}`}
      role="article"
      aria-label={`Order ${ticketNumber} ${order.customerName}${allergenConflict ? ", allergen conflict" : ""}${overdue ? ", overdue" : ""}`}
      data-testid={`kds-ticket-${order.id}`}
      className={cn(
        "rounded-xl border-l-4 bg-card p-4 shadow-sm transition-all",
        kdsTicketAgeClassName(order.elapsedSeconds),
        isNew && KDS_NEW_TICKET_ANIMATION_CLASS,
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
            <VoiceOrderTicketBadge
              tableName={order.tableName}
              sourceMetadataJson={order.sourceMetadataJson}
            />
            <QrOrderTicketBadge
              tableName={order.tableName}
              sourceMetadataJson={order.sourceMetadataJson}
            />
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
          <KdsTicketRowNextAction
            order={order}
            canBump={canBump}
            canRecall={canRecall}
            pending={isPending}
            blocked={isBlocked}
            onBump={onBump}
            onRecall={onRecall}
          />
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
          disabled={isPending || isBlocked}
          onClick={() => onRecall(order.id)}
          aria-label={`Recall order ${ticketNumber} to prep`}
          className="min-h-11 w-full rounded-xl bg-amber-600 px-4 py-3 text-base font-bold text-white transition-all hover:bg-amber-700 active:scale-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-500 disabled:opacity-60"
        >
          Recall to prep
        </button>
      ) : canBump ? (
        <button
          type="button"
          disabled={isPending || isBlocked}
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
