"use client";

import { useMemo, useState } from "react";
import { SlidersHorizontal } from "lucide-react";

import {
  MARKETPLACE_CATALOG_SORT_OPTIONS,
  type MarketplaceCatalogFilters,
  type MarketplaceCatalogVendorOption,
} from "@/lib/marketplace/catalog-filters";
import {
  MARKETPLACE_TOUCH_BUTTON_CLASS,
  MARKETPLACE_TOUCH_INPUT_CLASS,
} from "@/lib/marketplace/mobile-ui";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

export type CatalogFilterBarProps = {
  filters: MarketplaceCatalogFilters;
  vendors: MarketplaceCatalogVendorOption[];
};

export function countActiveCatalogFilters(filters: MarketplaceCatalogFilters): number {
  let count = 0;
  if (filters.q.trim()) count += 1;
  if (filters.category.trim()) count += 1;
  if (filters.vendorId.trim()) count += 1;
  if (filters.minPrice != null) count += 1;
  if (filters.maxPrice != null) count += 1;
  if (filters.minRating != null) count += 1;
  if (filters.maxLeadDays != null) count += 1;
  if (filters.maxMoq != null) count += 1;
  if (filters.inStockOnly) count += 1;
  if (filters.sort !== "popularity") count += 1;
  return count;
}

function CatalogFilterHiddenFields({
  filters,
  omit,
}: {
  filters: MarketplaceCatalogFilters;
  omit?: keyof MarketplaceCatalogFilters | (keyof MarketplaceCatalogFilters)[];
}) {
  const omitted = new Set(Array.isArray(omit) ? omit : omit ? [omit] : []);

  return (
    <>
      {!omitted.has("category") && filters.category ? (
        <input type="hidden" name="category" value={filters.category} />
      ) : null}
      {!omitted.has("vendorId") && filters.vendorId ? (
        <input type="hidden" name="vendor" value={filters.vendorId} />
      ) : null}
      {!omitted.has("minPrice") && filters.minPrice != null ? (
        <input type="hidden" name="minPrice" value={String(filters.minPrice)} />
      ) : null}
      {!omitted.has("maxPrice") && filters.maxPrice != null ? (
        <input type="hidden" name="maxPrice" value={String(filters.maxPrice)} />
      ) : null}
      {!omitted.has("minRating") && filters.minRating != null ? (
        <input type="hidden" name="minRating" value={String(filters.minRating)} />
      ) : null}
      {!omitted.has("maxLeadDays") && filters.maxLeadDays != null ? (
        <input type="hidden" name="maxLeadDays" value={String(filters.maxLeadDays)} />
      ) : null}
      {!omitted.has("maxMoq") && filters.maxMoq != null ? (
        <input type="hidden" name="maxMoq" value={String(filters.maxMoq)} />
      ) : null}
      {!omitted.has("inStockOnly") && filters.inStockOnly ? (
        <input type="hidden" name="inStock" value="1" />
      ) : null}
      {!omitted.has("sort") && filters.sort !== "popularity" ? (
        <input type="hidden" name="sort" value={filters.sort} />
      ) : null}
    </>
  );
}

function CatalogFilterFields({
  filters,
  vendors,
  className,
  showCategoryHidden = true,
}: CatalogFilterBarProps & {
  className?: string;
  showCategoryHidden?: boolean;
}) {
  return (
    <>
      {showCategoryHidden ? <input type="hidden" name="category" value={filters.category} /> : null}

      <div className="space-y-2 lg:col-span-2">
        <Label htmlFor="catalog-q">Search</Label>
        <Input
          id="catalog-q"
          name="q"
          defaultValue={filters.q}
          placeholder="Product name, SKU, GTIN, vendor"
          className={`rounded-xl ${MARKETPLACE_TOUCH_INPUT_CLASS}`}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="catalog-vendor">Vendor</Label>
        <select
          id="catalog-vendor"
          name="vendor"
          defaultValue={filters.vendorId}
          className={`flex w-full rounded-xl border border-input bg-background px-3 py-2 text-sm ${MARKETPLACE_TOUCH_INPUT_CLASS}`}
        >
          <option value="">All vendors</option>
          {vendors.map((vendor) => (
            <option key={vendor.id} value={vendor.id}>
              {vendor.companyName}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="catalog-sort">Sort</Label>
        <select
          id="catalog-sort"
          name="sort"
          defaultValue={filters.sort}
          className={`flex w-full rounded-xl border border-input bg-background px-3 py-2 text-sm ${MARKETPLACE_TOUCH_INPUT_CLASS}`}
        >
          {MARKETPLACE_CATALOG_SORT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="catalog-min-price">Min price</Label>
        <Input
          id="catalog-min-price"
          name="minPrice"
          type="number"
          min="0"
          step="0.01"
          defaultValue={filters.minPrice ?? ""}
          className={`rounded-xl ${MARKETPLACE_TOUCH_INPUT_CLASS}`}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="catalog-max-price">Max price</Label>
        <Input
          id="catalog-max-price"
          name="maxPrice"
          type="number"
          min="0"
          step="0.01"
          defaultValue={filters.maxPrice ?? ""}
          className={`rounded-xl ${MARKETPLACE_TOUCH_INPUT_CLASS}`}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="catalog-min-rating">Min vendor rating</Label>
        <Input
          id="catalog-min-rating"
          name="minRating"
          type="number"
          min="1"
          max="5"
          step="0.5"
          defaultValue={filters.minRating ?? ""}
          className={`rounded-xl ${MARKETPLACE_TOUCH_INPUT_CLASS}`}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="catalog-max-lead">Max delivery (days)</Label>
        <Input
          id="catalog-max-lead"
          name="maxLeadDays"
          type="number"
          min="1"
          step="1"
          defaultValue={filters.maxLeadDays ?? ""}
          className={`rounded-xl ${MARKETPLACE_TOUCH_INPUT_CLASS}`}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="catalog-max-moq">Max MOQ</Label>
        <Input
          id="catalog-max-moq"
          name="maxMoq"
          type="number"
          min="1"
          step="1"
          defaultValue={filters.maxMoq ?? ""}
          className={`rounded-xl ${MARKETPLACE_TOUCH_INPUT_CLASS}`}
        />
      </div>

      <div className="flex items-end gap-3 lg:col-span-2">
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            name="inStock"
            value="1"
            defaultChecked={filters.inStockOnly}
            className="h-4 w-4 rounded border-input"
          />
          In stock only
        </label>
      </div>

      <div className={cn("flex flex-wrap items-end gap-2 lg:col-span-2", className)}>
        <Button type="submit" className={`rounded-full ${MARKETPLACE_TOUCH_BUTTON_CLASS}`}>
          Apply filters
        </Button>
        <Button type="reset" variant="outline" className={`rounded-full ${MARKETPLACE_TOUCH_BUTTON_CLASS}`} asChild>
          <a href="/dashboard/marketplace/catalog">Reset</a>
        </Button>
      </div>
    </>
  );
}

export function CatalogFilterBar({ filters, vendors }: CatalogFilterBarProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const activeCount = useMemo(() => countActiveCatalogFilters(filters), [filters]);

  return (
    <div data-testid="marketplace-catalog-filter-bar">
      <div className="space-y-3 lg:hidden">
        <form method="get" className="flex gap-2">
          <CatalogFilterHiddenFields filters={filters} omit="q" />
          <Input
            name="q"
            defaultValue={filters.q}
            placeholder="Search catalog…"
            className={`min-w-0 flex-1 rounded-full ${MARKETPLACE_TOUCH_INPUT_CLASS}`}
            aria-label="Search catalog"
          />
          <Button type="submit" variant="secondary" className={`shrink-0 rounded-full ${MARKETPLACE_TOUCH_BUTTON_CLASS}`}>
            Search
          </Button>
        </form>

        <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
          <SheetTrigger asChild>
            <Button
              type="button"
              variant="outline"
              className={`w-full justify-center gap-2 rounded-full ${MARKETPLACE_TOUCH_BUTTON_CLASS}`}
              data-testid="marketplace-catalog-filters-drawer-trigger"
            >
              <SlidersHorizontal className="h-4 w-4" aria-hidden />
              Filters
              {activeCount > 0 ? (
                <Badge variant="secondary" className="rounded-full tabular-nums">
                  {activeCount}
                </Badge>
              ) : null}
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="flex w-full flex-col overflow-y-auto sm:max-w-md">
            <SheetHeader>
              <SheetTitle>Catalog filters</SheetTitle>
            </SheetHeader>
            <form
              method="get"
              className="mt-6 grid flex-1 gap-4 pb-8"
              onSubmit={() => setDrawerOpen(false)}
            >
              <CatalogFilterFields filters={filters} vendors={vendors} showCategoryHidden />
            </form>
          </SheetContent>
        </Sheet>
      </div>

      <form
        method="get"
        className="hidden gap-4 rounded-2xl border border-border/80 bg-card p-4 shadow-sm lg:grid lg:grid-cols-4"
      >
        <CatalogFilterFields filters={filters} vendors={vendors} />
      </form>
    </div>
  );
}

/** @deprecated Prefer `CatalogFilterBar` — alias kept for existing imports. */
export const MarketplaceCatalogFilterBar = CatalogFilterBar;
