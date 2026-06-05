"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import type { StripeLiveDashboard } from "@/lib/integrations/stripe-live-types";

export function StripeLivePanel({ dashboard }: { dashboard: StripeLiveDashboard }) {
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState<"connect" | "intent" | "payout" | null>(null);

  async function connect() {
    setLoading("connect");
    setStatus(null);
    try {
      const res = await fetch("/api/integrations/stripe/connect", { method: "POST" });
      const json = (await res.json()) as { ok?: boolean; message?: string };
      setStatus(json.message ?? (json.ok ? "Connected." : "Connect failed."));
    } catch (e) {
      setStatus(e instanceof Error ? e.message : "Connect failed.");
    } finally {
      setLoading(null);
    }
  }

  async function createPaymentIntent() {
    setLoading("intent");
    setStatus(null);
    try {
      const res = await fetch("/api/integrations/stripe/payment-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: 12.5, currency: "usd", description: "OS Kitchen LIVE test" }),
      });
      const json = (await res.json()) as { ok?: boolean; message?: string; paymentIntentId?: string };
      setStatus(
        json.message ??
          (json.ok ? `PaymentIntent ${json.paymentIntentId} created.` : "PaymentIntent failed."),
      );
    } catch (e) {
      setStatus(e instanceof Error ? e.message : "PaymentIntent failed.");
    } finally {
      setLoading(null);
    }
  }

  async function reconcilePayouts() {
    setLoading("payout");
    setStatus(null);
    try {
      const res = await fetch("/api/integrations/stripe/reconcile-payouts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ limit: 10 }),
      });
      const json = (await res.json()) as { ok?: boolean; message?: string };
      setStatus(json.message ?? (json.ok ? "Payouts reconciled." : "Reconciliation failed."));
    } catch (e) {
      setStatus(e instanceof Error ? e.message : "Reconciliation failed.");
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="space-y-4 text-sm">
      <p className="text-muted-foreground">{dashboard.message}</p>
      {dashboard.connected ? (
        <p className="text-emerald-600">
          Connected · webhook {dashboard.webhookConfigured ? "configured" : "missing"}
          {dashboard.pendingPayoutCents != null
            ? ` · pending $${(dashboard.pendingPayoutCents / 100).toFixed(2)}`
            : ""}
        </p>
      ) : (
        <p className="text-muted-foreground">Not connected — verify Stripe env vars below.</p>
      )}

      {!dashboard.connected ? (
        <Button
          type="button"
          size="sm"
          className="rounded-full"
          disabled={loading !== null || dashboard.mode === "placeholder"}
          onClick={() => void connect()}
        >
          {loading === "connect" ? "Connecting…" : "Connect Stripe LIVE"}
        </Button>
      ) : null}

      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="rounded-full"
          disabled={!dashboard.connected || loading !== null}
          onClick={() => void createPaymentIntent()}
        >
          {loading === "intent" ? "Creating…" : "Create PaymentIntent"}
        </Button>
        <Button
          type="button"
          size="sm"
          className="rounded-full"
          disabled={!dashboard.connected || loading !== null}
          onClick={() => void reconcilePayouts()}
        >
          {loading === "payout" ? "Reconciling…" : "Reconcile payouts"}
        </Button>
      </div>

      {dashboard.lastPaymentIntentAt ? (
        <p className="text-xs text-muted-foreground">
          Last PaymentIntent: {dashboard.lastPaymentIntentAt}
        </p>
      ) : null}
      {dashboard.lastPayoutReconcileAt ? (
        <p className="text-xs text-muted-foreground">
          Last payout reconcile: {dashboard.lastPayoutReconcileAt}
          {dashboard.lastPayoutReconcileCount != null
            ? ` · ${dashboard.lastPayoutReconcileCount} payouts`
            : ""}
        </p>
      ) : null}
      {status ? <p className="text-xs">{status}</p> : null}
    </div>
  );
}
