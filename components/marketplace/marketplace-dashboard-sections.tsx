import Link from "next/link";
import { Plus, Star } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type {
  MarketplaceFeaturedVendor,
  MarketplaceOrderAgainItem,
  MarketplacePendingAction,
  MarketplaceProductCard,
} from "@/services/marketplace/marketplace-dashboard-service";
import { formatCurrency } from "@/lib/utils";

export function MarketplaceProductGridCard({
  product,
  canAddToCart,
}: {
  product: MarketplaceProductCard;
  canAddToCart: boolean;
}) {
  return (
    <Card className="border-border/80 shadow-sm">
      <CardHeader className="space-y-2 pb-3">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="line-clamp-2 text-base">{product.name}</CardTitle>
          <Badge variant={product.inStock ? "secondary" : "outline"} className="shrink-0 rounded-full text-[10px]">
            {product.inStock ? "In stock" : "Backorder"}
          </Badge>
        </div>
        <CardDescription>{product.vendorName}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <p className="text-lg font-semibold tabular-nums">
            {formatCurrency(product.basePrice, product.currency)}
          </p>
          <p className="text-xs text-muted-foreground">
            per {product.priceUnit.replace(/^PER_/, "").replace(/_/g, " ").toLowerCase()} ·{" "}
            {product.leadTimeDays}d lead
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline" size="sm" className="rounded-full">
            <Link href={`/dashboard/marketplace/products/${product.slug}`}>View</Link>
          </Button>
          {canAddToCart ? (
            <Button asChild size="sm" className="rounded-full gap-1">
              <Link href={`/dashboard/marketplace/products/${product.slug}?add=1`}>
                <Plus className="h-3.5 w-3.5" />
                Quick add
              </Link>
            </Button>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}

export function MarketplaceOrderAgainCard({
  item,
  canAddToCart,
}: {
  item: MarketplaceOrderAgainItem;
  canAddToCart: boolean;
}) {
  return (
    <Card className="border-border/80 shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">{item.productName}</CardTitle>
        <CardDescription>
          {item.vendorName} · Qty {item.quantity} · {formatCurrency(item.unitPrice)}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-wrap gap-2">
        <Button asChild variant="outline" size="sm" className="rounded-full">
          <Link href={`/dashboard/marketplace/products/${item.slug}`}>View product</Link>
        </Button>
        {canAddToCart ? (
          <Button asChild size="sm" className="rounded-full">
            <Link href={`/dashboard/marketplace/products/${item.slug}?qty=${item.quantity}&add=1`}>
              Order again
            </Link>
          </Button>
        ) : null}
      </CardContent>
    </Card>
  );
}

export function MarketplaceFeaturedVendorCard({ vendor }: { vendor: MarketplaceFeaturedVendor }) {
  return (
    <Card className="border-border/80 shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">{vendor.companyName}</CardTitle>
        <CardDescription className="capitalize">{vendor.type.replace(/_/g, " ").toLowerCase()}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
          <span>{vendor.productCount} products</span>
          {vendor.avgRating != null ? (
            <span className="inline-flex items-center gap-1">
              <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
              {vendor.avgRating}
            </span>
          ) : (
            <span>New vendor</span>
          )}
        </div>
        <Button asChild variant="outline" size="sm" className="rounded-full">
          <Link href={`/dashboard/marketplace/vendors/${vendor.id}`}>View vendor</Link>
        </Button>
      </CardContent>
    </Card>
  );
}

export function MarketplacePendingActionsList({
  actions,
}: {
  actions: MarketplacePendingAction[];
}) {
  if (actions.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-border/80 px-4 py-6 text-sm text-muted-foreground">
        No pending marketplace actions — you are caught up.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {actions.map((action) => (
        <Link
          key={action.id}
          href={action.href}
          className="flex items-start justify-between gap-3 rounded-xl border border-border/80 px-4 py-3 transition-colors hover:bg-muted/40"
        >
          <div>
            <p className="font-medium">{action.title}</p>
            <p className="text-sm text-muted-foreground">{action.description}</p>
          </div>
          <Badge variant="outline" className="shrink-0 rounded-full capitalize">
            {action.kind}
          </Badge>
        </Link>
      ))}
    </div>
  );
}
