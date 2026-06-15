"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";

export function GoogleFormsSyncPanel({ configured }: { configured: boolean }) {
  const [message, setMessage] = useState<string | null>(null);
  const [lastSyncAt, setLastSyncAt] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("kitchenos_google_forms_last_sync");
    if (stored) setLastSyncAt(stored);
  }, []);

  async function sync() {
    if (!configured) {
      toast.error("Set GOOGLE_FORMS_SHEET_ACCESS_TOKEN and GOOGLE_FORMS_SHEET_ID first");
      return;
    }

    setLoading(true);
    const res = await fetch("/api/integrations/google-forms/sync", { method: "POST" });
    const json = (await res.json()) as { message?: string; ok?: boolean };
    setLoading(false);

    if (!res.ok || json.ok === false) {
      toast.error(json.message ?? "Sync failed");
      return;
    }

    const at = new Date().toISOString();
    localStorage.setItem("kitchenos_google_forms_last_sync", at);
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
        BETA — imports linked Google Sheet responses (Forms → Sheet pattern). No native Google Forms
        webhook; point your form to a Sheet and share read access via API token.
      </p>

      <button
        type="button"
        disabled={loading || !configured}
        onClick={() => void sync()}
        className="rounded-xl bg-primary px-4 py-2 text-sm text-primary-foreground disabled:opacity-50"
      >
        {loading ? "Syncing…" : "Import form responses"}
      </button>

      {message ? <p className="text-muted-foreground">{message}</p> : null}
    </div>
  );
}
