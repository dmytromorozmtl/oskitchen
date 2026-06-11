import Link from "next/link";
import { notFound } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getTenantActor } from "@/lib/scope/cached-tenant";
import { brandDetailPath, brandHubPath } from "@/lib/brands/brand-routing";
import { orderListWhereForOwnerAnd } from "@/lib/scope/workspace-resource-scope";
import { prisma } from "@/lib/prisma";

export default async function BrandReportsPage({ params }: { params: Promise<{ brandId: string }> }) {
  const { brandId } = await params;
  const { sessionUser: user, dataUserId } = await getTenantActor();

  const brand = await prisma.brand.findFirst({
    where: { id: brandId, workspace: { ownerUserId: dataUserId } },
    select: { id: true, name: true, slug: true },
  });
  if (!brand) notFound();

  const since = new Date(Date.now() - 30 * 86400000);
  const weekSince = new Date(Date.now() - 7 * 86400000);
  const [monthWhere, weekWhere, brandOrderWhere] = await Promise.all([
    orderListWhereForOwnerAnd(dataUserId, { brandId: brand.id, createdAt: { gte: since } }),
    orderListWhereForOwnerAnd(dataUserId, { brandId: brand.id, createdAt: { gte: weekSince } }),
    orderListWhereForOwnerAnd(dataUserId, { brandId: brand.id }),
  ]);

  const [month, week, topItems] = await Promise.all([
    prisma.order.aggregate({
      where: monthWhere,
      _sum: { total: true },
      _count: true,
    }),
    prisma.order.aggregate({
      where: weekWhere,
      _sum: { total: true },
      _count: true,
    }),
    prisma.orderItem.groupBy({
      by: ["productId"],
      where: { order: brandOrderWhere },
      _sum: { quantity: true },
      orderBy: { _sum: { quantity: "desc" } },
      take: 5,
    }),
  ]);

  const monthRev = month._sum.total != null ? Number(month._sum.total) : 0;
  const weekRev = week._sum.total != null ? Number(week._sum.total) : 0;

  const topProductIds = topItems
    .map((t) => t.productId)
    .filter((id): id is string => typeof id === "string");
  const productTitles =
    topProductIds.length > 0
      ? await prisma.product.findMany({
          where: { id: { in: topProductIds } },
          select: { id: true, title: true },
        })
      : [];
  const titleById = new Map(productTitles.map((p) => [p.id, p.title]));

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            <Link href={brandHubPath()} className="hover:text-foreground">
              Brands
            </Link>
            <span className="mx-2">/</span>
            <Link href={brandDetailPath(brand.id)} className="hover:text-foreground">
              {brand.name}
            </Link>
            <span className="mx-2">/</span>
            Reports
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight">Brand reports</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Scoped to orders with <code className="text-xs">brand_id</code> set. Older orders without a brand stay in
            workspace totals.
          </p>
        </div>
        <Button asChild variant="outline" className="rounded-full">
          <Link href={brandDetailPath(brand.id)}>Back to brand</Link>
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Revenue (30 days)</CardTitle>
            <CardDescription>Sum of order totals for this brand.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold tabular-nums">${monthRev.toFixed(2)}</p>
            <p className="text-xs text-muted-foreground">{month._count} orders</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Revenue (7 days)</CardTitle>
            <CardDescription>Recent week slice.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold tabular-nums">${weekRev.toFixed(2)}</p>
            <p className="text-xs text-muted-foreground">{week._count} orders</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Top items (all time, by quantity)</CardTitle>
          <CardDescription>Based on order line items tied to orders for this brand.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          {topItems.length === 0 ? (
            <p className="text-muted-foreground">No line items yet for this brand.</p>
          ) : (
            <ol className="list-decimal space-y-1 pl-5">
              {topItems.map((row) => {
                const pid = row.productId ?? "—";
                return (
                  <li key={pid}>
                    {(row.productId ? titleById.get(row.productId) : null) ?? pid}{" "}
                    <span className="text-muted-foreground">
                      ×{row._sum.quantity != null ? Number(row._sum.quantity) : 0}
                    </span>
                  </li>
                );
              })}
            </ol>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
