import Link from "next/link";
import { Heart, Package, Star, Truck } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import type { MarketplaceVendorCard } from "@/services/marketplace/marketplace-vendors-service";

export function MarketplaceVendorCardView({
  vendor,
  onToggleFavorite,
  canReorder,
  pendingFavorite,
}: {
  vendor: MarketplaceVendorCard;
  onToggleFavorite?: () => void;
  canReorder?: boolean;
  pendingFavorite?: boolean;
}) {
  return (
    <Card className="border-border/80 shadow-sm">
      <CardHeader className="space-y-2 pb-3">
        <div className="flex items-start justify-between gap-2">
          <div>
            <CardTitle className="text-base">{vendor.companyName}</CardTitle>
            <CardDescription>
              {vendor.type.replace(/_/g, " ").toLowerCase()} · {vendor.planTier}
            </CardDescription>
          </div>
          {onToggleFavorite ? (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="shrink-0 rounded-full"
              disabled={pendingFavorite}
              onClick={onToggleFavorite}
              aria-label={vendor.isFavorite ? "Remove favorite" : "Add favorite"}
            >
              <Heart
                className={`h-4 w-4 ${vendor.isFavorite ? "fill-rose-500 text-rose-500" : ""}`}
              />
            </Button>
          ) : null}
        </div>
        <div className="flex flex-wrap gap-2">
          {vendor.isFavorite ? (
            <Badge variant="secondary" className="rounded-full">
              Favorite
            </Badge>
          ) : null}
          {vendor.avgRating != null ? (
            <Badge variant="outline" className="rounded-full gap-1">
              <Star className="h-3 w-3 fill-amber-400 text-amber-500" />
              {vendor.avgRating} ({vendor.reviewCount})
            </Badge>
          ) : null}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-xs text-muted-foreground">Total spent</p>
            <p className="font-semibold tabular-nums">
              {formatCurrency(vendor.totalSpent, vendor.currency as "USD")}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Orders</p>
            <p className="font-semibold tabular-nums">{vendor.orderCount}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Delivery avg</p>
            <p className="font-semibold tabular-nums">
              {vendor.avgDeliveryDays != null ? `${vendor.avgDeliveryDays}d` : "—"}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Catalog</p>
            <p className="flex items-center gap-1 font-semibold tabular-nums">
              <Package className="h-3.5 w-3.5 text-muted-foreground" />
              {vendor.productCount}
            </p>
          </div>
        </div>

        {vendor.lastOrderAt ? (
          <p className="flex items-center gap-1 text-xs text-muted-foreground">
            <Truck className="h-3.5 w-3.5" />
            Last order {new Date(vendor.lastOrderAt).toLocaleDateString()}
          </p>
        ) : null}

        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline" size="sm" className="rounded-full">
            <Link href={`/dashboard/marketplace/vendors/${vendor.id}`}>Profile</Link>
          </Button>
          <Button asChild size="sm" className="rounded-full">
            <Link href={`/dashboard/marketplace/catalog?vendor=${vendor.id}`}>Browse catalog</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
