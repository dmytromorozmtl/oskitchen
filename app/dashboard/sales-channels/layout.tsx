import type { ReactNode } from "react";

import { SalesChannelsSubnav } from "@/components/sales-channels/sales-channels-subnav";

export default function SalesChannelsLayout({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Operations
        </p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight">Channel operations center</h1>
        <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
          Connect and monitor order sources honestly — live paths for KitchenOS storefront, manual
          orders, WooCommerce, and Shopify; partner-gated or roadmap placeholders for marketplaces
          and POS without faking approvals.
        </p>
      </div>
      <SalesChannelsSubnav />
      {children}
    </div>
  );
}
