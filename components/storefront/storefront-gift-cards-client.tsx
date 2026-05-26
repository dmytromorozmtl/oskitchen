"use client";

import { getActionError } from "@/lib/action-result";

import * as React from "react";
import { toast } from "sonner";

import { lookupGiftCardBalanceAction } from "@/actions/storefront/gift-cards-public";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function StorefrontGiftCardsClient({ storeSlug, publicName }: { storeSlug: string; publicName: string }) {
  const [code, setCode] = React.useState("");
  const [pending, setPending] = React.useState(false);
  const [balance, setBalance] = React.useState<string | null>(null);

  async function onCheck(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setBalance(null);
    const res = await lookupGiftCardBalanceAction({ storeSlug, code });
    setPending(false);
    if (!res.ok) {
      toast.error(getActionError(res) ?? "Something went wrong");
      return;
    }
    setBalance(res.formatted);
    toast.success("Balance found");
  }

  return (
    <div className="space-y-8">
      <section className="sf-card rounded-3xl p-8 dark:bg-gray-900/80">
        <h2 className="text-xl font-semibold tracking-tight">Check balance</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Enter the code from your {publicName} gift card.
        </p>
        <form onSubmit={onCheck} className="mt-6 flex max-w-md flex-col gap-4 sm:flex-row sm:items-end">
          <div className="flex-1 space-y-2">
            <Label htmlFor="gift-code">Gift card code</Label>
            <Input
              id="gift-code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="AB12CD34"
              className="uppercase dark:bg-gray-950"
              autoComplete="off"
            />
          </div>
          <Button type="submit" disabled={pending} className="rounded-full sf-btn-primary">
            {pending ? "Checking…" : "Check balance"}
          </Button>
        </form>
        {balance ? (
          <p className="mt-4 text-lg font-semibold tabular-nums">
            Remaining balance: <span className="text-[var(--store-accent,hsl(var(--primary)))]">{balance}</span>
          </p>
        ) : null}
      </section>

      <section className="rounded-3xl border border-dashed border-border/80 bg-muted/20 p-8 dark:bg-gray-900/30">
        <h2 className="text-lg font-semibold">Purchase a gift card</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Gift cards are issued by the kitchen team. Contact us to purchase a card for friends and family — apply the
          code at checkout when ordering online.
        </p>
      </section>
    </div>
  );
}
