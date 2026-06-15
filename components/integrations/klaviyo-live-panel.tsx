"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import type { KlaviyoLiveDashboard, KlaviyoSegmentRow } from "@/lib/integrations/klaviyo-live-types";
import type { EmailFlowId } from "@/services/marketing/email-marketing-service";

const FLOW_OPTIONS: { id: EmailFlowId; label: string }[] = [
  { id: "welcome", label: "Welcome email" },
  { id: "abandoned_cart", label: "Abandoned cart" },
  { id: "post_purchase", label: "Post-purchase" },
  { id: "win_back", label: "Win-back" },
];

export function KlaviyoLivePanel({ dashboard }: { dashboard: KlaviyoLiveDashboard }) {
  const [status, setStatus] = useState<string | null>(null);
  const [segments, setSegments] = useState<KlaviyoSegmentRow[]>([]);
  const [selectedSegment, setSelectedSegment] = useState("");
  const [selectedFlow, setSelectedFlow] = useState<EmailFlowId>("welcome");
  const [loading, setLoading] = useState<
    "connect" | "sync" | "export" | "trigger" | "segments" | null
  >(null);

  useEffect(() => {
    if (!dashboard.connected) return;
    void loadSegments();
  }, [dashboard.connected]);

  async function loadSegments() {
    setLoading("segments");
    try {
      const res = await fetch("/api/integrations/klaviyo/export-segment");
      const json = (await res.json()) as {
        ok?: boolean;
        segments?: KlaviyoSegmentRow[];
        message?: string;
      };
      if (json.segments?.length) {
        setSegments(json.segments);
        setSelectedSegment((prev) => prev || json.segments![0].id);
      } else if (!json.ok) {
        setStatus(json.message ?? "Could not load segments.");
      }
    } catch (e) {
      setStatus(e instanceof Error ? e.message : "Could not load segments.");
    } finally {
      setLoading(null);
    }
  }

  async function connect() {
    setLoading("connect");
    setStatus(null);
    try {
      const res = await fetch("/api/integrations/klaviyo/connect", { method: "POST" });
      const json = (await res.json()) as { ok?: boolean; message?: string };
      setStatus(json.message ?? (json.ok ? "Connected." : "Connect failed."));
    } catch (e) {
      setStatus(e instanceof Error ? e.message : "Connect failed.");
    } finally {
      setLoading(null);
    }
  }

  async function syncProfiles() {
    setLoading("sync");
    setStatus(null);
    try {
      const res = await fetch("/api/integrations/klaviyo/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ days: 90, limit: 500 }),
      });
      const json = (await res.json()) as { ok?: boolean; message?: string };
      setStatus(json.message ?? (json.ok ? "Profiles synced." : "Sync failed."));
    } catch (e) {
      setStatus(e instanceof Error ? e.message : "Sync failed.");
    } finally {
      setLoading(null);
    }
  }

  async function exportSegment() {
    if (!selectedSegment) return;
    setLoading("export");
    setStatus(null);
    try {
      const res = await fetch("/api/integrations/klaviyo/export-segment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ segmentId: selectedSegment }),
      });
      if (!res.ok) {
        const json = (await res.json().catch(() => ({}))) as { message?: string };
        setStatus(json.message ?? "Export failed.");
        return;
      }
      const blob = await res.blob();
      const rowCount = res.headers.get("X-Export-Row-Count") ?? "?";
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `klaviyo-segment-${selectedSegment.slice(0, 8)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      setStatus(`Exported ${rowCount} profiles.`);
    } catch (e) {
      setStatus(e instanceof Error ? e.message : "Export failed.");
    } finally {
      setLoading(null);
    }
  }

  async function triggerCampaign() {
    if (!selectedSegment) return;
    setLoading("trigger");
    setStatus(null);
    try {
      const res = await fetch("/api/integrations/klaviyo/trigger-campaign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ flow: selectedFlow, segmentId: selectedSegment }),
      });
      const json = (await res.json()) as { ok?: boolean; message?: string };
      setStatus(json.message ?? (json.ok ? "Campaign triggered." : "Trigger failed."));
    } catch (e) {
      setStatus(e instanceof Error ? e.message : "Trigger failed.");
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="space-y-4 text-sm">
      <p className="text-muted-foreground">{dashboard.message}</p>
      {dashboard.connected ? (
        <p className="text-emerald-600">
          Connected · {dashboard.segmentCount} segments · {dashboard.campaignFlowCount} campaign flows
        </p>
      ) : (
        <p className="text-muted-foreground">Not connected — verify API key below.</p>
      )}

      {!dashboard.connected ? (
        <Button
          type="button"
          size="sm"
          className="rounded-full"
          disabled={loading !== null || dashboard.mode === "placeholder"}
          onClick={() => void connect()}
        >
          {loading === "connect" ? "Connecting…" : "Connect Klaviyo (API key)"}
        </Button>
      ) : null}

      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="rounded-full"
          disabled={!dashboard.connected || loading !== null}
          onClick={() => void syncProfiles()}
        >
          {loading === "sync" ? "Syncing…" : "Sync profiles"}
        </Button>
      </div>

      {dashboard.connected && segments.length > 0 ? (
        <div className="space-y-2">
          <label className="block text-xs text-muted-foreground" htmlFor="klaviyo-segment">
            Segment
          </label>
          <select
            id="klaviyo-segment"
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
            value={selectedSegment}
            onChange={(e) => setSelectedSegment(e.target.value)}
          >
            {segments.map((segment) => (
              <option key={segment.id} value={segment.id}>
                {segment.name}
                {segment.profileCount != null ? ` (${segment.profileCount})` : ""}
              </option>
            ))}
          </select>
        </div>
      ) : null}

      {dashboard.connected ? (
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="rounded-full"
            disabled={!selectedSegment || loading !== null}
            onClick={() => void exportSegment()}
          >
            {loading === "export" ? "Exporting…" : "Export segment CSV"}
          </Button>
          <select
            className="rounded-full border border-border bg-background px-3 py-1.5 text-sm"
            value={selectedFlow}
            onChange={(e) => setSelectedFlow(e.target.value as EmailFlowId)}
          >
            {FLOW_OPTIONS.map((flow) => (
              <option key={flow.id} value={flow.id}>
                {flow.label}
              </option>
            ))}
          </select>
          <Button
            type="button"
            size="sm"
            className="rounded-full"
            disabled={!selectedSegment || loading !== null}
            onClick={() => void triggerCampaign()}
          >
            {loading === "trigger" ? "Triggering…" : "Trigger campaign"}
          </Button>
        </div>
      ) : null}

      {dashboard.lastSegmentExportAt ? (
        <p className="text-xs text-muted-foreground">
          Last segment export: {dashboard.lastSegmentExportAt}
          {dashboard.lastSegmentExportCount != null
            ? ` · ${dashboard.lastSegmentExportCount} profiles`
            : ""}
        </p>
      ) : null}
      {dashboard.lastCampaignTriggerAt ? (
        <p className="text-xs text-muted-foreground">
          Last campaign trigger: {dashboard.lastCampaignTriggerAt}
          {dashboard.lastCampaignTriggered != null
            ? ` · ${dashboard.lastCampaignTriggered} events`
            : ""}
        </p>
      ) : null}
      {status ? <p className="text-xs">{status}</p> : null}
    </div>
  );
}
