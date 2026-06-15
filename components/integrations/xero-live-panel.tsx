"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import type { XeroLiveDashboard } from "@/lib/integrations/xero-live-types";

export function XeroLivePanel({ dashboard }: { dashboard: XeroLiveDashboard }) {
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState<"invoices" | "bank" | null>(null);

  async function syncInvoices() {
    setLoading("invoices");
    setStatus(null);
    try {
      const res = await fetch("/api/integrations/xero/sync-invoices", { method: "POST" });
      const json = (await res.json()) as { ok?: boolean; message?: string; synced?: number };
      setStatus(json.message ?? (json.ok ? "Invoices synced." : "Invoice sync failed."));
    } catch (e) {
      setStatus(e instanceof Error ? e.message : "Invoice sync failed.");
    } finally {
      setLoading(null);
    }
  }

  async function reconcileBank() {
    setLoading("bank");
    setStatus(null);
    try {
      const res = await fetch("/api/integrations/xero/reconcile-bank", { method: "POST" });
      const json = (await res.json()) as {
        ok?: boolean;
        message?: string;
        matched?: number;
        unmatched?: number;
      };
      setStatus(json.message ?? (json.ok ? "Bank reconciled." : "Bank reconciliation failed."));
    } catch (e) {
      setStatus(e instanceof Error ? e.message : "Bank reconciliation failed.");
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="space-y-4 text-sm">
      <p className="text-muted-foreground">{dashboard.message}</p>
      {dashboard.connected ? (
        <p className="text-emerald-600">
          Connected · {dashboard.tenantName ?? dashboard.tenantId}
        </p>
      ) : (
        <p className="text-muted-foreground">Not connected — use OAuth below.</p>
      )}
      {dashboard.oauthAuthorizeUrl ? (
        <Button asChild size="sm" className="rounded-full">
          <a href={dashboard.oauthAuthorizeUrl}>Connect Xero (OAuth)</a>
        </Button>
      ) : null}
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="rounded-full"
          disabled={!dashboard.connected || loading !== null}
          onClick={() => void syncInvoices()}
        >
          {loading === "invoices" ? "Syncing…" : "Sync supplier invoices"}
        </Button>
        <Button
          type="button"
          size="sm"
          className="rounded-full"
          disabled={!dashboard.connected || loading !== null}
          onClick={() => void reconcileBank()}
        >
          {loading === "bank" ? "Reconciling…" : "Reconcile bank transactions"}
        </Button>
      </div>
      {dashboard.lastInvoiceSyncAt ? (
        <p className="text-xs text-muted-foreground">
          Last invoice sync: {dashboard.lastInvoiceSyncAt}
          {dashboard.lastInvoicesSynced != null ? ` · ${dashboard.lastInvoicesSynced} synced` : ""}
        </p>
      ) : null}
      {dashboard.lastBankReconcileAt ? (
        <p className="text-xs text-muted-foreground">
          Last bank reconcile: {dashboard.lastBankReconcileAt}
          {dashboard.lastBankMatched != null ? ` · ${dashboard.lastBankMatched} matched` : ""}
        </p>
      ) : null}
      {status ? <p className="text-xs">{status}</p> : null}
    </div>
  );
}
