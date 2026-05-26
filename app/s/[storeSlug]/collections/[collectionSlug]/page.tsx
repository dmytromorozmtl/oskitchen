import Image from "next/image";
import { notFound } from "next/navigation";

import { getSessionUser } from "@/lib/auth";
import { loadPublicStorefrontPage } from "@/lib/storefront/public-storefront-brand";
import { productUrlSegment } from "@/lib/storefront/resolve-product-ref";
import { parseCollectionStorefrontSettings } from "@/lib/storefront/collection-settings";
import { StorefrontBreadcrumbs } from "@/components/storefront/storefront-breadcrumbs";
import { CollectionCatalogClient } from "@/components/storefront/collection-catalog-client";
import { buildCollectionPageJsonLd, buildStorefrontMetadata } from "@/lib/storefront/seo";
import { prisma } from "@/lib/prisma";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ storeSlug: string; collectionSlug: string }>;
}) {
  const { storeSlug, collectionSlug } = await params;
  const bundle = await loadPublicStorefrontPage(storeSlug);
  if (!bundle) return { title: "Collection" };
  const { sf, canonicalBase, brandOverlay } = bundle;
  const menu = await prisma.menu.findFirst({
    where: { userId: sf.userId, collectionSlug, catalogOnly: false },
    select: { title: true, description: true },
  });
  if (!menu) return { title: sf.publicName };
  return buildStorefrontMetadata(sf, storeSlug, {
    title: `${menu.title} · ${sf.publicName}`,
    description: menu.description ?? undefined,
    path: `/collections/${encodeURIComponent(collectionSlug)}`,
    canonicalBase,
    brand: brandOverlay,
  });
}

export default async function StorefrontCollectionPage({
  params,
}: {
  params: Promise<{ storeSlug: string; collectionSlug: string }>;
}) {
  const { storeSlug, collectionSlug } = await params;
  const user = await getSessionUser();
  const bundle = await loadPublicStorefrontPage(storeSlug, user?.id ?? null);
  if (!bundle) notFound();
  const { sf, canonicalBase } = bundle;

  const menu = await prisma.menu.findFirst({
    where: { userId: sf.userId, collectionSlug, catalogOnly: false },
    include: {
      products: {
        where: { active: true, storefrontVisible: true },
        orderBy: { sortOrder: "asc" },
      },
    },
  });
  if (!menu) notFound();

  const collectionSettings = parseCollectionStorefrontSettings(menu.storefrontSettingsJson);
  const heroImage =
    collectionSettings.heroImageUrl ??
    menu.products.find((p) => p.image)?.image ??
    null;
  const heroTitle = collectionSettings.heroTitle ?? menu.title;
  const heroSubtitle = collectionSettings.heroSubtitle ?? menu.description;

  const base = canonicalBase.replace(/\/$/, "");
  const collectionUrl = `${base}/collections/${encodeURIComponent(collectionSlug)}`;

  const catalogRows = menu.products.map((p) => {
    const seg = productUrlSegment({ id: p.id, publicSlug: p.publicSlug });
    return {
      id: p.id,
      title: p.title,
      description: p.description,
      price: Number(p.price),
      sortOrder: p.sortOrder,
      allergens: p.allergens,
      productHref: `/s/${storeSlug}/products/${seg}`,
      canonicalProductUrl: `${base}/products/${encodeURIComponent(seg)}`,
    };
  });

  const collectionLd = buildCollectionPageJsonLd({
    name: menu.title,
    description: menu.description,
    url: collectionUrl,
    items: catalogRows.map((p) => ({ name: p.title, url: p.canonicalProductUrl })),
  });

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionLd) }} />
      <StorefrontBreadcrumbs
        items={[
          { label: sf.publicName, href: `/s/${storeSlug}/menu` },
          { label: menu.title },
        ]}
        jsonLdBase={[
          { name: sf.publicName, url: base },
          { name: menu.title, url: collectionUrl },
        ]}
      />
      {heroImage ? (
        <div className="relative aspect-[21/9] overflow-hidden rounded-2xl border border-border/80">
          <Image src={heroImage} alt="" fill className="object-cover" sizes="(max-width: 768px) 100vw, 768px" />
        </div>
      ) : null}
      <header>
        <h1 className="text-3xl font-semibold tracking-tight">{heroTitle}</h1>
        {heroSubtitle ? <p className="mt-2 text-muted-foreground">{heroSubtitle}</p> : null}
      </header>
      <CollectionCatalogClient products={catalogRows} currency={sf.currency} />
    </div>
  );
}
