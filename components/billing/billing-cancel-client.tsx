"use client";

import * as React from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

export function BillingPanelLinkPortal({
  stripeConfigured,
}: {
  stripeConfigured: boolean;
}) {
  const [pending, setPending] = React.useState(false);

  async function openPortal() {
    if (!stripeConfigured) {
      toast.error("Stripe is not configured.");
      return;
    }
    try {
      setPending(true);
      const res = await fetch("/api/billing-portal", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Portal unavailable");
      window.location.href = data.url as string;
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Portal failed");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="space-y-2 border-t border-border/70 pt-4">
      <p className="text-sm font-medium">Stripe customer portal</p>
      <p className="text-xs text-muted-foreground">
        Opens Stripe-hosted cancellation, invoices, and payment methods (test mode safe).
      </p>
      <Button
        type="button"
        variant="destructive"
        className="rounded-full"
        disabled={pending || !stripeConfigured}
        onClick={() => void openPortal()}
      >
        Open billing portal
      </Button>
    </div>
  );
}
