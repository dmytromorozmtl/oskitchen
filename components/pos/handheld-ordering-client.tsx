"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { ChefHat, Minus, Plus, Send, ShoppingBag, Smartphone } from "lucide-react";

import { posCheckoutAction } from "@/actions/pos";
import { fireHandheldToKdsAction } from "@/actions/pos/handheld";
import { createTabAction } from "@/actions/pos/tabs";
import { OfflineSyncStatusBar } from "@/components/dashboard/offline-sync-status-bar";
import { broadcastOfflineSyncState } from "@/hooks/use-offline-sync-status";
import { getActionError, isActionSuccess } from "@/lib/action-result";
import {
  classifyOfflineCheckoutError,
  resolveOfflineSyncConflict,
} from "@/lib/pos/offline-sync";
import {
  enqueueOfflinePosCheckout,
  listOfflinePosCheckouts,
  registerOfflinePosBackgroundSync,
  removeOfflinePosCheckout,
  updateOfflinePosCheckout,
} from "@/lib/pos/offline-pos-queue";
import type { PosConflictResolutionStrategy } from "@/lib/pos/pos-settings";
import {
  findOpenTabForTable,
  groupHandheldProducts,
  HANDHELD_KDS_ROUTE,
  handheldCartSubtotal,
  tableStatusTone,
  type HandheldCartLine,
  type HandheldProduct,
  type HandheldTab,
  type HandheldTable,
} from "@/lib/pos/handheld-ordering";
import { posTouchButtonClass, posTouchTileClass } from "@/lib/pos/touch-targets";
import { posBadgeTextClass } from "@/lib/pos/pos-spacing-tokens";
import { posPaymentAllowedWhileOffline } from "@/services/pos/pos-payment-service";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type HandheldOrderingClientProps = {
  registers: Array<{ id: string; name: string; locationId: string | null }>;
  staff: Array<{ id: string; name: string }>;
  products: HandheldProduct[];
  tables: HandheldTable[];
  tabs: HandheldTab[];
  openShiftsByRegisterId: Record<string, { id: string } | null>;
  offlineQueueEnabled?: boolean;
  conflictResolution?: PosConflictResolutionStrategy;
};

export function HandheldOrderingClient(props: HandheldOrderingClientProps) {
  const offlineQueueEnabled = props.offlineQueueEnabled ?? true;
  const conflictResolution = props.conflictResolution ?? "manual_review";
  const registerId = props.registers[0]?.id ?? "";
  const staffId = props.staff[0]?.id ?? "";

  const [online, setOnline] = useState(() =>
    typeof navigator === "undefined" ? true : navigator.onLine,
  );
  const [selectedTableId, setSelectedTableId] = useState<string | null>(props.tables[0]?.id ?? null);
  const [category, setCategory] = useState<string>("All");
  const [cart, setCart] = useState<HandheldCartLine[]>([]);
  const [tabs, setTabs] = useState(props.tabs);
  const [status, setStatus] = useState<string | null>(null);
  const [lastKdsOrderId, setLastKdsOrderId] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const grouped = useMemo(() => groupHandheldProducts(props.products), [props.products]);
  const categories = useMemo(() => ["All", ...grouped.map((group) => group.category)], [grouped]);
  const visibleProducts = useMemo(() => {
    if (category === "All") return props.products;
    return grouped.find((group) => group.category === category)?.products ?? [];
  }, [category, grouped, props.products]);

  const selectedTable = props.tables.find((table) => table.id === selectedTableId) ?? null;
  const activeTab = findOpenTabForTable(tabs, selectedTableId);
  const subtotal = handheldCartSubtotal(cart);

  useEffect(() => {
    registerOfflinePosBackgroundSync();
    const onOnline = () => {
      setOnline(true);
      void flushOfflineQueue();
    };
    const onOffline = () => setOnline(false);
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);
    return () => {
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
    };
  }, [offlineQueueEnabled, conflictResolution]);

  async function flushOfflineQueue() {
    if (!offlineQueueEnabled) return;
    const queued = await listOfflinePosCheckouts();
    const pendingRows = queued.filter((entry) => entry.syncStatus !== "conflict");
    if (!pendingRows.length) return;

    broadcastOfflineSyncState("syncing");
    for (const entry of pendingRows) {
      await updateOfflinePosCheckout(entry.id, { syncStatus: "syncing" });
      const payload = {
        ...(entry.payload as Parameters<typeof posCheckoutAction>[0]),
        offlineSaleId: entry.id,
      };
      const res = await posCheckoutAction(payload);
      if (res.ok) {
        await removeOfflinePosCheckout(entry.id);
        continue;
      }
      const reason = classifyOfflineCheckoutError(res.error);
      const resolution = resolveOfflineSyncConflict({
        strategy: conflictResolution,
        conflict: { offlineSaleId: entry.id, reason, message: res.error },
      });
      if (resolution === "remove") {
        await removeOfflinePosCheckout(entry.id);
      } else {
        await updateOfflinePosCheckout(entry.id, {
          syncStatus: "conflict",
          syncError: res.error,
          conflictReason: reason,
        });
      }
    }
    broadcastOfflineSyncState("idle");
  }

  function addProduct(product: HandheldProduct) {
    setCart((prev) => {
      const existing = prev.find((line) => line.productId === product.id);
      if (existing) {
        return prev.map((line) =>
          line.productId === product.id ? { ...line, quantity: line.quantity + 1 } : line,
        );
      }
      return [
        ...prev,
        {
          key: product.id,
          productId: product.id,
          title: product.title,
          quantity: 1,
          unitPrice: product.price,
        },
      ];
    });
  }

  function adjustLine(key: string, delta: number) {
    setCart((prev) =>
      prev
        .map((line) =>
          line.key === key ? { ...line, quantity: Math.max(0, line.quantity + delta) } : line,
        )
        .filter((line) => line.quantity > 0),
    );
  }

  async function ensureTabForTable(): Promise<string | null> {
    if (!selectedTable) {
      setStatus("Select a table before firing items.");
      return null;
    }
    const existing = findOpenTabForTable(tabs, selectedTable.id);
    if (existing) return existing.id;

    const formData = new FormData();
    formData.set("name", `Table ${selectedTable.name}`);
    formData.set("tableId", selectedTable.id);
    const result = await createTabAction(formData);
    const error = getActionError(result);
    if (error) {
      setStatus(error);
      return null;
    }
    if (isActionSuccess<{ tab: HandheldTab & { status: string; subtotal: number; tax: number; tip: number; total: number } }>(result) && result.data?.tab) {
      const tab = result.data.tab;
      setTabs((prev) => [{ id: tab.id, name: tab.name, tableId: tab.tableId ?? null, items: [] }, ...prev]);
      return tab.id;
    }
    setStatus("Could not open tab for this table.");
    return null;
  }

  function fireToKds() {
    if (!registerId) {
      setStatus("Create a register before firing to KDS.");
      return;
    }
    if (!cart.length) {
      setStatus("Add items before firing to KDS.");
      return;
    }
    if (!online) {
      setStatus("KDS fire requires connectivity — checkout cash offline instead.");
      return;
    }

    const lineCount = cart.length;
    const tableName = selectedTable?.name ?? null;

    startTransition(async () => {
      const tabId = await ensureTabForTable();
      if (!tabId) return;

      const res = await fireHandheldToKdsAction({
        registerId,
        shiftId: props.openShiftsByRegisterId[registerId]?.id ?? null,
        staffMemberId: staffId || null,
        locationId: props.registers.find((register) => register.id === registerId)?.locationId ?? null,
        tableId: selectedTableId,
        tableName,
        tabId,
        lines: cart.map((line) => ({
          productId: line.productId,
          title: line.title,
          quantity: line.quantity,
          unitPrice: line.unitPrice,
        })),
      });

      if (!res.ok) {
        setStatus(res.error);
        return;
      }

      setTabs((prev) =>
        prev.map((tab) =>
          tab.id === tabId
            ? {
                ...tab,
                items: [
                  ...tab.items,
                  ...cart.map((line, index) => ({
                    id: `kds-${res.orderId}-${index}`,
                    productName: line.title,
                    quantity: line.quantity,
                    unitPrice: line.unitPrice,
                    totalPrice: line.quantity * line.unitPrice,
                  })),
                ],
              }
            : tab,
        ),
      );
      setCart([]);
      setLastKdsOrderId(res.orderId);
      const tableLabel = tableName ? `Table ${tableName}` : "table";
      setStatus(
        `Fired ${lineCount} line(s) to KDS (${res.workItemsCreated} prep ticket(s)) — ${tableLabel} · order ${res.orderId.slice(0, 8)}…`,
      );
    });
  }

  function checkoutCash() {
    if (!registerId) {
      setStatus("Create a register before checkout.");
      return;
    }
    if (!cart.length) {
      setStatus("Add items before checkout.");
      return;
    }

    const payload = {
      registerId,
      shiftId: props.openShiftsByRegisterId[registerId]?.id ?? null,
      staffMemberId: staffId || null,
      locationId: props.registers.find((register) => register.id === registerId)?.locationId ?? null,
      brandId: null,
      customerId: null,
      fulfillmentDetail: "DINE_IN" as const,
      paymentMode: "CASH" as const,
      notes: selectedTable ? `Handheld — Table ${selectedTable.name}` : "Handheld order",
      lines: cart.map((line) => ({
        productId: line.productId,
        quantity: line.quantity,
        unitPrice: line.unitPrice,
      })),
    };

    if (!online && offlineQueueEnabled && posPaymentAllowedWhileOffline("CASH")) {
      startTransition(async () => {
        await enqueueOfflinePosCheckout(payload);
        setCart([]);
        setStatus("Offline — sale queued. Will sync when back online.");
        broadcastOfflineSyncState("idle");
      });
      return;
    }
    if (!online) {
      setStatus("Reconnect or enable offline queue for cash checkout.");
      return;
    }

    startTransition(async () => {
      const res = await posCheckoutAction(payload);
      if (!res.ok) {
        setStatus(res.error);
        return;
      }
      setCart([]);
      setStatus(`Sale complete — order ${res.orderId.slice(0, 8)}…`);
    });
  }

  return (
    <div className="space-y-4 pb-28" data-testid="handheld-ordering-root">
      <div className="sticky top-0 z-sticky-header space-y-3 rounded-2xl border border-border/70 bg-background/95 p-3 backdrop-blur">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Handheld waiter</p>
            <h1 className="text-lg font-semibold">{selectedTable ? `Table ${selectedTable.name}` : "Select table"}</h1>
            {activeTab ? (
              <p className="text-xs text-muted-foreground">Open tab · {activeTab.items.length} item(s)</p>
            ) : null}
          </div>
          <Badge variant={online ? "default" : "outline"}>{online ? "Online" : "Offline"}</Badge>
        </div>
        <OfflineSyncStatusBar className="w-full" showWhenIdle={offlineQueueEnabled} />
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-2">
            <Smartphone className="h-4 w-4" aria-hidden />
            Install from browser menu for full-screen waiter mode.
          </span>
          <Link
            href={HANDHELD_KDS_ROUTE}
            className="inline-flex items-center gap-1 text-primary underline-offset-2 hover:underline"
            data-testid="handheld-kds-link"
          >
            <ChefHat className="h-4 w-4" aria-hidden />
            Kitchen display
          </Link>
        </div>
      </div>

      <section className="space-y-2">
        <p className="text-sm font-medium">Tables</p>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {props.tables.length === 0 ? (
            <p className="col-span-full text-sm text-muted-foreground">
              No tables yet.{" "}
              <Link href="/dashboard/tables" className="text-primary underline-offset-2 hover:underline">
                Add tables
              </Link>
            </p>
          ) : (
            props.tables.map((table) => (
              <button
                key={table.id}
                type="button"
                data-testid="handheld-table-tile"
                onClick={() => setSelectedTableId(table.id)}
                className={cn(
                  "rounded-2xl border px-3 py-3 text-left transition-colors",
                  posTouchButtonClass,
                  selectedTableId === table.id
                    ? "border-primary bg-primary/5"
                    : "border-border/70 bg-card hover:bg-muted/40",
                )}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-medium">{table.name}</span>
                  <Badge variant={tableStatusTone(table.status)} className={posBadgeTextClass}>
                    {table.status.toLowerCase()}
                  </Badge>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {table.section ?? "Main"} · seats {table.capacity}
                </p>
              </button>
            ))
          )}
        </div>
      </section>

      <section className="space-y-3">
        <div className="flex gap-2 overflow-x-auto pb-1">
          {categories.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setCategory(item)}
              className={cn(
                "shrink-0 rounded-full px-3 py-1.5 text-sm",
                category === item ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground",
              )}
            >
              {item}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-2">
          {visibleProducts.map((product) => (
            <button
              key={product.id}
              type="button"
              data-testid="handheld-product-tile"
              onClick={() => addProduct(product)}
              className={cn(
                "rounded-2xl border border-border/70 bg-card p-3 text-left",
                posTouchTileClass,
              )}
            >
              <p className="line-clamp-2 text-sm font-medium">{product.title}</p>
              <p className="mt-2 text-sm tabular-nums text-muted-foreground">${product.price.toFixed(2)}</p>
            </button>
          ))}
        </div>
      </section>

      <div className="fixed inset-x-0 bottom-0 z-chrome border-t border-border/80 bg-background/95 p-4 backdrop-blur">
        <div className="mx-auto flex max-w-md flex-col gap-3">
          {status ? (
            <p className="text-sm text-muted-foreground" data-testid="handheld-status">
              {status}
              {lastKdsOrderId ? (
                <>
                  {" "}
                  <Link href={HANDHELD_KDS_ROUTE} className="text-primary underline-offset-2 hover:underline">
                    View KDS
                  </Link>
                </>
              ) : null}
            </p>
          ) : null}
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-sm">
              <ShoppingBag className="h-4 w-4" aria-hidden />
              <span className="font-medium">{cart.length} line(s)</span>
              <span className="tabular-nums text-muted-foreground">${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                className={cn("rounded-full", posTouchButtonClass)}
                disabled={pending || !cart.length}
                onClick={fireToKds}
                data-testid="handheld-fire-kds"
              >
                <Send className="mr-1 h-4 w-4" />
                Fire KDS
              </Button>
              <Button
                type="button"
                className={cn("rounded-full", posTouchButtonClass)}
                disabled={pending || !cart.length}
                onClick={checkoutCash}
                data-testid="handheld-checkout-cash"
              >
                Cash
              </Button>
            </div>
          </div>
          {cart.length > 0 ? (
            <div className="max-h-28 space-y-1 overflow-y-auto text-sm">
              {cart.map((line) => (
                <div key={line.key} className="flex items-center justify-between gap-2">
                  <span className="truncate">{line.title}</span>
                  <div className="flex items-center gap-1">
                    <button type="button" aria-label={`Decrease ${line.title}`} onClick={() => adjustLine(line.key, -1)}>
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="w-6 text-center tabular-nums">{line.quantity}</span>
                    <button type="button" aria-label={`Increase ${line.title}`} onClick={() => adjustLine(line.key, 1)}>
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
