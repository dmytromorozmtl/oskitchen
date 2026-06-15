"use client";

import * as React from "react";
import Link from "next/link";
import { format } from "date-fns";
import { toast } from "sonner";

import { TurnstileWidget } from "@/components/storefront/turnstile-widget";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { StorefrontReorderActions } from "@/components/storefront/storefront-reorder-actions";
import { formatCurrency } from "@/lib/utils";

type OrderRow = {
  token: string;
  orderNumber: string;
  total: number;
  status: string;
  createdAt: string;
  href: string;
};

export function StorefrontAccountClient({
  storeSlug,
  turnstileSiteKey,
}: {
  storeSlug: string;
  turnstileSiteKey: string | null;
}) {
  const [email, setEmail] = React.useState("");
  const [captchaToken, setCaptchaToken] = React.useState<string | null>(null);
  const [pending, setPending] = React.useState(false);
  const [orders, setOrders] = React.useState<OrderRow[] | null>(null);

  async function lookup(e: React.FormEvent) {
    e.preventDefault();
    if (turnstileSiteKey && !captchaToken) {
      toast.error("Complete the security check.");
      return;
    }
    setPending(true);
    try {
      const res = await fetch("/api/storefront/account/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ storeSlug, email, captchaToken: captchaToken ?? undefined }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Could not load orders.");
        return;
      }
      setOrders(data.orders ?? []);
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="space-y-6">
      <form onSubmit={(ev) => void lookup(ev)} className="max-w-md space-y-4 rounded-2xl border border-border/80 bg-card p-5 shadow-sm">
        <div className="space-y-2">
          <Label htmlFor="account-email">Email</Label>
          <Input
            id="account-email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
          />
        </div>
        {turnstileSiteKey ? (
          <TurnstileWidget siteKey={turnstileSiteKey} onToken={setCaptchaToken} />
        ) : null}
        <Button type="submit" className="rounded-full" disabled={pending}>
          {pending ? "Looking up…" : "Find my orders"}
        </Button>
      </form>

      {orders ? (
        <ul className="space-y-3">
          {orders.length === 0 ? (
            <p className="text-sm text-muted-foreground">No orders found for this email.</p>
          ) : (
            orders.map((o) => (
              <li key={o.token} className="rounded-xl border border-border/80 bg-card p-4 text-sm shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-mono text-xs">{o.orderNumber}</span>
                  <span className="text-muted-foreground">{format(new Date(o.createdAt), "PPp")}</span>
                </div>
                <p className="mt-2 font-medium">{formatCurrency(o.total)} · {o.status}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <StorefrontReorderActions
                    storeSlug={storeSlug}
                    orderToken={o.token}
                    variant="outline"
                    className="h-8 rounded-full px-3 text-xs"
                  />
                  <Button asChild size="sm" variant="ghost" className="rounded-full">
                    <Link href={o.href}>View order</Link>
                  </Button>
                </div>
              </li>
            ))
          )}
        </ul>
      ) : null}
    </div>
  );
}
