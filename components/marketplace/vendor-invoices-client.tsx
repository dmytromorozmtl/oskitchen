import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { VendorInvoicesModel } from "@/lib/marketplace/vendor-portal-types";
import { formatCurrency } from "@/lib/utils";

type Props = {
  model: VendorInvoicesModel;
};

function statusLabel(status: string): string {
  return status.toLowerCase().replace(/_/g, " ");
}

export function VendorInvoicesClient({ model }: Props) {
  return (
    <div className="space-y-6" data-testid="vendor-invoices-panel">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Outstanding</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold tabular-nums">
              {formatCurrency(model.outstandingAmount, model.currency)}
            </p>
            <p className="text-xs text-muted-foreground">
              {model.pendingCount + model.availableCount} open invoices
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Paid out</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold tabular-nums">
              {formatCurrency(model.paidOutAmount, model.currency)}
            </p>
            <p className="text-xs text-muted-foreground">{model.paidCount} settled invoices</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold tabular-nums">{model.pendingCount}</p>
            <p className="text-xs text-muted-foreground">Awaiting delivery confirmation</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Available</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold tabular-nums">{model.availableCount}</p>
            <p className="text-xs text-muted-foreground">Ready for payout request</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border/80 shadow-sm">
        <CardHeader>
          <CardTitle>Invoice ledger</CardTitle>
          <CardDescription>
            Commission invoices generated from marketplace purchase orders — gross, net, and payout status.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {model.invoices.length === 0 ? (
            <p className="rounded-xl border border-dashed border-border/80 px-4 py-8 text-sm text-muted-foreground">
              No invoices yet. Completed buyer orders create invoice lines automatically.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice</TableHead>
                  <TableHead>Buyer</TableHead>
                  <TableHead>Gross</TableHead>
                  <TableHead>Net</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">PO</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {model.invoices.map((invoice) => (
                  <TableRow key={invoice.id}>
                    <TableCell className="font-medium">{invoice.invoiceNumber}</TableCell>
                    <TableCell>{invoice.buyerName}</TableCell>
                    <TableCell className="tabular-nums">
                      {formatCurrency(invoice.grossAmount, invoice.currency)}
                    </TableCell>
                    <TableCell className="tabular-nums">
                      {formatCurrency(invoice.netAmount, invoice.currency)}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="rounded-full capitalize">
                        {statusLabel(invoice.status)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Link href={invoice.href} className="text-sm text-primary hover:underline">
                        View order
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
