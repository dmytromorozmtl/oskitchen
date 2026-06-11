import { WishlistPage } from "@/components/marketplace/wishlist-page";
import { resolveMarketplaceHubAccess } from "@/lib/marketplace/marketplace-page-access";

export default async function MarketplaceWishlistRoutePage() {
  const access = await resolveMarketplaceHubAccess();
  return <WishlistPage canAddToCart={access.canCartWrite} />;
}
