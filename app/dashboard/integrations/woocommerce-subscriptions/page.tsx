import Link from "next/link";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getWooCommerceCredentials } from "@/lib/integrations/decrypt-connection";
import { requireTenantActor } from "@/lib/scope/require-tenant-actor";
import { integrationConnectionByProviderWhereForOwner } from "@/lib/scope/workspace-resource-scope";
import { prisma } from "@/lib/prisma";
import {
  fetchWooSubscriptionsReadOnly,
  type WooSubscriptionSummary,
} from "@/services/integrations/woocommerce-subscriptions-service";
import { IntegrationProvider } from "@prisma/client";

export default async function WooCommerceSubscriptionsPage() {
  const { userId } = await requireTenantActor();
  const conn = await prisma.integrationConnection.findFirst({
    where: await integrationConnectionByProviderWhereForOwner(
      userId,
      IntegrationProvider.WOOCOMMERCE,
    ),
  });

  const creds = conn ? getWooCommerceCredentials(conn) : null;
  let subscriptions: WooSubscriptionSummary[] = [];
  let loadError: string | null = null;

  if (creds) {
    try {
      subscriptions = await fetchWooSubscriptionsReadOnly(creds, 1, 25);
    } catch (e) {
      loadError = e instanceof Error ? e.message : "Failed to load Woo subscriptions.";
    }
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Integrations · Phase 1
        </p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">WooCommerce Subscriptions</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Read-only import from WooCommerce Subscriptions — view recurring agreements in KitchenOS
          without billing writes. Link to native meal plans ships in a later phase.
        </p>
      </div>

      {!conn || !creds ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Connect WooCommerce first</CardTitle>
            <CardDescription>
              Save Woo REST credentials on the main WooCommerce integration page, then return here to
              import subscriptions.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/dashboard/integrations/woocommerce" className="text-sm font-medium underline">
              Open WooCommerce integration →
            </Link>
          </CardContent>
        </Card>
      ) : loadError ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Import unavailable</CardTitle>
            <CardDescription>{loadError}</CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Imported subscriptions ({subscriptions.length})</CardTitle>
            <CardDescription>Read-only list — first page from Woo REST.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {subscriptions.length === 0 ? (
              <p className="text-sm text-muted-foreground">No subscriptions returned from Woo store.</p>
            ) : (
              subscriptions.map((sub) => (
                <div key={sub.externalSubscriptionId} className="rounded-lg border p-3 text-sm">
                  <p className="font-medium">#{sub.externalSubscriptionId} · {sub.status}</p>
                  <p className="text-muted-foreground">
                    {sub.customerEmail ?? "No email"} ·{" "}
                    {sub.billingInterval && sub.billingPeriod
                      ? `Every ${sub.billingInterval} ${sub.billingPeriod}(s)`
                      : "Billing interval unknown"}
                  </p>
                  {sub.productNames.length > 0 ? (
                    <p className="text-muted-foreground">{sub.productNames.join(", ")}</p>
                  ) : null}
                </div>
              ))
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
