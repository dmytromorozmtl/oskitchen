"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";
import { Download, Wallet } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { requestVendorPayoutAction } from "@/actions/vendor/finance";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { VendorFinanceFilters } from "@/lib/marketplace/vendor-finance-filters";
import { vendorFinanceFiltersToQuery } from "@/lib/marketplace/vendor-finance-filters";
import { formatCurrency } from "@/lib/utils";
import type { VendorFinanceModel } from "@/services/marketplace/vendor-finance-service";

const STATUS_LABELS = {
  PENDING: "Pending",
  AVAILABLE: "Available",
  PAID_OUT: "Paid out",
} as const;

export function VendorFinanceClient({
  model,
  filters,
  canRequestPayout,
}: {
  model: VendorFinanceModel;
  filters: VendorFinanceFilters;
  canRequestPayout: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const taxYear = new Date().getFullYear();

  function pushFilters(next: Partial<VendorFinanceFilters>) {
    const merged = { ...filters, ...next, page: next.page ?? 1 };
    const query = vendorFinanceFiltersToQuery(merged);
    const qs = new URLSearchParams(query).toString();
    startTransition(() => {
      router.push(`/vendor/finance${qs ? `?${qs}` : ""}`);
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button variant="outline" size="sm" className="rounded-full" asChild>
          <Link href="/vendor/finance/instant-payouts">Instant payouts (beta)</Link>
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <BalanceCard
          label="Available balance"
          value={formatCurrency(model.balanceAvailable, "USD")}
          hint="Ready for payout"
        />
        <BalanceCard
          label="Pending balance"
          value={formatCurrency(model.balancePending, "USD")}
          hint="Awaiting order completion"
        />
        <BalanceCard
          label="Paid out (lifetime)"
          value={formatCurrency(model.balancePaidOut, "USD")}
          hint={`Commission rate ${model.commissionRate}%`}
        />
      </div>

      <div className="flex flex-wrap gap-2">
        {canRequestPayout ? (
          <Button
            className="rounded-full"
            disabled={pending || model.balanceAvailable <= 0}
            onClick={() =>
              startTransition(async () => {
                const result = await requestVendorPayoutAction();
                if (result.ok) {
                  toast.success(
                    `Payout ${result.payoutId} initiated · ${formatCurrency(result.amount, "USD")}`,
                  );
                } else {
                  toast.error(result.error ?? "Payout request failed");
                }
              })
            }
          >
            <Wallet className="mr-2 h-4 w-4" />
            Request payout
          </Button>
        ) : null}
        <Button asChild variant="outline" className="rounded-full">
          <a
            href={`/api/vendor/finance/tax-1099?year=${taxYear}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Download className="mr-2 h-4 w-4" />
            1099-K summary ({taxYear})
          </a>
        </Button>
      </div>

      <Card className="border-border/80 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Revenue & commission (30d)</CardTitle>
          <CardDescription>Gross marketplace payments vs platform commission and net earnings.</CardDescription>
        </CardHeader>
        <CardContent className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={model.revenueTrend}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border/60" />
              <XAxis dataKey="label" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Legend />
              <Bar dataKey="gross" name="Gross" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              <Bar dataKey="commission" name="Commission" fill="hsl(var(--muted-foreground))" radius={[4, 4, 0, 0]} />
              <Bar dataKey="net" name="Net" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="border-border/80 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Transactions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:flex-wrap lg:items-center">
            <Input
              placeholder="Search PO or buyer…"
              defaultValue={filters.q ?? ""}
              className="max-w-md rounded-full"
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  pushFilters({ q: event.currentTarget.value || undefined });
                }
              }}
            />
            <Select
              value={filters.status ?? "all"}
              onValueChange={(value) =>
                pushFilters({ status: value === "all" ? undefined : (value as typeof filters.status) })
              }
            >
              <SelectTrigger className="w-full rounded-full lg:w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                {(["PENDING", "AVAILABLE", "PAID_OUT"] as const).map((status) => (
                  <SelectItem key={status} value={status}>
                    {STATUS_LABELS[status]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              type="date"
              defaultValue={filters.dateFrom ?? ""}
              className="w-full rounded-full lg:w-[160px]"
              onChange={(event) => pushFilters({ dateFrom: event.target.value || undefined })}
            />
            <Input
              type="date"
              defaultValue={filters.dateTo ?? ""}
              className="w-full rounded-full lg:w-[160px]"
              onChange={(event) => pushFilters({ dateTo: event.target.value || undefined })}
            />
            <Badge variant="outline" className="rounded-full">
              {model.totalTransactions} transactions
            </Badge>
          </div>

          <div className="overflow-hidden rounded-2xl border border-border/80">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>PO</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Gross</TableHead>
                  <TableHead>Commission</TableHead>
                  <TableHead>Net</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Order</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {model.transactions.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell className="font-medium">
                      {row.poNumber ?? row.purchaseOrderId.slice(0, 8)}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="rounded-full">
                        {STATUS_LABELS[row.status]}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatCurrency(row.grossAmount, "USD")}</TableCell>
                    <TableCell>{formatCurrency(row.commissionAmount, "USD")}</TableCell>
                    <TableCell>{formatCurrency(row.netAmount, "USD")}</TableCell>
                    <TableCell>{new Date(row.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">
                      <Button asChild variant="ghost" size="sm" className="rounded-full">
                        <Link href={`/vendor/orders/${row.purchaseOrderId}`}>View</Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/80 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Payout history</CardTitle>
          <CardDescription>Recent transfers to your connected payout account.</CardDescription>
        </CardHeader>
        <CardContent>
          {model.payoutHistory.length === 0 ? (
            <p className="text-sm text-muted-foreground">No payouts yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Payout ID</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Orders</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {model.payoutHistory.map((payout) => (
                  <TableRow key={payout.payoutId}>
                    <TableCell className="font-mono text-xs">{payout.payoutId}</TableCell>
                    <TableCell>{formatCurrency(payout.amount, "USD")}</TableCell>
                    <TableCell>{payout.transactionCount}</TableCell>
                    <TableCell>{new Date(payout.paidAt).toLocaleDateString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Card className="border-border/80 bg-muted/20 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Tax documents</CardTitle>
          <CardDescription>
            {taxYear} gross {formatCurrency(model.taxYearGross, "USD")} · net{" "}
            {formatCurrency(model.taxYearNet, "USD")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild variant="outline" className="rounded-full">
            <a href={`/api/vendor/finance/tax-1099?year=${taxYear}`} target="_blank" rel="noopener noreferrer">
              Download 1099-K summary
            </a>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

function BalanceCard({ label, value, hint }: { label: string; value: string; hint: string }) {
  return (
    <Card className="border-border/80 shadow-sm">
      <CardHeader className="pb-2">
        <CardDescription>{label}</CardDescription>
        <CardTitle className="text-2xl">{value}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-xs text-muted-foreground">{hint}</p>
      </CardContent>
    </Card>
  );
}
