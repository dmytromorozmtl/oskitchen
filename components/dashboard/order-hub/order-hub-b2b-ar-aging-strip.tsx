import Link from "next/link";
import { AlertTriangle, Clock3 } from "lucide-react";

import { OrderB2bInvoiceMarkPaidButton } from "@/components/orders/order-b2b-invoice-mark-paid-button";
import { OrderB2bInvoiceSendReminderButton } from "@/components/orders/order-b2b-invoice-send-reminder-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { B2bArAgingSnapshot } from "@/lib/integrations/shopify-b2b-ar-aging-metadata";
import { formatCurrency } from "@/lib/utils";

export function OrderHubB2bArAgingStrip({
  snapshot,
  ordersById,
}: {
  snapshot: B2bArAgingSnapshot | null;
  ordersById: Map<
    string,
    { sourceMetadataJson: unknown; paymentStatus: string | null }
  >;
}) {
  if (!snapshot || snapshot.openTotal === 0) return null;

  const overdueRows = snapshot.rows.filter((row) => row.bucket !== "current").slice(0, 8);
  const critical = snapshot.buckets.days_61_plus > 0;

  return (
    <Card
      className={
        critical
          ? "border-amber-500/40 bg-amber-500/5 shadow-sm"
          : "border-sky-500/30 bg-sky-500/5 shadow-sm"
      }
      data-testid="order-hub-b2b-ar-aging-strip"
    >
      <CardHeader className="pb-2">
        <CardTitle className="flex flex-wrap items-center gap-2 text-lg">
          {critical ? (
            <AlertTriangle className="size-5 text-amber-700 dark:text-amber-300" aria-hidden />
          ) : (
            <Clock3 className="size-5 text-sky-700 dark:text-sky-300" aria-hidden />
          )}
          B2B receivables aging
          {critical ? (
            <Badge variant="destructive" className="rounded-full text-[10px]">
              {snapshot.buckets.days_61_plus} critical (61+ days)
            </Badge>
          ) : null}
        </CardTitle>
        <CardDescription className="max-w-3xl">
          Open Shopify B2B net-terms invoices bucketed by days past due. Send manual reminders or mark
          paid when payment is collected.
        </CardDescription>
        <div className="flex flex-wrap gap-2 pt-1">
          <Badge variant="outline" className="rounded-full text-[10px] tabular-nums">
            Open {snapshot.openTotal} · {formatCurrency(snapshot.openAmountCents / 100)}
          </Badge>
          <Badge variant="outline" className="rounded-full text-[10px] tabular-nums">
            0–30d {snapshot.buckets.days_0_30}
          </Badge>
          <Badge variant="outline" className="rounded-full text-[10px] tabular-nums">
            31–60d {snapshot.buckets.days_31_60}
          </Badge>
          <Badge
            variant={snapshot.buckets.days_61_plus > 0 ? "destructive" : "outline"}
            className="rounded-full text-[10px] tabular-nums"
          >
            61+d {snapshot.buckets.days_61_plus}
          </Badge>
        </div>
      </CardHeader>
      {overdueRows.length > 0 ? (
        <CardContent className="overflow-x-auto pt-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Past due</TableHead>
                <TableHead className="text-right">Open</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {overdueRows.map((row) => {
                const order = ordersById.get(row.orderId);
                return (
                  <TableRow key={row.orderId}>
                    <TableCell className="font-mono text-xs">{row.invoiceNumber}</TableCell>
                    <TableCell className="text-xs">{row.companyName ?? "—"}</TableCell>
                    <TableCell className="text-xs tabular-nums">{row.daysPastDue}d</TableCell>
                    <TableCell className="text-right text-xs tabular-nums">
                      {formatCurrency(row.openAmountCents / 100)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex flex-wrap items-center justify-end gap-1">
                        {order ? (
                          <>
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
      ) : (
        <CardContent className="pt-0 text-xs text-muted-foreground">
          All open B2B invoices are current — none past due yet.
        </CardContent>
      )}
    </Card>
  );
}
