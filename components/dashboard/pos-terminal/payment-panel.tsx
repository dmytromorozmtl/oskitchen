"use client";

import { StripeTerminalReaderPanel } from "@/components/pos/stripe-terminal-reader";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PAYMENT_MODE_LABEL } from "@/lib/orders/order-payment";
import {
  posTouchInputClass,
  posTouchSelectClass,
  posTouchSelectLargeClass,
} from "@/lib/pos/touch-targets";
import { cn } from "@/lib/utils";

import type { PosTerminalPaymentPanelProps } from "@/components/dashboard/pos-terminal/pos-terminal-types";

export function PaymentPanel(props: PosTerminalPaymentPanelProps) {
  return (
    <>
      <div className="space-y-2" data-testid="pos-payment-panel">
        <Label>Payment</Label>
        <Select value={props.paymentMode} onValueChange={(v) => props.onPaymentModeChange(v as typeof props.paymentMode)}>
          <SelectTrigger className={posTouchSelectLargeClass}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {props.availablePaymentModes.map((k) => (
              <SelectItem key={k} value={k}>
                {PAYMENT_MODE_LABEL[k]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {props.paymentMode === "CARD_TERMINAL_PLACEHOLDER" ? (
          <StripeTerminalReaderPanel compact className="mt-2" />
        ) : null}
        {props.paymentMode === "OFFLINE_CARD_QUEUED" ? (
          <div className="mt-2 space-y-2 rounded-lg border border-dashed p-3" data-testid="offline-card-fields">
            <p className="text-xs text-muted-foreground">
              PCI-safe offline card — last4 and brand only. Full capture when Stripe Terminal is online.
            </p>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-xs">Last 4 digits</Label>
                <Input
                  inputMode="numeric"
                  maxLength={4}
                  value={props.offlineCardLast4}
                  onChange={(e) =>
                    props.onOfflineCardLast4Change(e.target.value.replace(/\D/g, "").slice(0, 4))
                  }
                  placeholder="4242"
                  data-testid="offline-card-last4"
                />
              </div>
              <div>
                <Label className="text-xs">Brand</Label>
                <Select value={props.offlineCardBrand} onValueChange={props.onOfflineCardBrandChange}>
                  <SelectTrigger className={posTouchSelectClass}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="visa">Visa</SelectItem>
                    <SelectItem value="mastercard">Mastercard</SelectItem>
                    <SelectItem value="amex">Amex</SelectItem>
                    <SelectItem value="discover">Discover</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        ) : null}
        {!props.canApplyPosDiscount ? (
          <p className="text-xs text-muted-foreground">
            Discounts and comps require manager approval (`pos.discount.apply`).
          </p>
        ) : null}
      </div>

      {props.showSecondaryPanels ? (
        <div className="grid gap-2 sm:grid-cols-2">
          <div>
            <Label className="text-xs">Redeem loyalty points</Label>
            <Input
              value={props.loyaltyPointsRedeem}
              onChange={(e) => props.onLoyaltyPointsRedeemChange(e.target.value)}
              placeholder="e.g. 100"
              className={cn("rounded-xl", posTouchInputClass)}
              disabled={!props.selectedCustomer}
            />
            {props.selectedCustomer && props.loyaltyBalance != null ? (
              <p className="mt-1 text-xs text-muted-foreground">
                {props.loyaltyBalance} points available
              </p>
            ) : null}
          </div>
          <div>
            <Label className="text-xs">Gift card code</Label>
            <Input
              value={props.giftCardCode}
              onChange={(e) => props.onGiftCardCodeChange(e.target.value.toUpperCase())}
              placeholder="GC-XXXX"
              className={cn("rounded-xl font-mono uppercase", posTouchInputClass)}
            />
            {props.giftCardBalance != null ? (
              <p className="mt-1 text-xs text-muted-foreground">
                ${props.giftCardBalance.toFixed(2)} balance
              </p>
            ) : null}
          </div>
        </div>
      ) : null}
    </>
  );
}
