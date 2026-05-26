import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getTenantActor } from "@/lib/scope/cached-tenant";
import { brandHubPath } from "@/lib/brands/brand-routing";
import {
  integrationConnectionListWhereForOwner,
  menuListWhereForOwnerAnd,
  orderListWhereForOwnerAnd,
  productListWhereForOwnerAnd,
} from "@/lib/scope/workspace-resource-scope";
import { prisma } from "@/lib/prisma";

export default async function BrandAssignmentPage() {
  const { sessionUser: user, dataUserId } = await getTenantActor();

  const [menuWhere, productWhere, orderWhere, connectionWhere] = await Promise.all([
    menuListWhereForOwnerAnd(dataUserId, { brandId: null, catalogOnly: false }),
    productListWhereForOwnerAnd(dataUserId, { brandId: null }),
    orderListWhereForOwnerAnd(dataUserId, { brandId: null }),
    integrationConnectionListWhereForOwner(dataUserId),
  ]);

  const [
    menusUnassigned,
    productsUnassigned,
    ordersUnassigned,
    storefrontUnassigned,
    channelsUnassigned,
  ] = await Promise.all([
    prisma.menu.count({
      where: menuWhere,
    }),
    prisma.product.count({
      where: productWhere,
    }),
    prisma.order.count({
      where: orderWhere,
    }),
    prisma.storefrontSettings.count({
      where: { userId: dataUserId, brandId: null },
    }),
    prisma.integrationConnection.count({
      where: { AND: [connectionWhere, { brandId: null }] },
    }),
  ]);

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Brand assignment</h1>
          <p className="mt-2 text-muted-foreground">
            Inspect unscoped records safely. Bulk write APIs and undo queues are staged — today this page is an
            operational snapshot plus deep links.
          </p>
        </div>
        <Button asChild variant="outline" className="rounded-full">
          <Link href={brandHubPath()}>Back to brands</Link>
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Menus without brand</CardTitle>
            <CardDescription>Catalog-only menus excluded.</CardDescription>
          </CardHeader>
          <CardContent className="text-3xl font-semibold tabular-nums">{menusUnassigned}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Products without brand</CardTitle>
            <CardDescription>Across menus owned by this workspace user.</CardDescription>
          </CardHeader>
          <CardContent className="text-3xl font-semibold tabular-nums">{productsUnassigned}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Orders without brand</CardTitle>
            <CardDescription>Historical rows remain valid — assign when channel mapping is confident.</CardDescription>
          </CardHeader>
          <CardContent className="text-3xl font-semibold tabular-nums">{ordersUnassigned}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Storefront rows without brand</CardTitle>
            <CardDescription>Usually 0–1 while storefront remains per-user singleton.</CardDescription>
          </CardHeader>
          <CardContent className="text-3xl font-semibold tabular-nums">{storefrontUnassigned}</CardContent>
        </Card>
        <Card className="sm:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Sales channel connections without brand</CardTitle>
            <CardDescription>Map each integration to a brand for cleaner downstream order attribution.</CardDescription>
          </CardHeader>
          <CardContent className="text-3xl font-semibold tabular-nums">{channelsUnassigned}</CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Open modules</CardTitle>
          <CardDescription>Assign in-context until dedicated bulk tools ship.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Button asChild variant="outline" className="rounded-full">
            <Link href="/dashboard/menus">Menus</Link>
          </Button>
          <Button asChild variant="outline" className="rounded-full">
            <Link href="/dashboard/products">Products</Link>
          </Button>
          <Button asChild variant="outline" className="rounded-full">
            <Link href="/dashboard/orders">Orders</Link>
          </Button>
          <Button asChild variant="outline" className="rounded-full">
            <Link href="/dashboard/storefront">Storefront</Link>
          </Button>
          <Button asChild variant="outline" className="rounded-full">
            <Link href="/dashboard/sales-channels">Sales channels</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
