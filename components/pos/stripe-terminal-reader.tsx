"use client";

import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import type { Reader } from "@stripe/terminal-js/types/terminal";
import { Battery, CreditCard, Plug, PlugZap, RefreshCw, WifiOff } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useStripeTerminal,
  type UseStripeTerminalResult,
} from "@/hooks/use-stripe-terminal";
import type { StripeTerminalReaderStatus } from "@/lib/payments/stripe-terminal-client";
import {
  catalogEntryForDeviceType,
  formatStripeTerminalDeviceLabel,
} from "@/lib/payments/stripe-terminal-hardware-types";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const StripeTerminalContext = createContext<UseStripeTerminalResult | null>(null);

export function useStripeTerminalContext(): UseStripeTerminalResult {
  const ctx = useContext(StripeTerminalContext);
  if (!ctx) {
    throw new Error("useStripeTerminalContext requires StripeTerminalProvider");
  }
  return ctx;
}

export function StripeTerminalProvider({
  active,
  children,
}: {
  active: boolean;
  children: ReactNode;
}) {
  const terminal = useStripeTerminal({ enabled: active, autoConnect: active });
  return (
    <StripeTerminalContext.Provider value={terminal}>{children}</StripeTerminalContext.Provider>
  );
}

function statusMeta(status: StripeTerminalReaderStatus): {
  label: string;
  dotClass: string;
  textClass: string;
} {
  switch (status) {
    case "online":
      return {
        label: "Connected",
        dotClass: "bg-emerald-500",
        textClass: "text-emerald-700",
      };
    case "busy":
    case "processing":
      return {
        label: status === "processing" ? "Processing payment" : "Reader busy",
        dotClass: "bg-amber-500 animate-pulse",
        textClass: "text-amber-700",
      };
    case "connecting":
      return {
        label: "Connecting…",
        dotClass: "bg-amber-400 animate-pulse",
        textClass: "text-amber-700",
      };
    case "offline":
      return {
        label: "Disconnected",
        dotClass: "bg-rose-500",
        textClass: "text-rose-700",
      };
    default:
      return {
        label: "Not connected",
        dotClass: "bg-muted-foreground/40",
        textClass: "text-muted-foreground",
      };
  }
}

function readerBatteryLabel(reader: Reader | null): string | null {
  const level = (reader as { battery_level?: number | null } | null)?.battery_level;
  if (level == null || Number.isNaN(level)) return null;
  return `${Math.round(level)}%`;
}

export function StripeTerminalReaderPanel({
  compact = false,
  className,
}: {
  compact?: boolean;
  className?: string;
}) {
  const {
    terminal,
    reader,
    status,
    discoveredReaders,
    error,
    processing,
    discoverReaders,
    connectReader,
    disconnectReader,
  } = useStripeTerminalContext();

  const meta = statusMeta(status);
  const battery = readerBatteryLabel(reader);
  const [selectedReaderId, setSelectedReaderId] = useState<string | undefined>();

  const readerOptions = useMemo(() => {
    const list = discoveredReaders.length > 0 ? discoveredReaders : reader ? [reader] : [];
    return list.map((r) => {
      const model = formatStripeTerminalDeviceLabel(r.device_type ?? null);
      const base = r.label || r.serial_number || r.id;
      return {
        id: r.id,
        label: `${base} · ${model}`,
        deviceType: r.device_type ?? null,
      };
    });
  }, [discoveredReaders, reader]);

  const connectedDevice = catalogEntryForDeviceType(reader?.device_type ?? null);

  if (!terminal) {
    return (
      <Card className={cn("border-dashed border-border/80", className)} data-testid="stripe-terminal-reader">
        <CardHeader className={compact ? "p-4 pb-2" : undefined}>
          <CardTitle className="text-base">Stripe card reader</CardTitle>
          <CardDescription>Stripe Terminal is not configured for this environment.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className={cn("border-border/80 shadow-sm", className)} data-testid="stripe-terminal-reader">
      <CardHeader className={cn("flex flex-row items-start justify-between gap-3 space-y-0", compact && "p-4 pb-2")}>
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <CardTitle className="text-base">Stripe card reader</CardTitle>
            {connectedDevice ? (
              <Badge variant="outline" data-testid="stripe-terminal-device-badge">
                {connectedDevice.shortLabel}
              </Badge>
            ) : null}
          </div>
          <CardDescription>
            {reader?.label ?? reader?.device_type ?? "Discover and connect a reader before card payment."}
            {connectedDevice ? ` · ${connectedDevice.connectivity}` : ""}
          </CardDescription>
        </div>
        <div className="flex items-center gap-2 text-xs font-medium" aria-live="polite">
          <span className={cn("h-2.5 w-2.5 rounded-full", meta.dotClass)} aria-hidden />
          <span className={meta.textClass}>{meta.label}</span>
        </div>
      </CardHeader>
      <CardContent className={cn("space-y-3", compact && "p-4 pt-0")}>
        {readerOptions.length > 1 ? (
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground">Reader</p>
            <Select
              value={selectedReaderId ?? reader?.id ?? readerOptions[0]?.id}
              onValueChange={(id) => {
                setSelectedReaderId(id);
                void connectReader(id);
              }}
              disabled={processing}
            >
              <SelectTrigger className="h-9 rounded-xl">
                <SelectValue placeholder="Select reader" />
              </SelectTrigger>
              <SelectContent>
                {readerOptions.map((option) => (
                  <SelectItem key={option.id} value={option.id}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        ) : null}

        {battery ? (
          <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Battery className="h-3.5 w-3.5" aria-hidden />
            Battery {battery}
          </p>
        ) : null}

        {status === "offline" || status === "disconnected" ? (
          <p className="flex items-start gap-2 rounded-xl border border-amber-200/80 bg-amber-50/80 p-3 text-xs text-amber-900">
            <WifiOff className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
            Card reader disconnected — use cash or saved card until the reader reconnects.
          </p>
        ) : null}

        {error ? <p className="text-xs text-destructive">{error}</p> : null}

        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="rounded-full"
            disabled={processing}
            onClick={() => void discoverReaders().then((readers) => readers[0] && connectReader(readers[0].id))}
          >
            <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
            Discover
          </Button>
          {reader ? (
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="rounded-full"
              disabled={processing}
              onClick={() => void disconnectReader()}
            >
              <Plug className="mr-1.5 h-3.5 w-3.5" />
              Disconnect
            </Button>
          ) : (
            <Button
              type="button"
              size="sm"
              className="rounded-full"
              disabled={processing || status === "connecting"}
              onClick={() => void connectReader(selectedReaderId)}
            >
              <PlugZap className="mr-1.5 h-3.5 w-3.5" />
              Connect reader
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

type TerminalReceiptPreview = {
  orderId: string;
  amount: number;
  transactionId?: string;
  readerLabel?: string;
};

export function StripeTerminalCheckout({
  amount,
  orderId,
  onSuccess,
  onError,
}: {
  amount: number;
  orderId: string;
  onSuccess: (transaction: unknown) => void;
  onError?: (message: string) => void;
}) {
  const { status, processing, error, processPayment, reader } = useStripeTerminalContext();
  const [receipt, setReceipt] = useState<TerminalReceiptPreview | null>(null);

  async function handlePay() {
    try {
      const transaction = await processPayment({ amount, orderId });
      const tx = transaction as { id?: string } | null;
      setReceipt({
        orderId,
        amount,
        transactionId: tx?.id,
        readerLabel: reader?.label ?? reader?.device_type ?? undefined,
      });
      onSuccess(transaction);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Tap-to-pay failed";
      onError?.(message);
    }
  }

  const disabled = processing || status === "offline" || status === "connecting" || status === "disconnected";

  return (
    <div className="space-y-3" data-testid="stripe-terminal-checkout">
      <StripeTerminalReaderPanel compact />

      <button
        type="button"
        onClick={() => void handlePay()}
        disabled={disabled}
        className="flex w-full items-center gap-3 rounded-2xl border-2 border-primary/30 bg-primary/5 p-6 text-left transition hover:bg-primary/10 disabled:opacity-50"
      >
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-white">
          <CreditCard className="h-6 w-6" />
        </div>
        <div>
          <p className="text-lg font-semibold">Tap, insert, or swipe card</p>
          <p className="text-sm text-muted-foreground">${amount.toFixed(2)} — Stripe Terminal</p>
          {processing ? <p className="mt-1 text-xs text-primary">Processing…</p> : null}
          {error ? <p className="mt-1 text-xs text-destructive">{error}</p> : null}
        </div>
      </button>

      {receipt ? (
        <Card className="border-emerald-200/80 bg-emerald-50/50" data-testid="stripe-terminal-receipt-preview">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-sm font-semibold text-emerald-900">Payment approved</CardTitle>
            <CardDescription className="text-emerald-800/90">
              Order {receipt.orderId.slice(0, 8)}… · ${receipt.amount.toFixed(2)}
              {receipt.transactionId ? ` · Txn ${receipt.transactionId.slice(0, 8)}…` : null}
            </CardDescription>
          </CardHeader>
          {receipt.readerLabel ? (
            <CardContent className="p-4 pt-0 text-xs text-emerald-800">
              Reader: {receipt.readerLabel}
            </CardContent>
          ) : null}
        </Card>
      ) : null}
    </div>
  );
}
