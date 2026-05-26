import Link from "next/link";
import { format } from "date-fns";
import { CalendarDays, ClipboardCheck, Columns3, LayoutDashboard, Timer } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getTenantActor } from "@/lib/scope/cached-tenant";
import { getMenuPlannerPageTitle } from "@/lib/menu-items/item-terminology";
import { ensureCatalogMenu } from "@/lib/products/ensure-catalog-menu";
import {
  menuListWhereForOwner,
  menuListWhereForOwnerAnd,
} from "@/lib/scope/workspace-resource-scope";
import { prisma } from "@/lib/prisma";

export default async function MenuPlannerPage() {
  const { sessionUser: user, dataUserId } = await getTenantActor();
  await ensureCatalogMenu(dataUserId);

  const [plannerMenuWhere, menuScopeWhere] = await Promise.all([
    menuListWhereForOwnerAnd(dataUserId, { catalogOnly: false }),
    menuListWhereForOwner(dataUserId),
  ]);

  const [profile, menus, availCount, templates] = await Promise.all([
    prisma.userProfile.findUnique({
      where: { id: dataUserId },
      select: { kitchenSettings: { select: { businessType: true } } },
    }),
    prisma.menu.findMany({
      where: plannerMenuWhere,
      include: {
        products: {
          where: { active: true },
          orderBy: { sortOrder: "asc" },
          take: 80,
        },
        _count: { select: { productAvailabilities: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 24,
    }),
    prisma.productAvailability.count({
      where: { menu: menuScopeWhere },
    }),
    prisma.menuTemplate.count({ where: { userId: dataUserId } }),
  ]);

  const businessType = profile?.kitchenSettings?.businessType ?? null;
  const pageTitle = getMenuPlannerPageTitle(businessType);

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">{pageTitle}</h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            Plan availability, preorder cutoffs, production days, pickup windows, events, and
            channel-specific menus. Calendar, timeline, and board views are rolling out alongside
            your existing weekly preorder workflow — nothing here replaces Menu Center or the
            catalog.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline" className="rounded-full">
            <Link href="/dashboard/menus">Menu Center</Link>
          </Button>
          <Button asChild variant="outline" className="rounded-full">
            <Link href="/dashboard/products">Item catalog</Link>
          </Button>
        </div>
      </div>

      <Tabs defaultValue="calendar" className="w-full">
        <TabsList className="flex h-auto flex-wrap justify-start gap-1 rounded-xl bg-muted/40 p-1">
          <TabsTrigger value="calendar" className="rounded-lg gap-2">
            <CalendarDays className="h-4 w-4" />
            Calendar
          </TabsTrigger>
          <TabsTrigger value="timeline" className="rounded-lg gap-2">
            <Timer className="h-4 w-4" />
            Timeline
          </TabsTrigger>
          <TabsTrigger value="board" className="rounded-lg gap-2">
            <Columns3 className="h-4 w-4" />
            Board
          </TabsTrigger>
          <TabsTrigger value="strategy" className="rounded-lg gap-2">
            <LayoutDashboard className="h-4 w-4" />
            Strategy
          </TabsTrigger>
          <TabsTrigger value="coverage" className="rounded-lg gap-2">
            <ClipboardCheck className="h-4 w-4" />
            Coverage
          </TabsTrigger>
        </TabsList>

        <TabsContent value="calendar" className="mt-4 space-y-3">
          <Card className="border-dashed border-border/80">
            <CardHeader>
              <CardTitle className="text-base">Day / week / month calendar</CardTitle>
              <CardDescription>
                Will overlay menus, prepared dates, preorder deadlines, closures, pickup windows,
                and catering events. Today, use Menu Center dates and prepared-date hints on each
                menu.
              </CardDescription>
            </CardHeader>
          </Card>
        </TabsContent>
        <TabsContent value="timeline" className="mt-4 space-y-3">
          <Card className="border-dashed border-border/80">
            <CardHeader>
              <CardTitle className="text-base">Publish → cutoff → production → pickup</CardTitle>
              <CardDescription>
                Gantt-style lanes for meal prep, bakery batches, and catering timelines land next.
              </CardDescription>
            </CardHeader>
          </Card>
        </TabsContent>
        <TabsContent value="board" className="mt-4 space-y-3">
          <Card className="border-dashed border-border/80">
            <CardHeader>
              <CardTitle className="text-base">Drag-and-drop lanes</CardTitle>
              <CardDescription>
                Unscheduled items, sold-out lanes, and draft vs published columns will connect the
                catalog, menus, and production.
              </CardDescription>
            </CardHeader>
          </Card>
        </TabsContent>
        <TabsContent value="strategy" className="mt-4 space-y-3">
          <Card className="border-dashed border-border/80">
            <CardHeader>
              <CardTitle className="text-base">Menu strategy</CardTitle>
              <CardDescription>
                Weekly preorder, daily specials, bar happy hour, catering packages, and ghost-kitchen
                brands already use <code className="text-xs">MenuStrategy</code> on menus — planner
                will visualize strategy-specific milestones.
              </CardDescription>
            </CardHeader>
          </Card>
        </TabsContent>
        <TabsContent value="coverage" className="mt-4 space-y-3">
          <Card className="border-dashed border-border/80">
            <CardHeader>
              <CardTitle className="text-base">Availability coverage</CardTitle>
              <CardDescription>
                Highlights gaps: no published menu, no items, no pickup window, no production date,
                or storefront not wired. You currently have{" "}
                <span className="font-medium text-foreground">{availCount}</span> product
                availability window(s) and{" "}
                <span className="font-medium text-foreground">{templates}</span> saved template(s).
              </CardDescription>
            </CardHeader>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="grid gap-4 md:grid-cols-2">
        {menus.map((m) => (
          <Card key={m.id} className="border-border/80 shadow-sm">
            <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-2">
              <div>
                <CardTitle className="text-lg">{m.title}</CardTitle>
                <CardDescription>
                  {format(m.startDate, "MMM d")} – {format(m.endDate, "MMM d, yyyy")}{" "}
                  {m.active ? (
                    <Badge className="ml-2 rounded-full">Active</Badge>
                  ) : (
                    <Badge variant="secondary" className="ml-2 rounded-full">
                      Draft
                    </Badge>
                  )}
                </CardDescription>
              </div>
              <Button asChild size="sm" variant="ghost" className="rounded-full">
                <Link href="/dashboard/products">Items</Link>
              </Button>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p className="font-medium text-foreground">
                {m.products.length} active SKUs · Prepared dates:
              </p>
              <ul className="flex flex-wrap gap-2">
                {[
                  ...new Set(
                    m.products.map((p) => format(p.preparedDate, "EEE MMM d")),
                  ),
                ]
                  .slice(0, 8)
                  .map((d) => (
                    <li key={d}>
                      <Badge variant="outline" className="rounded-full font-normal">
                        {d}
                      </Badge>
                    </li>
                  ))}
              </ul>
              {m._count.productAvailabilities > 0 ? (
                <p className="text-xs">
                  {m._count.productAvailabilities} availability window(s) on file.
                </p>
              ) : (
                <p className="text-xs">
                  No availability windows yet — configure in Menu Center, products, or channel
                  publishes.
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {menus.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Planner setup checklist</CardTitle>
            <CardDescription>
              You can still build your item library without a service menu. When you are ready to
              schedule guest-facing menus, work through the steps below.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <ul className="list-disc space-y-1 pl-5">
              <li>Create a menu in Menu Center (weekly, daily, event, or other strategy).</li>
              <li>Add or import items in the catalog, then assign them to that menu.</li>
              <li>Apply a template or duplicate a previous cycle to move faster.</li>
              <li>Configure storefront publishing and availability windows.</li>
            </ul>
            <div className="flex flex-wrap gap-2 pt-2">
              <Button asChild className="rounded-full">
                <Link href="/dashboard/menus">Menu Center</Link>
              </Button>
              <Button asChild variant="outline" className="rounded-full">
                <Link href="/dashboard/products">Item catalog</Link>
              </Button>
              <Button asChild variant="outline" className="rounded-full">
                <Link href="/dashboard/storefront">Storefront</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
