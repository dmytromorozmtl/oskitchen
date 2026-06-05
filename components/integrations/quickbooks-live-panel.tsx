"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import type { QuickBooksLiveDashboard } from "@/lib/integrations/quickbooks-live-types";

export function QuickBooksLivePanel({ dashboard }: { dashboard: QuickBooksLiveDashboard }) {
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState<"accounts" | "journal" | null>(null);

  async function loadAccounts() {
    setLoading("accounts");
    setStatus(null);
    try {
      const res = await fetch("/api/integrations/quickbooks/accounts");
      const json = (await res.json()) as {
        ok?: boolean;
        message?: string;
        salesAccounts?: { id: string; name: string }[];
        depositAccounts?: { id: string; name: string }[];
      };
      if (!res.ok || !json.ok) {
        setStatus(json.message ?? "Failed to load accounts.");
        return;
      }
      setStatus(
        `Loaded ${json.salesAccounts?.length ?? 0} sales + ${json.depositAccounts?.length ?? 0} deposit accounts from QuickBooks.`,
      );
    } catch (e) {
      setStatus(e instanceof Error ? e.message : "Failed to load accounts.");
    } finally {
      setLoading(null);
    }
  }

  async function postJournal() {
    setLoading("journal");
    setStatus(null);
    try {
      const res = await fetch("/api/integrations/quickbooks/sync-journal", { method: "POST" });
      const json = (await res.json()) as { ok?: boolean; message?: string; amount?: number };
      setStatus(json.message ?? (json.ok ? "Journal posted." : "Journal failed."));
    } catch (e) {
      setStatus(e instanceof Error ? e.message : "Journal post failed.");
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="space-y-4 text-sm">
      <p className="text-muted-foreground">{dashboard.message}</p>
      {dashboard.connected ? (
        <p className="text-emerald-600">
          Connected · realm {dashboard.realmId}
          {dashboard.salesAccountName ? ` · sales: ${dashboard.salesAccountName}` : ""}
          {dashboard.depositAccountName ? ` · deposit: ${dashboard.depositAccountName}` : ""}
        </p>
      ) : (
        <p className="text-muted-foreground">Not connected — use OAuth below.</p>
      )}
      {dashboard.oauthAuthorizeUrl ? (
        <Button asChild size="sm" className="rounded-full">
          <a href={dashboard.oauthAuthorizeUrl}>Connect QuickBooks (OAuth)</a>
        </Button>
      ) : null}
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="rounded-full"
          disabled={!dashboard.connected || loading !== null}
          onClick={() => void loadAccounts()}
        >
          {loading === "accounts" ? "Loading…" : "Load chart of accounts"}
        </Button>
        <Button
          type="button"
          size="sm"
          className="rounded-full"
          disabled={!dashboard.connected || loading !== null}
          onClick={() => void postJournal()}
        >
          {loading === "journal" ? "Posting…" : "Post daily sales journal"}
        </Button>
      </div>
      {dashboard.lastJournalPostedAt ? (
        <p className="text-xs text-muted-foreground">
          Last journal: {dashboard.lastJournalPostedAt}
          {dashboard.lastJournalAmount != null ? ` · $${dashboard.lastJournalAmount}` : ""}
        </p>
      ) : null}
      {status ? <p className="text-xs">{status}</p> : null}
    </div>
  );
}
