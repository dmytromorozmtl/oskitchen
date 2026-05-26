import { notFound } from "next/navigation";

import { StoreProductDetailClient } from "@/components/storefront/store-product-detail-client";
import { getSessionUser } from "@/lib/auth";
import { buildStorefrontProductSurface } from "@/lib/nutrition/build-storefront-product-surface";
import { loadPublicStorefrontPage } from "@/lib/storefront/public-storefront-brand";
import { findProductByPublicRef, productUrlSegment } from "@/lib/storefront/resolve-product-ref";
import { StorefrontBreadcrumbs } from "@/components/storefront/storefront-breadcrumbs";
import { loadStorefrontMenuCatalogForPage } from "@/lib/storefront/menu-page-data";
import { buildMenuProductJsonLd, buildStorefrontMetadata } from "@/lib/storefront/seo";

export const revalidate = 60;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ storeSlug: string; productRef: string }>;
}) {
  const { storeSlug, productRef } = await params;
  const user = await getSessionUser();
  const bundle = await loadPublicStorefrontPage(storeSlug, user?.id ?? null);
  const activeMenu = bundle?.sf.activeMenu;
  if (!bundle || !activeMenu) return { title: "Product" };
  const { sf, canonicalBase, brandOverlay } = bundle;
  const p = findProductByPublicRef(activeMenu.products, decodeURIComponent(productRef));
  if (!p) return { title: "Product" };
  const seg = productUrlSegment(p);
  const seoTitle = (p as { storefrontSeoTitle?: string | null }).storefrontSeoTitle?.trim();
  const seoDescription = (p as { storefrontSeoDescription?: string | null }).storefrontSeoDescription?.trim();
  const ogImage = (p as { storefrontOgImageUrl?: string | null }).storefrontOgImageUrl?.trim();
  return buildStorefrontMetadata(sf, storeSlug, {
    title: seoTitle ? `${seoTitle} · ${sf.publicName}` : `${p.title} · ${sf.publicName}`,
    description: seoDescription || p.description || sf.description || undefined,
    path: `/products/${seg}`,
    openGraphImage: ogImage || undefined,
    canonicalBase,
    brand: brandOverlay,
  });
}

export default async function StorefrontProductPage({
  params,
  searchParams,
}: {
  params: Promise<{ storeSlug: string; productRef: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { storeSlug, productRef } = await params;
  const sp = searchParams ? await searchParams : {};
  const marketQ = typeof sp.market === "string" ? sp.market : undefined;
  const user = await getSessionUser();
  const bundle = await loadPublicStorefrontPage(storeSlug, user?.id ?? null);
  if (!bundle?.sf.activeMenu) notFound();
  const { sf, canonicalBase } = bundle;
  const activeMenu = bundle.sf.activeMenu;
  const p = findProductByPublicRef(activeMenu.products, decodeURIComponent(productRef));
  if (!p) notFound();

  const visibility = {
    publicShowNutritionWhenUnverified: sf.publicShowNutritionWhenUnverified,
    publicShowAllergensWhenUnverified: sf.publicShowAllergensWhenUnverified,
    publicShowIngredientsWhenUnverified: sf.publicShowIngredientsWhenUnverified,
  };

  const surface = buildStorefrontProductSurface({
    product: {
      id: p.id,
      title: p.title,
      description: p.description,
      price: Number(p.price),
      preparedDate: p.preparedDate.toISOString(),
      image: p.image,
      allergens: p.allergens,
      ingredients: p.ingredients,
      reheatingInstructions: p.reheatingInstructions,
      nutritionProfile: p.nutritionProfile,
      allergenProfile: p.allergenProfile,
      ingredientDeclaration: p.ingredientDeclaration,
    },
    visibility,
  });

  const catalog = await loadStorefrontMenuCatalogForPage(storeSlug, marketQ);
  const catalogProduct = catalog?.catalog.products.find((x) => x.id === p.id);

  const product = {
    id: p.id,
    title: p.title,
    description: p.description,
    price: Number(p.price),
    preparedDate: p.preparedDate.toISOString(),
    image: p.image,
    allergens: surface.allergens,
    ingredients: surface.ingredients,
    reheatingInstructions: p.reheatingInstructions,
    nutrition: surface.nutrition,
    labelDisclaimer: surface.labelDisclaimer,
    variants: catalogProduct?.variants ?? [],
    modifierGroups: catalogProduct?.modifierGroups ?? [],
    priceVersion: catalog?.catalog.priceVersion ?? "",
  };

  const urlPath = productUrlSegment({ id: p.id, publicSlug: p.publicSlug });

  const productJsonLd = buildMenuProductJsonLd(
    sf,
    storeSlug,
    {
      id: product.id,
      title: product.title,
      description: product.description,
      price: product.price,
      image: product.image,
      urlPath,
    },
    canonicalBase,
  );

  const base = canonicalBase.replace(/\/$/, "");
  const menuHref = `/s/${storeSlug}/menu`;
  const productHref = `${base}/products/${encodeURIComponent(urlPath)}`;

  return (
    <div className="space-y-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />
      <StorefrontBreadcrumbs
        items={[
          { label: sf.publicName, href: menuHref },
          { label: "Menu", href: menuHref },
          { label: product.title },
        ]}
        jsonLdBase={[
          { name: sf.publicName, url: base },
          { name: "Menu", url: `${base}/menu` },
          { name: product.title, url: productHref },
        ]}
      />
      <StoreProductDetailClient
        slug={storeSlug}
        currency={sf.currency}
        product={product}
        priceVersion={product.priceVersion}
      />
    </div>
  );
}
