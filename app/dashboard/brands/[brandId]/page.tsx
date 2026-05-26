import Link from "next/link";
import { notFound } from "next/navigation";

import { updateBrandDetailsFormAction, updateBrandLifecycleFormAction } from "@/actions/brands";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { getTenantActor } from "@/lib/scope/cached-tenant";
import { ALL_BUSINESS_TYPES_ORDERED, BUSINESS_TYPE_LABELS } from "@/lib/business-modes";
import { brandHubPath, brandReportsPath } from "@/lib/brands/brand-routing";
import { brandSetupProgress, formatConceptKind, formatLifecycle } from "@/lib/brands/brand-helpers";
import { orderListWhereForOwnerAnd } from "@/lib/scope/workspace-resource-scope";
import { prisma } from "@/lib/prisma";

const TABS = [
  "overview",
  "identity",
  "menus",
  "items",
  "storefront",
  "channels",
  "orders",
  "production",
  "customers",
  "reports",
  "settings",
] as const;
type BrandTab = (typeof TABS)[number];

function normalizeTab(raw: string | undefined): BrandTab {
  if (raw && (TABS as readonly string[]).includes(raw)) return raw as BrandTab;
  return "overview";
}

export default async function BrandDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ brandId: string }>;
  searchParams?: Promise<{ tab?: string }>;
}) {
  const { brandId } = await params;
  const tab = normalizeTab((await searchParams)?.tab);
  const { sessionUser: user, dataUserId } = await getTenantActor();

  const brand = await prisma.brand.findFirst({
    where: { id: brandId, workspace: { ownerUserId: dataUserId } },
    include: {
      _count: {
        select: {
          menus: true,
          products: true,
          orders: true,
          storefrontSettings: true,
          integrationConnections: true,
        },
      },
    },
  });
  if (!brand) notFound();

  const setup = brandSetupProgress({
    hasLogo: Boolean(brand.logoUrl),
    hasColor: Boolean(brand.brandColor),
    menuCount: brand._count.menus,
    storefrontCount: brand._count.storefrontSettings,
    hasDescription: Boolean(brand.description?.trim()),
  });

  const ordersWeek = await prisma.order.count({
    where: await orderListWhereForOwnerAnd(dataUserId, {
      brandId: brand.id,
      createdAt: { gte: new Date(Date.now() - 7 * 86400000) },
    }),
  });

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            <Link href={brandHubPath()} className="hover:text-foreground">
              Brands
            </Link>
            <span className="mx-2">/</span>
            {brand.name}
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <h1 className="text-3xl font-semibold tracking-tight">{brand.name}</h1>
            <Badge variant="secondary" className="rounded-full">
              {formatLifecycle(brand.lifecycleStatus)}
            </Badge>
            <Badge variant="outline" className="rounded-full">
              {formatConceptKind(brand.conceptKind)}
            </Badge>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">/{brand.slug}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline" size="sm" className="rounded-full">
            <Link href={brandReportsPath(brand.id)}>Reports</Link>
          </Button>
        </div>
      </div>

      <nav className="flex flex-wrap gap-2 border-b border-border/70 pb-2 text-sm">
        {TABS.map((id) => (
          <Link
            key={id}
            href={`/dashboard/brands/${brand.id}?tab=${id}`}
            className={
              tab === id
                ? "rounded-full bg-primary/10 px-3 py-1 font-medium text-primary"
                : "rounded-full px-3 py-1 text-muted-foreground hover:text-foreground"
            }
          >
            {id === "items"
              ? "Menu items"
              : id.charAt(0).toUpperCase() + id.slice(1).replace(/-/g, " ")}
          </Link>
        ))}
      </nav>

      {tab === "overview" ? (
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Setup checklist</CardTitle>
              <CardDescription>Heuristic progress across story, visuals, menus, and storefront.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex items-center justify-between gap-2">
                <span>Progress</span>
                <span className="tabular-nums font-medium">{Math.round(setup * 100)}%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-muted">
                <div className="h-full bg-primary" style={{ width: `${setup * 100}%` }} />
              </div>
              <ul className="list-disc pl-5 text-muted-foreground">
                {brand._count.menus === 0 ? <li>Attach at least one menu in Menus (filter by brand).</li> : null}
                {brand._count.storefrontSettings === 0 ? (
                  <li>Link a storefront row to this brand when multi-storefront ships.</li>
                ) : null}
                {!brand.logoUrl ? <li>Add a logo in Identity.</li> : null}
              </ul>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">KPIs (7 days)</CardTitle>
              <CardDescription>Orders tagged with this brand id.</CardDescription>
            </CardHeader>
            <CardContent className="text-2xl font-semibold tabular-nums">{ordersWeek}</CardContent>
          </Card>
        </div>
      ) : null}

      {tab === "identity" ? (
        <Card>
          <CardHeader>
            <CardTitle>Identity & positioning</CardTitle>
            <CardDescription>Updates write to the brand row; storefront can later inherit these tokens.</CardDescription>
          </CardHeader>
          <CardContent>
            <form action={updateBrandDetailsFormAction} className="grid max-w-xl gap-4">
              <input type="hidden" name="brandId" value={brand.id} />
              <div className="grid gap-2">
                <label className="text-sm font-medium">Name</label>
                <Input name="name" defaultValue={brand.name} required />
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium">Slug</label>
                <Input name="slug" defaultValue={brand.slug} required />
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium">Description</label>
                <Textarea name="description" defaultValue={brand.description ?? ""} rows={3} />
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium">Positioning</label>
                <Textarea name="positioning" defaultValue={brand.positioning ?? ""} rows={3} />
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium">Customer segment</label>
                <Input name="customerSegment" defaultValue={brand.customerSegment ?? ""} />
              </div>
              <div className="grid gap-2 md:grid-cols-2 md:gap-4">
                <div className="grid gap-2">
                  <label className="text-sm font-medium">Brand color</label>
                  <Input name="brandColor" defaultValue={brand.brandColor ?? ""} />
                </div>
                <div className="grid gap-2">
                  <label className="text-sm font-medium">Secondary color</label>
                  <Input name="secondaryColor" defaultValue={brand.secondaryColor ?? ""} />
                </div>
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium">Logo URL</label>
                <Input name="logoUrl" defaultValue={brand.logoUrl ?? ""} />
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium">Cover image URL</label>
                <Input name="coverImageUrl" defaultValue={brand.coverImageUrl ?? ""} />
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium">Website</label>
                <Input name="websiteUrl" defaultValue={brand.websiteUrl ?? ""} />
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium">Custom domain (brand)</label>
                <Input name="brandCustomDomain" defaultValue={brand.brandCustomDomain ?? ""} />
              </div>
              <div className="grid gap-2 md:grid-cols-2 md:gap-4">
                <div className="grid gap-2">
                  <label className="text-sm font-medium">Contact email</label>
                  <Input name="contactEmail" type="email" defaultValue={brand.contactEmail ?? ""} />
                </div>
                <div className="grid gap-2">
                  <label className="text-sm font-medium">Contact phone</label>
                  <Input name="contactPhone" defaultValue={brand.contactPhone ?? ""} />
                </div>
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium">SEO title</label>
                <Input name="seoTitle" defaultValue={brand.seoTitle ?? ""} />
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium">SEO description</label>
                <Textarea name="seoDescription" defaultValue={brand.seoDescription ?? ""} rows={2} />
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium">SEO image URL</label>
                <Input name="seoImageUrl" defaultValue={brand.seoImageUrl ?? ""} />
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium">Default business mode</label>
                <select
                  name="defaultBusinessMode"
                  defaultValue={brand.defaultBusinessMode ?? ""}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <option value="">Not set</option>
                  {ALL_BUSINESS_TYPES_ORDERED.map((bt) => (
                    <option key={bt} value={bt}>
                      {BUSINESS_TYPE_LABELS[bt]}
                    </option>
                  ))}
                </select>
              </div>
              <Button type="submit" className="w-fit rounded-full">
                Save identity
              </Button>
            </form>
          </CardContent>
        </Card>
      ) : null}

      {tab === "menus" ? (
        <Card>
          <CardHeader>
            <CardTitle>Menus</CardTitle>
            <CardDescription>
              {brand._count.menus} menu{brand._count.menus === 1 ? "" : "s"} linked to this brand. Open Menu Center to
              assign <code className="text-xs">brandId</code> without breaking existing menus.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline" className="rounded-full">
              <Link href="/dashboard/menus">Open menus</Link>
            </Button>
          </CardContent>
        </Card>
      ) : null}

      {tab === "items" ? (
        <Card>
          <CardHeader>
            <CardTitle>Menu items</CardTitle>
            <CardDescription>
              {brand._count.products} product row{brand._count.products === 1 ? "" : "s"} carry this brand id.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline" className="rounded-full">
              <Link href="/dashboard/products">Open products</Link>
            </Button>
          </CardContent>
        </Card>
      ) : null}

      {tab === "storefront" ? (
        <Card>
          <CardHeader>
            <CardTitle>Storefront</CardTitle>
            <CardDescription>
              {brand._count.storefrontSettings} storefront row{brand._count.storefrontSettings === 1 ? "" : "s"} linked.
              Theme inheritance and per-brand domains are staged in docs.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline" className="rounded-full">
              <Link href="/dashboard/storefront">Open storefront</Link>
            </Button>
          </CardContent>
        </Card>
      ) : null}

      {tab === "channels" ? (
        <Card>
          <CardHeader>
            <CardTitle>Sales channels</CardTitle>
            <CardDescription>
              {brand._count.integrationConnections} integration connection{brand._count.integrationConnections === 1 ? "" : "s"} scoped to this brand.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline" className="rounded-full">
              <Link href="/dashboard/sales-channels">Open sales channels</Link>
            </Button>
          </CardContent>
        </Card>
      ) : null}

      {tab === "orders" ? (
        <Card>
          <CardHeader>
            <CardTitle>Orders</CardTitle>
            <CardDescription>
              {brand._count.orders} total orders tagged with this brand. Order Hub filters ship incrementally.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline" className="rounded-full">
              <Link href="/dashboard/orders">Open order hub</Link>
            </Button>
          </CardContent>
        </Card>
      ) : null}

      {tab === "production" ? (
        <Card>
          <CardHeader>
            <CardTitle>Production</CardTitle>
            <CardDescription>Brand badges on kitchen tasks and batch views are rolling out with shared boards.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline" className="rounded-full">
              <Link href="/dashboard/production">Open production</Link>
            </Button>
          </CardContent>
        </Card>
      ) : null}

      {tab === "customers" ? (
        <Card>
          <CardHeader>
            <CardTitle>Customers</CardTitle>
            <CardDescription>Segment overlap and brand-level CRM views stay on the roadmap.</CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Use orders filtered by brand today; dedicated customer cohort export comes next.
          </CardContent>
        </Card>
      ) : null}

      {tab === "reports" ? (
        <Card>
          <CardHeader>
            <CardTitle>Reports</CardTitle>
            <CardDescription>Deep dashboards live on the brand reports route.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="rounded-full">
              <Link href={brandReportsPath(brand.id)}>Open brand reports</Link>
            </Button>
          </CardContent>
        </Card>
      ) : null}

      {tab === "settings" ? (
        <div className="grid gap-4 md:max-w-md">
          <Card>
            <CardHeader>
              <CardTitle>Lifecycle</CardTitle>
              <CardDescription>Draft → Active → Paused → Archived. Prefer archive over delete.</CardDescription>
            </CardHeader>
            <CardContent>
              <form action={updateBrandLifecycleFormAction} className="flex flex-wrap items-end gap-2">
                <input type="hidden" name="brandId" value={brand.id} />
                <select
                  name="lifecycleStatus"
                  defaultValue={brand.lifecycleStatus}
                  className="flex h-10 flex-1 min-w-[160px] rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="DRAFT">Draft</option>
                  <option value="ACTIVE">Active</option>
                  <option value="PAUSED">Paused</option>
                  <option value="ARCHIVED">Archived</option>
                </select>
                <Button type="submit" variant="secondary" className="rounded-full">
                  Update status
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      ) : null}
    </div>
  );
}
