"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

import { MarketplaceEmptyState } from "@/components/marketplace/marketplace-empty-state";
import { MarketplaceOrderStatusBadge } from "@/components/marketplace/marketplace-order-status-badge";
import { getMarketplaceEmptyStateDefinition } from "@/lib/marketplace/marketplace-empty-states-policy";
import { MarketplaceResponsiveDataList } from "@/components/marketplace/marketplace-responsive-data-list";
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
  MARKETPLACE_PO_STATUSES,
  marketplaceOrderStatusLabel,
} from "@/lib/marketplace/order-status";
import type { MarketplaceOrdersFilters } from "@/lib/marketplace/orders-filters";
import { marketplaceOrdersFiltersToQuery } from "@/lib/marketplace/orders-filters";
import { MARKETPLACE_TOUCH_INPUT_CLASS } from "@/lib/marketplace/mobile-ui";
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

  const ordersFilteredEmpty = getMarketplaceEmptyStateDefinition("orders_filtered");

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 rounded-2xl border border-border/80 bg-card/80 p-4 lg:flex-row lg:flex-wrap lg:items-center">
        <Input
          placeholder="Search PO, vendor, product…"
          defaultValue={filters.q ?? ""}
          className={`max-w-md rounded-full ${MARKETPLACE_TOUCH_INPUT_CLASS}`}
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
          <SelectTrigger className={`w-full rounded-full lg:w-[180px] ${MARKETPLACE_TOUCH_INPUT_CLASS}`}>
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
          <SelectTrigger className={`w-full rounded-full lg:w-[200px] ${MARKETPLACE_TOUCH_INPUT_CLASS}`}>
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
          className={`w-full rounded-full lg:w-[160px] ${MARKETPLACE_TOUCH_INPUT_CLASS}`}
          onChange={(event) => pushFilters({ dateFrom: event.target.value || undefined })}
        />
        <Input
          type="date"
          defaultValue={filters.dateTo ?? ""}
          className={`w-full rounded-full lg:w-[160px] ${MARKETPLACE_TOUCH_INPUT_CLASS}`}
          onChange={(event) => pushFilters({ dateTo: event.target.value || undefined })}
        />
        <Badge variant="outline" className="rounded-full">
          {total} orders
        </Badge>
      </div>

      <MarketplaceResponsiveDataList
        rows={orders}
        emptyState={{
          icon: ordersFilteredEmpty.icon,
          title: ordersFilteredEmpty.title,
          description: ordersFilteredEmpty.description,
          primaryLabel: ordersFilteredEmpty.primaryLabel,
          primaryHref: ordersFilteredEmpty.primaryHref,
          secondaryLabel: ordersFilteredEmpty.secondaryLabel,
          secondaryHref: ordersFilteredEmpty.secondaryHref,
        }}
        columns={[
          {
            key: "po",
            header: "PO",
            cell: (order) => order.poNumber ?? order.id.slice(0, 8),
          },
          {
            key: "vendor",
            header: "Vendor",
            cell: (order) => order.vendorName,
          },
          {
            key: "status",
            header: "Status",
            cell: (order) => <MarketplaceOrderStatusBadge status={order.status} />,
          },
          {
            key: "items",
            header: "Items",
            cell: (order) => order.itemCount,
          },
          {
            key: "total",
            header: "Total",
            cell: (order) => formatCurrency(order.total, order.currency as "USD"),
          },
          {
            key: "placed",
            header: "Placed",
            cell: (order) => new Date(order.createdAt).toLocaleDateString(),
          },
          {
            key: "actions",
            header: "Actions",
            className: "text-right",
            cell: (order) => (
              <Button asChild variant="outline" size="sm" className="rounded-full">
                <Link href={`/dashboard/marketplace/orders/${order.id}`}>View</Link>
              </Button>
            ),
          },
        ]}
        renderMobileCard={(order) => (
          <div className="space-y-3">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-medium">{order.poNumber ?? order.id.slice(0, 8)}</p>
                <p className="text-sm text-muted-foreground">{order.vendorName}</p>
              </div>
              <MarketplaceOrderStatusBadge status={order.status} />
            </div>
            <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
              <span>{order.itemCount} items</span>
              <span className="font-semibold">
                {formatCurrency(order.total, order.currency as "USD")}
              </span>
            </div>
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs text-muted-foreground">
                {new Date(order.createdAt).toLocaleDateString()}
              </span>
              <Button asChild variant="outline" size="sm" className="rounded-full min-h-11">
                <Link href={`/dashboard/marketplace/orders/${order.id}`}>View</Link>
              </Button>
            </div>
          </div>
        )}
      />

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
