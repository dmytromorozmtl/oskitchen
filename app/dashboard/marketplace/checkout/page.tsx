import Link from "next/link";
import { ShoppingCart } from "lucide-react";

import { EmptyState } from "@/components/dashboard/empty-state";
import { MarketplaceEmptyState } from "@/components/marketplace/marketplace-empty-state";
import { MarketplaceCheckoutClient } from "@/components/marketplace/marketplace-checkout-client";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { requireMarketplaceReadPage } from "@/lib/marketplace/marketplace-page-access";
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

  const accessGate = await requireMarketplaceReadPage({
    operation: "marketplace.checkout.read",
    route: "/dashboard/marketplace/checkout",
  });
  if (!accessGate.ok) return accessGate.deny;

  const access = accessGate;

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
        <MarketplaceEmptyState scenario="cart_empty" variant="card" />
      ) : (
        <MarketplaceCheckoutClient
          cart={cart}
          canCheckout={access.canCartWrite && access.canCreateOrders}
        />
      )}
    </div>
  );
}
