"use client";

import { useEffect, useState } from "react";

import {
  subscribePosCustomerDisplayState,
  type PosCustomerDisplayState,
} from "@/lib/pos/pos-multi-monitor";

const EMPTY_STATE: PosCustomerDisplayState = {
  registerName: "Register",
  lines: [],
  subtotal: 0,
  discount: 0,
  total: 0,
  paymentLabel: "Cash",
  updatedAtIso: new Date(0).toISOString(),
};

function formatMoney(value: number): string {
  return new Intl.NumberFormat(undefined, { style: "currency", currency: "USD" }).format(value);
}

export function PosCustomerDisplayClient() {
  const [state, setState] = useState<PosCustomerDisplayState>(EMPTY_STATE);

  useEffect(() => subscribePosCustomerDisplayState(setState), []);

  return (
    <div
      className="flex min-h-screen flex-col bg-zinc-950 text-zinc-50"
      data-testid="pos-customer-display"
    >
      <header className="border-b border-zinc-800 px-8 py-6">
        <p className="text-sm uppercase tracking-[0.2em] text-zinc-400">Your order</p>
        <h1 className="mt-1 text-3xl font-semibold">{state.registerName}</h1>
      </header>

      <main className="flex flex-1 flex-col gap-6 px-8 py-8">
        {state.lines.length === 0 ? (
          <p className="text-2xl text-zinc-400">Items will appear here as the cashier rings your sale.</p>
        ) : (
          <ul className="space-y-4">
            {state.lines.map((line, index) => (
              <li
                key={`${line.title}-${index}`}
                className="flex items-baseline justify-between gap-4 border-b border-zinc-800 pb-3 text-2xl"
              >
                <span>
                  <span className="mr-3 tabular-nums text-zinc-400">{line.quantity}×</span>
                  {line.title}
                </span>
                <span className="tabular-nums">{formatMoney(line.lineTotal)}</span>
              </li>
            ))}
          </ul>
        )}
      </main>

      <footer className="border-t border-zinc-800 px-8 py-8">
        <div className="space-y-2 text-xl text-zinc-300">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span className="tabular-nums">{formatMoney(state.subtotal)}</span>
          </div>
          {state.discount > 0 ? (
            <div className="flex justify-between text-emerald-300">
              <span>Discount</span>
              <span className="tabular-nums">-{formatMoney(state.discount)}</span>
            </div>
          ) : null}
          <div className="flex justify-between text-4xl font-semibold text-white">
            <span>Total · {state.paymentLabel}</span>
            <span className="tabular-nums">{formatMoney(state.total)}</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
