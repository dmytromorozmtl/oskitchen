import Link from "next/link";
import type { ReactNode } from "react";
import { Plus, Star } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MARKETPLACE_TOUCH_BUTTON_CLASS } from "@/lib/marketplace/mobile-ui";
import { cn, formatCurrency } from "@/lib/utils";
import type { MarketplaceCompareRow } from "@/services/marketplace/marketplace-compare-service";

export const MARKETPLACE_PRODUCT_COMPARISON_MAX = 4;

export function sliceProductsForComparison<T>(
  rows: readonly T[],
  max = MARKETPLACE_PRODUCT_COMPARISON_MAX,
): T[] {
  return rows.slice(0, max);
}

export type ProductComparisonTableProps = {
  products: MarketplaceCompareRow[];
  canAddToCart?: boolean;
  onAddToCart?: (row: MarketplaceCompareRow) => void;
  pendingProductId?: string | null;
  isPending?: boolean;
  className?: string;
  truncatedFrom?: number;
};

function ComparisonCell({
  label,
  children,
  className,
}: {
  label: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <tr className={cn("border-t border-border/60", className)}>
      <th
        scope="row"
        className="sticky left-0 z-10 bg-card/95 px-3 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground backdrop-blur supports-[backdrop-filter]:bg-card/80"
      >
        {label}
      </th>
      {children}
    </tr>
  );
}

export function ProductComparisonTable({
  products,
  canAddToCart = false,
  onAddToCart,
  pendingProductId = null,
  isPending = false,
  className,
  truncatedFrom,
}: ProductComparisonTableProps) {
  const columns = sliceProductsForComparison(products);

  if (columns.length < 2) {
    return null;
  }

  return (
    <div className={cn("space-y-2", className)} data-testid="product-comparison-table">
      {truncatedFrom != null && truncatedFrom > columns.length ? (
        <p className="text-xs text-muted-foreground">
          Side-by-side view shows up to {MARKETPLACE_PRODUCT_COMPARISON_MAX} products ({truncatedFrom}{" "}
          total matches).
        </p>
      ) : null}

      <div className="overflow-x-auto rounded-2xl border border-border/80 bg-card/80 shadow-sm">
        <table className="w-full min-w-[36rem] border-collapse text-sm">
          <caption className="sr-only">
            Product comparison table with up to {MARKETPLACE_PRODUCT_COMPARISON_MAX} products side by side
          </caption>
          <thead>
            <tr className="border-b border-border/80 bg-muted/20">
              <th
                scope="col"
                className="sticky left-0 z-20 bg-muted/20 px-3 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground"
              >
                Attribute
              </th>
              {columns.map((product) => (
                <th key={product.id} scope="col" className="min-w-[9rem] px-3 py-3 text-left align-top">
                  <Link
                    href={`/dashboard/marketplace/products/${product.slug}`}
                    className="line-clamp-2 font-semibold leading-snug hover:underline"
                  >
                    {product.name}
                  </Link>
                  <p className="mt-1 text-xs font-normal text-muted-foreground">{product.vendorName}</p>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <ComparisonCell label="Price">
              {columns.map((product) => (
                <td key={product.id} className="px-3 py-3 align-top">
                  <div className="flex flex-col gap-1">
                    <span className="font-semibold tabular-nums">
                      {formatCurrency(product.basePrice, product.currency)}
                    </span>
                    {product.isBestPrice ? (
                      <Badge variant="secondary" className="w-fit rounded-full text-[10px]">
                        Best price
                      </Badge>
                    ) : null}
                  </div>
                </td>
              ))}
            </ComparisonCell>

            <ComparisonCell label="Delivery">
              {columns.map((product) => (
                <td key={product.id} className="px-3 py-3 align-top tabular-nums">
                  {product.leadTimeDays} days
                </td>
              ))}
            </ComparisonCell>

            <ComparisonCell label="Rating">
              {columns.map((product) => (
                <td key={product.id} className="px-3 py-3 align-top">
                  {product.avgVendorRating != null ? (
                    <span className="inline-flex items-center gap-1">
                      <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" aria-hidden />
                      {product.avgVendorRating}
                      <span className="text-xs text-muted-foreground">({product.reviewCount})</span>
                    </span>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </td>
              ))}
            </ComparisonCell>

            <ComparisonCell label="MOQ">
              {columns.map((product) => (
                <td key={product.id} className="px-3 py-3 align-top tabular-nums">
                  {product.moq}
                </td>
              ))}
            </ComparisonCell>

            <ComparisonCell label="Stock">
              {columns.map((product) => (
                <td key={product.id} className="px-3 py-3 align-top">
                  <Badge
                    variant={product.inStock ? "secondary" : "outline"}
                    className="rounded-full text-[10px]"
                  >
                    {product.inStock ? "In stock" : "Backorder"}
                  </Badge>
                </td>
              ))}
            </ComparisonCell>

            <ComparisonCell label="SKU">
              {columns.map((product) => (
                <td key={product.id} className="px-3 py-3 align-top font-mono text-xs">
                  {product.sku}
                  {product.gtin ? (
                    <p className="mt-1 font-sans text-muted-foreground">GTIN {product.gtin}</p>
                  ) : null}
                </td>
              ))}
            </ComparisonCell>

            <ComparisonCell label="Actions">
              {columns.map((product) => (
                <td key={product.id} className="px-3 py-3 align-top">
                  <div className="flex flex-col gap-2">
                    <Button asChild variant="outline" size="sm" className={`rounded-full ${MARKETPLACE_TOUCH_BUTTON_CLASS}`}>
                      <Link href={`/dashboard/marketplace/products/${product.slug}`}>View</Link>
                    </Button>
                    {canAddToCart && onAddToCart ? (
                      <Button
                        size="sm"
                        className={`rounded-full gap-1 ${MARKETPLACE_TOUCH_BUTTON_CLASS}`}
                        disabled={isPending && pendingProductId === product.id}
                        onClick={() => onAddToCart(product)}
                      >
                        <Plus className="h-3.5 w-3.5" aria-hidden />
                        Add
                      </Button>
                    ) : null}
                  </div>
                </td>
              ))}
            </ComparisonCell>
          </tbody>
        </table>
      </div>
    </div>
  );
}
