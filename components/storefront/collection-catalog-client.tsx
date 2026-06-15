"use client";

import * as React from "react";
import Link from "next/link";

import {
  COLLECTION_DIETARY_FILTERS,
  productMatchesDietaryFilter,
  sortCollectionProducts,
  type CollectionSort,
} from "@/lib/storefront/collection-settings";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

export type CollectionProductRow = {
  id: string;
  title: string;
  description: string | null;
  price: number;
  sortOrder: number;
  allergens: string | null;
  productHref: string;
};

export function CollectionCatalogClient({
  products,
  currency,
}: {
  products: CollectionProductRow[];
  currency: string;
}) {
  const [sort, setSort] = React.useState<CollectionSort>("default");
  const [dietary, setDietary] = React.useState<string[]>([]);

  const visible = React.useMemo(() => {
    let rows = products;
    if (dietary.length > 0) {
      rows = rows.filter((p) => dietary.every((f) => productMatchesDietaryFilter(p.allergens, f)));
    }
    return sortCollectionProducts(rows, sort);
  }, [products, sort, dietary]);

  function toggleDietary(id: string) {
    setDietary((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-4 rounded-2xl border border-border/80 bg-card p-4">
        <div className="space-y-1">
          <Label htmlFor="collection-sort">Sort</Label>
          <select
            id="collection-sort"
            className="h-10 rounded-xl border border-input bg-background px-3 text-sm"
            value={sort}
            onChange={(e) => setSort(e.target.value as CollectionSort)}
          >
            <option value="default">Featured order</option>
            <option value="price-asc">Price: low to high</option>
            <option value="price-desc">Price: high to low</option>
            <option value="title">Name A–Z</option>
          </select>
        </div>
        <div className="space-y-2">
          <Label>Dietary</Label>
          <div className="flex flex-wrap gap-2">
            {COLLECTION_DIETARY_FILTERS.map((f) => (
              <Button
                key={f.id}
                type="button"
                size="sm"
                variant={dietary.includes(f.id) ? "default" : "outline"}
                className="rounded-full"
                onClick={() => toggleDietary(f.id)}
              >
                {f.label}
              </Button>
            ))}
          </div>
        </div>
      </div>

      <ul className="divide-y divide-border/80 rounded-2xl border border-border/80">
        {visible.map((p) => (
          <li key={p.id} className="flex items-center justify-between gap-4 px-4 py-3">
            <div>
              <p className="font-medium">{p.title}</p>
              {p.description ? (
                <p className="text-sm text-muted-foreground line-clamp-2">{p.description}</p>
              ) : null}
              <p className="mt-1 text-sm font-medium">{formatCurrency(p.price, currency)}</p>
            </div>
            <Link
              href={p.productHref}
              className="text-sm text-primary underline-offset-4 hover:underline shrink-0"
            >
              View
            </Link>
          </li>
        ))}
      </ul>
      {visible.length === 0 ? (
        <p className="text-sm text-muted-foreground">No products match these filters.</p>
      ) : null}
    </div>
  );
}
