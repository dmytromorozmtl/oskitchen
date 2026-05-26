"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { updateCheckoutExtensionsAction } from "@/actions/storefront-catalog-admin";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { CheckoutExtensions } from "@/lib/storefront/checkout-extensions";

type Props = {
  extensions: CheckoutExtensions;
  stripeApplicationFeeBps: number | null;
};

export function StorefrontCheckoutExtensionsPanel({ extensions, stripeApplicationFeeBps }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

  return (
    <Card className="border-border/80 shadow-sm">
      <CardHeader>
        <CardTitle>Tips &amp; deposit</CardTitle>
        <CardDescription>
          Optional tip presets at checkout and deposit collection (percent or fixed). Stored in kitchen settings center.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          className="space-y-4"
          action={async (fd) => {
            setMessage(null);
            const r = await updateCheckoutExtensionsAction(fd);
            if (r.error) setMessage(r.error);
            else {
              setMessage("Saved.");
              startTransition(() => router.refresh());
            }
          }}
        >
          {message ? <p className="text-sm text-muted-foreground">{message}</p> : null}
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="tipsEnabled" defaultChecked={extensions.tipsEnabled} className="rounded" />
            Enable tip line at checkout
          </label>
          <div className="space-y-1">
            <Label htmlFor="tipPresets">Tip presets (%)</Label>
            <Input
              id="tipPresets"
              name="tipPresets"
              defaultValue={(extensions.tipPresetsPercent ?? [10, 15, 20]).join(",")}
              placeholder="10,15,20"
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-1">
              <Label htmlFor="depositMode">Deposit mode</Label>
              <select
                id="depositMode"
                name="depositMode"
                defaultValue={extensions.depositMode}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="off">Off</option>
                <option value="percent">Percent of subtotal</option>
                <option value="fixed">Fixed amount</option>
              </select>
            </div>
            <div className="space-y-1">
              <Label htmlFor="depositPercent">Deposit %</Label>
              <Input
                id="depositPercent"
                name="depositPercent"
                type="number"
                min="0"
                max="100"
                defaultValue={extensions.depositPercent ?? ""}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="depositFixed">Deposit fixed</Label>
              <Input
                id="depositFixed"
                name="depositFixed"
                type="number"
                step="0.01"
                min="0"
                defaultValue={extensions.depositFixed ?? ""}
              />
            </div>
          </div>
          <div className="space-y-1 max-w-xs">
            <Label htmlFor="stripeApplicationFeeBps">Stripe Connect application fee (bps)</Label>
            <Input
              id="stripeApplicationFeeBps"
              name="stripeApplicationFeeBps"
              type="number"
              min="0"
              max="5000"
              defaultValue={stripeApplicationFeeBps ?? 0}
            />
            <p className="text-xs text-muted-foreground">100 bps = 1%. Only applies when STOREFRONT_STRIPE_CONNECT=1.</p>
          </div>
          <Button type="submit" className="rounded-full" disabled={pending}>
            Save checkout extensions
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
