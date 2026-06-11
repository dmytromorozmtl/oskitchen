import Link from "next/link";

import { updateStorefrontProductFieldsFormAction } from "@/actions/storefront-product-public";
import { PaginationBar } from "@/components/dashboard/pagination-bar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { getTenantActor } from "@/lib/scope/cached-tenant";
import { requireStorefrontManagePage } from "@/lib/storefront/storefront-page-access";
import { adminPagination, parseAdminPageParam } from "@/lib/storefront/pagination";
import { prisma } from "@/lib/prisma";

export default async function StorefrontProductsAdminPage({
  searchParams,
}: {
  searchParams?: Promise<{ page?: string }>;
}) {
  const manageAccess = await requireStorefrontManagePage({
    operation: "storefront.products.view",
    route: "/dashboard/storefront/products",
  });
  if (!manageAccess.ok) return manageAccess.deny;

  const { dataUserId } = await getTenantActor();
  const sp = searchParams ? await searchParams : {};
  const pageNum = parseAdminPageParam(sp.page);
  const settings = await prisma.storefrontSettings.findFirst({
    where: { userId: dataUserId },
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      storeSlug: true,
      activeMenuId: true,
    },
  });

  const menuId = settings?.activeMenuId;
  const productWhere = menuId ? { menuId } : null;
  const total = productWhere ? await prisma.product.count({ where: productWhere }) : 0;
  const { skip, take, page, totalPages } = adminPagination(total, pageNum);
  const products = productWhere
    ? await prisma.product.findMany({
        where: productWhere,
        orderBy: { sortOrder: "asc" },
        take,
        skip,
      })
    : [];

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Products on the storefront</h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Control public URL slugs, visibility on the guest menu, featured flags, and per-item caps.
          Dish content (photos, ingredients) is edited in{" "}
          <Link href="/dashboard/menus" className="text-primary underline-offset-4 hover:underline">
            Menu Center
          </Link>
          .
        </p>
      </div>

      {!menuId ? (
        <Card className="border-border/80 shadow-sm">
          <CardHeader>
            <CardTitle>No active menu</CardTitle>
            <CardDescription>
              Choose an active menu on{" "}
              <Link href="/dashboard/storefront" className="text-primary underline-offset-4 hover:underline">
                Overview
              </Link>{" "}
              first.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <div className="space-y-4">
          {products.length === 0 ? (
            <p className="text-sm text-muted-foreground">No products on this menu.</p>
          ) : null}
          {products.map((p) => (
            <Card key={p.id} className="border-border/80 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">{p.title}</CardTitle>
                <CardDescription className="font-mono text-xs">Product id: {p.id}</CardDescription>
              </CardHeader>
              <CardContent>
                <form action={updateStorefrontProductFieldsFormAction} className="grid gap-4 sm:grid-cols-2">
                  <input type="hidden" name="productId" value={p.id} />
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor={`slug-${p.id}`}>Public URL slug (optional)</Label>
                    <Input
                      id={`slug-${p.id}`}
                      name="publicSlug"
                      defaultValue={p.publicSlug ?? ""}
                      placeholder="e.g. chicken-tikka-bowl"
                      className="rounded-xl font-mono text-sm"
                    />
                    <p className="text-xs text-muted-foreground">
                      Guests can open{" "}
                      <span className="font-mono">
                        /s/{settings!.storeSlug}/products/
                        {p.publicSlug?.trim() || p.id}
                      </span>
                      .
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`max-${p.id}`}>Max per order (optional)</Label>
                    <Input
                      id={`max-${p.id}`}
                      name="maxStorefrontQuantity"
                      type="number"
                      min={1}
                      max={500}
                      defaultValue={p.maxStorefrontQuantity ?? ""}
                      className="rounded-xl"
                    />
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor={`seoTitle-${p.id}`}>SEO title (storefront)</Label>
                    <Input
                      id={`seoTitle-${p.id}`}
                      name="storefrontSeoTitle"
                      defaultValue={p.storefrontSeoTitle ?? ""}
                      className="rounded-xl"
                      placeholder={p.title}
                    />
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor={`seoDesc-${p.id}`}>SEO description</Label>
                    <Textarea
                      id={`seoDesc-${p.id}`}
                      name="storefrontSeoDescription"
                      rows={2}
                      defaultValue={p.storefrontSeoDescription ?? ""}
                      className="rounded-xl text-sm"
                    />
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor={`og-${p.id}`}>Open Graph image URL</Label>
                    <Input
                      id={`og-${p.id}`}
                      name="storefrontOgImageUrl"
                      defaultValue={p.storefrontOgImageUrl ?? ""}
                      className="rounded-xl font-mono text-sm"
                      placeholder="https://…"
                    />
                  </div>
                  <div className="flex flex-col justify-end gap-3 sm:col-span-2 sm:flex-row sm:items-center">
                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        name="storefrontVisible"
                        value="on"
                        defaultChecked={p.storefrontVisible}
                        className="h-4 w-4 rounded border-input"
                      />
                      Visible on storefront menu
                    </label>
                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        name="storefrontFeatured"
                        value="on"
                        defaultChecked={p.storefrontFeatured}
                        className="h-4 w-4 rounded border-input"
                      />
                      Featured (for future homepage blocks)
                    </label>
                  </div>
                  <div className="sm:col-span-2">
                    <Button type="submit" size="sm" className="rounded-full">
                      Save product
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          ))}
          <PaginationBar
            basePath="/dashboard/storefront/products"
            page={page}
            totalPages={totalPages}
          />
        </div>
      )}
    </div>
  );
}
