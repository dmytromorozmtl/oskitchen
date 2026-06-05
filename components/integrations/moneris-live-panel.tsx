"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import type { MonerisLiveDashboard } from "@/lib/integrations/moneris-live-types";

export function MonerisLivePanel({ dashboard }: { dashboard: MonerisLiveDashboard }) {
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState<"payment" | null>(null);

  async function processPayment() {
    setLoading("payment");
    setStatus(null);
    try {
      const res = await fetch("/api/integrations/moneris/process-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: 15.0, currency: "CAD" }),
      });
      const json = (await res.json()) as { ok?: boolean; message?: string };
      setStatus(json.message ?? (json.ok ? "Payment processed." : "Payment failed."));
    } catch (e) {
      setStatus(e instanceof Error ? e.message : "Payment failed.");
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="space-y-4 text-sm">
      <p className="text-muted-foreground">{dashboard.message}</p>
      {dashboard.connected ? (
        <p className="text-emerald-600">Connected · store {dashboard.storeId ?? "not set"}</p>
      ) : (
        <p className="text-muted-foreground">Not connected — use OAuth below.</p>
      )}

      {dashboard.oauthAuthorizeUrl ? (
        <Button asChild size="sm" className="rounded-full">
          <a href={dashboard.oauthAuthorizeUrl}>Connect Moneris (OAuth)</a>
        </Button>
      ) : null}

      <Button
        type="button"
        size="sm"
        className="rounded-full"
        disabled={!dashboard.connected || loading !== null}
        onClick={() => void processPayment()}
      >
        {loading === "payment" ? "Processing…" : "Process gateway payment"}
      </Button>

      {dashboard.lastPaymentAt ? (
        <p className="text-xs text-muted-foreground">
          Last payment: {dashboard.lastPaymentAt}
          {dashboard.lastTransactionId ? ` · ${dashboard.lastTransactionId}` : ""}
          {dashboard.lastGatewayStatus ? ` · ${dashboard.lastGatewayStatus}` : ""}
        </p>
      ) : null}
      {status ? <p className="text-xs">{status}</p> : null}
    </div>
  );
}
