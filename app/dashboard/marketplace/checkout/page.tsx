import Link from "next/link";
import { ShoppingCart } from "lucide-react";

import { EmptyState } from "@/components/dashboard/empty-state";
import { MarketplaceCheckoutClient } from "@/components/marketplace/marketplace-checkout-client";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { resolveMarketplaceHubAccess } from "@/lib/marketplace/marketplace-page-access";
import { getTenantActor } from "@/lib/scope/cached-tenant";
import { getCart, toMarketplaceCartClientView } from "@/services/marketplace/cart-service";
import { MarketplaceDataUnavailable } from "@/components/marketplace/marketplace-data-unavailable";
import { isPrismaMigrationMissingError } from "@/lib/prisma-migration-missing";

export default async function MarketplaceCheckoutPage() {
  const { workspaceId } = await getTenantActor();
  if (!workspaceId) {
    return (
      <EmptyState
        icon={ShoppingCart}
        title="Workspace required"
        description="Open a workspace to checkout marketplace orders."
        primaryLabel="Marketplace"
        primaryHref="/dashboard/marketplace"
      />
    );
  }

  const access = await resolveMarketplaceHubAccess();

  let cart = null;
  try {
    const cartRaw = await getCart(workspaceId);
    cart = cartRaw ? toMarketplaceCartClientView(cartRaw) : null;
  } catch (error) {
    console.error("[marketplace-checkout] load failed", error);
    if (isPrismaMigrationMissingError(error)) {
      return <MarketplaceDataUnavailable />;
    }
    throw error;
  }

  return (
    <div className="space-y-6 pb-8">
      <PageHeader
        title="Checkout"
        description="Multi-vendor cart splits into separate purchase orders per supplier at checkout."
        actions={
          <Button asChild variant="outline" className="rounded-full">
            <Link href="/dashboard/marketplace/catalog">Continue shopping</Link>
          </Button>
        }
      />

      {!cart || cart.items.length === 0 ? (
        <EmptyState
          icon={ShoppingCart}
          title="Your marketplace cart is empty"
          description="Add products from the catalog, then return here to validate stock and place orders."
          primaryLabel="Browse catalog"
          primaryHref="/dashboard/marketplace/catalog"
        />
      ) : (
        <MarketplaceCheckoutClient
          cart={cart}
          canCheckout={access.canCartWrite && access.canCreateOrders}
        />
      )}
    </div>
  );
}
