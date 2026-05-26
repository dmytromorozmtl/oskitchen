"use client";

import * as React from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { TurnstileWidget } from "@/components/storefront/turnstile-widget";

export function GuestOrderAccountClient({
  storeSlug,
  orderToken,
  turnstileSiteKey = null,
}: {
  storeSlug: string;
  orderToken: string;
  turnstileSiteKey?: string | null;
}) {
  const [pending, setPending] = React.useState(false);
  const [captchaToken, setCaptchaToken] = React.useState<string | null>(null);

  async function onCreateAccount() {
    if (turnstileSiteKey && !captchaToken) {
      toast.error("Complete the security check first.");
      return;
    }
    setPending(true);
    try {
      const res = await fetch("/api/storefront/guest-account", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ storeSlug, orderToken, captchaToken: captchaToken ?? undefined }),
      });
      const json = (await res.json()) as { ok?: boolean; message?: string; error?: string };
      if (!res.ok || json.error) {
        toast.error(json.error ?? "Could not send sign-in link.");
        return;
      }
      toast.success(json.message ?? "Check your email for a sign-in link.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="rounded-2xl border border-border/80 bg-card p-5 space-y-3">
      <p className="text-sm font-medium">Create an account from this order</p>
      <p className="text-sm text-muted-foreground">
        We will email a magic link to the address on your order so you can access the dashboard.
      </p>
      {turnstileSiteKey ? <TurnstileWidget siteKey={turnstileSiteKey} onToken={setCaptchaToken} /> : null}
      <Button type="button" className="rounded-full" disabled={pending} onClick={() => void onCreateAccount()}>
        {pending ? "Sending…" : "Email me a sign-in link"}
      </Button>
    </div>
  );
}
