"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import type {
  MailchimpAutomationRow,
  MailchimpListRow,
  MailchimpLiveDashboard,
} from "@/lib/integrations/mailchimp-live-types";

export function MailchimpLivePanel({ dashboard }: { dashboard: MailchimpLiveDashboard }) {
  const [status, setStatus] = useState<string | null>(null);
  const [lists, setLists] = useState<MailchimpListRow[]>([]);
  const [automations, setAutomations] = useState<MailchimpAutomationRow[]>([]);
  const [selectedList, setSelectedList] = useState(dashboard.listId ?? "");
  const [selectedAutomation, setSelectedAutomation] = useState("");
  const [loading, setLoading] = useState<"sync" | "trigger" | "load" | null>(null);

  useEffect(() => {
    if (!dashboard.connected) return;
    void loadResources();
  }, [dashboard.connected]);

  async function loadResources() {
    setLoading("load");
    try {
      const [listsRes, autoRes] = await Promise.all([
        fetch("/api/integrations/mailchimp/lists"),
        fetch("/api/integrations/mailchimp/trigger-automation"),
      ]);
      const listsJson = (await listsRes.json()) as {
        ok?: boolean;
        lists?: MailchimpListRow[];
        message?: string;
      };
      const autoJson = (await autoRes.json()) as {
        ok?: boolean;
        automations?: MailchimpAutomationRow[];
        message?: string;
      };

      if (listsJson.lists?.length) {
        setLists(listsJson.lists);
        setSelectedList((prev) => prev || listsJson.lists![0].id);
      }
      if (autoJson.automations?.length) {
        setAutomations(autoJson.automations);
        setSelectedAutomation((prev) => prev || autoJson.automations![0].id);
      }
      if (!listsJson.ok && listsJson.message) setStatus(listsJson.message);
    } catch (e) {
      setStatus(e instanceof Error ? e.message : "Could not load Mailchimp resources.");
    } finally {
      setLoading(null);
    }
  }

  async function syncList() {
    if (!selectedList) return;
    setLoading("sync");
    setStatus(null);
    try {
      const res = await fetch("/api/integrations/mailchimp/sync-list", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listId: selectedList, days: 90, limit: 500 }),
      });
      const json = (await res.json()) as { ok?: boolean; message?: string };
      setStatus(json.message ?? (json.ok ? "List synced." : "Sync failed."));
    } catch (e) {
      setStatus(e instanceof Error ? e.message : "Sync failed.");
    } finally {
      setLoading(null);
    }
  }

  async function triggerAutomation() {
    if (!selectedAutomation) return;
    setLoading("trigger");
    setStatus(null);
    try {
      const res = await fetch("/api/integrations/mailchimp/trigger-automation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          automationId: selectedAutomation,
          listId: selectedList || undefined,
        }),
      });
      const json = (await res.json()) as { ok?: boolean; message?: string };
      setStatus(json.message ?? (json.ok ? "Automation triggered." : "Trigger failed."));
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
          Connected · {dashboard.listCount} lists · {dashboard.automationCount} automations
        </p>
      ) : (
        <p className="text-muted-foreground">Not connected — use OAuth below.</p>
      )}

      {dashboard.oauthAuthorizeUrl ? (
        <Button asChild size="sm" className="rounded-full">
          <a href={dashboard.oauthAuthorizeUrl}>Connect Mailchimp (OAuth)</a>
        </Button>
      ) : null}

      {dashboard.connected && lists.length > 0 ? (
        <div className="space-y-2">
          <label className="block text-xs text-muted-foreground" htmlFor="mailchimp-list">
            Audience list
          </label>
          <select
            id="mailchimp-list"
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
            value={selectedList}
            onChange={(e) => setSelectedList(e.target.value)}
          >
            {lists.map((list) => (
              <option key={list.id} value={list.id}>
                {list.name} ({list.memberCount})
              </option>
            ))}
          </select>
        </div>
      ) : null}

      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="rounded-full"
          disabled={!dashboard.connected || !selectedList || loading !== null}
          onClick={() => void syncList()}
        >
          {loading === "sync" ? "Syncing…" : "Sync email list"}
        </Button>
      </div>

      {dashboard.connected && automations.length > 0 ? (
        <div className="space-y-2">
          <label className="block text-xs text-muted-foreground" htmlFor="mailchimp-automation">
            Campaign automation
          </label>
          <select
            id="mailchimp-automation"
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
            value={selectedAutomation}
            onChange={(e) => setSelectedAutomation(e.target.value)}
          >
            {automations.map((row) => (
              <option key={row.id} value={row.id}>
                {row.title} ({row.status})
              </option>
            ))}
          </select>
          <Button
            type="button"
            size="sm"
            className="rounded-full"
            disabled={!selectedAutomation || loading !== null}
            onClick={() => void triggerAutomation()}
          >
            {loading === "trigger" ? "Triggering…" : "Trigger automation"}
          </Button>
        </div>
      ) : null}

      {dashboard.lastListSyncAt ? (
        <p className="text-xs text-muted-foreground">
          Last list sync: {dashboard.lastListSyncAt}
          {dashboard.lastListSyncCount != null ? ` · ${dashboard.lastListSyncCount} members` : ""}
        </p>
      ) : null}
      {dashboard.lastAutomationTriggerAt ? (
        <p className="text-xs text-muted-foreground">
          Last automation: {dashboard.lastAutomationTriggerAt}
          {dashboard.lastAutomationTriggered != null
            ? ` · ${dashboard.lastAutomationTriggered} queued`
            : ""}
        </p>
      ) : null}
      {loading === "load" ? <p className="text-xs text-muted-foreground">Loading resources…</p> : null}
      {status ? <p className="text-xs">{status}</p> : null}
    </div>
  );
}
