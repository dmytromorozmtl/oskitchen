import Link from "next/link";
import { AlertTriangle } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { B2bArAgingRow } from "@/lib/integrations/shopify-b2b-ar-aging-metadata";
import { formatCurrency } from "@/lib/utils";

export function CustomerB2bArOverdueSummary({
  rows,
  customerType,
}: {
  rows: B2bArAgingRow[];
  customerType: string;
}) {
  if (customerType !== "OFFICE_CLIENT" || rows.length === 0) return null;

  const overdue = rows.filter((row) => row.bucket !== "current");
  if (overdue.length === 0) return null;

  const openTotal = overdue.reduce((sum, row) => sum + row.openAmountCents, 0);
  const critical = overdue.filter((row) => row.bucket === "days_61_plus").length;

  return (
    <Card
      className={
        critical > 0
          ? "border-amber-500/40 bg-amber-500/5 shadow-sm"
          : "border-sky-500/30 bg-sky-500/5 shadow-sm"
      }
      data-testid="customer-b2b-ar-overdue-summary"
    >
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <AlertTriangle className="size-4 shrink-0" aria-hidden />
          B2B open receivables
        </CardTitle>
        <CardDescription>
          Overdue Shopify B2B net-terms invoices linked to this office client contact.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline" className="rounded-full text-[10px] tabular-nums">
            {overdue.length} overdue · {formatCurrency(openTotal / 100)} open
          </Badge>
          {critical > 0 ? (
            <Badge variant="destructive" className="rounded-full text-[10px]">
              {critical} critical (61+ days)
            </Badge>
          ) : null}
        </div>
        <ul className="space-y-2 text-xs">
          {overdue.slice(0, 5).map((row) => (
            <li key={row.orderId} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border/60 px-3 py-2">
              <div>
                <p className="font-mono font-medium">{row.invoiceNumber}</p>
                <p className="text-muted-foreground">
                  {row.daysPastDue}d past due · {formatCurrency(row.openAmountCents / 100)} open
                  {row.poNumber ? ` · PO#${row.poNumber}` : ""}
                </p>
              </div>
              <Link
                href={`/dashboard/orders/${row.orderId}`}
                className="shrink-0 text-primary underline-offset-2 hover:underline"
              >
                Open order
              </Link>
            </li>
          ))}
        </ul>
        <p className="text-xs text-muted-foreground">
          Manage collections from{" "}
          <Link href="/dashboard/order-hub" className="text-primary underline-offset-2 hover:underline">
            Order Hub
          </Link>
          .
        </p>
      </CardContent>
    </Card>
  );
}
