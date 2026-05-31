"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { Download, Link2, Mail, Users } from "lucide-react";

import {
  assignB2bArCollectorAction,
  bulkMintB2bArPayLinksAction,
  bulkSendB2bArRemindersAction,
} from "@/actions/shopify-b2b-ar-dashboard";
import { OrderB2bInvoiceMarkPaidButton } from "@/components/orders/order-b2b-invoice-mark-paid-button";
import { OrderB2bInvoicePayLinkButton } from "@/components/orders/order-b2b-invoice-pay-link-button";
import { OrderB2bInvoiceSendReminderButton } from "@/components/orders/order-b2b-invoice-send-reminder-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { SHOPIFY_MARKET_B2B_AR_DASHBOARD_HONESTY } from "@/lib/commercial/shopify-market-b2b-ar-dashboard";
import type { B2bArAgingBucket } from "@/lib/integrations/shopify-b2b-ar-aging-metadata";
import type { B2bArDashboardSnapshot } from "@/lib/integrations/shopify-b2b-ar-dashboard-metadata";
import { formatCurrency } from "@/lib/utils";

const BUCKET_LABELS: Record<B2bArAgingBucket | "overdue", string> = {
  current: "Current",
  days_0_30: "0–30 days",
  days_31_60: "31–60 days",
  days_61_plus: "61+ days",
  overdue: "All overdue",
};

export function B2bReceivablesDashboard({
  snapshot,
  ordersById,
  activeBucket,
}: {
  snapshot: B2bArDashboardSnapshot;
  ordersById: Map<string, { sourceMetadataJson: unknown; paymentStatus: string | null }>;
  activeBucket: B2bArAgingBucket | "all" | "overdue";
}) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

  const visibleRows = useMemo(() => {
    if (activeBucket === "all") return snapshot.rows;
    if (activeBucket === "overdue") return snapshot.rows.filter((row) => row.bucket !== "current");
    return snapshot.rows.filter((row) => row.bucket === activeBucket);
  }, [snapshot.rows, activeBucket]);

  const overdueOrderIds = visibleRows.filter((row) => row.bucket !== "current").map((row) => row.orderId);

  function toggle(orderId: string) {
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(orderId)) next.delete(orderId);
      else next.add(orderId);
      return next;
    });
  }

  function runBulk(action: "reminders" | "pay-links") {
    const orderIds = selected.size > 0 ? [...selected] : overdueOrderIds.slice(0, 25);
    if (orderIds.length === 0) {
      setMessage("No overdue invoices selected.");
      return;
    }
    setMessage(null);
    startTransition(async () => {
      const result =
        action === "reminders"
          ? await bulkSendB2bArRemindersAction(orderIds)
          : await bulkMintB2bArPayLinksAction(orderIds);
      if (!result.ok) {
        setMessage(result.error);
        return;
      }
      setMessage(
        action === "reminders"
          ? `Sent ${result.data.succeeded} reminder(s), skipped ${result.data.skipped}.`
          : `Minted ${result.data.succeeded} pay link(s), skipped ${result.data.skipped}.`,
      );
    });
  }

  return (
    <div className="space-y-6">
      <Card className="border-border/80 bg-card/90 shadow-sm">
        <CardHeader>
          <CardTitle>B2B receivables command center</CardTitle>
          <CardDescription className="max-w-3xl">{SHOPIFY_MARKET_B2B_AR_DASHBOARD_HONESTY}</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {(["current", "days_0_30", "days_31_60", "days_61_plus"] as const).map((bucket) => (
            <Link
              key={bucket}
              href={`/dashboard/receivables?bucket=${bucket}`}
              className={`rounded-xl border p-3 transition hover:bg-muted/40 ${
                activeBucket === bucket ? "border-primary bg-primary/5" : "border-border/70"
              }`}
            >
              <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
                {BUCKET_LABELS[bucket]}
              </p>
              <p className="mt-1 text-2xl font-semibold tabular-nums">{snapshot.buckets[bucket]}</p>
              <p className="text-xs text-muted-foreground tabular-nums">
                {formatCurrency(snapshot.bucketAmountCents[bucket] / 100)}
              </p>
            </Link>
          ))}
          <div className="rounded-xl border border-border/70 p-3">
            <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Health score</p>
            <p className="mt-1 text-2xl font-semibold tabular-nums">{snapshot.healthScore}</p>
            <Badge
              variant={snapshot.healthLevel === "critical" ? "destructive" : "outline"}
              className="mt-1 rounded-full text-[10px]"
            >
              {snapshot.healthLevel}
            </Badge>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          size="sm"
          className="rounded-full"
          disabled={pending}
          onClick={() => runBulk("reminders")}
        >
          <Mail className="size-3.5" aria-hidden />
          <span className="ml-1.5">Bulk send reminders</span>
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="rounded-full"
          disabled={pending}
          onClick={() => runBulk("pay-links")}
        >
          <Link2 className="size-3.5" aria-hidden />
          <span className="ml-1.5">Bulk mint pay links</span>
        </Button>
        <Button asChild size="sm" variant="outline" className="rounded-full">
          <a href="/api/dashboard/receivables/export" download>
            <Download className="size-3.5" aria-hidden />
            <span className="ml-1.5">Export CSV</span>
          </a>
        </Button>
        <Button asChild size="sm" variant="ghost" className="rounded-full">
          <Link href="/dashboard/order-hub">Order Hub</Link>
        </Button>
        <Button asChild size="sm" variant="ghost" className="rounded-full">
          <Link href="/dashboard/integrations/shopify">Shopify settings</Link>
        </Button>
      </div>
      {message ? <p className="text-sm text-muted-foreground">{message}</p> : null}

      <Card className="border-border/80 bg-card/90 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <Users className="size-4" aria-hidden />
            Company rollups
          </CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Company</TableHead>
                <TableHead>Open</TableHead>
                <TableHead>Overdue</TableHead>
                <TableHead>Max past due</TableHead>
                <TableHead>Collector</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {snapshot.companies.slice(0, 12).map((company) => (
                <TableRow key={company.companyKey}>
                  <TableCell className="text-sm">{company.companyName}</TableCell>
                  <TableCell className="text-sm tabular-nums">
                    {company.openInvoices} · {formatCurrency(company.openAmountCents / 100)}
                  </TableCell>
                  <TableCell className="text-sm tabular-nums">{company.overdueInvoices}</TableCell>
                  <TableCell className="text-sm tabular-nums">{company.maxDaysPastDue}d</TableCell>
                  <TableCell>
                    {company.companyAccountId ? (
                      <CollectorAssignForm
                        companyAccountId={company.companyAccountId}
                        initialValue={company.assignedCollector ?? ""}
                      />
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card className="border-border/80 bg-card/90 shadow-sm" data-testid="b2b-receivables-table">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">
            Invoices · {BUCKET_LABELS[activeBucket === "all" ? "overdue" : activeBucket] ?? "All"}
          </CardTitle>
          <CardDescription>
            {visibleRows.length} open invoice(s) · Shopify mirror on {snapshot.shopifyMirrorCount} row(s)
          </CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead />
                <TableHead>Invoice</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Bucket</TableHead>
                <TableHead>KitchenOS</TableHead>
                <TableHead>Shopify</TableHead>
                <TableHead className="text-right">Open</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {visibleRows.map((row) => {
                const order = ordersById.get(row.orderId);
                return (
                  <TableRow key={row.orderId}>
                    <TableCell>
                      <input
                        type="checkbox"
                        checked={selected.has(row.orderId)}
                        onChange={() => toggle(row.orderId)}
                        aria-label={`Select ${row.invoiceNumber}`}
                      />
                    </TableCell>
                    <TableCell className="font-mono text-xs">{row.invoiceNumber}</TableCell>
                    <TableCell className="text-xs">{row.companyName ?? "—"}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="rounded-full text-[10px]">
                        {BUCKET_LABELS[row.bucket]}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs">{row.kitchenPaymentStatus ?? "—"}</TableCell>
                    <TableCell className="text-xs">{row.shopifyFinancialStatus ?? "—"}</TableCell>
                    <TableCell className="text-right text-xs tabular-nums">
                      {formatCurrency(row.openAmountCents / 100)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex flex-wrap items-center justify-end gap-1">
                        {order ? (
                          <>
                            <OrderB2bInvoicePayLinkButton
                              orderId={row.orderId}
                              sourceMetadataJson={order.sourceMetadataJson}
                              paymentStatus={order.paymentStatus}
                            />
                            <OrderB2bInvoiceSendReminderButton
                              orderId={row.orderId}
                              sourceMetadataJson={order.sourceMetadataJson}
                              paymentStatus={order.paymentStatus}
                              compact
                            />
                            <OrderB2bInvoiceMarkPaidButton
                              orderId={row.orderId}
                              sourceMetadataJson={order.sourceMetadataJson}
                              paymentStatus={order.paymentStatus}
                              compact
                            />
                          </>
                        ) : null}
                        <Button asChild variant="ghost" size="sm" className="h-7 rounded-full px-2 text-xs">
                          <Link href={`/dashboard/orders/${row.orderId}`}>Open</Link>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

function CollectorAssignForm({
  companyAccountId,
  initialValue,
}: {
  companyAccountId: string;
  initialValue: string;
}) {
  const [value, setValue] = useState(initialValue);
  const [pending, startTransition] = useTransition();

  return (
    <form
      className="flex items-center gap-1"
      onSubmit={(event) => {
        event.preventDefault();
        startTransition(async () => {
          await assignB2bArCollectorAction(companyAccountId, value);
        });
      }}
    >
      <Input
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder="Collector"
        className="h-7 w-28 rounded-full text-xs"
      />
      <Button type="submit" size="sm" variant="ghost" className="h-7 rounded-full px-2 text-xs" disabled={pending}>
        Save
      </Button>
    </form>
  );
}
