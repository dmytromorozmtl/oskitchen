"use client";

import { CreditCard } from "lucide-react";

import { StripeTerminalCheckout } from "@/components/pos/stripe-terminal-reader";
import { Button } from "@/components/ui/button";
import { posCheckoutStatusClassName } from "@/lib/pos/pos-checkout-status";
import {
  POS_TERMINAL_DENSITY_AMOUNT_DUE_CLASS,
  POS_TERMINAL_DENSITY_CHECKOUT_BUTTON_CLASS,
  POS_TERMINAL_DENSITY_CHECKOUT_SPEED_CLASS,
  POS_TERMINAL_DENSITY_CHECKOUT_TEST_ID,
  POS_TERMINAL_DENSITY_CHECKOUT_WRAPPER_CLASS,
} from "@/lib/design/pos-terminal-density-policy";
import { cn } from "@/lib/utils";

import type { PosTerminalReceiptPanelProps } from "@/components/dashboard/pos-terminal/pos-terminal-types";

export function ReceiptPanel(props: PosTerminalReceiptPanelProps) {
  return (
    <div className="space-y-4" data-testid="pos-receipt-panel">
      <div className="rounded-xl border border-border/80 bg-muted/20 px-3 py-3 text-sm">
        <div className="flex items-center justify-between gap-2">
          <span className="text-muted-foreground">Subtotal</span>
          <span className="font-medium tabular-nums">${props.cartTotal.toFixed(2)}</span>
        </div>
        {props.appliedDiscountAmount > 0 ? (
          <div className="mt-1 flex items-center justify-between gap-2 text-emerald-700 dark:text-emerald-300">
            <span>Discount</span>
            <span className="font-medium tabular-nums">
              −${props.appliedDiscountAmount.toFixed(2)}
            </span>
          </div>
        ) : null}
        <div className="mt-2 flex items-center justify-between gap-2 border-t border-border/60 pt-2">
          <span className="font-semibold">Amount due</span>
          <span className={POS_TERMINAL_DENSITY_AMOUNT_DUE_CLASS}>${props.amountDue.toFixed(2)}</span>
        </div>
      </div>

      {props.checkoutStatus ? (
        <p
          className={posCheckoutStatusClassName(props.checkoutStatus.kind)}
          role="status"
          aria-live="polite"
          data-testid="pos-checkout-status"
        >
          {props.checkoutStatus.text}
        </p>
      ) : null}

      {props.pendingTerminal ? (
        <StripeTerminalCheckout
          amount={props.pendingTerminal.amount}
          orderId={props.pendingTerminal.orderId}
          onSuccess={props.onTerminalSuccess}
          onError={props.onTerminalError}
        />
      ) : null}

      <div
        className={cn(
          props.speedMode && POS_TERMINAL_DENSITY_CHECKOUT_WRAPPER_CLASS,
        )}
      >
        <Button
          type="button"
          data-testid={POS_TERMINAL_DENSITY_CHECKOUT_TEST_ID}
          className={cn(
            POS_TERMINAL_DENSITY_CHECKOUT_BUTTON_CLASS,
            props.speedMode && POS_TERMINAL_DENSITY_CHECKOUT_SPEED_CLASS,
          )}
          disabled={props.pending}
          onClick={props.onCheckout}
        >
          <CreditCard className="mr-2 h-5 w-5" />
          {props.pending ? "Submitting…" : props.speedMode ? "Complete sale — speed" : "Complete sale"}
        </Button>
      </div>

      {!props.speedMode ? (
        <p className="text-xs text-muted-foreground">
          Cash and comp modes record operational intent only. Select{" "}
          <span className="font-medium text-foreground">Card terminal</span> to use Stripe Terminal
          tap-to-pay when configured.
        </p>
      ) : (
        <p className="text-xs text-muted-foreground">
          Speed mode hides CRM, discounts, and loyalty — switch to standard layout for full controls.
        </p>
      )}
    </div>
  );
}
