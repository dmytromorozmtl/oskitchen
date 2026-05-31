"use client";

import { useTransition } from "react";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import { Loader2, Mail, Play } from "lucide-react";

import { runB2bDunningNowFormAction } from "@/actions/shopify-b2b-dunning";
import { SHOPIFY_MARKET_B2B_DUNNING_HONESTY } from "@/lib/commercial/shopify-market-b2b-dunning";
import type { ShopifyMarketsSyncSettings } from "@/lib/integrations/shopify-markets-settings";
import type { B2bOperatorDigestPreview } from "@/lib/integrations/shopify-b2b-dunning-metadata";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";

export function ShopifyMarketsB2bDunningCard({
  connectionId,
  syncSettings,
  digestPreview,
  canManage,
}: {
  connectionId: string | null;
  syncSettings: ShopifyMarketsSyncSettings;
  digestPreview: B2bOperatorDigestPreview | null;
  canManage: boolean;
}) {
  const [pending, startTransition] = useTransition();

  if (!connectionId || !digestPreview) return null;

  const cadenceLabel =
    syncSettings.b2bDunningCadenceDays?.join(" / ") ??
    digestPreview.cadenceDays.join(" / ");

  return (
    <div
      className="space-y-3 rounded-lg border border-violet-500/30 bg-violet-500/5 p-3 text-xs"
      id="shopify-markets-b2b-dunning"
      data-testid="shopify-markets-b2b-dunning"
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="font-medium text-foreground">B2B automated dunning</p>
          <p className="mt-1 max-w-2xl text-muted-foreground">{SHOPIFY_MARKET_B2B_DUNNING_HONESTY}</p>
        </div>
        <div className="flex flex-wrap gap-1">
          <Badge variant="outline" className="rounded-full text-[10px]">
            cadence day {cadenceLabel}
          </Badge>
          {syncSettings.b2bAutoDunningEnabled ? (
            <Badge className="rounded-full bg-violet-500/15 text-[10px] text-violet-900 dark:text-violet-100">
              auto reminders on
            </Badge>
          ) : (
            <Badge variant="secondary" className="rounded-full text-[10px]">
              auto reminders off
            </Badge>
          )}
          {!syncSettings.b2bOperatorDigestEnabled ? (
            <Badge variant="secondary" className="rounded-full text-[10px]">
              digest off
            </Badge>
          ) : null}
        </div>
      </div>

      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-md border border-border/60 bg-background/70 px-2 py-1.5">
          <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Open</p>
          <p className="font-semibold tabular-nums">
            {digestPreview.openTotal} · {formatCurrency(digestPreview.openAmountCents / 100)}
          </p>
        </div>
        <div className="rounded-md border border-border/60 bg-background/70 px-2 py-1.5">
          <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Overdue</p>
          <p className="font-semibold tabular-nums">{digestPreview.overdueTotal}</p>
        </div>
        <div className="rounded-md border border-border/60 bg-background/70 px-2 py-1.5">
          <p className="text-[10px] uppercase tracking-wide text-muted-foreground">61+ days</p>
          <p className="font-semibold tabular-nums">{digestPreview.bucket61Plus}</p>
        </div>
        <div className="rounded-md border border-border/60 bg-background/70 px-2 py-1.5">
          <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Cron stats</p>
          <p className="font-semibold tabular-nums">
            {syncSettings.b2bDunningStats?.digestsSent ?? 0} digests ·{" "}
            {syncSettings.b2bDunningStats?.autoRemindersSent ?? 0} auto
          </p>
        </div>
      </div>

      {digestPreview.topOverdue.length > 0 ? (
        <ul className="space-y-1 rounded-md border border-border/60 bg-background/50 p-2">
          {digestPreview.topOverdue.map((row) => (
            <li key={row.orderId} className="flex flex-wrap items-center justify-between gap-2">
              <span className="font-mono">{row.invoiceNumber}</span>
              <span className="text-muted-foreground">
                {row.companyName ?? "—"} · {row.daysPastDue}d ·{" "}
                {formatCurrency(row.openAmountCents / 100)}
              </span>
              <Link href={`/dashboard/orders/${row.orderId}`} className="text-primary hover:underline">
                Open
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-muted-foreground">No overdue B2B invoices in the current snapshot.</p>
      )}

      <div className="flex flex-wrap items-center gap-2 text-muted-foreground">
        {syncSettings.lastB2bOperatorDigestAt ? (
          <span>
            Last digest{" "}
            {formatDistanceToNow(new Date(syncSettings.lastB2bOperatorDigestAt), { addSuffix: true })}
          </span>
        ) : null}
        {syncSettings.lastB2bDunningRunAt ? (
          <span>
            Last run {formatDistanceToNow(new Date(syncSettings.lastB2bDunningRunAt), { addSuffix: true })}
          </span>
        ) : null}
        {(syncSettings.b2bDunningStats?.skippedEmailOff ?? 0) > 0 ? (
          <Badge variant="destructive" className="rounded-full text-[10px]">
            email not configured
          </Badge>
        ) : null}
      </div>

      {canManage ? (
        <div className="flex flex-wrap gap-2">
          <form
            action={(formData) => {
              startTransition(() => runB2bDunningNowFormAction(formData));
            }}
          >
            <input type="hidden" name="connectionId" value={connectionId} />
            <Button type="submit" size="sm" className="rounded-full" disabled={pending}>
              {pending ? <Loader2 className="size-3.5 animate-spin" aria-hidden /> : <Play className="size-3.5" aria-hidden />}
              <span className="ml-1.5">Run dunning now</span>
            </Button>
          </form>
          <form
            action={(formData) => {
              startTransition(() => runB2bDunningNowFormAction(formData));
            }}
          >
            <input type="hidden" name="connectionId" value={connectionId} />
            <input type="hidden" name="forceDigest" value="1" />
            <Button type="submit" size="sm" variant="outline" className="rounded-full" disabled={pending}>
              {pending ? <Loader2 className="size-3.5 animate-spin" aria-hidden /> : <Mail className="size-3.5" aria-hidden />}
              <span className="ml-1.5">Send digest now</span>
            </Button>
          </form>
          <Button asChild size="sm" variant="ghost" className="rounded-full">
            <Link href="/dashboard/order-hub">Order Hub aging</Link>
          </Button>
        </div>
      ) : null}
    </div>
  );
}
