import Link from "next/link";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { requireSalesChannelsManagePage } from "@/lib/channels/sales-channels-page-access";

export default async function SalesChannelsSettingsPage() {
  const access = await requireSalesChannelsManagePage();
  if (!access.ok) {
    return access.deny;
  }

  return (
    <Card className="border-dashed">
      <CardHeader>
        <CardTitle className="text-base">Per-channel settings</CardTitle>
        <CardDescription>
          Display name, colors, import toggles, and mapping defaults will live here per connection.
          Today: manage credentials on each integration&apos;s setup page.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-wrap gap-2 text-sm">
        <Link href="/dashboard/integrations/woocommerce" className="text-primary hover:underline">
          WooCommerce
        </Link>
        <span className="text-muted-foreground">·</span>
        <Link href="/dashboard/integrations/shopify" className="text-primary hover:underline">
          Shopify
        </Link>
        <span className="text-muted-foreground">·</span>
        <Link href="/dashboard/storefront" className="text-primary hover:underline">
          Storefront
        </Link>
      </CardContent>
    </Card>
  );
}
