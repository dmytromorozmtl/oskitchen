"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import type { OpenTableLiveDashboard } from "@/lib/integrations/opentable-live-types";

export function OpenTableLivePanel({ dashboard }: { dashboard: OpenTableLiveDashboard }) {
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState<"availability" | "push" | null>(null);

  async function loadAvailability() {
    setLoading("availability");
    setStatus(null);
    try {
      const res = await fetch("/api/integrations/opentable/availability");
      const json = (await res.json()) as { ok?: boolean; message?: string; openCount?: number };
      setStatus(json.message ?? (json.ok ? "Availability loaded." : "Availability failed."));
    } catch (e) {
      setStatus(e instanceof Error ? e.message : "Availability failed.");
    } finally {
      setLoading(null);
    }
  }

  async function pushAvailability() {
    setLoading("push");
    setStatus(null);
    try {
      const res = await fetch("/api/integrations/opentable/availability", { method: "POST" });
      const json = (await res.json()) as { ok?: boolean; message?: string };
      setStatus(json.message ?? (json.ok ? "Availability pushed." : "Push failed."));
    } catch (e) {
      setStatus(e instanceof Error ? e.message : "Push failed.");
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="space-y-4 text-sm">
      <p className="text-muted-foreground">{dashboard.message}</p>
      {dashboard.connected ? (
        <p className="text-emerald-600">
          Connected · RID {dashboard.restaurantId}
          {dashboard.storefrontId ? ` · storefront linked` : " · link storefront in settings"}
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
          <a href={dashboard.oauthAuthorizeUrl}>Connect OpenTable (OAuth)</a>
        </Button>
      ) : null}
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="rounded-full"
          disabled={!dashboard.connected || loading !== null}
          onClick={() => void loadAvailability()}
        >
          {loading === "availability" ? "Loading…" : "Load table availability"}
        </Button>
        <Button
          type="button"
          size="sm"
          className="rounded-full"
          disabled={!dashboard.connected || loading !== null}
          onClick={() => void pushAvailability()}
        >
          {loading === "push" ? "Pushing…" : "Push availability to OpenTable"}
        </Button>
      </div>
      {dashboard.lastWebhookAt ? (
        <p className="text-xs text-muted-foreground">Last webhook: {dashboard.lastWebhookAt}</p>
      ) : null}
      {dashboard.lastAvailabilitySyncAt ? (
        <p className="text-xs text-muted-foreground">
          Last availability sync: {dashboard.lastAvailabilitySyncAt}
          {dashboard.availableSlots != null ? ` · ${dashboard.availableSlots} open slots` : ""}
        </p>
      ) : null}
      {status ? <p className="text-xs">{status}</p> : null}
    </div>
  );
}
