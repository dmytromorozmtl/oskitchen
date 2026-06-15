"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import type { PlanKey } from "@/lib/billing/plan-registry";

export function CheckoutButton({
  plan,
  disabled,
  label,
  variant = "default",
}: {
  plan: PlanKey;
  disabled?: boolean;
  label?: string;
  variant?: "default" | "outline" | "secondary";
}) {
  const [, startTransition] = useTransition();
  const [pending, setPending] = useState(false);

  function go() {
    if (disabled) return;
    setPending(true);
    startTransition(async () => {
      try {
        const res = await fetch("/api/billing/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ plan }),
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error ?? "Unable to start checkout");
        }
        if (data.url) {
          window.location.href = data.url;
        }
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Checkout failed");
      } finally {
        setPending(false);
      }
    });
  }

  return (
    <Button type="button" disabled={disabled || pending} onClick={go} variant={variant}>
      {pending ? "Redirecting…" : (label ?? `Subscribe to ${plan}`)}
    </Button>
  );
}

export function PortalButton({
  disabled,
  label = "Manage subscription",
  variant = "outline",
}: {
  disabled?: boolean;
  label?: string;
  variant?: "default" | "outline" | "secondary";
}) {
  const [pending, setPending] = useState(false);
  async function go() {
    if (disabled) return;
    setPending(true);
    try {
      const res = await fetch("/api/billing/portal", { method: "POST" });
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
    <Button type="button" disabled={disabled || pending} onClick={go} variant={variant}>
      {pending ? "Opening…" : label}
    </Button>
  );
}
