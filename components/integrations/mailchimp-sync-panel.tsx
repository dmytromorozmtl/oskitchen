"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";

export function MailchimpSyncPanel({ configured }: { configured: boolean }) {
  const [message, setMessage] = useState<string | null>(null);
  const [lastSyncAt, setLastSyncAt] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("kitchenos_mailchimp_last_sync");
    if (stored) setLastSyncAt(stored);
  }, []);

  async function sync() {
    if (!configured) {
      toast.error("Set MAILCHIMP_API_KEY and MAILCHIMP_LIST_ID first");
      return;
    }
    setLoading(true);
    const res = await fetch("/api/integrations/mailchimp/sync", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ days: 90, limit: 500 }),
    });
    const json = (await res.json()) as { message?: string };
    setLoading(false);

    if (!res.ok) {
      toast.error(json.message ?? "Sync failed");
      return;
    }

    const at = new Date().toISOString();
    localStorage.setItem("kitchenos_mailchimp_last_sync", at);
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
        Pushes consent-opted customers (EMAIL_MARKETING) to your Mailchimp audience via member
        upsert. Requires audience merge fields FNAME, LNAME, PHONE.
      </p>

      <button
        type="button"
        disabled={loading || !configured}
        onClick={() => void sync()}
        className="rounded-xl bg-primary px-4 py-2 text-sm text-primary-foreground disabled:opacity-50"
      >
        {loading ? "Syncing…" : "Sync customers to Mailchimp"}
      </button>

      {message ? <p className="text-muted-foreground">{message}</p> : null}
    </div>
  );
}
