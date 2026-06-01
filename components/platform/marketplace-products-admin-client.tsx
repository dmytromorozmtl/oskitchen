"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Fragment, useState, useTransition } from "react";
import { toast } from "sonner";

import {
  bulkModeratePlatformProductsAction,
  moderatePlatformProductAction,
} from "@/actions/platform/marketplace-products";
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
  vendorProductStatusBadgeVariant,
  vendorProductStatusLabel,
} from "@/lib/marketplace/vendor-product-filters";
import {
  platformProductAdminFiltersToQuery,
  type PlatformProductAdminFilters,
} from "@/lib/platform/marketplace-product-admin-filters";
import type { PlatformProductListItem } from "@/services/marketplace/platform-product-moderation-service";

function formatMoney(amount: number, currency: string): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function MarketplaceProductsAdminClient({
  filters,
  result,
  categories,
  queueCount,
  flaggedCount,
  canModerate,
}: {
  filters: PlatformProductAdminFilters;
  result: {
    items: PlatformProductListItem[];
    total: number;
    page: number;
    totalPages: number;
  };
  categories: Array<{ id: string; name: string }>;
  queueCount: number;
  flaggedCount: number;
  canModerate: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [selected, setSelected] = useState<string[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  function navigate(next: Partial<PlatformProductAdminFilters>) {
    const merged = { ...filters, ...next };
    const query = platformProductAdminFiltersToQuery(merged);
    const qs = new URLSearchParams(query).toString();
    router.push(qs ? `/platform/marketplace/products?${qs}` : "/platform/marketplace/products");
  }

  function toggleProduct(productId: string, checked: boolean) {
    setSelected((prev) =>
      checked ? [...new Set([...prev, productId])] : prev.filter((id) => id !== productId),
    );
  }

  function toggleAll(checked: boolean) {
    setSelected(checked ? result.items.map((item) => item.id) : []);
  }

  function runModeration(
    productId: string,
    action: "approve" | "reject" | "request_changes" | "flag" | "unflag",
  ) {
    const notes =
      action === "reject" || action === "request_changes" || action === "flag"
        ? window.prompt(
            action === "flag"
              ? "Flag reason (optional):"
              : action === "request_changes"
                ? "Describe required changes:"
                : "Rejection notes (optional):",
          ) ?? undefined
        : undefined;

    startTransition(async () => {
      const response = await moderatePlatformProductAction({
        productId,
        action,
        notes,
        flagReason: notes,
      });
      if (response.ok) {
        toast.success(`Product ${action.replace("_", " ")}.`);
        setSelected((prev) => prev.filter((id) => id !== productId));
      } else {
        toast.error(response.error);
      }
    });
  }

  function runBulk(action: "approve" | "reject" | "flag") {
    if (selected.length === 0) return;
    const notes =
      action === "reject" || action === "flag"
        ? window.prompt(action === "flag" ? "Flag reason (optional):" : "Rejection notes (optional):") ??
          undefined
        : undefined;

    startTransition(async () => {
      const response = await bulkModeratePlatformProductsAction({
        productIds: selected,
        action,
        notes,
      });
      if (response.ok) {
        toast.success(`${response.updated} product(s) updated.`);
        setSelected([]);
      } else {
        toast.error(response.error);
      }
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <Button
          variant={filters.tab === "all" ? "default" : "outline"}
          size="sm"
          onClick={() => navigate({ tab: "all", page: 1, status: undefined })}
        >
          All products
        </Button>
        <Button
          variant={filters.tab === "queue" ? "default" : "outline"}
          size="sm"
          onClick={() => navigate({ tab: "queue", page: 1, status: undefined })}
        >
          New products queue
          {queueCount > 0 ? (
            <Badge variant="secondary" className="ml-2 rounded-full">
              {queueCount}
            </Badge>
          ) : null}
        </Button>
        <Button
          variant={filters.tab === "flagged" ? "default" : "outline"}
          size="sm"
          onClick={() => navigate({ tab: "flagged", page: 1, status: undefined })}
        >
          Flagged
          {flaggedCount > 0 ? (
            <Badge variant="destructive" className="ml-2 rounded-full">
              {flaggedCount}
            </Badge>
          ) : null}
        </Button>
      </div>

      <div className="grid gap-3 rounded-xl border border-zinc-800 bg-zinc-900/40 p-4 md:grid-cols-2 lg:grid-cols-4">
        <Input
          placeholder="Search name, SKU, GTIN, vendor…"
          defaultValue={filters.q ?? ""}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              navigate({ q: event.currentTarget.value.trim() || undefined, page: 1 });
            }
          }}
        />
        <Select
          value={filters.status ?? "all"}
          onValueChange={(value) =>
            navigate({
              status: value === "all" ? undefined : (value as PlatformProductAdminFilters["status"]),
              page: 1,
            })
          }
        >
          <SelectTrigger>
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
        <Select
          value={filters.categoryId ?? "all"}
          onValueChange={(value) =>
            navigate({ categoryId: value === "all" ? undefined : value, page: 1 })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category.id} value={category.id}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button variant="secondary" onClick={() => navigate({ page: 1 })}>
          Apply filters
        </Button>
      </div>

      {canModerate && selected.length > 0 ? (
        <div className="flex flex-wrap items-center gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-sm">
          <span className="text-amber-100">{selected.length} selected</span>
          <Button size="sm" disabled={pending} onClick={() => runBulk("approve")}>
            Bulk approve
          </Button>
          <Button size="sm" variant="destructive" disabled={pending} onClick={() => runBulk("reject")}>
            Bulk reject
          </Button>
          <Button size="sm" variant="outline" disabled={pending} onClick={() => runBulk("flag")}>
            Bulk flag
          </Button>
        </div>
      ) : null}

      <div className="overflow-x-auto rounded-lg border border-zinc-800">
        <table className="w-full min-w-[1100px] text-left text-sm text-zinc-200">
          <thead className="bg-zinc-900 text-xs uppercase text-zinc-500">
            <tr>
              {canModerate ? (
                <th className="px-3 py-2">
                  <Checkbox
                    checked={selected.length === result.items.length && result.items.length > 0}
                    onCheckedChange={(checked) => toggleAll(Boolean(checked))}
                    aria-label="Select all products"
                  />
                </th>
              ) : null}
              <th className="px-3 py-2">Product</th>
              <th className="px-3 py-2">Vendor</th>
              <th className="px-3 py-2">Category</th>
              <th className="px-3 py-2">Status</th>
              <th className="px-3 py-2">Price</th>
              <th className="px-3 py-2">Stock</th>
              <th className="px-3 py-2">Updated</th>
              <th className="px-3 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {result.items.length === 0 ? (
              <tr>
                <td colSpan={canModerate ? 9 : 8} className="px-3 py-8 text-center text-zinc-500">
                  No products match the current filters.
                </td>
              </tr>
            ) : (
              result.items.map((product) => (
                <Fragment key={product.id}>
                  <tr className="border-t border-zinc-800">
                    {canModerate ? (
                      <td className="px-3 py-2">
                        <Checkbox
                          checked={selected.includes(product.id)}
                          onCheckedChange={(checked) => toggleProduct(product.id, Boolean(checked))}
                          aria-label={`Select ${product.name}`}
                        />
                      </td>
                    ) : null}
                    <td className="px-3 py-2">
                      <button
                        type="button"
                        className="text-left"
                        onClick={() => setExpandedId(expandedId === product.id ? null : product.id)}
                      >
                        <p className="font-medium text-white">{product.name}</p>
                        <p className="text-xs text-zinc-500">
                          {product.sku}
                          {product.flagged ? (
                            <Badge variant="destructive" className="ml-2 rounded-full">
                              Flagged
                            </Badge>
                          ) : null}
                        </p>
                      </button>
                    </td>
                    <td className="px-3 py-2">
                      <Link
                        href={`/platform/marketplace/vendors/${product.vendorId}`}
                        className="hover:underline"
                      >
                        {product.vendorName}
                      </Link>
                    </td>
                    <td className="px-3 py-2">{product.categoryName}</td>
                    <td className="px-3 py-2">
                      <Badge variant={vendorProductStatusBadgeVariant(product.status)} className="rounded-full">
                        {vendorProductStatusLabel(product.status)}
                      </Badge>
                    </td>
                    <td className="px-3 py-2">{formatMoney(product.basePrice, product.currency)}</td>
                    <td className="px-3 py-2">{product.stockQty}</td>
                    <td className="px-3 py-2">{new Date(product.updatedAt).toLocaleDateString()}</td>
                    <td className="px-3 py-2">
                      <div className="flex flex-wrap gap-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setExpandedId(expandedId === product.id ? null : product.id)}
                        >
                          Detail
                        </Button>
                        <Button size="sm" variant="outline" asChild>
                          <Link href={`/dashboard/marketplace/products/${product.slug}`} target="_blank">
                            Preview
                          </Link>
                        </Button>
                        {canModerate && product.status === "PENDING_REVIEW" ? (
                          <>
                            <Button size="sm" disabled={pending} onClick={() => runModeration(product.id, "approve")}>
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="secondary"
                              disabled={pending}
                              onClick={() => runModeration(product.id, "request_changes")}
                            >
                              Changes
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              disabled={pending}
                              onClick={() => runModeration(product.id, "reject")}
                            >
                              Reject
                            </Button>
                          </>
                        ) : null}
                        {canModerate && product.flagged ? (
                          <Button size="sm" disabled={pending} onClick={() => runModeration(product.id, "unflag")}>
                            Unflag
                          </Button>
                        ) : canModerate ? (
                          <Button size="sm" variant="outline" disabled={pending} onClick={() => runModeration(product.id, "flag")}>
                            Flag
                          </Button>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                  {expandedId === product.id ? (
                    <tr className="border-t border-zinc-800 bg-zinc-950/40">
                      <td colSpan={canModerate ? 9 : 8} className="px-4 py-4">
                        <div className="grid gap-4 md:grid-cols-2">
                          <div>
                            <p className="text-xs uppercase tracking-wide text-zinc-500">Catalog slug</p>
                            <p className="font-mono text-sm text-zinc-300">{product.slug}</p>
                          </div>
                          <div>
                            <p className="text-xs uppercase tracking-wide text-zinc-500">Submitted / updated</p>
                            <p className="text-sm text-zinc-300">
                              Created {new Date(product.createdAt).toLocaleString()} · Updated{" "}
                              {new Date(product.updatedAt).toLocaleString()}
                            </p>
                          </div>
                          {product.flagReason ? (
                            <div className="md:col-span-2">
                              <p className="text-xs uppercase tracking-wide text-zinc-500">Flag reason</p>
                              <p className="text-sm text-amber-100">{product.flagReason}</p>
                            </div>
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  ) : null}
                </Fragment>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between text-sm text-zinc-400">
        <span>
          {result.total} product{result.total === 1 ? "" : "s"} · page {result.page} of {result.totalPages}
        </span>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={result.page <= 1}
            onClick={() => navigate({ page: result.page - 1 })}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={result.page >= result.totalPages}
            onClick={() => navigate({ page: result.page + 1 })}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
