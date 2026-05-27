import Link from "next/link";
import { startOfDay } from "date-fns";
import { ExternalLink, Store } from "lucide-react";

import { upsertStorefrontSettingsFormAction } from "@/actions/storefront-settings";
import { EmptyState } from "@/components/dashboard/empty-state";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { SITE_URL } from "@/lib/constants";
import { getTenantActor } from "@/lib/scope/cached-tenant";
import { findAdminStorefront } from "@/lib/storefront/load-admin-storefront";
import { resolveStorefrontHubAccess } from "@/lib/storefront/storefront-page-access";
import { ensureCatalogMenu } from "@/lib/products/ensure-catalog-menu";
import { allEditorLocalesForStorefront } from "@/lib/storefront/localized-content";
import { computeStorefrontTranslationCoverage } from "@/lib/storefront/translation-coverage";
import { PilotBetaSurfaceBanner } from "@/components/dashboard/pilot-beta-surface-banner";
import { QRGenerator } from "@/components/storefront/qr-generator";
import { menuListWhereForOwner } from "@/lib/scope/workspace-resource-scope";
import { prisma } from "@/lib/prisma";

export default async function StorefrontAdminPage() {
  const { canManage } = await resolveStorefrontHubAccess();
  const { sessionUser, userId } = await getTenantActor();
  await ensureCatalogMenu(userId);
  const menuWhere = await menuListWhereForOwner(userId);
  const [settings, menusAll] = await Promise.all([
    findAdminStorefront(sessionUser.id),
    prisma.menu.findMany({
      where: menuWhere,
      orderBy: { createdAt: "desc" },
      take: 40,
    }),
  ]);

  const menus = menusAll.filter((m) => !m.catalogOnly);

  const brandCount =
    settings?.workspaceId != null
      ? await prisma.brand.count({ where: { workspaceId: settings.workspaceId } })
      : 0;

  if (menus.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Public storefront</h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            Publish a branded preorder link powered by KitchenOS — no WooCommerce or Shopify
            required.
          </p>
        </div>
        <EmptyState
          icon={Store}
          title="Create a service menu first"
          description="Your storefront displays items from one active menu. Build a menu in Menu Center (weekly, daily, or event-style), then return here to publish."
          primaryLabel="Menu Center"
          primaryHref="/dashboard/menus"
        />
      </div>
    );
  }

  const publicUrl = settings ? `${SITE_URL}/s/${settings.storeSlug}` : null;
  const [ordersToday, pagesForCoverage] = await Promise.all([
    settings?.id != null
      ? prisma.storefrontOrder.count({
          where: {
            storefrontId: settings.id,
            createdAt: { gte: startOfDay(new Date()) },
          },
        })
      : Promise.resolve(0),
    settings?.id != null
      ? prisma.storefrontPage.findMany({
          where: { storefrontId: settings.id },
          include: { sections: { select: { type: true, contentJson: true } } },
        })
      : Promise.resolve([]),
  ]);

  const editorLocales = settings ? allEditorLocalesForStorefront(settings.locale ?? "en") : ["en"];
  const translationCoverage =
    settings && editorLocales.length > 1
      ? computeStorefrontTranslationCoverage({
          editorLocales,
          defaultLocale: editorLocales[0] ?? "en",
          pages: pagesForCoverage.map((p) => ({
            published: p.published,
            contentJson: p.contentJson,
            sections: p.sections,
          })),
        })
      : null;

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <PilotBetaSurfaceBanner
        title="Native storefront commerce"
        description="Checkout, Stripe, and pay-later paths are in beta. Validate on your staging shop before promising production card capture to customers."
      />
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Public storefront</h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            Mobile-first preorder pages — pay-later / request mode by default (no hosted checkout
            required).
          </p>
          <p className="mt-2 text-xs text-muted-foreground">
            Scope: <span className="font-medium text-foreground">Workspace storefront</span> —{" "}
            <Link href="/dashboard/storefront/workspace" className="underline underline-offset-2">
              multi-store
            </Link>
            ,{" "}
            <Link href="/dashboard/storefront/markets" className="underline underline-offset-2">
              markets
            </Link>
            ,{" "}
            <Link href="/dashboard/storefront/team" className="underline underline-offset-2">
              team
            </Link>
            .
          </p>
        </div>
        {publicUrl ? (
          <Button variant="outline" className="rounded-full gap-2" asChild>
            <Link href={publicUrl} target="_blank" rel="noreferrer">
              <ExternalLink className="h-4 w-4" />
              Preview live
            </Link>
          </Button>
        ) : null}
      </div>

      {settings && brandCount > 1 ? (
        <Card className="border-amber-500/30 bg-amber-500/5 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Multi-brand note</CardTitle>
            <CardDescription>
              This workspace has {brandCount} brands. Storefront settings are still owner-scoped — separate public brands need a future{" "}
              <span className="font-mono">brandId</span> storefront model (see docs).
            </CardDescription>
          </CardHeader>
        </Card>
      ) : null}

      {settings ? (
        <div className="grid gap-3 sm:grid-cols-3">
          <Card className="border-border/80 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Orders today</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold tabular-nums">{ordersToday}</p>
              <p className="text-xs text-muted-foreground">Storefront preorder requests</p>
            </CardContent>
          </Card>
          {translationCoverage ? (
            <Card className="border-border/80 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Translation coverage</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-semibold tabular-nums">{translationCoverage.overallPercent}%</p>
                <p className="text-xs text-muted-foreground">
                  Sections {translationCoverage.sectionPercent}% · page SEO {translationCoverage.pageMetaPercent}%
                </p>
              </CardContent>
            </Card>
          ) : null}
          <Card className="border-border/80 shadow-sm sm:col-span-2">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Last updated</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm">
                {settings.updatedAt.toLocaleString(undefined, {
                  dateStyle: "medium",
                  timeStyle: "short",
                })}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Tune theme, SEO, and domains in the tabs above — conversion summary lives under
                Analytics.
              </p>
            </CardContent>
          </Card>
        </div>
      ) : null}

      {settings ? (
        <Card className="border-border/80 shadow-sm">
          <CardHeader>
            <CardTitle>QR menu codes</CardTitle>
            <CardDescription>
              Generate QR codes for tables. Guests scan to open your daily menu and order from their
              phone.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <QRGenerator storeSlug={settings.storeSlug} />
          </CardContent>
        </Card>
      ) : null}

      <Card className="border-border/80 shadow-sm">
        <CardHeader>
          <CardTitle>Publishing</CardTitle>
          <CardDescription>
            {publicUrl ? (
              <span className="font-mono text-xs break-all">{publicUrl}</span>
            ) : canManage ? (
              "Save settings to generate your public URL."
            ) : (
              "Storefront is not configured yet. An editor can save settings from this workspace."
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!canManage ? (
            <p className="text-sm text-muted-foreground">
              You have read-only storefront access. Publishing, domain mode, and checkout terms are
              visible on Launch and Analytics; contact an owner or marketing lead to make changes.
            </p>
          ) : null}
          {canManage ? (
          <form className="space-y-6" action={upsertStorefrontSettingsFormAction}>
            <div className="flex items-center justify-between rounded-xl border border-border/80 px-4 py-3">
              <div>
                <Label htmlFor="published">Published (visible to guests)</Label>
                <p className="text-xs text-muted-foreground">
                  When off, only you can preview the storefront while signed in.
                </p>
              </div>
              <input
                id="published"
                name="published"
                type="checkbox"
                value="on"
                defaultChecked={settings?.published ?? true}
                className="h-4 w-4 rounded border-input"
              />
            </div>

            <div className="flex items-center justify-between rounded-xl border border-border/80 px-4 py-3">
              <div>
                <Label htmlFor="enabled">Enable storefront</Label>
                <p className="text-xs text-muted-foreground">Turn off anytime — link shows 404.</p>
              </div>
              <input
                id="enabled"
                name="enabled"
                type="checkbox"
                value="on"
                defaultChecked={settings?.enabled ?? false}
                className="h-4 w-4 rounded border-input"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="publicName">Public business name</Label>
                <Input
                  id="publicName"
                  name="publicName"
                  defaultValue={settings?.publicName ?? ""}
                  required
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="tagline">Tagline</Label>
                <Input
                  id="tagline"
                  name="tagline"
                  defaultValue={settings?.tagline ?? ""}
                  placeholder="Weekly meal prep · pickup & delivery"
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="storeSlug">URL slug</Label>
                <Input
                  id="storeSlug"
                  name="storeSlug"
                  defaultValue={settings?.storeSlug ?? ""}
                  placeholder="your-brand"
                  required
                  className="rounded-xl font-mono text-sm"
                />
                <p className="text-xs text-muted-foreground">
                  Final path: <span className="font-mono">{SITE_URL}/s/your-slug</span>
                </p>
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="subdomain">Vanity subdomain label</Label>
                <Input
                  id="subdomain"
                  name="subdomain"
                  defaultValue={settings?.subdomain ?? ""}
                  placeholder="your-brand"
                  className="rounded-xl font-mono text-sm"
                />
                <p className="text-xs text-muted-foreground">
                  Pair with <span className="font-mono">NEXT_PUBLIC_STOREFRONT_ROOT_DOMAIN</span> — see
                  Domains tab.
                </p>
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="primaryDomainMode">Primary domain mode</Label>
                <select
                  id="primaryDomainMode"
                  name="primaryDomainMode"
                  defaultValue={settings?.primaryDomainMode ?? "PATH"}
                  className="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="PATH">KitchenOS path (/s/slug)</option>
                  <option value="SUBDOMAIN">Subdomain</option>
                  <option value="CUSTOM_DOMAIN">Custom domain</option>
                </select>
                <p className="text-xs text-muted-foreground">
                  For <strong>custom hostnames</strong>, save the mode here, then enter the hostname on the{" "}
                  <Link href="/dashboard/storefront/domains" className="text-primary underline-offset-4 hover:underline">
                    Domains
                  </Link>{" "}
                  tab.
                </p>
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="activeMenuId">Active menu</Label>
                <select
                  id="activeMenuId"
                  name="activeMenuId"
                  defaultValue={settings?.activeMenuId ?? ""}
                  className="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="">None</option>
                  {menus.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.title}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  rows={3}
                  defaultValue={settings?.description ?? ""}
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="termsText">Checkout terms (optional)</Label>
                <Textarea
                  id="termsText"
                  name="termsText"
                  rows={4}
                  defaultValue={settings?.termsText ?? ""}
                  placeholder="When filled, guests must accept before placing an order."
                  className="rounded-xl"
                />
              </div>
            </div>

            <Card className="border-dashed border-border/80 bg-muted/30 shadow-none">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Checkout, SEO, theme</CardTitle>
                <CardDescription>
                  These use the same database row but dedicated tabs so saves never overwrite each other by accident.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2 text-sm">
                <Button asChild variant="secondary" size="sm" className="rounded-full">
                  <Link href="/dashboard/storefront/fulfillment">Fulfillment</Link>
                </Button>
                <Button asChild variant="secondary" size="sm" className="rounded-full">
                  <Link href="/dashboard/storefront/ordering">Ordering</Link>
                </Button>
                <Button asChild variant="secondary" size="sm" className="rounded-full">
                  <Link href="/dashboard/storefront/seo">SEO &amp; pixels</Link>
                </Button>
                <Button asChild variant="secondary" size="sm" className="rounded-full">
                  <Link href="/dashboard/storefront/theme">Theme</Link>
                </Button>
              </CardContent>
            </Card>

            <Button type="submit" className="rounded-full">
              Save storefront
            </Button>
          </form>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
