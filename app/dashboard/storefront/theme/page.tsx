import Link from "next/link";

import { PublishChecklistCard } from "@/components/storefront-builder/publish-checklist-card";
import { ThemePresetApplyCard } from "@/components/storefront-builder/theme-preset-apply-card";
import { StorefrontThemePublishForm } from "@/components/storefront-builder/theme-publish-form";
import { ExperimentPublishPreflightBanner } from "@/components/dashboard/storefront/experiment-publish-preflight-banner";
import { ThemePublishDiffPanel } from "@/components/storefront-builder/theme-publish-diff-panel";
import { ThemeCustomizer } from "@/components/storefront/theme-customizer";
import { ThemeCustomCssForm } from "@/components/storefront/theme-custom-css-form";
import { ThemeVisualIdentityForm } from "@/components/storefront/theme/theme-visual-identity-form";
import { loadThemeCustomizerForStorefront } from "@/services/storefront/storefront-theme-customizer-service";
import { parseThemeDraft } from "@/lib/storefront/theme-draft";
import { ThemeContrastCheck } from "@/components/storefront/theme/theme-contrast-check";
import { ThemeAssetPreview } from "@/components/storefront/theme/theme-asset-preview";
import { ThemeLayoutPreview } from "@/components/storefront/theme/theme-layout-preview";
import { ThemePresetPreview } from "@/components/storefront/theme/theme-preset-preview";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getTenantActor } from "@/lib/scope/cached-tenant";
import { findAdminStorefront } from "@/lib/storefront/load-admin-storefront";
import { loadPublishChecklistForStorefront, publishChecklistBlocksGoLive } from "@/lib/storefront/launch-readiness";
import { buildThemePublishDiff } from "@/lib/storefront/theme-publish-diff";
import type { ThemeSnapshotV1 } from "@/lib/storefront/theme-snapshot";
import { STOREFRONT_THEME_PRESETS } from "@/lib/storefront-builder/theme-presets";
import { prisma } from "@/lib/prisma";
import { resolveStorefrontPublishAccess } from "@/lib/storefront/storefront-page-access";
import { listStorefrontMediaForOwner } from "@/services/storefront-builder/media-service";

export default async function StorefrontThemePage() {
  const { sessionUser: user, dataUserId } = await getTenantActor();
  const { canPublish } = await resolveStorefrontPublishAccess(user.id, user.email ?? null);
  const settings = await findAdminStorefront(user.id, {
    id: true,
    storeSlug: true,
    locale: true,
    themePublishedAt: true,
    themePublishedJson: true,
    themePreset: true,
    brandColor: true,
    secondaryColor: true,
    backgroundColor: true,
    textColor: true,
    logoUrl: true,
    faviconUrl: true,
    heroImageUrl: true,
    coverImageUrl: true,
    fontFamily: true,
    layoutPreset: true,
    themeDraftJson: true,
    navigation: { select: { itemsJson: true } },
    footer: { select: { blocksJson: true } },
  });
  const pages = settings
    ? await prisma.storefrontPage.findMany({
        where: { storefrontId: settings.id },
        include: { sections: { select: { type: true, contentJson: true } } },
      })
    : [];
  const publishChecklist = settings ? await loadPublishChecklistForStorefront(settings.id) : [];
  const publishBlocked = publishChecklistBlocksGoLive(publishChecklist).blocked;
  const publishDiff = settings
    ? buildThemePublishDiff(
        {
          navigationItemsJson: settings.navigation?.itemsJson ?? { items: [] },
          footerBlocksJson: settings.footer?.blocksJson ?? { blocks: [] },
          brandColor: settings.brandColor,
          secondaryColor: settings.secondaryColor,
          backgroundColor: settings.backgroundColor,
          textColor: settings.textColor,
        },
        (settings.themePublishedJson as ThemeSnapshotV1 | null) ?? null,
      )
    : [];
  const themeBundle = settings ? await loadThemeCustomizerForStorefront(settings.id) : null;
  const themeDraft = settings ? parseThemeDraft(settings.themeDraftJson) : null;

  const mediaAssets = settings
    ? (await listStorefrontMediaForOwner(dataUserId, settings.id)).map((a) => ({
        id: a.id,
        url: a.url,
        label: a.label,
        altText: a.altText,
      }))
    : [];

  if (!settings) {
    return (
      <div className="mx-auto max-w-2xl space-y-6">
        <h1 className="text-3xl font-semibold tracking-tight">Theme</h1>
        <Card className="border-border/80 shadow-sm">
          <CardHeader>
            <CardTitle>Not set up yet</CardTitle>
            <CardDescription>Save the storefront overview once, then customize appearance here.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="rounded-full">
              <Link href="/dashboard/storefront">Open overview</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Theme &amp; brand</h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Logo, hero imagery, palette, and typography mirror what guests see on your public storefront. Accent color also
          appears on checkout buttons.
        </p>
      </div>

      {themeBundle ? (
        <Card className="border-border/80 shadow-sm">
          <CardHeader>
            <CardTitle>Visual theme customizer</CardTitle>
            <CardDescription>
              Shopify-style controls — colors, fonts, hero layout, and card style. Preview updates live; save then publish
              your theme snapshot for guests.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ThemeCustomizer
              storefrontId={settings.id}
              storeSlug={settings.storeSlug}
              initial={themeBundle.customizer}
            />
          </CardContent>
        </Card>
      ) : null}

      <Card className="border-border/80 shadow-sm">
        <CardHeader>
          <CardTitle>Custom CSS</CardTitle>
          <CardDescription>Advanced brand styling injected on the public storefront.</CardDescription>
        </CardHeader>
        <CardContent>
          <ThemeCustomCssForm storefrontId={settings.id} initialCss={themeDraft?.customCss ?? ""} />
        </CardContent>
      </Card>

      <Card className="border-border/80 shadow-sm">
        <CardHeader>
          <CardTitle>Curated theme presets</CardTitle>
          <CardDescription>
            Apply a curated palette in one click — colors and typography update immediately. Publish when you are ready for guests to see changes.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ThemePresetApplyCard
            presets={STOREFRONT_THEME_PRESETS}
            activePresetId={settings.themePreset}
            currentColors={{
              brand: settings.brandColor ?? "#111827",
              background: settings.backgroundColor ?? "#fafafa",
              text: settings.textColor ?? "#111827",
              secondary: settings.secondaryColor ?? "#6b7280",
            }}
          />
        </CardContent>
      </Card>

      <PublishChecklistCard items={publishChecklist} />

      <Card className="border-border/80 shadow-sm">
        <CardHeader>
          <CardTitle>Publish live theme snapshot</CardTitle>
          <CardDescription>
            Draft edits in navigation, footer, and colors stay editable until you publish. Public guests and checkout read the
            last published snapshot when available.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <ExperimentPublishPreflightBanner />
          <ThemePublishDiffPanel lines={publishDiff} />
          <StorefrontThemePublishForm checklistBlocked={publishBlocked} canPublish={canPublish} />
        </CardContent>
      </Card>

      <Card className="border-border/80 shadow-sm">
        <CardHeader>
          <CardTitle>Validation &amp; preview</CardTitle>
          <CardDescription>HTTPS-only media URLs; unsafe schemes blocked. Full-screen image checks rely on your CDN responding over HTTPS.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <ThemeAssetPreview
            logoUrl={settings.logoUrl}
            faviconUrl={settings.faviconUrl}
            heroImageUrl={settings.heroImageUrl}
            coverImageUrl={settings.coverImageUrl}
          />
          <ThemePresetPreview themePreset={settings.themePreset} layoutPreset={settings.layoutPreset} />
          <ThemeLayoutPreview layoutPreset={settings.layoutPreset} />
          <ThemeContrastCheck brandColor={settings.brandColor} textColor={settings.textColor} />
          <p className="text-xs text-muted-foreground">
            Media upload requires your own storage (S3, Supabase, etc.). Until wired, paste HTTPS URLs from your CDN.
          </p>
        </CardContent>
      </Card>

      <Card className="border-border/80 shadow-sm">
        <CardHeader>
          <CardTitle>Visual identity</CardTitle>
          <CardDescription>Use HTTPS image URLs you control (CDN, object storage, or your site).</CardDescription>
        </CardHeader>
        <CardContent>
          <ThemeVisualIdentityForm assets={mediaAssets} settings={settings} />
        </CardContent>
      </Card>

      <p className="text-sm text-muted-foreground">
        Publishing and business name stay on{" "}
        <Link href="/dashboard/storefront" className="text-primary underline-offset-4 hover:underline">
          Overview
        </Link>
        .
      </p>
    </div>
  );
}
