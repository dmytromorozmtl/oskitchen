"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import type { HomebaseLiveDashboard } from "@/lib/integrations/homebase-live-types";

export function HomebaseLivePanel({
  dashboard,
  staffMappings,
}: {
  dashboard: HomebaseLiveDashboard;
  staffMappings: Record<string, string>;
}) {
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState<"import" | "export" | "timeclock" | null>(null);

  async function runSync(direction: "import" | "export") {
    setLoading(direction);
    setStatus(null);
    try {
      const res = await fetch("/api/integrations/homebase/sync-schedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ direction, staffMappings }),
      });
      const json = (await res.json()) as { ok?: boolean; message?: string };
      setStatus(json.message ?? (json.ok ? "Schedule synced." : "Schedule sync failed."));
    } catch (e) {
      setStatus(e instanceof Error ? e.message : "Schedule sync failed.");
    } finally {
      setLoading(null);
    }
  }

  async function syncTimeClock() {
    setLoading("timeclock");
    setStatus(null);
    try {
      const res = await fetch("/api/integrations/homebase/sync-timeclock", { method: "POST" });
      const json = (await res.json()) as { ok?: boolean; message?: string };
      setStatus(json.message ?? (json.ok ? "Time clock synced." : "Time clock sync failed."));
    } catch (e) {
      setStatus(e instanceof Error ? e.message : "Time clock sync failed.");
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="space-y-4 text-sm">
      <p className="text-muted-foreground">{dashboard.message}</p>
      {dashboard.connected ? (
        <p className="text-emerald-600">
          Connected · location {dashboard.locationId}
          {dashboard.staffMappingCount > 0
            ? ` · ${dashboard.staffMappingCount} staff mapped`
            : " · map staff on the schedule page"}
        </p>
      ) : (
        <p className="text-muted-foreground">Not connected — use OAuth below.</p>
      )}
      {dashboard.oauthAuthorizeUrl ? (
        <Button asChild size="sm" className="rounded-full">
          <a href={dashboard.oauthAuthorizeUrl}>Connect Homebase (OAuth)</a>
        </Button>
      ) : null}
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="rounded-full"
          disabled={!dashboard.connected || loading !== null}
          onClick={() => void runSync("import")}
        >
          {loading === "import" ? "Importing…" : "Import schedule"}
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="rounded-full"
          disabled={!dashboard.connected || loading !== null}
          onClick={() => void runSync("export")}
        >
          {loading === "export" ? "Exporting…" : "Export schedule"}
        </Button>
        <Button
          type="button"
          size="sm"
          className="rounded-full"
          disabled={!dashboard.connected || loading !== null}
          onClick={() => void syncTimeClock()}
        >
          {loading === "timeclock" ? "Syncing…" : "Sync time clock"}
        </Button>
      </div>
      {dashboard.lastScheduleImportAt ? (
        <p className="text-xs text-muted-foreground">
          Last import: {dashboard.lastScheduleImportAt}
        </p>
      ) : null}
      {dashboard.lastScheduleExportAt ? (
        <p className="text-xs text-muted-foreground">Last export: {dashboard.lastScheduleExportAt}</p>
      ) : null}
      {dashboard.lastTimeClockSyncAt ? (
        <p className="text-xs text-muted-foreground">
          Last time clock sync: {dashboard.lastTimeClockSyncAt}
          {dashboard.lastTimeClockSynced != null ? ` · ${dashboard.lastTimeClockSynced} punches` : ""}
        </p>
      ) : null}
      {status ? <p className="text-xs">{status}</p> : null}
    </div>
  );
}
