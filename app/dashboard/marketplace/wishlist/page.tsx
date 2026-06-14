import { WishlistPage } from "@/components/marketplace/wishlist-page";
import { resolveMarketplaceHubAccess } from "@/lib/marketplace/marketplace-page-access";
import { SuspenseWave1PageBoundary } from "@/components/dashboard/suspense-wave1-page-boundary";

export default function MarketplaceWishlistRoutePage() {
  return (
    <SuspenseWave1PageBoundary sector="marketplace">
      <MarketplaceWishlistRoutePageAsync  />
    </SuspenseWave1PageBoundary>
  );
}

async function MarketplaceWishlistRoutePageAsync() {
  const access = await resolveMarketplaceHubAccess();
  return <WishlistPage canAddToCart={access.canCartWrite} />;
}
