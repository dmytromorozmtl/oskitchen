"use client";

import { getActionError } from "@/lib/action-result";

import Link from "next/link";
import { format, isSameDay, parseISO } from "date-fns";
import { ShoppingBag } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";

import { updateOrderStatus } from "@/actions/orders";
import { EmptyState } from "@/components/dashboard/empty-state";
import { BulkActionsBar } from "@/components/tables/bulk-actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
import { TableSkeletonRows } from "@/components/tables/table-skeleton";
import { SITE_URL } from "@/lib/constants";
import { orderStatusLabel, t } from "@/lib/i18n";
import { formatCurrency } from "@/lib/utils";

export type OrderRowDTO = {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string | null;
  total: string;
  status: string;
  fulfillmentType: "PICKUP" | "DELIVERY";
  pickupDate: string | null;
  createdAt: string;
  lookupToken: string | null;
};

const statuses = [
  "PENDING",
  "CONFIRMED",
  "PREPARING",
  "READY",
  "COMPLETED",
  "CANCELLED",
];

export function OrdersTable({
  orders,
  locale = "en",
  loading = false,
}: {
  orders: OrderRowDTO[];
  locale?: string;
  loading?: boolean;
}) {
  const [query, setQuery] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<string>("all");
  const [fulfillmentFilter, setFulfillmentFilter] = React.useState<string>("all");
  const [dateFilter, setDateFilter] = React.useState("");
  const [selected, setSelected] = React.useState<Record<string, boolean>>({});

  const filtered = React.useMemo(() => {
    return orders.filter((o) => {
      const hay = `${o.customerName} ${o.customerEmail} ${o.customerPhone ?? ""}`.toLowerCase();
      if (!hay.includes(query.toLowerCase())) return false;
      if (statusFilter !== "all" && o.status !== statusFilter) return false;
      if (
        fulfillmentFilter !== "all" &&
        o.fulfillmentType !== fulfillmentFilter
      )
        return false;
      if (dateFilter && o.pickupDate) {
        if (
          !isSameDay(parseISO(o.pickupDate), parseISO(`${dateFilter}T12:00:00`))
        )
          return false;
      } else if (dateFilter && !o.pickupDate) return false;
      return true;
    });
  }, [orders, query, statusFilter, fulfillmentFilter, dateFilter]);

  const selectedIds = Object.entries(selected)
    .filter(([, v]) => v)
    .map(([id]) => id);

  function toggleAll(checked: boolean) {
    const next: Record<string, boolean> = {};
    if (checked) filtered.forEach((o) => { next[o.id] = true; });
    setSelected(next);
  }

  async function bulkMarkConfirmed() {
    if (!selectedIds.length) return;
    for (const id of selectedIds) {
      const res = await updateOrderStatus(id, "CONFIRMED");
      const _err = getActionError(res); if (_err) { toast.error(_err);
        return;
      }
    }
    toast.success(`Updated ${selectedIds.length} orders`);
    setSelected({});
    window.location.reload();
  }

  function bulkExportCsv() {
    if (!selectedIds.length) return;
    const rows = filtered.filter((o) => selectedIds.includes(o.id));
    const header = "id,customer,email,total,status\n";
    const body = rows
      .map((o) => `${o.id},"${o.customerName}",${o.customerEmail},${o.total},${o.status}`)
      .join("\n");
    const blob = new Blob([header + body], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "orders-export.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">
            {t(locale as never, "nav.orders")}
          </h1>
          <p className="mt-2 text-muted-foreground">
            Filter by guest, status, fulfillment, or service date.
          </p>
        </div>
        <Button className="rounded-full" variant="premium" asChild>
          <Link href="/dashboard/orders/new">New order</Link>
        </Button>
      </div>

      {orders.length === 0 ? (
        <EmptyState
          icon={ShoppingBag}
          title="No orders yet"
          description="Orders from POS, manual entry, storefront, imports, and connected channels appear here."
          primaryLabel="Create order"
          primaryHref="/dashboard/orders/new"
          secondaryLabel="Open Order hub"
          secondaryHref="/dashboard/order-hub"
          demoHref="/dashboard/demo/scenarios"
          demoLabel="Load demo orders"
          helpLabel="Open POS Terminal"
          helpHref="/dashboard/pos"
        />
      ) : (
        <>
          <div className="flex flex-col gap-3 rounded-2xl border border-border/80 bg-card/80 p-4 shadow-sm lg:flex-row lg:flex-wrap lg:items-center">
            <Input
              placeholder="Search name, email, phone..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="max-w-md rounded-full"
            />
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full rounded-full lg:w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                {statuses.map((s) => (
                  <SelectItem key={s} value={s}>
                    {orderStatusLabel(locale, s)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={fulfillmentFilter} onValueChange={setFulfillmentFilter}>
              <SelectTrigger className="w-full rounded-full lg:w-[180px]">
                <SelectValue placeholder="Fulfillment" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All fulfillment</SelectItem>
                <SelectItem value="PICKUP">{t(locale as never, "fulfillment.pickup")}</SelectItem>
                <SelectItem value="DELIVERY">
                  {t(locale as never, "fulfillment.delivery")}
                </SelectItem>
              </SelectContent>
            </Select>
            <Input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-full rounded-full lg:w-[200px]"
            />
          </div>

          <BulkActionsBar
            selectedCount={selectedIds.length}
            totalCount={filtered.length}
            onToggleAll={toggleAll}
            onBulkStatus={bulkMarkConfirmed}
            onBulkExport={bulkExportCsv}
            statusLabel="Mark confirmed"
          />

          <div className="rounded-2xl border border-border/80 bg-card/90 shadow-sm">
            <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10">
                <Checkbox
                  checked={selectedIds.length > 0 && selectedIds.length === filtered.length}
                  onCheckedChange={(v) => toggleAll(Boolean(v))}
                  aria-label="Select all orders"
                />
              </TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Fulfillment</TableHead>
              <TableHead>Lookup</TableHead>
              <TableHead>Created</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableSkeletonRows columns={7} rows={10} />
            ) : null}
            {!loading &&
            filtered.map((o) => (
              <TableRow key={o.id}>
                <TableCell>
                  <Checkbox
                    checked={Boolean(selected[o.id])}
                    onCheckedChange={(v) =>
                      setSelected((prev) => ({ ...prev, [o.id]: Boolean(v) }))
                    }
                    aria-label={`Select order ${o.customerName}`}
                  />
                </TableCell>
                <TableCell>
                  <Link
                    href={`/dashboard/orders/${o.id}`}
                    className="font-medium text-foreground hover:underline"
                  >
                    {o.customerName}
                  </Link>
                  <div className="text-xs text-muted-foreground">{o.customerEmail}</div>
                  {o.customerPhone && (
                    <div className="text-xs text-muted-foreground">{o.customerPhone}</div>
                  )}
                </TableCell>
                <TableCell>{formatCurrency(Number(o.total))}</TableCell>
                <TableCell className="min-w-[160px]">
                  <Select
                    defaultValue={o.status}
                    onValueChange={async (value) => {
                      const res = await updateOrderStatus(o.id, value);
                      const _err = getActionError(res); if (_err) toast.error(_err);
                      else toast.success("Status updated");
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {statuses.map((s) => (
                        <SelectItem key={s} value={s}>
                          {orderStatusLabel(locale, s)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {o.pickupDate ? format(parseISO(o.pickupDate), "MMM d") : "—"}
                  {o.fulfillmentType === "DELIVERY" ? (
                    <Badge variant="outline" className="ml-2 text-[10px]">
                      {t(locale as never, "fulfillment.delivery")}
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="ml-2 text-[10px]">
                      {t(locale as never, "fulfillment.pickup")}
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="text-xs">
                  {o.lookupToken ? (
                    <a
                      className="text-primary hover:underline"
                      href={`${SITE_URL}/order/${o.lookupToken}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Open
                    </a>
                  ) : (
                    "—"
                  )}
                </TableCell>
                <TableCell className="text-xs text-muted-foreground">
                  {format(parseISO(o.createdAt), "MMM d, p")}
                </TableCell>
              </TableRow>
            ))}
              {!loading && !filtered.length && (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="py-14 text-center text-sm text-muted-foreground"
                  >
                    No orders match these filters.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        </>
      )}
    </div>
  );
}
