"use client";

import * as React from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

type ProviderSlug = "woocommerce" | "shopify" | "uber-eats";

export function IntegrationToolRow({
  connectionId,
  provider,
}: {
  connectionId: string | null;
  provider: ProviderSlug;
}) {
  const [busy, setBusy] = React.useState<string | null>(null);

  async function post(path: string, label: string) {
    if (!connectionId) {
      toast.error("Save credentials first to get a connection id.");
      return;
    }
    setBusy(label);
    try {
      const res = await fetch(path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ connectionId }),
      });
      const data = (await res.json()) as { error?: string; ok?: boolean; message?: string };
      if (!res.ok) throw new Error(data.error ?? "Request failed");
      toast.success(data.message ?? "Done");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    } finally {
      setBusy(null);
    }
  }

  const base = `/api/integrations/${provider}`;

  return (
    <div className="flex flex-wrap gap-2">
      <Button
        type="button"
        variant="secondary"
        size="sm"
        className="rounded-full"
        disabled={!connectionId || busy !== null}
        onClick={() => void post(`${base}/test`, "test")}
      >
        {busy === "test" ? "Testing…" : "Test connection"}
      </Button>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="rounded-full"
        disabled={!connectionId || busy !== null}
        onClick={() => void post(`${base}/sync-products`, "sync-p")}
      >
        {busy === "sync-p" ? "Syncing…" : "Sync products"}
      </Button>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="rounded-full"
        disabled={!connectionId || busy !== null}
        onClick={() => void post(`${base}/sync-orders`, "sync-o")}
      >
        {busy === "sync-o" ? "Syncing…" : "Sync orders"}
      </Button>
    </div>
  );
}
