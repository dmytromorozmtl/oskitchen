import React, { type ReactNode } from "react";

import { SalesChannelsSubnav } from "@/components/sales-channels/sales-channels-subnav";
import { requireIntegrationsReadPage } from "@/lib/integrations/integrations-page-access";

export default async function SalesChannelsLayout({ children }: { children: ReactNode }) {
  const access = await requireIntegrationsReadPage();
  if (!access.ok) {
    return <div className="mx-auto max-w-xl py-10">{access.deny}</div>;
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Operations
        </p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight">Channel operations center</h1>
        <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
          Connect and monitor order sources honestly — live paths for OS Kitchen storefront, manual
          orders, WooCommerce, and Shopify; partner-gated or roadmap placeholders for marketplaces
          and POS without faking approvals.
        </p>
        {!access.canManage ? (
          <p className="mt-3 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-sm text-amber-950 dark:text-amber-100">
            Read-only access — you can monitor channel health and activity but cannot connect
            channels or change integration settings.
          </p>
        ) : null}
      </div>
      <SalesChannelsSubnav canManage={access.canManage} />
      {children}
    </div>
  );
}
