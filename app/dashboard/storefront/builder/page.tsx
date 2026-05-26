import Link from "next/link";

import { NavFooterBuilder } from "@/components/storefront-builder/nav-footer-builder";
import { PageBuilder } from "@/components/storefront/page-builder";
import { StorefrontPageType } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getTenantActor } from "@/lib/scope/cached-tenant";
import { findAdminStorefront } from "@/lib/storefront/load-admin-storefront";
import { secondaryLocalesForStorefront } from "@/lib/storefront/localized-content";
import { adminPagination, parseAdminPageParam } from "@/lib/storefront/pagination";
import { prisma } from "@/lib/prisma";
import {
  layoutDraftDiffersFromPublished,
  parsePageLayoutMeta,
} from "@/lib/storefront/page-layout-snapshot";
import { listPageBuilderSectionTypes } from "@/services/storefront-builder/page-builder-service";
import { listThemePresets } from "@/services/storefront-builder/theme-service";
import { PaginationBar } from "@/components/dashboard/pagination-bar";

export default async function StorefrontBuilderHubPage({
  searchParams,
}: {
  searchParams?: Promise<{ page?: string }>;
}) {
  const { sessionUser: user } = await getTenantActor();
  const sp = searchParams ? await searchParams : {};
  const pageNum = parseAdminPageParam(sp.page);
  const sf = await findAdminStorefront(user.id, {
    id: true,
    userId: true,
    storeSlug: true,
    locale: true,
    navigation: true,
    footer: true,
  });

  const sections = listPageBuilderSectionTypes();
  const presets = listThemePresets();
  const customWhere = sf
    ? { storefrontId: sf.id, pageType: "CUSTOM" as const, published: true }
    : null;
  const customTotal = customWhere ? await prisma.storefrontPage.count({ where: customWhere }) : 0;
  const { skip, take, page, totalPages } = adminPagination(customTotal, pageNum);
  const homePage = sf
    ? await prisma.storefrontPage.findFirst({
        where: { storefrontId: sf.id, pageType: StorefrontPageType.HOME },
        include: { sections: { orderBy: { sortOrder: "asc" } } },
      })
    : null;

  const customPages = customWhere
    ? await prisma.storefrontPage.findMany({
        where: customWhere,
        orderBy: { title: "asc" },
        select: { slug: true, title: true },
        take,
        skip,
      })
    : [];
  const secondaryLocales = sf ? secondaryLocalesForStorefront(sf.locale) : [];

  const itemsJson = sf?.navigation?.itemsJson
    ? JSON.stringify(sf.navigation.itemsJson, null, 2)
    : JSON.stringify({ items: [] }, null, 2);
  const blocksJson = sf?.footer?.blocksJson
    ? JSON.stringify(sf.footer.blocksJson, null, 2)
    : JSON.stringify({ blocks: [] }, null, 2);

  return (
    <div className="mx-auto max-w-5xl space-y-10">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Storefront builder</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Drag-and-drop navigation and footer blocks — no JSON required. Publish your theme snapshot on the Theme tab so guests see changes.
        </p>
      </div>

      {sf && homePage ? (
        <Card className="border-border/80 shadow-sm">
          <CardHeader>
            <CardTitle>Home page sections</CardTitle>
            <CardDescription>
              Drag-and-drop blocks for your storefront home — Hero, product grid, FAQ, testimonials, and more.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <PageBuilder
              pageId={homePage.id}
              storefrontId={sf.id}
              storeSlug={sf.storeSlug}
              layoutPublishedAt={parsePageLayoutMeta(homePage.contentJson).layoutPublishedAt ?? null}
              initialDirty={layoutDraftDiffersFromPublished(
                homePage.sections,
                parsePageLayoutMeta(homePage.contentJson),
              )}
              sections={homePage.sections.map((s) => ({
                id: s.id,
                type: s.type,
                sortOrder: s.sortOrder,
                visible: s.visible,
              }))}
            />
          </CardContent>
        </Card>
      ) : null}

      {sf ? (
        <Card className="border-border/80 shadow-sm">
          <CardHeader>
            <CardTitle>Navigation &amp; footer</CardTitle>
            <CardDescription>
              Reorder links visually, pick custom pages from a dropdown, and add translated labels per locale.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <NavFooterBuilder
              itemsJson={itemsJson}
              blocksJson={blocksJson}
              customPages={customPages}
              secondaryLocales={secondaryLocales}
            />
            <PaginationBar
              basePath="/dashboard/storefront/builder"
              page={page}
              totalPages={totalPages}
            />
          </CardContent>
        </Card>
      ) : (
        <Card className="border-border/80 shadow-sm">
          <CardContent className="py-6">
            <Button asChild className="rounded-full">
              <Link href="/dashboard/storefront">Set up storefront overview first</Link>
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="border-border/80 shadow-sm">
          <CardHeader>
            <CardTitle>Theme presets</CardTitle>
            <CardDescription>{presets.length} curated palettes — apply IDs in Theme settings.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            <Button asChild size="sm" className="rounded-full" variant="secondary">
              <Link href="/dashboard/storefront/theme">Open theme</Link>
            </Button>
          </CardContent>
        </Card>
        <Card className="border-border/80 shadow-sm">
          <CardHeader>
            <CardTitle>Media</CardTitle>
            <CardDescription>Upload to storage when configured, or paste HTTPS URLs.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild size="sm" className="rounded-full" variant="secondary">
              <Link href="/dashboard/storefront/media">Open media</Link>
            </Button>
          </CardContent>
        </Card>
        <Card className="border-border/80 shadow-sm md:col-span-2">
          <CardHeader>
            <CardTitle>Page sections</CardTitle>
            <CardDescription>{sections.length} section types — HERO, TEXT, and CTA have visual editors.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            <Button asChild size="sm" className="rounded-full" variant="secondary">
              <Link href="/dashboard/storefront/pages">Pages</Link>
            </Button>
            <Button asChild size="sm" className="rounded-full" variant="outline">
              <Link href="/dashboard/storefront/preview">Preview</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
