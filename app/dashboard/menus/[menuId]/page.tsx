import Link from "next/link";
import { notFound } from "next/navigation";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getTenantActor } from "@/lib/scope/cached-tenant";
import { findOwnerKitchenSettings } from "@/lib/scope/owner-kitchen-settings";
import { menuCenterCopy } from "@/lib/menus/menu-terminology";
import { menuStrategyDefinition } from "@/lib/menus/menu-strategies";
import { menuByIdWhereForOwner } from "@/lib/scope/workspace-resource-scope";
import { prisma } from "@/lib/prisma";

const TABS = [
  { id: "overview", label: "Overview" },
  { id: "items", label: "Items" },
  { id: "categories", label: "Categories" },
  { id: "availability", label: "Availability" },
  { id: "fulfillment", label: "Fulfillment" },
  { id: "storefront", label: "Storefront" },
  { id: "production", label: "Production" },
  { id: "reports", label: "Reports" },
  { id: "settings", label: "Settings" },
] as const;

export default async function MenuDetailPage({ params }: { params: Promise<{ menuId: string }> }) {
  const { menuId } = await params;
  const { dataUserId } = await getTenantActor();

  const menuWhere = await menuByIdWhereForOwner(dataUserId, menuId);
  const [menu, kitchen] = await Promise.all([
    prisma.menu.findFirst({
      where: menuWhere,
      include: { _count: { select: { products: true } } },
    }),
    findOwnerKitchenSettings(dataUserId, { businessType: true }),
  ]);

  if (!menu) notFound();

  const copy = menuCenterCopy(kitchen?.businessType ?? null);
  const strat = menuStrategyDefinition(menu.strategy);

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          <Link href="/dashboard/menus" className="hover:text-foreground">
            {copy.pageTitle}
          </Link>
          <span className="mx-2">/</span>
          {menu.title}
        </p>
        <div className="mt-3 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">{menu.title}</h1>
            <p className="mt-2 text-muted-foreground">{strat.description}</p>
            <p className="mt-2 text-sm text-muted-foreground">
              {format(menu.startDate, "MMM d, yyyy")} — {format(menu.endDate, "MMM d, yyyy")} ·{" "}
              {menu._count.products} {copy.itemsWord.toLowerCase()}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" className="rounded-full" asChild>
              <Link href="/dashboard/products">Attach {copy.itemsWord.toLowerCase()}</Link>
            </Button>
            <Button variant="outline" size="sm" className="rounded-full" asChild>
              <Link href="/dashboard/menu-planner">Open planner</Link>
            </Button>
            <Button size="sm" className="rounded-full" variant="premium" asChild>
              <Link href={`/dashboard/menus/${menu.id}/reports`}>Reports</Link>
            </Button>
          </div>
        </div>
      </div>

      <nav className="flex flex-wrap gap-2 border-b border-border/70 pb-2 text-sm">
        {TABS.map((t) => (
          <span
            key={t.id}
            className={
              t.id === "overview"
                ? "rounded-full bg-primary/10 px-3 py-1 font-medium text-primary"
                : "rounded-full px-3 py-1 text-muted-foreground"
            }
          >
            {t.label}
            {t.id !== "overview" ? (
              <span className="ml-1 text-[10px] uppercase text-muted-foreground/80">Soon</span>
            ) : null}
          </span>
        ))}
      </nav>

      <Card className="border-border/80 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Overview</CardTitle>
          <CardDescription>
            Readiness checklist and deep tabs (items, storefront, production) will roll out
            incrementally. Your menu already powers products, orders, and production tasks.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>
            <span className="font-medium text-foreground">Strategy:</span> {strat.label}
          </p>
          <p>
            <span className="font-medium text-foreground">Storefront:</span> {strat.storefrontBehavior}
          </p>
          <p>
            <span className="font-medium text-foreground">Production:</span> {strat.productionBehavior}
          </p>
          {menu.description ? (
            <p>
              <span className="font-medium text-foreground">Notes:</span> {menu.description}
            </p>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
