import {
  MARKETPLACE_CATALOG_SORT_OPTIONS,
  type MarketplaceCatalogFilters,
  type MarketplaceCatalogVendorOption,
} from "@/lib/marketplace/catalog-filters";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function MarketplaceCatalogFilterBar({
  filters,
  vendors,
}: {
  filters: MarketplaceCatalogFilters;
  vendors: MarketplaceCatalogVendorOption[];
}) {
  return (
    <form
      method="get"
      className="grid gap-4 rounded-2xl border border-border/80 bg-card p-4 shadow-sm lg:grid-cols-4"
    >
      <input type="hidden" name="category" value={filters.category} />

      <div className="space-y-2 lg:col-span-2">
        <Label htmlFor="catalog-q">Search</Label>
        <Input
          id="catalog-q"
          name="q"
          defaultValue={filters.q}
          placeholder="Product name, SKU, GTIN, vendor"
          className="rounded-xl"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="catalog-vendor">Vendor</Label>
        <select
          id="catalog-vendor"
          name="vendor"
          defaultValue={filters.vendorId}
          className="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm"
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
          className="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm"
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
          className="rounded-xl"
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
          className="rounded-xl"
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
          className="rounded-xl"
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
          className="rounded-xl"
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
          className="rounded-xl"
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

      <div className="flex flex-wrap items-end gap-2 lg:col-span-2">
        <Button type="submit" className="rounded-full">
          Apply filters
        </Button>
        <Button type="reset" variant="outline" className="rounded-full" asChild>
          <a href="/dashboard/marketplace/catalog">Reset</a>
        </Button>
      </div>
    </form>
  );
}
