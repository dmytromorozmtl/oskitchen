"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";

export function ResySyncPanel({
  configured,
  storefrontId,
}: {
  configured: boolean;
  storefrontId: string | null;
}) {
  const [message, setMessage] = useState<string | null>(null);
  const [lastSyncAt, setLastSyncAt] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("kitchenos_resy_last_sync");
    if (stored) setLastSyncAt(stored);
  }, []);

  async function sync(direction: "import" | "export") {
    if (!configured) {
      toast.error("Set RESY_API_KEY and RESY_VENUE_ID first");
      return;
    }
    if (!storefrontId) {
      toast.error("Set up a storefront first");
      return;
    }

    setLoading(true);
    const res = await fetch("/api/integrations/resy/sync", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ direction, storefrontId }),
    });
    const json = (await res.json()) as { message?: string };
    setLoading(false);

    if (!res.ok) {
      toast.error(json.message ?? "Sync failed");
      return;
    }

    const at = new Date().toISOString();
    localStorage.setItem("kitchenos_resy_last_sync", at);
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
        Two-way reservation sync with Resy venue API — 14-day import window, export for local
        PENDING/CONFIRMED bookings without a Resy tag.
      </p>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          disabled={loading || !configured || !storefrontId}
          onClick={() => void sync("import")}
          className="rounded-xl bg-primary px-4 py-2 text-sm text-primary-foreground disabled:opacity-50"
        >
          {loading ? "Syncing…" : "Import from Resy"}
        </button>
        <button
          type="button"
          disabled={loading || !configured || !storefrontId}
          onClick={() => void sync("export")}
          className="rounded-xl border px-4 py-2 text-sm disabled:opacity-50"
        >
          Export to Resy
        </button>
      </div>

      {message ? <p className="text-muted-foreground">{message}</p> : null}
    </div>
  );
}
