"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import { bulkConfirmVendorOrdersAction } from "@/actions/vendor/orders";
import { MarketplaceOrderStatusBadge } from "@/components/marketplace/marketplace-order-status-badge";
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
import {
  MARKETPLACE_PO_STATUSES,
  marketplaceOrderStatusLabel,
} from "@/lib/marketplace/order-status";
import type { VendorOrdersFilters } from "@/lib/marketplace/vendor-orders-filters";
import { vendorOrdersFiltersToQuery } from "@/lib/marketplace/vendor-orders-filters";
import { formatCurrency } from "@/lib/utils";
import type { VendorOrderListItem } from "@/services/marketplace/vendor-orders-service";

export function VendorOrdersListClient({
  orders,
  filters,
  total,
  canManage,
}: {
  orders: VendorOrderListItem[];
  filters: VendorOrdersFilters;
  total: number;
  canManage: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [selected, setSelected] = useState<Record<string, boolean>>({});

  const selectedIds = Object.entries(selected)
    .filter(([, value]) => value)
    .map(([id]) => id);

  function pushFilters(next: Partial<VendorOrdersFilters>) {
    const merged = { ...filters, ...next, page: next.page ?? 1 };
    const query = vendorOrdersFiltersToQuery(merged);
    const qs = new URLSearchParams(query).toString();
    startTransition(() => {
      router.push(`/vendor/orders${qs ? `?${qs}` : ""}`);
    });
  }

  function runBulkConfirm() {
    startTransition(async () => {
      const result = await bulkConfirmVendorOrdersAction(selectedIds);
      if (result.ok) {
        toast.success(`Confirmed ${result.updated} orders`);
        setSelected({});
      } else {
        toast.error(result.error ?? "Bulk confirm failed");
      }
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 rounded-2xl border border-border/80 bg-card/80 p-4 lg:flex-row lg:flex-wrap lg:items-center">
        <Input
          placeholder="Search PO, buyer, SKU…"
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
            {MARKETPLACE_PO_STATUSES.filter((status) => status !== "DRAFT").map((status) => (
              <SelectItem key={status} value={status}>
                {marketplaceOrderStatusLabel(status)}
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
          {total} orders
        </Badge>
      </div>

      {canManage && selectedIds.length > 0 ? (
        <div className="flex flex-wrap gap-2 rounded-xl border border-border/80 bg-muted/30 p-3">
          <span className="text-sm text-muted-foreground">{selectedIds.length} selected</span>
          <Button
            size="sm"
            variant="outline"
            className="rounded-full"
            disabled={pending}
            onClick={runBulkConfirm}
          >
            Confirm selected
          </Button>
        </div>
      ) : null}

      <div className="overflow-hidden rounded-2xl border border-border/80 bg-card/80 shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              {canManage ? <TableHead className="w-10" /> : null}
              <TableHead>PO</TableHead>
              <TableHead>Buyer</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Items</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Placed</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order) => (
              <TableRow key={order.id}>
                {canManage ? (
                  <TableCell>
                    <Checkbox
                      checked={!!selected[order.id]}
                      onCheckedChange={(checked) =>
                        setSelected((prev) => ({ ...prev, [order.id]: checked === true }))
                      }
                    />
                  </TableCell>
                ) : null}
                <TableCell className="font-medium">{order.poNumber ?? order.id.slice(0, 8)}</TableCell>
                <TableCell>{order.buyerWorkspaceName}</TableCell>
                <TableCell>
                  <MarketplaceOrderStatusBadge status={order.status} />
                </TableCell>
                <TableCell>{order.itemCount}</TableCell>
                <TableCell>{formatCurrency(order.total, order.currency as "USD")}</TableCell>
                <TableCell>{new Date(order.createdAt).toLocaleDateString()}</TableCell>
                <TableCell className="text-right">
                  <Button asChild variant="outline" size="sm" className="rounded-full">
                    <Link href={`/vendor/orders/${order.id}`}>Manage</Link>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {filters.page > 1 ? (
        <div className="flex justify-center">
          <Button
            variant="outline"
            className="rounded-full"
            onClick={() => pushFilters({ page: filters.page - 1 })}
          >
            Previous page
          </Button>
        </div>
      ) : null}
    </div>
  );
}
