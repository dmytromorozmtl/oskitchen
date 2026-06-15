"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import type { ResyLiveDashboard } from "@/lib/integrations/resy-live-types";

export function ResyLivePanel({ dashboard }: { dashboard: ResyLiveDashboard }) {
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState<"reservations" | "waitlist" | null>(null);

  async function syncReservations() {
    setLoading("reservations");
    setStatus(null);
    try {
      const res = await fetch("/api/integrations/resy/sync-reservations", { method: "POST" });
      const json = (await res.json()) as { ok?: boolean; message?: string };
      setStatus(json.message ?? (json.ok ? "Reservations synced." : "Reservation sync failed."));
    } catch (e) {
      setStatus(e instanceof Error ? e.message : "Reservation sync failed.");
    } finally {
      setLoading(null);
    }
  }

  async function syncWaitlist() {
    setLoading("waitlist");
    setStatus(null);
    try {
      const res = await fetch("/api/integrations/resy/sync-waitlist", { method: "POST" });
      const json = (await res.json()) as { ok?: boolean; message?: string };
      setStatus(json.message ?? (json.ok ? "Waitlist synced." : "Waitlist sync failed."));
    } catch (e) {
      setStatus(e instanceof Error ? e.message : "Waitlist sync failed.");
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="space-y-4 text-sm">
      <p className="text-muted-foreground">{dashboard.message}</p>
      {dashboard.connected ? (
        <p className="text-emerald-600">
          Connected · venue {dashboard.venueId}
          {dashboard.storefrontId ? " · storefront linked" : " · link storefront in settings"}
        </p>
      ) : (
        <p className="text-muted-foreground">Not connected — use OAuth below.</p>
      )}
      {dashboard.webhookUrl ? (
        <div className="space-y-1">
          <p className="text-xs font-medium">Reservation webhook URL</p>
          <code className="block break-all rounded-lg bg-muted px-3 py-2 text-xs">
            {dashboard.webhookUrl}
          </code>
        </div>
      ) : null}
      {dashboard.oauthAuthorizeUrl ? (
        <Button asChild size="sm" className="rounded-full">
          <a href={dashboard.oauthAuthorizeUrl}>Connect Resy (OAuth)</a>
        </Button>
      ) : null}
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="rounded-full"
          disabled={!dashboard.connected || loading !== null}
          onClick={() => void syncReservations()}
        >
          {loading === "reservations" ? "Syncing…" : "Sync reservations"}
        </Button>
        <Button
          type="button"
          size="sm"
          className="rounded-full"
          disabled={!dashboard.connected || loading !== null}
          onClick={() => void syncWaitlist()}
        >
          {loading === "waitlist" ? "Syncing…" : "Sync waitlist"}
        </Button>
      </div>
      {dashboard.lastReservationSyncAt ? (
        <p className="text-xs text-muted-foreground">
          Last reservation sync: {dashboard.lastReservationSyncAt}
        </p>
      ) : null}
      {dashboard.lastWaitlistSyncAt ? (
        <p className="text-xs text-muted-foreground">Last waitlist sync: {dashboard.lastWaitlistSyncAt}</p>
      ) : null}
      {status ? <p className="text-xs">{status}</p> : null}
    </div>
  );
}
