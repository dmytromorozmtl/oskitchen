"use client";

import * as React from "react";

import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";

export type StorefrontLoyaltyCheckoutProgram = {
  pointsPerDollar: number;
  redeemPoints: number;
  redeemAmount: number;
  minPointsToRedeem: number;
};

type Props = {
  slug: string;
  currency: string;
  program: StorefrontLoyaltyCheckoutProgram;
  customerEmail: string;
  loyaltyPointsRedeem: number;
  loyaltyCreditAmount: number;
  onRedeemChange: (points: number, creditAmount: number) => void;
};

export function StorefrontLoyaltyCheckoutPanel(props: Props) {
  const [balance, setBalance] = React.useState<number | null>(null);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    const email = props.customerEmail.trim();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setBalance(null);
      return;
    }

    const timer = setTimeout(() => {
      setLoading(true);
      void fetch(
        `/api/storefront/loyalty/balance?storeSlug=${encodeURIComponent(props.slug)}&email=${encodeURIComponent(email)}`,
      )
        .then((res) => res.json())
        .then((data: { points?: number }) => {
          setBalance(typeof data.points === "number" ? data.points : 0);
        })
        .catch(() => setBalance(null))
        .finally(() => setLoading(false));
    }, 350);

    return () => clearTimeout(timer);
  }, [props.customerEmail, props.slug]);

  if (!props.customerEmail.trim()) return null;

  const canRedeem =
    balance != null &&
    balance >= props.program.minPointsToRedeem &&
    balance >= props.program.redeemPoints;

  const blocks =
    balance != null ? Math.floor(balance / props.program.redeemPoints) : 0;
  const redeemPoints = blocks * props.program.redeemPoints;
  const redeemCredit = blocks * props.program.redeemAmount;
  const isApplied = props.loyaltyPointsRedeem > 0;

  return (
    <div
      className="space-y-2 rounded-xl border border-amber-200/70 bg-amber-50/50 p-4 text-sm dark:border-amber-900/40 dark:bg-amber-950/20"
      data-testid="storefront-loyalty-balance"
    >
      <p className="font-medium">Loyalty rewards</p>
      {loading ? (
        <p className="text-muted-foreground">Checking points balance…</p>
      ) : balance != null ? (
        <p className="text-muted-foreground">
          Balance: <strong>{balance}</strong> pts · Earn{" "}
          <strong>{props.program.pointsPerDollar}</strong> pts per $1
        </p>
      ) : (
        <p className="text-muted-foreground">Enter your email to see loyalty balance.</p>
      )}
      {canRedeem ? (
        <div className="flex flex-wrap items-center gap-2">
          {isApplied ? (
            <>
              <span>
                Redeeming {props.loyaltyPointsRedeem} pts (
                {formatCurrency(props.loyaltyCreditAmount, props.currency)} off)
              </span>
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="rounded-full"
                onClick={() => props.onRedeemChange(0, 0)}
              >
                Remove
              </Button>
            </>
          ) : (
            <Button
              type="button"
              size="sm"
              className="rounded-full"
              data-testid="storefront-loyalty-redeem"
              onClick={() => props.onRedeemChange(redeemPoints, redeemCredit)}
            >
              Redeem {redeemPoints} pts for {formatCurrency(redeemCredit, props.currency)} off
            </Button>
          )}
        </div>
      ) : balance != null && balance > 0 ? (
        <p className="text-xs text-muted-foreground">
          Need {props.program.minPointsToRedeem} pts minimum to redeem (
          {props.program.redeemPoints} pts = {formatCurrency(props.program.redeemAmount, props.currency)}).
        </p>
      ) : null}
    </div>
  );
}
