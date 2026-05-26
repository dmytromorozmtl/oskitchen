import Link from "next/link";
import { ChefHat } from "lucide-react";

import { setStorefrontActiveMenuFormAction } from "@/actions/storefront-settings";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { getTenantActor } from "@/lib/scope/cached-tenant";
import { findAdminStorefront } from "@/lib/storefront/load-admin-storefront";
import { menuListWhereForOwner } from "@/lib/scope/workspace-resource-scope";
import { prisma } from "@/lib/prisma";
import { SITE_URL } from "@/lib/constants";
import { ensureCatalogMenu } from "@/lib/products/ensure-catalog-menu";

export default async function StorefrontMenuAdminPage() {
  const { sessionUser: user, dataUserId } = await getTenantActor();
  await ensureCatalogMenu(dataUserId);
  const menuWhere = await menuListWhereForOwner(dataUserId);
  const [settings, menusAll] = await Promise.all([
    findAdminStorefront(user.id),
    prisma.menu.findMany({
      where: menuWhere,
      orderBy: { createdAt: "desc" },
      take: 50,
      include: { _count: { select: { products: true } } },
    }),
  ]);

  const menus = menusAll.filter((m) => !m.catalogOnly);

  const active = settings?.activeMenuId
    ? menus.find((m) => m.id === settings.activeMenuId)
    : null;

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Menu</h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          The public storefront shows dishes from your <strong>active menu</strong>. Edit dishes,
          photos, and pricing in Menu Center — then set the live menu here (or on Overview; both update the same field).
        </p>
      </div>

      <Card className="border-border/80 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ChefHat className="h-5 w-5" />
            Active menu
          </CardTitle>
          <CardDescription>
            {settings ? (
              <>
                Store:{" "}
                <span className="font-mono text-xs">
                  {SITE_URL.replace(/\/$/, "")}/s/{settings.storeSlug}
                </span>
              </>
            ) : (
              "Save storefront settings on Overview to attach a menu."
            )}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {active ? (
            <div className="rounded-xl border border-border/80 bg-muted/40 px-4 py-3 text-sm">
              <p className="font-medium">{active.title}</p>
              <p className="text-muted-foreground">
                {active._count.products} product{active._count.products === 1 ? "" : "s"} on this menu
              </p>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              No active menu selected. Choose one below or on{" "}
              <Link href="/dashboard/storefront" className="text-primary underline-offset-4 hover:underline">
                Overview
              </Link>
              .
            </p>
          )}
          {settings && menus.length > 0 ? (
            <form action={setStorefrontActiveMenuFormAction} className="space-y-2 rounded-xl border border-border/60 bg-background/60 p-4">
              <Label htmlFor="menu-active-pick">Switch active menu</Label>
              <div className="flex flex-wrap gap-2">
                <select
                  id="menu-active-pick"
                  name="activeMenuId"
                  defaultValue={settings.activeMenuId ?? ""}
                  className="min-h-10 min-w-[200px] flex-1 rounded-xl border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="">None</option>
                  {menus.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.title}
                    </option>
                  ))}
                </select>
                <Button type="submit" size="sm" className="rounded-full">
                  Save
                </Button>
              </div>
            </form>
          ) : null}
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="outline" className="rounded-full">
              <Link href="/dashboard/menus">Menu Center</Link>
            </Button>
            <Button asChild variant="outline" className="rounded-full">
              <Link href="/dashboard/storefront/catalog">Variants &amp; modifiers</Link>
            </Button>
            <Button asChild className="rounded-full" variant="secondary">
              <Link href="/dashboard/storefront">Storefront overview</Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/80 shadow-sm">
        <CardHeader>
          <CardTitle>Your menus</CardTitle>
          <CardDescription>Recently updated menus for this workspace.</CardDescription>
        </CardHeader>
        <CardContent>
          {menus.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No menus yet.{" "}
              <Link href="/dashboard/menus" className="text-primary underline-offset-4 hover:underline">
                Create a menu in Menu Center
              </Link>
              .
            </p>
          ) : (
            <ul className="divide-y divide-border/80 rounded-xl border border-border/80">
              {menus.map((m) => (
                <li key={m.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 text-sm">
                  <div>
                    <p className="font-medium">{m.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {m._count.products} products
                      {settings?.activeMenuId === m.id ? " · Active on storefront" : ""}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
