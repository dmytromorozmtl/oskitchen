"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import type { SquarePaymentsLiveDashboard } from "@/lib/integrations/square-payments-live-types";

export function SquarePaymentsLivePanel({
  dashboard,
}: {
  dashboard: SquarePaymentsLiveDashboard;
}) {
  const [status, setStatus] = useState<string | null>(null);
  const [sourceId, setSourceId] = useState("");
  const [loading, setLoading] = useState<"payment" | "refund" | null>(null);

  async function processPayment() {
    if (!sourceId.trim()) {
      setStatus("Enter a Square source_id (card nonce from Web Payments SDK).");
      return;
    }
    setLoading("payment");
    setStatus(null);
    try {
      const res = await fetch("/api/integrations/square-payments/process-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: 12.5, currency: "USD", sourceId: sourceId.trim() }),
      });
      const json = (await res.json()) as { ok?: boolean; message?: string };
      setStatus(json.message ?? (json.ok ? "Payment processed." : "Payment failed."));
    } catch (e) {
      setStatus(e instanceof Error ? e.message : "Payment failed.");
    } finally {
      setLoading(null);
    }
  }

  async function syncRefunds() {
    setLoading("refund");
    setStatus(null);
    try {
      const res = await fetch("/api/integrations/square-payments/sync-refunds", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          paymentId: dashboard.lastPaymentId ?? undefined,
          limit: 25,
        }),
      });
      const json = (await res.json()) as { ok?: boolean; message?: string };
      setStatus(json.message ?? (json.ok ? "Refunds synced." : "Refund sync failed."));
    } catch (e) {
      setStatus(e instanceof Error ? e.message : "Refund sync failed.");
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="space-y-4 text-sm">
      <p className="text-muted-foreground">{dashboard.message}</p>
      {dashboard.connected ? (
        <p className="text-emerald-600">
          Connected · location {dashboard.locationId ?? "not set"}
        </p>
      ) : (
        <p className="text-muted-foreground">Not connected — use OAuth below.</p>
      )}

      {dashboard.oauthAuthorizeUrl ? (
        <Button asChild size="sm" className="rounded-full">
          <a href={dashboard.oauthAuthorizeUrl}>Connect Square Payments (OAuth)</a>
        </Button>
      ) : null}

      {dashboard.connected ? (
        <div className="space-y-2">
          <label className="block text-xs text-muted-foreground" htmlFor="square-source-id">
            Payment source_id
          </label>
          <input
            id="square-source-id"
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
            placeholder="cnon:card-nonce-from-square-sdk"
            value={sourceId}
            onChange={(e) => setSourceId(e.target.value)}
          />
        </div>
      ) : null}

      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="rounded-full"
          disabled={!dashboard.connected || loading !== null}
          onClick={() => void processPayment()}
        >
          {loading === "payment" ? "Processing…" : "Process payment"}
        </Button>
        <Button
          type="button"
          size="sm"
          className="rounded-full"
          disabled={!dashboard.connected || loading !== null}
          onClick={() => void syncRefunds()}
        >
          {loading === "refund" ? "Syncing…" : "Sync refunds"}
        </Button>
      </div>

      {dashboard.lastPaymentAt ? (
        <p className="text-xs text-muted-foreground">
          Last payment: {dashboard.lastPaymentAt}
          {dashboard.lastPaymentId ? ` · ${dashboard.lastPaymentId}` : ""}
        </p>
      ) : null}
      {dashboard.lastRefundSyncAt ? (
        <p className="text-xs text-muted-foreground">
          Last refund sync: {dashboard.lastRefundSyncAt}
          {dashboard.lastRefundSynced != null ? ` · ${dashboard.lastRefundSynced} refunds` : ""}
        </p>
      ) : null}
      {status ? <p className="text-xs">{status}</p> : null}
    </div>
  );
}
