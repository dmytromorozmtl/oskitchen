import Link from "next/link";
import { notFound } from "next/navigation";

import { StorefrontPwaInstall } from "@/components/branding/storefront-pwa-install";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getStorefrontForPublicFromRequest } from "@/lib/storefront/public-access";
import { buildBrandedManifest } from "@/services/branding/white-label-service";

export const dynamic = "force-dynamic";

export default async function BrandingInstallPage({
  searchParams,
}: {
  searchParams: Promise<{ slug?: string }>;
}) {
  const { slug } = await searchParams;
  const storeSlug = slug?.trim();
  if (!storeSlug) {
    return (
      <div className="mx-auto flex min-h-[70vh] max-w-lg flex-col justify-center gap-6 px-4 py-12">
        <Card>
          <CardHeader>
            <CardTitle>Install your restaurant app</CardTitle>
            <CardDescription>
              Open the install link from your restaurant — it looks like{" "}
              <code className="rounded bg-muted px-1">/branding?slug=your-store</code>.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline" className="rounded-full">
              <Link href="/">OS Kitchen home</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const sf = await getStorefrontForPublicFromRequest(storeSlug, null);
  if (!sf || !sf.published) notFound();

  const manifest = buildBrandedManifest({
    storeSlug,
    restaurantName: sf.publicName,
    logoUrl: sf.logoUrl,
    themeColor: sf.brandColor,
  });

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center gap-6 px-4 py-10">
      <div className="text-center">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Mobile app install
        </p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">{sf.publicName}</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Add {sf.publicName} to your home screen — order and reorder without the App Store.
        </p>
      </div>

      <StorefrontPwaInstall
        storeSlug={storeSlug}
        restaurantName={sf.publicName}
        themeColor={manifest.theme_color}
        logoUrl={sf.logoUrl}
        menuUrl={`/s/${storeSlug}/menu`}
      />

      <Button asChild className="w-full rounded-full" size="lg">
        <Link href={`/s/${storeSlug}`}>Open menu in browser</Link>
      </Button>
    </div>
  );
}
