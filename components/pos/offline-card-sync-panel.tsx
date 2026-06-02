"use client";

import { useEffect, useState, useTransition } from "react";

import {
  loadOfflineCardDashboardAction,
  syncOfflineCardCapturesAction,
} from "@/actions/pos-offline-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function OfflineCardSyncPanel() {
  const [dashboard, setDashboard] = useState<{
    queued: number;
    captured: number;
    failed: number;
    pciNotes: readonly string[];
  } | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function refresh() {
    startTransition(async () => {
      const res = await loadOfflineCardDashboardAction();
      if (res.ok) {
        setDashboard({
          queued: res.data.queued,
          captured: res.data.captured,
          failed: res.data.failed,
          pciNotes: res.data.pciNotes,
        });
      }
    });
  }

  useEffect(() => {
    refresh();
  }, []);

  function syncNow() {
    startTransition(async () => {
      const res = await syncOfflineCardCapturesAction();
      if (!res.ok) {
        setMessage(res.error);
        return;
      }
      setMessage(
        res.data.captured > 0
          ? `${res.data.captured} offline card payment(s) captured via Stripe.`
          : res.data.attempted === 0
            ? "No offline card captures waiting."
            : `${res.data.failed} capture(s) failed — check Stripe Terminal when online.`,
      );
      refresh();
    });
  }

  return (
    <Card data-testid="offline-card-sync-panel">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Offline card queue</CardTitle>
        <CardDescription>
          PCI-safe: last4 and brand only — capture syncs when you are back online.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex flex-wrap gap-4 text-sm">
          <span>
            Queued: <strong>{dashboard?.queued ?? "—"}</strong>
          </span>
          <span>
            Captured: <strong>{dashboard?.captured ?? "—"}</strong>
          </span>
          <span>
            Failed: <strong>{dashboard?.failed ?? "—"}</strong>
          </span>
        </div>
        <Button type="button" size="sm" onClick={syncNow} disabled={pending}>
          Sync card captures
        </Button>
        {message ? <p className="text-xs text-muted-foreground">{message}</p> : null}
        <ul className="list-disc space-y-1 pl-4 text-xs text-muted-foreground">
          {(dashboard?.pciNotes ?? []).map((note) => (
            <li key={note}>{note}</li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
