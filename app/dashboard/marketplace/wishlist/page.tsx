import Link from "next/link";

import { MarketplaceWishlistClient } from "@/components/marketplace/marketplace-wishlist-client";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { resolveMarketplaceHubAccess } from "@/lib/marketplace/marketplace-page-access";

export default async function MarketplaceWishlistPage() {
  const access = await resolveMarketplaceHubAccess();

  return (
    <div className="space-y-6 pb-8">
      <PageHeader
        title="Wish List"
        description="Saved marketplace products for quick reordering later."
        actions={
          <Badge variant="outline" className="rounded-full">
            Local saves
          </Badge>
        }
      />

      <MarketplaceWishlistClient canAddToCart={access.canCartWrite} />

      <div className="flex justify-center">
        <Button asChild variant="outline" className="rounded-full">
          <Link href="/dashboard/marketplace/catalog">Browse catalog</Link>
        </Button>
      </div>
    </div>
  );
}
