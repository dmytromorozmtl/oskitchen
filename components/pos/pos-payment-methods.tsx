"use client";

import { CreditCard } from "lucide-react";

import { useStripeTerminal } from "@/hooks/use-stripe-terminal";

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
  const { terminal, status, processing, error, processPayment } = useStripeTerminal({
    autoConnect: true,
  });

  async function handleTapToPay() {
    try {
      const transaction = await processPayment({ amount, orderId });
      onSuccess(transaction);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Tap-to-pay failed";
      onError?.(message);
      console.error("Tap-to-pay failed:", err);
    }
  }

  if (!terminal) return null;

  const disabled = processing || status === "offline" || status === "connecting";

  return (
    <button
      type="button"
      onClick={() => void handleTapToPay()}
      disabled={disabled}
      className="flex w-full items-center gap-3 rounded-2xl border-2 border-primary/30 bg-primary/5 p-6 text-left transition hover:bg-primary/10 disabled:opacity-50"
    >
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-white">
        <CreditCard className="h-6 w-6" />
      </div>
      <div>
        <p className="text-lg font-semibold">Tap to Pay</p>
        <p className="text-sm text-muted-foreground">${amount.toFixed(2)} — Card Reader</p>
        {processing ? <p className="mt-1 text-xs text-primary">Processing...</p> : null}
        {status === "offline" ? (
          <p className="mt-1 text-xs text-amber-600">
            Card reader disconnected — use cash or reconnect in hardware settings
          </p>
        ) : null}
        {error ? <p className="mt-1 text-xs text-destructive">{error}</p> : null}
      </div>
    </button>
  );
}
