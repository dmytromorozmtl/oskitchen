import Link from "next/link";
import { Package, Refrigerator, Wheat } from "lucide-react";

import { SupplierOneClickReorderButton } from "@/components/marketplace/supplier-one-click-reorder-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { SupplierMarketplaceLaneId } from "@/lib/marketplace/supplier-marketplace-policy";
import type { SupplierMarketplaceDashboard } from "@/lib/marketplace/supplier-marketplace-types";
import { cn, formatCurrency } from "@/lib/utils";

const LANE_ICONS: Record<SupplierMarketplaceLaneId, typeof Wheat> = {
  food: Wheat,
  packaging: Package,
  equipment: Refrigerator,
};

type Props = {
  dashboard: SupplierMarketplaceDashboard;
  canReorder: boolean;
};

export function SupplierMarketplaceLanes({ dashboard, canReorder }: Props) {
  return (
    <section className="space-y-4" data-testid="supplier-marketplace-lanes">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">Supplier Marketplace</h2>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            Food, packaging, and equipment lanes with catalog browse and one-click reorder from your last
            purchase in each lane.
          </p>
        </div>
        <Badge variant="outline" className="rounded-full">
          {dashboard.summary.totalSkus} SKUs · {dashboard.summary.totalVendors} vendors
        </Badge>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {dashboard.lanes.map((lane) => {
          const Icon = LANE_ICONS[lane.lane];
          return (
            <Card key={lane.lane} className="border-border/80 shadow-sm">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        "flex h-10 w-10 items-center justify-center rounded-xl",
                        lane.lane === "food" && "bg-amber-500/10 text-amber-800 dark:text-amber-200",
                        lane.lane === "packaging" && "bg-sky-500/10 text-sky-800 dark:text-sky-300",
                        lane.lane === "equipment" && "bg-slate-500/10 text-slate-800 dark:text-slate-300",
                      )}
                    >
                      <Icon className="h-5 w-5" aria-hidden />
                    </span>
                    <div>
                      <CardTitle className="text-base">{lane.label}</CardTitle>
                      <CardDescription className="line-clamp-2">{lane.description}</CardDescription>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                  <span>{lane.productCount} products</span>
                  <span>·</span>
                  <span>{lane.vendorCount} suppliers</span>
                </div>

                {lane.topProducts.length > 0 ? (
                  <ul className="space-y-2 text-sm">
                    {lane.topProducts.map((product) => (
                      <li key={product.id} className="flex items-center justify-between gap-2">
                        <Link
                          href={`/dashboard/marketplace/products/${product.slug}`}
                          className="line-clamp-1 hover:text-primary"
                        >
                          {product.name}
                        </Link>
                        <span className="shrink-0 tabular-nums text-muted-foreground">
                          {formatCurrency(product.basePrice, product.currency)}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="rounded-lg border border-dashed border-border/80 px-3 py-4 text-sm text-muted-foreground">
                    Catalog seed pending — browse when vendors publish SKUs in this lane.
                  </p>
                )}

                <div className="flex flex-wrap items-center gap-2">
                  <Button asChild variant="outline" size="sm" className="rounded-full">
                    <Link href={lane.catalogHref}>Browse lane</Link>
                  </Button>
                  {canReorder && lane.oneClickReorder ? (
                    <SupplierOneClickReorderButton item={lane.oneClickReorder} />
                  ) : null}
                </div>

                {lane.oneClickReorder ? (
                  <p className="text-xs text-muted-foreground">
                    Last order: {lane.oneClickReorder.productName} · Qty {lane.oneClickReorder.quantity}
                  </p>
                ) : null}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </section>
  );
}
