import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getTenantActor } from "@/lib/scope/cached-tenant";
import { externalProductListWhereForOwner } from "@/lib/scope/workspace-channel-scope";
import { productMappingListWhereForOwner } from "@/lib/scope/workspace-product-mapping-scope";
import { prisma } from "@/lib/prisma";

export default async function SalesChannelsMappingPage() {
  const { userId } = await getTenantActor();
  const [externalProductWhere, mappingWhere] = await Promise.all([
    externalProductListWhereForOwner(userId),
    productMappingListWhereForOwner(userId),
  ]);
  const unmappedWhere = { AND: [externalProductWhere, { mappedProductId: null }] };
  const [unmatched, recentExternal, mappingCount, byStatus] = await Promise.all([
    prisma.externalProduct.count({ where: unmappedWhere }),
    prisma.externalProduct.findMany({
      where: unmappedWhere,
      orderBy: { updatedAt: "desc" },
      take: 12,
      select: { id: true, title: true, provider: true, sku: true, externalProductId: true },
    }),
    prisma.productMapping.count({ where: mappingWhere }),
    prisma.productMapping.groupBy({
      by: ["status"],
      where: mappingWhere,
      _count: { _all: true },
    }),
  ]);
  const totals = Object.fromEntries(byStatus.map((s) => [s.status, s._count._all]));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-lg font-semibold">Product mapping</h2>
          <p className="text-sm text-muted-foreground">
            Unmatched external catalog rows from WooCommerce, Shopify, or CSV should be mapped
            before high-volume order import. Full workbench lives under Product mapping.
          </p>
        </div>
        <Button asChild variant="outline" size="sm" className="rounded-full">
          <Link href="/dashboard/sales-channels">Overview</Link>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Unmatched external products</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-semibold tabular-nums">{unmatched}</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Workbench rows</CardTitle>
            <CardDescription>All ProductMapping rows.</CardDescription>
          </CardHeader>
          <CardContent className="text-3xl font-semibold tabular-nums">{mappingCount}</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Approved mappings</CardTitle>
            <CardDescription>APPROVED + CONFIRMED.</CardDescription>
          </CardHeader>
          <CardContent className="text-3xl font-semibold tabular-nums">
            {(totals.APPROVED ?? 0) + (totals.CONFIRMED ?? 0)}
          </CardContent>
        </Card>
        <Card className="flex flex-col justify-center border-dashed">
          <CardContent className="pt-6">
            <Button asChild className="w-full rounded-full">
              <Link href="/dashboard/product-mapping">Open mapping workbench</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Recent unmatched items</CardTitle>
          <CardDescription>Preview only — edit in the workbench.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          {recentExternal.length === 0 ? (
            <p className="text-muted-foreground">No unmatched external products — great.</p>
          ) : (
            <ul className="divide-y divide-border/60 rounded-lg border border-border/60">
              {recentExternal.map((p) => (
                <li key={p.id} className="flex flex-wrap items-center justify-between gap-2 px-3 py-2">
                  <span className="font-medium text-foreground">{p.title}</span>
                  <span className="text-xs text-muted-foreground">
                    {p.provider} · {p.sku ?? "no SKU"} · ext {p.externalProductId}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
