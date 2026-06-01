"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

import { MarketplaceOrderStatusBadge } from "@/components/marketplace/marketplace-order-status-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import type { MarketplaceOrdersFilters } from "@/lib/marketplace/orders-filters";
import { marketplaceOrdersFiltersToQuery } from "@/lib/marketplace/orders-filters";
import { formatCurrency } from "@/lib/utils";
import type { MarketplaceOrderListItem } from "@/services/marketplace/marketplace-orders-service";

export function MarketplaceOrdersListClient({
  orders,
  filters,
  vendors,
  total,
}: {
  orders: MarketplaceOrderListItem[];
  filters: MarketplaceOrdersFilters;
  vendors: Array<{ id: string; companyName: string }>;
  total: number;
}) {
  const router = useRouter();
  const [, startTransition] = useTransition();

  function pushFilters(next: Partial<MarketplaceOrdersFilters>) {
    const merged = { ...filters, ...next, page: next.page ?? 1 };
    const query = marketplaceOrdersFiltersToQuery(merged);
    const qs = new URLSearchParams(query).toString();
    startTransition(() => {
      router.push(`/dashboard/marketplace/orders${qs ? `?${qs}` : ""}`);
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 rounded-2xl border border-border/80 bg-card/80 p-4 lg:flex-row lg:flex-wrap lg:items-center">
        <Input
          placeholder="Search PO, vendor, product…"
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
        <Select
          value={filters.vendorId ?? "all"}
          onValueChange={(value) =>
            pushFilters({ vendorId: value === "all" ? undefined : value })
          }
        >
          <SelectTrigger className="w-full rounded-full lg:w-[200px]">
            <SelectValue placeholder="Vendor" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All vendors</SelectItem>
            {vendors.map((vendor) => (
              <SelectItem key={vendor.id} value={vendor.id}>
                {vendor.companyName}
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

      <div className="overflow-hidden rounded-2xl border border-border/80 bg-card/80 shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>PO</TableHead>
              <TableHead>Vendor</TableHead>
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
                <TableCell className="font-medium">{order.poNumber ?? order.id.slice(0, 8)}</TableCell>
                <TableCell>{order.vendorName}</TableCell>
                <TableCell>
                  <MarketplaceOrderStatusBadge status={order.status} />
                </TableCell>
                <TableCell>{order.itemCount}</TableCell>
                <TableCell>
                  {formatCurrency(order.total, order.currency as "USD")}
                </TableCell>
                <TableCell>{new Date(order.createdAt).toLocaleDateString()}</TableCell>
                <TableCell className="text-right">
                  <Button asChild variant="outline" size="sm" className="rounded-full">
                    <Link href={`/dashboard/marketplace/orders/${order.id}`}>View</Link>
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
