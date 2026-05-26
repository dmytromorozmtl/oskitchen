import Link from "next/link";
import { startOfDay } from "date-fns";
import {
  ArrowRight,
  BarChart3,
  Boxes,
  Layers3,
  LayoutGrid,
  Plus,
  Sparkles,
  Store,
} from "lucide-react";

import { createBrandFormAction } from "@/actions/brands";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getTenantActor } from "@/lib/scope/cached-tenant";
import { BUSINESS_TYPE_LABELS, resolveBusinessType } from "@/lib/business-modes";
import {
  brandAssignmentPath,
  brandDetailPath,
  brandMultiBrandSetupPath,
  brandNewWizardPath,
  brandReportsPath,
  brandTemplatesPath,
} from "@/lib/brands/brand-routing";
import { brandSetupProgress, formatConceptKind, formatLifecycle } from "@/lib/brands/brand-helpers";
import { orderListWhereForOwnerAnd } from "@/lib/scope/workspace-resource-scope";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

const brandHubInclude = {
  _count: {
    select: {
      menus: true,
      storefrontSettings: true,
      orders: true,
      products: true,
      integrationConnections: true,
    },
  },
} satisfies Prisma.BrandInclude;

type BrandHubRow = Prisma.BrandGetPayload<{ include: typeof brandHubInclude }>;

const TABS = ["overview", "active", "drafts", "templates", "multi", "reports"] as const;
type BrandsTab = (typeof TABS)[number];

function normalizeTab(raw: string | undefined): BrandsTab {
  if (raw && (TABS as readonly string[]).includes(raw)) return raw as BrandsTab;
  return "overview";
}

export default async function BrandsPage({
  searchParams,
}: {
  searchParams?: Promise<{ tab?: string }>;
}) {
  const { sessionUser: user, dataUserId } = await getTenantActor();
  const tab = normalizeTab((await searchParams)?.tab);

  const profile = await prisma.userProfile.findUnique({
    where: { id: dataUserId },
    select: { kitchenSettings: { select: { businessType: true } } },
  });
  const bt = profile?.kitchenSettings?.businessType ?? null;
  const modeLabel = bt != null ? BUSINESS_TYPE_LABELS[resolveBusinessType(bt)] : null;

  const brands = await prisma.brand.findMany({
    where: { workspace: { ownerUserId: dataUserId } },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    include: brandHubInclude,
  });

  const dayStart = startOfDay(new Date());
  const ordersToday = await prisma.order.count({
    where: await orderListWhereForOwnerAnd(dataUserId, { createdAt: { gte: dayStart } }),
  });

  const activeCount = brands.filter((b) => b.lifecycleStatus === "ACTIVE").length;
  const draftCount = brands.filter((b) => b.lifecycleStatus === "DRAFT").length;
  const withStorefront = brands.filter((b) => b._count.storefrontSettings > 0).length;
  const missingSetup = brands.filter(
    (b) =>
      brandSetupProgress({
        hasLogo: Boolean(b.logoUrl),
        hasColor: Boolean(b.brandColor),
        menuCount: b._count.menus,
        storefrontCount: b._count.storefrontSettings,
        hasDescription: Boolean(b.description?.trim()),
      }) < 1,
  ).length;

  const subtitle =
    modeLabel != null
      ? `Manage concepts, virtual brands, storefronts, menus, and reporting for your ${modeLabel.toLowerCase()} operation.`
      : "Manage concepts, virtual brands, storefronts, menus, and reporting under one kitchen operation.";

  const filtered =
    tab === "active"
      ? brands.filter((b) => b.lifecycleStatus === "ACTIVE")
      : tab === "drafts"
        ? brands.filter((b) => b.lifecycleStatus === "DRAFT")
        : brands;

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Brands</h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">{subtitle}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild className="rounded-full" variant="premium">
            <Link href={brandNewWizardPath()}>
              <Plus className="mr-2 h-4 w-4" />
              New brand
            </Link>
          </Button>
          <Button asChild variant="outline" className="rounded-full">
            <Link href={brandTemplatesPath()}>
              <Sparkles className="mr-2 h-4 w-4" />
              Brand templates
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="border-border/80 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active brands</CardTitle>
          </CardHeader>
          <CardContent className="flex items-baseline justify-between">
            <p className="text-3xl font-semibold tabular-nums">{activeCount}</p>
            <Badge variant="secondary" className="rounded-full">
              {brands.length} total
            </Badge>
          </CardContent>
        </Card>
        <Card className="border-border/80 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Draft brands</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold tabular-nums">{draftCount}</p>
          </CardContent>
        </Card>
        <Card className="border-border/80 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Storefronts linked</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold tabular-nums">{withStorefront}</p>
            <p className="text-xs text-muted-foreground">Distinct brands with ≥1 storefront row</p>
          </CardContent>
        </Card>
        <Card className="border-border/80 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Orders today (workspace)</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold tabular-nums">{ordersToday}</p>
            <p className="text-xs text-muted-foreground">Brand filters in Order Hub ship next</p>
          </CardContent>
        </Card>
        <Card className="border-border/80 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Brands missing setup</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold tabular-nums">{missingSetup}</p>
            <p className="text-xs text-muted-foreground">Heuristic: menus, storefront, logo, color, story</p>
          </CardContent>
        </Card>
        <Card className="border-border/80 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Multi-brand readiness</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-sm text-muted-foreground">
              {brands.length > 1
                ? "Multiple brands detected — use the setup guide to align storefronts, channels, and production."
                : brands.length === 1
                  ? "Single brand workspace — you can add more concepts anytime."
                  : "No brands yet — optional until you run ghost kitchen or multi-concept operations."}
            </p>
            <Button asChild variant="outline" size="sm" className="rounded-full">
              <Link href={brandMultiBrandSetupPath()}>Open multi-brand setup</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <Tabs value={tab} className="w-full">
        <TabsList className="flex h-auto flex-wrap justify-start gap-1 rounded-xl bg-muted/40 p-1">
          {(
            [
              ["overview", "Overview", LayoutGrid],
              ["active", "Active brands", Boxes],
              ["drafts", "Drafts", Layers3],
              ["templates", "Templates", Sparkles],
              ["multi", "Multi-brand", Boxes],
              ["reports", "Reports", BarChart3],
            ] as const
          ).map(([id, label, Icon]) => (
            <TabsTrigger key={id} value={id} asChild className="rounded-lg">
              <Link href={`/dashboard/brands?tab=${id}`} className="flex items-center gap-2">
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="overview" className="mt-6 space-y-6">
          {brands.length === 0 ? (
            <Card className="border-dashed border-border/80 bg-muted/10">
              <CardHeader>
                <CardTitle>When brands matter</CardTitle>
                <CardDescription>
                  Brands stay optional for single-concept kitchens. Add them when you run multiple guest-facing
                  concepts, virtual brands, or separate P&amp;L lines that share one back-of-house.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-muted-foreground">
                <ul className="list-disc space-y-1 pl-5">
                  <li>Ghost kitchen with multiple virtual concepts</li>
                  <li>Café daytime + catering or events brand</li>
                  <li>Bakery retail line vs preorder pickup brand</li>
                  <li>Meal prep consumer brand + corporate program</li>
                </ul>
                <div className="flex flex-wrap gap-2 pt-2">
                  <Button asChild className="rounded-full">
                    <Link href={brandNewWizardPath()}>Create first brand</Link>
                  </Button>
                  <Button asChild variant="outline" className="rounded-full">
                    <Link href={brandTemplatesPath()}>Use a template</Link>
                  </Button>
                  <Button asChild variant="ghost" className="rounded-full">
                    <Link href="/dashboard">Skip for now</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : brands.length === 1 ? (
            <Card className="border-border/80">
              <CardHeader>
                <CardTitle>You may not need more brands yet</CardTitle>
                <CardDescription>
                  Many operators run a single concept with workspace defaults. Keep building menus and storefront
                  traffic — add another brand when you launch a second concept or virtual label.
                </CardDescription>
              </CardHeader>
            </Card>
          ) : null}

          <Card className="border-border/80 shadow-sm">
            <CardHeader>
              <CardTitle>Quick create</CardTitle>
              <CardDescription>Fast path — use the wizard for identity, channels, and defaults.</CardDescription>
            </CardHeader>
            <CardContent>
              <form action={createBrandFormAction} className="grid gap-4">
                <div className="grid gap-4 md:grid-cols-3">
                  <Input name="name" placeholder="Brand name" required />
                  <Input name="slug" placeholder="brand-slug" required />
                  <Input name="brandColor" placeholder="#286ab8" />
                </div>
                <Textarea name="description" placeholder="Positioning, guest promise, internal notes" />
                <Button type="submit" className="w-fit rounded-full">
                  Create brand
                </Button>
              </form>
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-2">
            {brands.map((b) => {
              const setup = brandSetupProgress({
                hasLogo: Boolean(b.logoUrl),
                hasColor: Boolean(b.brandColor),
                menuCount: b._count.menus,
                storefrontCount: b._count.storefrontSettings,
                hasDescription: Boolean(b.description?.trim()),
              });
              return (
                <Card key={b.id} className="border-border/80 shadow-sm">
                  <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-2">
                    <div className="flex min-w-0 gap-3">
                      <div
                        className="h-12 w-12 shrink-0 rounded-xl border border-border/70"
                        style={{ background: b.brandColor ?? "hsl(var(--muted))" }}
                      />
                      <div className="min-w-0">
                        <CardTitle className="truncate text-lg">{b.name}</CardTitle>
                        <CardDescription className="truncate">
                          /{b.slug} · {formatConceptKind(b.conceptKind)}
                        </CardDescription>
                      </div>
                    </div>
                    <Badge variant={b.lifecycleStatus === "ACTIVE" ? "default" : "secondary"} className="rounded-full">
                      {formatLifecycle(b.lifecycleStatus)}
                    </Badge>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm text-muted-foreground">
                    <div className="flex flex-wrap gap-2 text-xs">
                      <Badge variant="outline" className="rounded-full font-normal">
                        Menus {b._count.menus}
                      </Badge>
                      <Badge variant="outline" className="rounded-full font-normal">
                        Items {b._count.products}
                      </Badge>
                      <Badge variant="outline" className="rounded-full font-normal">
                        Storefronts {b._count.storefrontSettings}
                      </Badge>
                      <Badge variant="outline" className="rounded-full font-normal">
                        Channels {b._count.integrationConnections}
                      </Badge>
                      <Badge variant="outline" className="rounded-full font-normal">
                        Orders {b._count.orders}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between gap-2 text-xs">
                      <span>Setup {Math.round(setup * 100)}%</span>
                      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                        <div className="h-full bg-primary" style={{ width: `${setup * 100}%` }} />
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 pt-1">
                      <Button asChild size="sm" variant="secondary" className="rounded-full">
                        <Link href={brandDetailPath(b.id)}>
                          Open <ArrowRight className="ml-1 h-3 w-3" />
                        </Link>
                      </Button>
                      <Button asChild size="sm" variant="outline" className="rounded-full">
                        <Link href="/dashboard/menus">Menus</Link>
                      </Button>
                      <Button asChild size="sm" variant="outline" className="rounded-full">
                        <Link href="/dashboard/storefront">
                          <Store className="mr-1 h-3 w-3" />
                          Storefront
                        </Link>
                      </Button>
                      <Button asChild size="sm" variant="outline" className="rounded-full">
                        <Link href={brandReportsPath(b.id)}>
                          <BarChart3 className="mr-1 h-3 w-3" />
                          Reports
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="active" className="mt-6">
          <BrandList brands={filtered} empty="No active brands." />
        </TabsContent>
        <TabsContent value="drafts" className="mt-6">
          <BrandList brands={filtered} empty="No draft brands." />
        </TabsContent>
        <TabsContent value="templates" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Brand templates</CardTitle>
              <CardDescription>
                Pre-configured concepts (menus, storefront tone, production defaults) live on the templates route.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="rounded-full">
                <Link href={brandTemplatesPath()}>Open templates library</Link>
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="multi" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Multi-brand setup</CardTitle>
              <CardDescription>
                Guided workflow for ghost kitchens: shared kitchen, menus, inventory, storefronts, channels, and
                production boards.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="rounded-full">
                <Link href={brandMultiBrandSetupPath()}>Start setup wizard</Link>
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="reports" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Brand-scoped reporting</CardTitle>
              <CardDescription>
                Revenue, margin, channel mix, and storefront conversion by brand — aggregate here or open a brand
                detail page.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              {brands.map((b) => (
                <Button key={b.id} asChild variant="outline" size="sm" className="rounded-full">
                  <Link href={brandReportsPath(b.id)}>{b.name}</Link>
                </Button>
              ))}
              {brands.length === 0 ? (
                <p className="text-sm text-muted-foreground">Create a brand to unlock scoped reports.</p>
              ) : null}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Card className="border-dashed border-border/80">
        <CardHeader>
          <CardTitle>Bulk assignment</CardTitle>
          <CardDescription>
            Assign existing menus, items, storefronts, and channels to brands without destructive migrations.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild variant="outline" className="rounded-full">
            <Link href={brandAssignmentPath()}>Open assignment tools</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

function BrandList({ brands, empty }: { brands: BrandHubRow[]; empty: string }) {
  if (!brands.length) {
    return (
      <Card className="border-dashed p-10 text-center text-sm text-muted-foreground">
        {empty}
      </Card>
    );
  }
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {brands.map((b) => (
        <Card key={b.id}>
          <CardHeader>
            <CardTitle className="text-base">{b.name}</CardTitle>
            <CardDescription>
              {formatLifecycle(b.lifecycleStatus)} · {formatConceptKind(b.conceptKind)}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild size="sm" variant="secondary" className="rounded-full">
              <Link href={brandDetailPath(b.id)}>Open</Link>
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
