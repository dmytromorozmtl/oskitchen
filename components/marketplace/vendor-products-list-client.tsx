"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { PackageSearch } from "lucide-react";
import { toast } from "sonner";

import {
  bulkVendorProductStatusAction,
  submitVendorProductsForReviewAction,
} from "@/actions/vendor/products";
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
  MARKETPLACE_PRODUCT_STATUSES,
  type VendorProductFilters,
  vendorProductStatusLabel,
} from "@/lib/marketplace/vendor-product-filters";
import { MARKETPLACE_TOUCH_INPUT_CLASS } from "@/lib/marketplace/mobile-ui";
import { formatCurrency } from "@/lib/utils";
import type { VendorProductListItem } from "@/services/marketplace/vendor-products-service";

export function VendorProductsListClient({
  products,
  filters,
  total,
  canManage,
  highlightId,
}: {
  products: VendorProductListItem[];
  filters: VendorProductFilters;
  total: number;
  canManage: boolean;
  highlightId?: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [selected, setSelected] = useState<Record<string, boolean>>({});

  const selectedIds = Object.entries(selected)
    .filter(([, value]) => value)
    .map(([id]) => id);

  function runBulk(action: () => Promise<{ ok: boolean; error?: string; updated?: number }>) {
    startTransition(async () => {
      const result = await action();
      if (result.ok) {
        toast.success(`Updated ${result.updated ?? selectedIds.length} products`);
        setSelected({});
      } else toast.error(result.error ?? "Action failed");
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 rounded-2xl border border-border/80 bg-card/80 p-4 lg:flex-row lg:flex-wrap lg:items-center">
        <Input
          placeholder="Search name, SKU, GTIN…"
          defaultValue={filters.q ?? ""}
          className={`max-w-md rounded-full ${MARKETPLACE_TOUCH_INPUT_CLASS}`}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              const params = new URLSearchParams();
              if (event.currentTarget.value) params.set("q", event.currentTarget.value);
              if (filters.status) params.set("status", filters.status);
              router.push(`/vendor/products${params.toString() ? `?${params}` : ""}`);
            }
          }}
        />
        <Select
          value={filters.status ?? "all"}
          onValueChange={(value) => {
            const params = new URLSearchParams();
            if (filters.q) params.set("q", filters.q);
            if (value !== "all") params.set("status", value);
            router.push(`/vendor/products${params.toString() ? `?${params}` : ""}`);
          }}
        >
          <SelectTrigger className={`w-full rounded-full lg:w-[180px] ${MARKETPLACE_TOUCH_INPUT_CLASS}`}>
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {MARKETPLACE_PRODUCT_STATUSES.map((status) => (
              <SelectItem key={status} value={status}>
                {vendorProductStatusLabel(status)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Badge variant="outline" className="rounded-full">
          {total} products
        </Badge>
        {canManage ? (
          <Button asChild className="ml-auto rounded-full">
            <Link href="/vendor/products/new">New product</Link>
          </Button>
        ) : null}
      </div>

      {canManage && selectedIds.length > 0 ? (
        <div className="flex flex-wrap gap-2 rounded-xl border border-border/80 bg-muted/30 p-3">
          <span className="text-sm text-muted-foreground">{selectedIds.length} selected</span>
          <Button
            size="sm"
            variant="outline"
            className="rounded-full"
            disabled={pending}
            onClick={() => runBulk(() => submitVendorProductsForReviewAction(selectedIds))}
          >
            Submit for review
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="rounded-full"
            disabled={pending}
            onClick={() =>
              runBulk(() =>
                bulkVendorProductStatusAction({ productIds: selectedIds, status: "ARCHIVED" }),
              )
            }
          >
            Archive
          </Button>
        </div>
      ) : null}

      <MarketplaceResponsiveDataList
        rows={products}
        emptyState={{
          icon: PackageSearch,
          title: "No products match your filters",
          description: "Try a different search term or status filter, or create a new product.",
          primaryLabel: "Clear filters",
          primaryHref: "/vendor/products",
          secondaryLabel: canManage ? "New product" : undefined,
          secondaryHref: canManage ? "/vendor/products/new" : undefined,
        }}
        columns={[
          ...(canManage
            ? [
                {
                  key: "select",
                  header: "",
                  className: "w-10",
                  cell: (product: VendorProductListItem) => (
                    <Checkbox
                      checked={!!selected[product.id]}
                      onCheckedChange={(checked) =>
                        setSelected((prev) => ({ ...prev, [product.id]: checked === true }))
                      }
                    />
                  ),
                },
              ]
            : []),
          {
            key: "product",
            header: "Product",
            cell: (product) => (
              <div>
                <p className="font-medium">{product.name}</p>
                <p className="text-xs text-muted-foreground">{product.sku}</p>
              </div>
            ),
          },
          {
            key: "status",
            header: "Status",
            cell: (product) => (
              <Badge variant="outline" className="rounded-full">
                {vendorProductStatusLabel(product.status)}
              </Badge>
            ),
          },
          {
            key: "price",
            header: "Price",
            cell: (product) => formatCurrency(product.basePrice, product.currency as "USD"),
          },
          { key: "stock", header: "Stock", cell: (product) => product.stockQty },
          { key: "category", header: "Category", cell: (product) => product.categoryName },
          {
            key: "actions",
            header: "Actions",
            className: "text-right",
            cell: (product) => (
              <div className="flex justify-end gap-2">
                <Button asChild variant="outline" size="sm" className="rounded-full">
                  <Link href={`/vendor/products/${product.id}/edit`}>Edit</Link>
                </Button>
                <Button asChild variant="ghost" size="sm" className="rounded-full">
                  <Link href={`/dashboard/marketplace/products/${product.slug}`} target="_blank">
                    Preview
                  </Link>
                </Button>
              </div>
            ),
          },
        ]}
        renderMobileCard={(product) => (
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              {canManage ? (
                <Checkbox
                  checked={!!selected[product.id]}
                  onCheckedChange={(checked) =>
                    setSelected((prev) => ({ ...prev, [product.id]: checked === true }))
                  }
                  className="mt-1"
                />
              ) : null}
              <div className="flex flex-1 items-start justify-between gap-2">
                <div>
                  <p className="font-medium">{product.name}</p>
                  <p className="text-xs text-muted-foreground">{product.sku}</p>
                </div>
                <Badge variant="outline" className="rounded-full">
                  {vendorProductStatusLabel(product.status)}
                </Badge>
              </div>
            </div>
            <div className="flex flex-wrap justify-between gap-2 text-sm">
              <span>{formatCurrency(product.basePrice, product.currency as "USD")}</span>
              <span>Stock {product.stockQty}</span>
              <span className="text-muted-foreground">{product.categoryName}</span>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button asChild variant="outline" size="sm" className="rounded-full min-h-11 flex-1">
                <Link href={`/vendor/products/${product.id}/edit`}>Edit</Link>
              </Button>
              <Button asChild variant="ghost" size="sm" className="rounded-full min-h-11 flex-1">
                <Link href={`/dashboard/marketplace/products/${product.slug}`} target="_blank">
                  Preview
                </Link>
              </Button>
            </div>
          </div>
        )}
      />
    </div>
  );
}
