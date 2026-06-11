import { MarketplaceSubnav } from "@/components/dashboard/marketplace-subnav";
import { MarketplaceMobileShell } from "@/components/marketplace/marketplace-mobile-shell";
import { requireMarketplaceReadPage } from "@/lib/marketplace/marketplace-page-access";
import { getCart, toMarketplaceCartClientView } from "@/services/marketplace/cart-service";

export default async function MarketplaceLayout({ children }: { children: React.ReactNode }) {
  const access = await requireMarketplaceReadPage({
    operation: "marketplace.hub.layout",
    route: "/dashboard/marketplace",
  });

  if (!access.ok) {
    return <div className="space-y-8">{access.deny}</div>;
  }

  const workspaceId = access.actor.workspaceId;
  let cart = null;
  if (workspaceId) {
    try {
      const cartRaw = await getCart(workspaceId);
      cart = cartRaw ? toMarketplaceCartClientView(cartRaw) : null;
    } catch {
      cart = null;
    }
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6 pb-20 lg:pb-8">
      <MarketplaceSubnav />
      <MarketplaceMobileShell cart={cart} canCartWrite={access.canCartWrite}>
        {children}
      </MarketplaceMobileShell>
    </div>
  );
}
