"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import {
  bulkVendorProductStatusAction,
  submitVendorProductsForReviewAction,
} from "@/actions/vendor/products";
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
  MARKETPLACE_PRODUCT_STATUSES,
  type VendorProductFilters,
  vendorProductStatusLabel,
} from "@/lib/marketplace/vendor-product-filters";
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
          className="max-w-md rounded-full"
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
          <SelectTrigger className="w-full rounded-full lg:w-[180px]">
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

      <div className="overflow-hidden rounded-2xl border border-border/80 bg-card/80 shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              {canManage ? <TableHead className="w-10" /> : null}
              <TableHead>Product</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead>Category</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product) => (
              <TableRow
                key={product.id}
                className={highlightId === product.id ? "bg-amber-500/10" : undefined}
              >
                {canManage ? (
                  <TableCell>
                    <Checkbox
                      checked={!!selected[product.id]}
                      onCheckedChange={(checked) =>
                        setSelected((prev) => ({ ...prev, [product.id]: checked === true }))
                      }
                    />
                  </TableCell>
                ) : null}
                <TableCell>
                  <p className="font-medium">{product.name}</p>
                  <p className="text-xs text-muted-foreground">{product.sku}</p>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="rounded-full">
                    {vendorProductStatusLabel(product.status)}
                  </Badge>
                </TableCell>
                <TableCell>{formatCurrency(product.basePrice, product.currency as "USD")}</TableCell>
                <TableCell>{product.stockQty}</TableCell>
                <TableCell className="text-sm">{product.categoryName}</TableCell>
                <TableCell className="text-right">
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
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
