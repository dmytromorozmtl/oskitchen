import Link from "next/link";
import { notFound } from "next/navigation";

import { ActivityTimeline } from "@/components/activity/activity-timeline";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getTenantActor } from "@/lib/scope/cached-tenant";
import { formatCurrency } from "@/lib/utils";
import { productByIdWhereForOwner } from "@/lib/scope/workspace-resource-scope";
import { prisma } from "@/lib/prisma";
import { listActivityForEntity } from "@/services/activity/activity-service";

export default async function ProductDetailPage({ params }: { params: Promise<{ productId: string }> }) {
  const { productId } = await params;
  const { dataUserId } = await getTenantActor();

  const product = await prisma.product.findFirst({
    where: await productByIdWhereForOwner(dataUserId, productId),
    include: {
      menu: { select: { id: true, title: true } },
      brand: { select: { id: true, name: true } },
      productionTask: { select: { cooked: true, packed: true, labeled: true } },
    },
  });

  if (!product) notFound();

  const activity = await listActivityForEntity(dataUserId, product.id, 30);

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">{product.title}</h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            Menu item · {product.menu.title}
            {product.brand ? ` · ${product.brand.name}` : ""}
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            <Badge variant="secondary">{product.category}</Badge>
            {product.active ? <Badge variant="outline">Active</Badge> : <Badge variant="destructive">Inactive</Badge>}
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline" className="rounded-full">
            <Link href="/dashboard/products">All menu items</Link>
          </Button>
          <Button asChild variant="outline" className="rounded-full">
            <Link href={`/dashboard/menus/${product.menu.id}`}>Open menu</Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Pricing & storefront</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p className="text-lg font-semibold tabular-nums">{formatCurrency(Number(product.price))}</p>
            <p>
              <span className="text-muted-foreground">Storefront:</span>{" "}
              {product.storefrontVisible ? "visible" : "hidden"}
            </p>
            {product.publicSlug ? (
              <p>
                <span className="text-muted-foreground">Slug:</span> {product.publicSlug}
              </p>
            ) : null}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Production task</CardTitle>
            <CardDescription>Cook / pack / label snapshot.</CardDescription>
          </CardHeader>
          <CardContent className="text-sm">
            {product.productionTask ? (
              <p>
                Cooked {product.productionTask.cooked ? "yes" : "no"} · Packed{" "}
                {product.productionTask.packed ? "yes" : "no"} · Labeled{" "}
                {product.productionTask.labeled ? "yes" : "no"}
              </p>
            ) : (
              <p className="text-muted-foreground">No production task row.</p>
            )}
            <Button asChild variant="outline" size="sm" className="mt-3 rounded-full">
              <Link href="/dashboard/production">Production</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {(product.allergens || product.ingredients || product.kitchenNotes) && (
        <Card>
          <CardHeader>
            <CardTitle>Allergens & kitchen notes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {product.allergens ? (
              <p>
                <span className="font-medium text-amber-800">Allergens:</span> {product.allergens}
              </p>
            ) : null}
            {product.ingredients ? (
              <p>
                <span className="font-medium">Ingredients:</span> {product.ingredients}
              </p>
            ) : null}
            {product.kitchenNotes ? (
              <p>
                <span className="font-medium">Kitchen notes:</span> {product.kitchenNotes}
              </p>
            ) : null}
          </CardContent>
        </Card>
      )}

      <ActivityTimeline items={activity} />
    </div>
  );
}
