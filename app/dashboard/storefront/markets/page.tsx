import Link from "next/link";

import { seedDefaultMarketFormAction } from "@/actions/storefront-markets";
import { StorefrontMarketsEditor } from "@/components/dashboard/storefront/storefront-markets-editor";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { requireStorefrontAdminPageAccess } from "@/lib/storefront/storefront-admin-page-access";
import { parseStorefrontMarketsFromSettingsCenter } from "@/lib/storefront/markets";
import { menuListWhereForOwnerAnd } from "@/lib/scope/workspace-resource-scope";
import { prisma } from "@/lib/prisma";

export default async function StorefrontMarketsPage() {
  const pageAccess = await requireStorefrontAdminPageAccess("storefront.markets");
  if (!pageAccess.ok) return pageAccess.deny;

  const ownerUserId = pageAccess.userId;
  const plannerMenuWhere = await menuListWhereForOwnerAnd(ownerUserId, { catalogOnly: false });
  const [sf, kitchen, menus] = await Promise.all([
    prisma.storefrontSettings.findUnique({
      where: { id: pageAccess.access.storefront.id },
      select: {
        id: true,
        storeSlug: true,
        subdomain: true,
        workspaceId: true,
        activeMenuId: true,
        currency: true,
      },
    }),
    prisma.kitchenSettings.findUnique({
      where: { userId: ownerUserId },
      select: { settingsCenterJson: true },
    }),
    prisma.menu.findMany({
      where: plannerMenuWhere,
      select: { id: true, title: true },
      orderBy: { title: "asc" },
    }),
  ]);

  const markets = parseStorefrontMarketsFromSettingsCenter(kitchen?.settingsCenterJson);

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Markets</h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            Per-market menus, product filters, and optional vanity slugs. Guests switch via{" "}
            <code className="text-xs">?market=</code> or the public market switcher.
          </p>
        </div>
        <Button asChild variant="outline" className="rounded-full">
          <Link href="/dashboard/storefront">← Overview</Link>
        </Button>
      </div>

      {!sf ? (
        <p className="text-muted-foreground">Publish storefront overview first.</p>
      ) : (
        <>
          <Card className="border-border/80 shadow-sm">
            <CardHeader>
              <CardTitle>Routing</CardTitle>
              <CardDescription>
                Primary slug: <span className="font-mono">{sf.storeSlug}</span>
                {sf.subdomain ? (
                  <>
                    {" "}
                    · subdomain column: <span className="font-mono">{sf.subdomain}</span>
                  </>
                ) : null}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 font-mono text-xs text-muted-foreground">
              <p>workspaceId: {sf.workspaceId ?? "—"}</p>
              <p>default activeMenuId: {sf.activeMenuId ?? "—"}</p>
              <p>currency: {sf.currency}</p>
            </CardContent>
          </Card>

          <Card className="border-border/80 shadow-sm">
            <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-2">
              <div>
                <CardTitle>Market definitions</CardTitle>
                <CardDescription>Each market can override menu, products, banner, and slug.</CardDescription>
              </div>
              <form action={seedDefaultMarketFormAction}>
                <Button type="submit" variant="secondary" size="sm" className="rounded-full">
                  Seed primary market
                </Button>
              </form>
            </CardHeader>
            <CardContent>
              <StorefrontMarketsEditor
                storeSlug={sf.storeSlug}
                currency={sf.currency}
                menus={menus}
                initialMarkets={markets}
              />
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
