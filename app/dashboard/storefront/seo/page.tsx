import Link from "next/link";

import { updateStorefrontSeoSettingsFormAction } from "@/actions/storefront-pillar-settings";
import { StorefrontSeoSocialForm } from "@/components/storefront/storefront-seo-social-form";
import { parseThemeDraft } from "@/lib/storefront/theme-draft";
import { SeoSocialPreviewLive } from "@/components/storefront/seo/seo-social-preview";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { getTenantActor } from "@/lib/scope/cached-tenant";
import { findAdminStorefront } from "@/lib/storefront/load-admin-storefront";
import { prisma } from "@/lib/prisma";

export default async function StorefrontSeoPage() {
  const { sessionUser: user, dataUserId } = await getTenantActor();
  const settings = await findAdminStorefront(user.id, {
    id: true,
    publicName: true,
    description: true,
    heroImageUrl: true,
    seoTitle: true,
    seoDescription: true,
    seoImageUrl: true,
    canonicalBaseUrl: true,
    robotsPolicy: true,
    metaPixelId: true,
    googleAnalyticsId: true,
    googleAnalyticsPropertyId: true,
    googleTagManagerId: true,
    analyticsConsentMode: true,
    analyticsConsentBannerText: true,
    analyticsExcludeTestOrders: true,
    firstPartyAnalyticsMode: true,
    themeDraftJson: true,
  });
  const seoDraft = settings ? parseThemeDraft(settings.themeDraftJson) : null;

  if (!settings) {
    return (
      <div className="mx-auto max-w-2xl space-y-6">
        <h1 className="text-3xl font-semibold tracking-tight">SEO &amp; social</h1>
        <Card className="border-border/80 shadow-sm">
          <CardHeader>
            <CardTitle>Not set up yet</CardTitle>
            <CardDescription>Save the storefront overview first.</CardDescription>
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
    <div className="mx-auto max-w-3xl space-y-8">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">SEO &amp; social</h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Global defaults for search, sharing, and marketing pixels. Page-level SEO overrides are edited on each row under{" "}
          <Link href="/dashboard/storefront/pages" className="text-primary underline-offset-4 hover:underline">
            Pages
          </Link>
          . Visitor counts stay under{" "}
          <Link href="/dashboard/storefront/analytics" className="text-primary underline-offset-4 hover:underline">
            Analytics
          </Link>
          .
        </p>
      </div>

      <Card className="border-border/80 shadow-sm">
        <CardHeader>
          <CardTitle>Search &amp; social</CardTitle>
          <CardDescription>Feeds Open Graph, Twitter cards, and JSON-LD on the public storefront.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <SeoSocialPreviewLive
            defaultTitle={settings.seoTitle ?? settings.publicName}
            defaultDescription={settings.seoDescription ?? settings.description ?? ""}
            defaultImageUrl={settings.seoImageUrl ?? settings.heroImageUrl ?? ""}
            siteName={settings.publicName}
          />
          <form id="storefront-seo-form" action={updateStorefrontSeoSettingsFormAction} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="seoTitle">Default SEO title</Label>
              <Input id="seoTitle" name="seoTitle" defaultValue={settings.seoTitle ?? ""} className="rounded-xl" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="seoDescription">Default SEO description</Label>
              <Textarea id="seoDescription" name="seoDescription" rows={3} defaultValue={settings.seoDescription ?? ""} className="rounded-xl" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="seoImageUrl">Share image URL</Label>
              <Input id="seoImageUrl" name="seoImageUrl" defaultValue={settings.seoImageUrl ?? ""} className="rounded-xl font-mono text-sm" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="canonicalBaseUrl">Canonical base URL (optional)</Label>
              <Input id="canonicalBaseUrl" name="canonicalBaseUrl" defaultValue={settings.canonicalBaseUrl ?? ""} className="rounded-xl font-mono text-sm" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="robotsPolicy">Robots policy hint</Label>
              <Input id="robotsPolicy" name="robotsPolicy" defaultValue={settings.robotsPolicy ?? ""} placeholder="index,follow" className="rounded-xl font-mono text-sm" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="metaPixelId">Meta Pixel ID</Label>
              <Input id="metaPixelId" name="metaPixelId" defaultValue={settings.metaPixelId ?? ""} className="rounded-xl font-mono text-sm" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="googleAnalyticsId">Google Analytics measurement ID</Label>
              <Input id="googleAnalyticsId" name="googleAnalyticsId" defaultValue={settings.googleAnalyticsId ?? ""} placeholder="G-XXXX" className="rounded-xl font-mono text-sm" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="googleAnalyticsPropertyId">GA4 property ID (Data API)</Label>
              <Input
                id="googleAnalyticsPropertyId"
                name="googleAnalyticsPropertyId"
                defaultValue={settings.googleAnalyticsPropertyId ?? ""}
                placeholder="123456789"
                className="rounded-xl font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground">
                Numeric ID from GA4 Admin → Property settings. Powers auto parity on Advanced.
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="googleTagManagerId">Google Tag Manager container</Label>
              <Input id="googleTagManagerId" name="googleTagManagerId" defaultValue={settings.googleTagManagerId ?? ""} placeholder="GTM-XXXX" className="rounded-xl font-mono text-sm" />
            </div>
            <div className="space-y-2 border-t border-border/80 pt-4">
              <Label htmlFor="firstPartyAnalyticsMode">First-party analytics beacon</Label>
              <select
                id="firstPartyAnalyticsMode"
                name="firstPartyAnalyticsMode"
                defaultValue={settings.firstPartyAnalyticsMode}
                className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="ALWAYS_ON">Always on (operational; no marketing cookies)</option>
                <option value="CONSENT_REQUIRED">Requires same Accept as marketing when banner is used</option>
                <option value="DISABLED">Disabled (no visits / cart events ingested)</option>
              </select>
              <p className="text-xs text-muted-foreground">
                Separate from GA/GTM/Meta above. This controls POSTs to <span className="font-mono">/api/storefront/analytics</span> only.
              </p>
            </div>
            <div className="space-y-2 border-t border-border/80 pt-4">
              <Label htmlFor="analyticsConsentMode">Analytics &amp; marketing consent</Label>
              <select
                id="analyticsConsentMode"
                name="analyticsConsentMode"
                defaultValue={settings.analyticsConsentMode}
                className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="DISABLED">Disabled — do not load tags</option>
                <option value="ENABLED_WITH_CONSENT">Enabled with consent banner</option>
                <option value="ENABLED_NO_BANNER">Enabled without banner (admin responsibility)</option>
              </select>
              <p className="text-xs text-muted-foreground">
                Legal requirements depend on your jurisdiction — this is a technical control only, not legal advice. Link your Privacy Policy
                from the public footer or pages.
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="analyticsConsentBannerText">Banner text (optional)</Label>
              <Textarea
                id="analyticsConsentBannerText"
                name="analyticsConsentBannerText"
                rows={2}
                defaultValue={settings.analyticsConsentBannerText ?? ""}
                className="rounded-xl text-sm"
              />
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                name="analyticsExcludeTestOrders"
                value="on"
                defaultChecked={settings.analyticsExcludeTestOrders}
                className="h-4 w-4 rounded border-input"
              />
              Exclude test orders from revenue rollups in analytics
            </label>
            <Button type="submit" className="rounded-full">
              Save SEO &amp; pixels
            </Button>
          </form>
          <StorefrontSeoSocialForm
            storefrontId={settings.id}
            initial={seoDraft?.seoSocial ?? {}}
          />
        </CardContent>
      </Card>
    </div>
  );
}
