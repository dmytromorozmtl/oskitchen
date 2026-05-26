import { notFound } from "next/navigation";

import { StorefrontSectionRenderer } from "@/components/storefront/section-renderer";
import { getSessionUser } from "@/lib/auth";
import { primaryLocaleForStorefront } from "@/lib/storefront/localized-content";
import { getStorefrontForPublicFromRequest, isStorefrontInClosureWindow } from "@/lib/storefront/public-access";
import { resolveStorefrontLocaleFromRequest } from "@/lib/storefront/resolve-locale";
import { getStorefrontHomeSections } from "@/services/storefront/storefront-sections-service";

export default async function StorefrontHomePage({
  params,
  searchParams,
}: {
  params: Promise<{ storeSlug: string }>;
  searchParams?: Promise<{ preview?: string }>;
}) {
  const { storeSlug } = await params;
  const sp = searchParams ? await searchParams : {};
  const previewQuery = sp.preview === "1" || sp.preview === "true";
  const user = await getSessionUser();
  const sf = await getStorefrontForPublicFromRequest(storeSlug, user?.id ?? null);
  if (!sf) notFound();

  const closed = isStorefrontInClosureWindow(sf);
  const locale = await resolveStorefrontLocaleFromRequest(sf.locale);
  const defaultLocale = primaryLocaleForStorefront(sf.locale);
  const isOwnerPreview = user?.id === sf.userId || previewQuery;

  const sections = await getStorefrontHomeSections({
    storefront: sf,
    locale,
    defaultLocale,
    isOwnerPreview,
  });

  return (
    <div className="space-y-2">
      {sections.map((section) => (
        <StorefrontSectionRenderer
          key={section.id}
          section={section}
          storeSlug={storeSlug}
          storefront={sf}
          locale={locale}
          defaultLocale={defaultLocale}
          orderingPaused={closed}
        />
      ))}
    </div>
  );
}
