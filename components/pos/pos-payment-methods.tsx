"use client";

import { useEffect, useState } from "react";
import { loadStripeTerminal } from "@stripe/terminal-js";
import type { Terminal } from "@stripe/terminal-js/types/terminal";
import { CreditCard } from "lucide-react";

export function TapToPayButton({
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
  const [terminalReady, setTerminalReady] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [terminal, setTerminal] = useState<Terminal | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function init() {
      try {
        const res = await fetch("/api/pos/terminal");
        if (!res.ok) return;
        const { token } = (await res.json()) as { token?: string };
        if (!token || cancelled) return;

        const StripeTerminal = await loadStripeTerminal();
        if (!StripeTerminal) return;
        const term = StripeTerminal.create({
          onFetchConnectionToken: async () => token,
          onUnexpectedReaderDisconnect: () => {
            setTerminalReady(false);
          },
        });

        if (cancelled) return;
        setTerminal(term);
        setTerminalReady(true);
      } catch {
        /* Stripe Terminal unavailable */
      }
    }

    void init();
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleTapToPay() {
    if (!terminal) return;
    setProcessing(true);

    try {
      const res = await fetch("/api/pos/terminal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount, orderId }),
      });
      const payload = (await res.json()) as { clientSecret?: string; error?: string };
      if (!payload.clientSecret) {
        throw new Error(payload.error || "Could not start payment");
      }

      const collectResult = await terminal.collectPaymentMethod(payload.clientSecret);
      if ("error" in collectResult) {
        throw new Error(collectResult.error.message);
      }

      const processResult = await terminal.processPayment(collectResult.paymentIntent);
      if ("error" in processResult) {
        throw new Error(processResult.error.message);
      }

      const processRes = await fetch("/api/pos/terminal", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          paymentIntentId: processResult.paymentIntent.id,
          orderId,
        }),
      });
      const data = await processRes.json();
      if (!processRes.ok) {
        throw new Error(data.error || "Failed to record payment");
      }

      onSuccess(data.transaction);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Tap-to-pay failed";
      onError?.(message);
      console.error("Tap-to-pay failed:", err);
    } finally {
      setProcessing(false);
    }
  }

  if (!terminalReady) return null;

  return (
    <button
      type="button"
      onClick={() => void handleTapToPay()}
      disabled={processing}
      className="flex w-full items-center gap-3 rounded-2xl border-2 border-primary/30 bg-primary/5 p-6 text-left transition hover:bg-primary/10 disabled:opacity-50"
    >
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-white">
        <CreditCard className="h-6 w-6" />
      </div>
      <div>
        <p className="text-lg font-semibold">Tap to Pay</p>
        <p className="text-sm text-muted-foreground">${amount.toFixed(2)} — Card Reader</p>
        {processing ? <p className="mt-1 text-xs text-primary">Processing...</p> : null}
      </div>
    </button>
  );
}
