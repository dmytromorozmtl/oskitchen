"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import { bulkConfirmVendorOrdersAction } from "@/actions/vendor/orders";
import { MarketplaceOrderStatusBadge } from "@/components/marketplace/marketplace-order-status-badge";
import { MarketplaceResponsiveDataList } from "@/components/marketplace/marketplace-responsive-data-list";
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
  MARKETPLACE_PO_STATUSES,
  marketplaceOrderStatusLabel,
} from "@/lib/marketplace/order-status";
import type { VendorOrdersFilters } from "@/lib/marketplace/vendor-orders-filters";
import { vendorOrdersFiltersToQuery } from "@/lib/marketplace/vendor-orders-filters";
import { MARKETPLACE_TOUCH_INPUT_CLASS } from "@/lib/marketplace/mobile-ui";
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

      <MarketplaceResponsiveDataList
        rows={orders}
        emptyMessage="No vendor orders match your filters."
        columns={[
          ...(canManage
            ? [
                {
                  key: "select",
                  header: "",
                  className: "w-10",
                  cell: (order: VendorOrderListItem) => (
                    <Checkbox
                      checked={!!selected[order.id]}
                      onCheckedChange={(checked) =>
                        setSelected((prev) => ({ ...prev, [order.id]: checked === true }))
                      }
                    />
                  ),
                },
              ]
            : []),
          {
            key: "po",
            header: "PO",
            cell: (order) => order.poNumber ?? order.id.slice(0, 8),
          },
          {
            key: "buyer",
            header: "Buyer",
            cell: (order) => order.buyerWorkspaceName,
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
                <Link href={`/vendor/orders/${order.id}`}>Manage</Link>
              </Button>
            ),
          },
        ]}
        renderMobileCard={(order) => (
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              {canManage ? (
                <Checkbox
                  checked={!!selected[order.id]}
                  onCheckedChange={(checked) =>
                    setSelected((prev) => ({ ...prev, [order.id]: checked === true }))
                  }
                  className="mt-1"
                />
              ) : null}
              <div className="flex flex-1 items-start justify-between gap-2">
                <div>
                  <p className="font-medium">{order.poNumber ?? order.id.slice(0, 8)}</p>
                  <p className="text-sm text-muted-foreground">{order.buyerWorkspaceName}</p>
                </div>
                <MarketplaceOrderStatusBadge status={order.status} />
              </div>
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
                <Link href={`/vendor/orders/${order.id}`}>Manage</Link>
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
