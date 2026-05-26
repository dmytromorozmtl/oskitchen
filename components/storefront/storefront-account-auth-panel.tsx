"use client";

import * as React from "react";
import Link from "next/link";
import { toast } from "sonner";

import { StorefrontReorderActions } from "@/components/storefront/storefront-reorder-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";

type OrderRow = {
  token: string;
  orderNumber: string | null;
  total: number;
  status: string;
  createdAt: string;
  href: string;
};

export function StorefrontAccountAuthPanel({ storeSlug }: { storeSlug: string }) {
  const [email, setEmail] = React.useState("");
  const [pending, setPending] = React.useState(false);
  const [orders, setOrders] = React.useState<OrderRow[] | null>(null);
  const [authenticated, setAuthenticated] = React.useState(false);

  const refreshSession = React.useCallback(async () => {
    const res = await fetch(`/api/storefront/account/session?storeSlug=${encodeURIComponent(storeSlug)}`, {
      credentials: "same-origin",
      cache: "no-store",
    });
    if (res.status === 401) {
      setAuthenticated(false);
      setOrders(null);
      return;
    }
    const data = await res.json().catch(() => ({}));
    if (data.ok && data.authenticated) {
      setAuthenticated(true);
      setEmail(data.email ?? "");
      setOrders(data.orders ?? []);
    }
  }, [storeSlug]);

  React.useEffect(() => {
    void refreshSession();
  }, [refreshSession]);

  async function sendMagicLink(ev: React.FormEvent) {
    ev.preventDefault();
    const trimmed = email.trim();
    if (!trimmed) return;
    setPending(true);
    const supabase = createClient();
    const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(`/s/${storeSlug}/account`)}`;
    const { error } = await supabase.auth.signInWithOtp({
      email: trimmed,
      options: { emailRedirectTo: redirectTo },
    });
    setPending(false);
    if (error) {
      toast.error("Could not send sign-in link.");
      return;
    }
    toast.success("Check your email for a sign-in link.");
  }

  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    setAuthenticated(false);
    setOrders(null);
    toast.message("Signed out.");
  }

  if (authenticated && orders) {
    return (
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground">
            Signed in as <span className="font-medium text-foreground">{email}</span>
          </p>
          <Button type="button" variant="outline" size="sm" className="rounded-full" onClick={() => void signOut()}>
            Sign out
          </Button>
        </div>
        <ul className="space-y-3">
          {orders.length === 0 ? (
            <p className="text-sm text-muted-foreground">No orders yet for this store.</p>
          ) : (
            orders.map((o) => (
              <li key={o.token} className="rounded-xl border border-border/80 bg-card p-4 shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-medium">{o.orderNumber ?? "Preorder"}</span>
                  <span className="text-sm text-muted-foreground">{new Date(o.createdAt).toLocaleString()}</span>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  {o.status} · ${o.total.toFixed(2)}
                </p>
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
      </div>
    );
  }

  return (
    <form onSubmit={(ev) => void sendMagicLink(ev)} className="max-w-md space-y-4 rounded-2xl border border-border/80 bg-card p-5 shadow-sm">
      <p className="text-sm text-muted-foreground">
        Sign in with a magic link to see all your orders at this kitchen — no password.
      </p>
      <div className="space-y-2">
        <Label htmlFor="account-email-signin">Email</Label>
        <Input
          id="account-email-signin"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
        />
      </div>
      <Button type="submit" className="rounded-full" disabled={pending}>
        {pending ? "Sending link…" : "Email me a sign-in link"}
      </Button>
    </form>
  );
}
