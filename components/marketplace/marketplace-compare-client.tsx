"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Plus, Scale, Search, Star } from "lucide-react";
import { toast } from "sonner";

import { addMarketplaceProductToCartAction } from "@/actions/marketplace/cart";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  MARKETPLACE_COMPARE_SORT_OPTIONS,
  marketplaceCompareFiltersToQuery,
  type MarketplaceCompareFilters,
} from "@/lib/marketplace/compare-filters";
import { formatCurrency } from "@/lib/utils";
import type { MarketplaceCompareResult } from "@/services/marketplace/marketplace-compare-service";

export function MarketplaceCompareClient({
  filters,
  result,
  canAddToCart,
}: {
  filters: MarketplaceCompareFilters;
  result: MarketplaceCompareResult;
  canAddToCart: boolean;
}) {
  const router = useRouter();
  const [query, setQuery] = useState(filters.q);
  const [pendingProductId, setPendingProductId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function navigate(next: Partial<MarketplaceCompareFilters>) {
    const merged = { ...filters, ...next };
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(marketplaceCompareFiltersToQuery(merged))) {
      if (value) params.set(key, value);
    }
    router.push(`/dashboard/marketplace/compare${params.toString() ? `?${params.toString()}` : ""}`);
  }

  function handleSearch(event: React.FormEvent) {
    event.preventDefault();
    navigate({ q: query.trim(), products: [] });
  }

  function handleAddToCart(row: MarketplaceCompareResult["rows"][number]) {
    if (!canAddToCart) return;
    setPendingProductId(row.id);
    startTransition(async () => {
      const resultAction = await addMarketplaceProductToCartAction({
        productId: row.id,
        slug: row.slug,
        name: row.name,
        sku: row.sku,
        vendorId: row.vendorId,
        vendorName: row.vendorName,
        quantity: row.moq,
        unitPrice: row.basePrice,
        currency: row.currency,
      });
      setPendingProductId(null);
      if (!resultAction.ok) {
        toast.error(resultAction.error);
        return;
      }
      toast.success(`Added ${row.name} (${row.moq} units) to cart`);
    });
  }

  return (
    <div className="space-y-6">
      <Card className="border-border/80 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Scale className="h-5 w-5" />
            Compare vendor offers
          </CardTitle>
          <CardDescription>
            Search by product name or GTIN to compare price, delivery, rating, and MOQ across approved vendors.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleSearch} className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <div className="flex-1 space-y-2">
              <Label htmlFor="compare-q">Product name or GTIN</Label>
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="compare-q"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="e.g. olive oil or 00812345678905"
                  className="pl-9"
                />
              </div>
            </div>
            <Button type="submit" className="rounded-full">
              Search
            </Button>
          </form>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted-foreground">
              {result.matchKind === "empty"
                ? "Enter a search term or pick products from the catalog compare checkbox."
                : `${result.total} offer${result.total === 1 ? "" : "s"} for ${result.queryLabel}`}
            </p>
            <div className="flex items-center gap-2">
              <Label htmlFor="compare-sort" className="text-sm text-muted-foreground">
                Sort
              </Label>
              <Select
                value={filters.sort}
                onValueChange={(value) =>
                  navigate({ sort: value as MarketplaceCompareFilters["sort"] })
                }
              >
                <SelectTrigger id="compare-sort" className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MARKETPLACE_COMPARE_SORT_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {result.rows.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
            <Scale className="h-10 w-10 text-muted-foreground/60" />
            <p className="text-sm text-muted-foreground">
              No comparable products found. Try another name, GTIN, or add items from the catalog.
            </p>
            <Button asChild variant="outline" className="rounded-full">
              <Link href="/dashboard/marketplace/catalog">Browse catalog</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-border/80 shadow-sm">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Vendor</TableHead>
                    <TableHead className="text-right">Price</TableHead>
                    <TableHead className="text-right">Delivery</TableHead>
                    <TableHead className="text-right">Rating</TableHead>
                    <TableHead className="text-right">MOQ</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {result.rows.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell>
                        <div className="space-y-1">
                          <Link
                            href={`/dashboard/marketplace/products/${row.slug}`}
                            className="font-medium hover:underline"
                          >
                            {row.name}
                          </Link>
                          <p className="text-xs text-muted-foreground">
                            SKU {row.sku}
                            {row.gtin ? ` · GTIN ${row.gtin}` : ""}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>{row.vendorName}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex flex-col items-end gap-1">
                          <span className="font-semibold tabular-nums">
                            {formatCurrency(row.basePrice, row.currency)}
                          </span>
                          {row.isBestPrice ? (
                            <Badge variant="secondary" className="rounded-full text-[10px]">
                              Best price
                            </Badge>
                          ) : null}
                        </div>
                      </TableCell>
                      <TableCell className="text-right tabular-nums">{row.leadTimeDays}d</TableCell>
                      <TableCell className="text-right">
                        {row.avgVendorRating != null ? (
                          <span className="inline-flex items-center justify-end gap-1 text-sm">
                            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                            {row.avgVendorRating}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">{row.moq}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex flex-wrap justify-end gap-2">
                          <Button asChild variant="outline" size="sm" className="rounded-full">
                            <Link href={`/dashboard/marketplace/products/${row.slug}`}>View</Link>
                          </Button>
                          {canAddToCart ? (
                            <Button
                              size="sm"
                              className="rounded-full gap-1"
                              disabled={isPending && pendingProductId === row.id}
                              onClick={() => handleAddToCart(row)}
                            >
                              <Plus className="h-3.5 w-3.5" />
                              Add
                            </Button>
                          ) : null}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
