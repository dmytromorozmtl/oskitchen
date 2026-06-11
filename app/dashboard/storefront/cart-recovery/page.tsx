import { CartRecoveryChart } from "@/components/dashboard/storefront/cart-recovery-chart";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { requireStorefrontAdminPageAccess } from "@/lib/storefront/storefront-admin-page-access";
import {
  getStorefrontCartRecoveryDailyMetrics,
  getStorefrontCartRecoveryMetrics,
} from "@/services/storefront/storefront-cart-recovery-service";

export default async function StorefrontCartRecoveryPage() {
  const pageAccess = await requireStorefrontAdminPageAccess("storefront.settings");
  if (!pageAccess.ok) return pageAccess.deny;

  const storefrontId = pageAccess.access.storefront.id;
  const metrics = await getStorefrontCartRecoveryMetrics(storefrontId);
  const daily = await getStorefrontCartRecoveryDailyMetrics(storefrontId, 14);

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Cart recovery</h1>
        <p className="mt-2 text-muted-foreground">
          Email sequence: T+1h, T+24h (+5% hint), T+72h (+10% discount). Cron runs{" "}
          <code className="text-xs">processStorefrontCartRecoveryEmails</code>.
        </p>
      </div>

      <>
          <div className="grid gap-4 sm:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground">Tracked carts</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-semibold tabular-nums">{metrics?.total ?? 0}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground">Emailed</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-semibold tabular-nums">{metrics?.emailed ?? 0}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground">Recovered</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-semibold tabular-nums">{metrics?.converted ?? 0}</p>
                <p className="text-xs text-muted-foreground">{metrics?.recoveryRatePercent ?? 0}% of emailed</p>
              </CardContent>
            </Card>
          </div>
          <Card>
            <CardHeader>
              <CardTitle>14-day funnel</CardTitle>
              <CardDescription>Tracked → emailed → converted</CardDescription>
            </CardHeader>
            <CardContent>
              <CartRecoveryChart data={daily} />
            </CardContent>
          </Card>
      </>
    </div>
  );
}
