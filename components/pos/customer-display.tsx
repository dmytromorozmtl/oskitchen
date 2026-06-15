import React from "react";

import type { PosCustomerDisplayLine } from "@/lib/pos/pos-multi-monitor";
import { cn } from "@/lib/utils";

export type CustomerDisplayProps = {
  registerName: string;
  lines: PosCustomerDisplayLine[];
  subtotal: number;
  discount: number;
  total: number;
  paymentLabel: string;
  idleMessage?: string;
  className?: string;
};

export function formatCustomerDisplayMoney(value: number): string {
  return new Intl.NumberFormat(undefined, { style: "currency", currency: "USD" }).format(value);
}

/**
 * Full-screen customer-facing display for a second monitor or popup window.
 * Driven by BroadcastChannel state from the desktop POS terminal.
 */
export function CustomerDisplay({
  registerName,
  lines,
  subtotal,
  discount,
  total,
  paymentLabel,
  idleMessage = "Items will appear here as the cashier rings your sale.",
  className,
}: CustomerDisplayProps) {
  return (
    <div
      className={cn("flex min-h-screen flex-col bg-zinc-950 text-zinc-50", className)}
      data-testid="pos-customer-display"
    >
      <header className="border-b border-zinc-800 px-8 py-6">
        <p className="text-sm uppercase tracking-[0.2em] text-zinc-400">Your order</p>
        <h1 className="mt-1 text-3xl font-semibold">{registerName}</h1>
      </header>

      <main className="flex flex-1 flex-col gap-6 px-8 py-8" data-testid="pos-customer-display-lines">
        {lines.length === 0 ? (
          <p className="text-2xl text-zinc-400" data-testid="pos-customer-display-idle">
            {idleMessage}
          </p>
        ) : (
          <ul className="space-y-4">
            {lines.map((line, index) => (
              <li
                key={`${line.title}-${index}`}
                className="flex items-baseline justify-between gap-4 border-b border-zinc-800 pb-3 text-2xl"
                data-testid="pos-customer-display-line"
              >
                <span>
                  <span className="mr-3 tabular-nums text-zinc-400">{line.quantity}×</span>
                  {line.title}
                </span>
                <span className="tabular-nums">{formatCustomerDisplayMoney(line.lineTotal)}</span>
              </li>
            ))}
          </ul>
        )}
      </main>

      <footer className="border-t border-zinc-800 px-8 py-8" data-testid="pos-customer-display-totals">
        <div className="space-y-2 text-xl text-zinc-300">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span className="tabular-nums">{formatCustomerDisplayMoney(subtotal)}</span>
          </div>
          {discount > 0 ? (
            <div className="flex justify-between text-emerald-300">
              <span>Discount</span>
              <span className="tabular-nums">-{formatCustomerDisplayMoney(discount)}</span>
            </div>
          ) : null}
          <div className="flex justify-between text-4xl font-semibold text-white">
            <span>
              Total · <span data-testid="pos-customer-display-payment">{paymentLabel}</span>
            </span>
            <span className="tabular-nums" data-testid="pos-customer-display-total">
              {formatCustomerDisplayMoney(total)}
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
