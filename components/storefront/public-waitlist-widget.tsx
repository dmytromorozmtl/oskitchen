"use client";

import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type JoinResult = {
  entryId: string;
  position: number;
  estimatedWaitMinutes: number;
  smsSent: boolean;
  smsSkipped: boolean;
};

type StatusResult = {
  entryId: string;
  status: string;
  position: number | null;
  estimatedWaitMinutes: number | null;
};

export function PublicWaitlistWidget({ storeSlug, storeName }: { storeSlug: string; storeName: string }) {
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  const [joinResult, setJoinResult] = useState<JoinResult | null>(null);
  const [status, setStatus] = useState<StatusResult | null>(null);
  const [lookupId, setLookupId] = useState("");

  function onJoin(formData: FormData) {
    setMessage(null);
    startTransition(async () => {
      const res = await fetch("/api/storefront/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          storeSlug,
          customerName: String(formData.get("customerName") ?? ""),
          customerPhone: String(formData.get("customerPhone") ?? ""),
          partySize: Number(formData.get("partySize") ?? 2),
        }),
      });
      const data = (await res.json()) as JoinResult & { ok?: boolean; error?: string };
      if (!res.ok || !data.entryId) {
        setMessage(data.error ?? "Could not join waitlist.");
        return;
      }
      setJoinResult({
        entryId: data.entryId,
        position: data.position,
        estimatedWaitMinutes: data.estimatedWaitMinutes,
        smsSent: Boolean(data.smsSent),
        smsSkipped: Boolean(data.smsSkipped),
      });
      setLookupId(data.entryId);
      const smsNote = data.smsSent
        ? "Confirmation text sent."
        : data.smsSkipped
          ? "SMS is not configured — save your confirmation code below."
          : "";
      setMessage(
        `You're #${data.position} in line (~${data.estimatedWaitMinutes} min). ${smsNote}`.trim(),
      );
    });
  }

  function refreshStatus() {
    if (!lookupId) return;
    startTransition(async () => {
      const params = new URLSearchParams({ storeSlug, entryId: lookupId });
      const res = await fetch(`/api/storefront/waitlist?${params.toString()}`);
      const data = (await res.json()) as { ok?: boolean; status?: StatusResult; error?: string };
      if (!res.ok || !data.status) {
        setMessage(data.error ?? "Could not load waitlist status.");
        return;
      }
      setStatus(data.status);
      if (data.status.status === "NOTIFIED") {
        setMessage("Your table is ready — please check in with the host.");
      } else if (data.status.position != null) {
        setMessage(
          `Still waiting — position #${data.status.position}, ~${data.status.estimatedWaitMinutes ?? "?"} min.`,
        );
      }
    });
  }

  return (
    <div className="space-y-6 rounded-2xl border border-border/80 bg-card p-6 shadow-sm" data-testid="public-waitlist-widget">
      <div>
        <h2 className="text-xl font-semibold">Join the waitlist at {storeName}</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Walk in without a reservation. We text you when your table is ready.
        </p>
      </div>

      <form action={onJoin} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="customerName">Name</Label>
          <Input id="customerName" name="customerName" required className="rounded-xl" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="customerPhone">Mobile phone</Label>
            <Input id="customerPhone" name="customerPhone" type="tel" required className="rounded-xl" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="partySize">Party size</Label>
            <Input id="partySize" name="partySize" type="number" min={1} max={12} defaultValue={2} required className="rounded-xl" />
          </div>
        </div>
        <Button type="submit" disabled={pending} className="rounded-full">
          Join waitlist
        </Button>
      </form>

      {joinResult ? (
        <div className="rounded-xl border bg-muted/40 p-4 text-sm">
          <p className="font-medium">Confirmation code</p>
          <p className="mt-1 font-mono text-xs">{joinResult.entryId}</p>
        </div>
      ) : null}

      <div className="space-y-2 rounded-xl border p-4">
        <Label htmlFor="lookupId">Check your status</Label>
        <div className="flex flex-wrap gap-2">
          <Input
            id="lookupId"
            value={lookupId}
            onChange={(e) => setLookupId(e.target.value)}
            placeholder="Paste confirmation code"
            className="max-w-md rounded-xl"
          />
          <Button type="button" variant="secondary" disabled={pending || !lookupId} onClick={refreshStatus} className="rounded-full">
            Refresh
          </Button>
        </div>
        {status ? (
          <p className="text-sm text-muted-foreground">
            Status: {status.status}
            {status.position != null ? ` · #${status.position} · ~${status.estimatedWaitMinutes ?? "?"} min` : ""}
          </p>
        ) : null}
      </div>

      {message ? <p className="text-sm text-muted-foreground">{message}</p> : null}
    </div>
  );
}
