"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";

export function KlaviyoSyncPanel({ configured }: { configured: boolean }) {
  const [message, setMessage] = useState<string | null>(null);
  const [lastSyncAt, setLastSyncAt] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("kitchenos_klaviyo_last_sync");
    if (stored) setLastSyncAt(stored);
  }, []);

  async function sync() {
    if (!configured) {
      toast.error("Set KLAVIYO_API_KEY first");
      return;
    }
    setLoading(true);
    const res = await fetch("/api/integrations/klaviyo/sync", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ days: 90, limit: 500 }),
    });
    const json = (await res.json()) as {
      message?: string;
      synced?: number;
      skipped?: number;
      failed?: number;
    };
    setLoading(false);

    if (!res.ok) {
      toast.error(json.message ?? "Sync failed");
      return;
    }

    const at = new Date().toISOString();
    localStorage.setItem("kitchenos_klaviyo_last_sync", at);
    setLastSyncAt(at);
    setMessage(json.message ?? "Done");
    toast.success(json.message ?? "Sync complete");
  }

  return (
    <div className="space-y-4 text-sm">
      {lastSyncAt ? (
        <p className="text-muted-foreground">Last sync: {new Date(lastSyncAt).toLocaleString()}</p>
      ) : (
        <p className="text-muted-foreground">No sync recorded yet.</p>
      )}

      <p className="text-muted-foreground">
        Pushes consent-opted customers (EMAIL_MARKETING) with order stats to Klaviyo profiles.
        Does not replace Klaviyo flow builder — event triggers use existing metric names.
      </p>

      <button
        type="button"
        disabled={loading || !configured}
        onClick={() => void sync()}
        className="rounded-xl bg-primary px-4 py-2 text-sm text-primary-foreground disabled:opacity-50"
      >
        {loading ? "Syncing…" : "Sync customers to Klaviyo"}
      </button>

      {message ? <p className="text-muted-foreground">{message}</p> : null}
    </div>
  );
}
