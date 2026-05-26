"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";

type StaffRow = { id: string; name: string; email: string | null; roleType: string };

export function SchedulingSyncPanel({
  provider,
  staff,
}: {
  provider: "7shifts" | "homebase";
  staff: StaffRow[];
}) {
  const [message, setMessage] = useState<string | null>(null);
  const [lastSyncAt, setLastSyncAt] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [mappings, setMappings] = useState<Record<string, string>>({});

  useEffect(() => {
    const stored = localStorage.getItem(`kitchenos_${provider}_last_sync`);
    if (stored) setLastSyncAt(stored);
    const mapStored = localStorage.getItem(`kitchenos_${provider}_staff_map`);
    if (mapStored) {
      try {
        setMappings(JSON.parse(mapStored) as Record<string, string>);
      } catch {
        /* ignore */
      }
    }
  }, [provider]);

  async function sync(direction: "export" | "import") {
    setLoading(true);
    const res = await fetch(`/api/integrations/${provider}/sync`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ direction, staffMappings: mappings }),
    });
    const json = (await res.json()) as { message?: string; error?: string; exported?: number; imported?: number };
    setLoading(false);

    if (!res.ok || json.error) {
      toast.error(json.error ?? "Sync failed");
      return;
    }

    const at = new Date().toISOString();
    localStorage.setItem(`kitchenos_${provider}_last_sync`, at);
    setLastSyncAt(at);
    setMessage(json.message ?? "Done");
    toast.success(json.message ?? "Sync complete");
  }

  function saveMappings() {
    localStorage.setItem(`kitchenos_${provider}_staff_map`, JSON.stringify(mappings));
    toast.success("Staff mapping saved locally");
  }

  const syncPath = provider === "7shifts" ? "7shifts" : "homebase";

  return (
    <div className="space-y-4 text-sm">
      {lastSyncAt ? (
        <p className="text-muted-foreground">Last sync: {new Date(lastSyncAt).toLocaleString()}</p>
      ) : (
        <p className="text-muted-foreground">No sync recorded yet.</p>
      )}

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          disabled={loading}
          onClick={() => void sync("export")}
          className="rounded-xl bg-primary px-4 py-2 text-sm text-primary-foreground disabled:opacity-50"
        >
          {loading ? "Syncing…" : "Export schedule"}
        </button>
        <button
          type="button"
          disabled={loading}
          onClick={() => void sync("import")}
          className="rounded-xl border px-4 py-2 text-sm disabled:opacity-50"
        >
          Import schedule
        </button>
      </div>

      <div>
        <p className="font-medium mb-2">Staff mapping ({staff.length})</p>
        {staff.length === 0 ? (
          <p className="text-muted-foreground">No active staff — add roster members first.</p>
        ) : (
          <ul className="space-y-2 max-h-64 overflow-y-auto">
            {staff.map((s) => (
              <li key={s.id} className="flex flex-wrap items-center gap-2">
                <span className="min-w-[120px]">{s.name}</span>
                <input
                  placeholder={`${syncPath} employee ID`}
                  value={mappings[s.id] ?? ""}
                  onChange={(e) => setMappings((m) => ({ ...m, [s.id]: e.target.value }))}
                  className="h-8 flex-1 min-w-[140px] rounded border px-2 text-xs font-mono"
                />
              </li>
            ))}
          </ul>
        )}
        <button type="button" onClick={saveMappings} className="mt-2 text-xs text-primary underline">
          Save mappings
        </button>
      </div>

      {message ? <p className="text-muted-foreground">{message}</p> : null}
    </div>
  );
}
