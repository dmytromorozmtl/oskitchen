"use client";

import { useTransition } from "react";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import { Loader2, Mail, Play } from "lucide-react";

import { runB2bCollectorDigestNowFormAction } from "@/actions/shopify-b2b-collector-queue";
import { SHOPIFY_MARKET_B2B_COLLECTOR_QUEUE_HONESTY } from "@/lib/commercial/shopify-market-b2b-collector-queue";
import type { ShopifyMarketsSyncSettings } from "@/lib/integrations/shopify-markets-settings";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";

export function ShopifyMarketsB2bCollectorQueueCard({
  connectionId,
  syncSettings,
  digestPreview,
  canManage,
}: {
  connectionId: string | null;
  syncSettings: ShopifyMarketsSyncSettings;
  digestPreview: {
    openCount: number;
    slaBreachedCount: number;
    tasksByAssignee: Array<{
      assignee: string;
      tasks: Array<{ companyName: string; maxDaysPastDue: number; openAmountCents: number }>;
    }>;
  } | null;
  canManage: boolean;
}) {
  const [pending, startTransition] = useTransition();

  if (!connectionId || !digestPreview) return null;

  return (
    <div
      className="space-y-3 rounded-lg border border-amber-500/30 bg-amber-500/5 p-3 text-xs"
      id="shopify-markets-b2b-collector-queue"
      data-testid="shopify-markets-b2b-collector-queue"
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="font-medium text-foreground">B2B collector task queue</p>
          <p className="mt-1 max-w-2xl text-muted-foreground">{SHOPIFY_MARKET_B2B_COLLECTOR_QUEUE_HONESTY}</p>
        </div>
        <div className="flex flex-wrap gap-1">
          {syncSettings.b2bCollectorDigestEnabled ? (
            <Badge className="rounded-full bg-amber-500/15 text-[10px] text-amber-900 dark:text-amber-100">
              daily digest on
            </Badge>
          ) : (
            <Badge variant="secondary" className="rounded-full text-[10px]">
              digest off
            </Badge>
          )}
          {digestPreview.slaBreachedCount > 0 ? (
            <Badge variant="destructive" className="rounded-full text-[10px]">
              {digestPreview.slaBreachedCount} SLA breach(es)
            </Badge>
          ) : null}
        </div>
      </div>

      <div className="grid gap-2 sm:grid-cols-3">
        <div className="rounded-md border border-border/60 bg-background/70 px-2 py-1.5">
          <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Open tasks</p>
          <p className="font-semibold tabular-nums">{digestPreview.openCount}</p>
        </div>
        <div className="rounded-md border border-border/60 bg-background/70 px-2 py-1.5">
          <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Queue stats</p>
          <p className="font-semibold tabular-nums">
            {syncSettings.b2bCollectorQueueStats?.tasksCreated ?? 0} created ·{" "}
            {syncSettings.b2bCollectorQueueStats?.tasksCompleted ?? 0} done
          </p>
        </div>
        <div className="rounded-md border border-border/60 bg-background/70 px-2 py-1.5">
          <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Digests sent</p>
          <p className="font-semibold tabular-nums">{syncSettings.b2bCollectorQueueStats?.digestsSent ?? 0}</p>
        </div>
      </div>

      {digestPreview.tasksByAssignee.length > 0 ? (
        <ul className="space-y-2 rounded-md border border-border/60 bg-background/50 p-2">
          {digestPreview.tasksByAssignee.slice(0, 4).map((group) => (
            <li key={group.assignee}>
              <p className="font-medium">{group.assignee}</p>
              <ul className="mt-1 space-y-1 text-muted-foreground">
                {group.tasks.slice(0, 3).map((task) => (
                  <li key={`${group.assignee}-${task.companyName}`}>
                    {task.companyName} · {task.maxDaysPastDue}d ·{" "}
                    {formatCurrency(task.openAmountCents / 100)}
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-muted-foreground">No active collector tasks — overdue company rollups will sync on receivables view.</p>
      )}

      <div className="flex flex-wrap items-center gap-2 text-muted-foreground">
        {syncSettings.lastB2bCollectorDigestAt ? (
          <span>
            Last digest{" "}
            {formatDistanceToNow(new Date(syncSettings.lastB2bCollectorDigestAt), { addSuffix: true })}
          </span>
        ) : null}
        {syncSettings.lastB2bCollectorQueueSyncAt ? (
          <span>
            Last sync{" "}
            {formatDistanceToNow(new Date(syncSettings.lastB2bCollectorQueueSyncAt), { addSuffix: true })}
          </span>
        ) : null}
      </div>

      {canManage ? (
        <div className="flex flex-wrap gap-2">
          <form
            action={(formData) => {
              startTransition(() => runB2bCollectorDigestNowFormAction(formData));
            }}
          >
            <input type="hidden" name="connectionId" value={connectionId} />
            <Button type="submit" size="sm" className="rounded-full" disabled={pending}>
              {pending ? <Loader2 className="size-3.5 animate-spin" aria-hidden /> : <Play className="size-3.5" aria-hidden />}
              <span className="ml-1.5">Run digest now</span>
            </Button>
          </form>
          <form
            action={(formData) => {
              startTransition(() => runB2bCollectorDigestNowFormAction(formData));
            }}
          >
            <input type="hidden" name="connectionId" value={connectionId} />
            <input type="hidden" name="forceDigest" value="1" />
            <Button type="submit" size="sm" variant="outline" className="rounded-full" disabled={pending}>
              {pending ? <Loader2 className="size-3.5 animate-spin" aria-hidden /> : <Mail className="size-3.5" aria-hidden />}
              <span className="ml-1.5">Force send digest</span>
            </Button>
          </form>
          <Button asChild size="sm" variant="ghost" className="rounded-full">
            <Link href="/dashboard/receivables#b2b-collector-task-queue">Open task queue</Link>
          </Button>
        </div>
      ) : null}
    </div>
  );
}
