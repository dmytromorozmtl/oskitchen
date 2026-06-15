"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";

export function ToastSyncPanel({ configured }: { configured: boolean }) {
  const [message, setMessage] = useState<string | null>(null);
  const [lastSyncAt, setLastSyncAt] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("kitchenos_toast_last_sync");
    if (stored) setLastSyncAt(stored);
  }, []);

  async function sync() {
    if (!configured) {
      toast.error("Set TOAST_ACCESS_TOKEN and TOAST_RESTAURANT_GUID first");
      return;
    }

    setLoading(true);
    const res = await fetch("/api/integrations/toast/sync", { method: "POST" });
    const json = (await res.json()) as { message?: string; ok?: boolean };
    setLoading(false);

    if (!res.ok || json.ok === false) {
      toast.error(json.message ?? "Sync failed");
      return;
    }

    const at = new Date().toISOString();
    localStorage.setItem("kitchenos_toast_last_sync", at);
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
        Import Toast POS orders from the last 14 business days into the order hub. Requires Toast
        partner-approved API access with ORDERS_READ scope.
      </p>

      <button
        type="button"
        disabled={loading || !configured}
        onClick={() => void sync()}
        className="rounded-xl bg-primary px-4 py-2 text-sm text-primary-foreground disabled:opacity-50"
      >
        {loading ? "Syncing…" : "Import Toast orders"}
      </button>

      {message ? <p className="text-muted-foreground">{message}</p> : null}
    </div>
  );
}
