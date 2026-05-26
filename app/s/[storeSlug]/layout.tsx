import type { Metadata } from "next";
import type { CSSProperties } from "react";
import { cookies, headers } from "next/headers";
import { Suspense } from "react";
import { notFound } from "next/navigation";

import { StorefrontAnalyticsBeacon } from "@/components/storefront/storefront-analytics-beacon";
import { StorefrontConsentAndMarketingScripts } from "@/components/storefront/storefront-consent-banner";
import { StorefrontFooter } from "@/components/storefront/StorefrontFooter";
import { StorefrontLocaleSwitcher } from "@/components/storefront/locale-switcher";
import { StorefrontNavigation } from "@/components/storefront/StorefrontNavigation";
import { enabledLocaleCodes, resolveStorefrontLocaleFromRequest } from "@/lib/storefront/resolve-locale";
import { getSessionUser } from "@/lib/auth";
import { readStorefrontPreviewCookie } from "@/lib/storefront/preview-cookie-server";
import { verifyStorefrontPreviewToken } from "@/lib/storefront/preview-token";
import { parseAnalyticsConsentMode, parseFirstPartyAnalyticsMode } from "@/lib/storefront/consent";
import { buildPublicStorefrontDesignTokens } from "@/lib/storefront/design-tokens";
import { storefrontDesignTokensToCssVarsStyle } from "@/lib/storefront/design-token-css-vars";
import { parseStorefrontFooterBlocks } from "@/lib/storefront/footer-validation";
import { defaultFallbackNav, parseStorefrontNavigationItems } from "@/lib/storefront/navigation-validation";
import { isStorefrontCheckoutPath } from "@/lib/storefront/store-path";
import {
  mergeDraftThemeTokensIntoSettings,
  mergePublishedThemeTokensIntoSettings,
  selectFooterJsonForAudience,
  selectNavigationJsonForAudience,
  selectThemeDraftForAudience,
} from "@/lib/storefront/theme-snapshot";
import { storefrontDesignTokensCssVarsEnabled } from "@/lib/storefront/theme-flags";
import { buildStorefrontFpIngestClientPayload } from "@/services/storefront/storefront-analytics-signing-service";
import { getStorefrontForPublicFromRequest, isStorefrontInClosureWindow } from "@/lib/storefront/public-access";
import { primaryLocaleForStorefront } from "@/lib/storefront/localized-content";
import { promoteScheduledStorefrontPages } from "@/lib/storefront/page-schedule";
import { promoteScheduledStorefrontTheme } from "@/lib/storefront/theme-schedule";
import { loadPublicStorefrontPage } from "@/lib/storefront/public-storefront-brand";
import { buildLocalBusinessJsonLd } from "@/lib/storefront/seo";
import { generateStorefrontMetadata } from "@/services/storefront/seo-service";
import {
  createExperimentSpanId,
  ensureTraceId,
  recordExperimentSpan,
  traceIdFromHeaders,
} from "@/lib/storefront/experiment-trace";
import { THEME_EXPERIMENT_ARM_HEADER } from "@/lib/storefront/theme-experiment-bucket";
import {
  parseThemeExperimentConfig,
  resolveThemeExperimentArm,
  THEME_EXPERIMENT_COOKIE,
} from "@/lib/storefront/theme-experiment";
import { isThemeExperimentEdgeEnabled } from "@/lib/storefront/theme-experiment-edge-config";
import {
  isStorefrontExperimentsEnabled,
  isStorefrontServerCartEnabled,
} from "@/lib/storefront/storefront-experiments-enabled";
import { ThemeExperimentAssigner } from "@/components/storefront/theme-experiment-assigner";
import { ServerCartSync } from "@/components/storefront/server-cart-sync";
import { StorefrontNavCart } from "@/components/storefront/storefront-nav-cart";
import type { ThemePresetId } from "@/lib/storefront-builder/theme-types";
import { buildStorefrontBrandStyle } from "@/lib/storefront/public-theme-style";
import { resolvePublicFooterBlocks } from "@/lib/storefront/public-footer-blocks";
import {
  customizerToCssVars,
  parseThemeDraft,
  resolveThemeCustomizer,
} from "@/lib/storefront/theme-draft";
import { PublicThemeProvider } from "@/components/storefront/public-theme-provider";
import { ThemePreviewListener } from "@/components/storefront/theme-preview-listener";
import { fontFamilyCss, getFontLink } from "@/services/storefront/font-service";

import "./storefront.css";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ storeSlug: string }>;
}): Promise<Metadata> {
  const { storeSlug } = await params;
  const user = await getSessionUser();
  const bundle = await loadPublicStorefrontPage(storeSlug, user?.id ?? null);
  if (!bundle) return { title: "Store" };
  const { sf, canonicalBase, brandOverlay } = bundle;
  const seoDraft = parseThemeDraft(sf.themeDraftJson);
  return generateStorefrontMetadata(sf, storeSlug, {
    canonicalBase,
    seoSocial: seoDraft.seoSocial,
  });
}

export default async function StorefrontLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ storeSlug: string }>;
}) {
  const { storeSlug } = await params;
  const user = await getSessionUser();
  const bundle = await loadPublicStorefrontPage(storeSlug, user?.id ?? null);
  if (!bundle) notFound();
  const { sf, canonicalBase } = bundle;

  try {
    await promoteScheduledStorefrontPages(sf.id);
    await promoteScheduledStorefrontTheme(sf.id);
  } catch (err) {
    console.warn("[storefront] schedule promotion skipped:", err);
  }

  const headerList = await headers();
  const pathname = headerList.get("x-kos-pathname") ?? "";
  const previewQueryHeader = headerList.get("x-kos-storefront-preview") === "1";
  const checkout = isStorefrontCheckoutPath(pathname);

  const closedForOrders = isStorefrontInClosureWindow(sf);
  const draft = !sf.published;
  const previewTok = await readStorefrontPreviewCookie();
  const signedPreview = Boolean(
    draft && previewTok && verifyStorefrontPreviewToken(previewTok, storeSlug)?.ownerUserId === sf.userId,
  );
  const ownerOrSignedPreview = signedPreview || user?.id === sf.userId;
  const previewDraftNav = ownerOrSignedPreview && (draft || previewQueryHeader);
  const experimentsOn = isStorefrontExperimentsEnabled();
  const experimentConfig = experimentsOn ? parseThemeExperimentConfig(sf.themeExperimentJson) : null;
  const cookieStore = await cookies();
  const experimentArm = experimentsOn
    ? resolveThemeExperimentArm({
        config: experimentConfig,
        cookieValue: cookieStore.get(THEME_EXPERIMENT_COOKIE)?.value,
        requestArm: headerList.get(THEME_EXPERIMENT_ARM_HEADER),
      }).arm
    : "published";

  if (experimentsOn) {
    const traceId = ensureTraceId(traceIdFromHeaders(headerList));
    recordExperimentSpan({
      traceId,
      spanId: createExperimentSpanId(),
      parentSpanId: headerList.get("x-kos-span-id"),
      name: "rsc.theme",
      fields: {
        store_slug: storeSlug,
        experiment_arm: experimentArm,
        experiment_enabled: experimentConfig?.enabled === true,
      },
    });
  }
  const experimentDraftNav =
    experimentsOn && !checkout && !previewDraftNav && experimentConfig?.enabled && experimentArm === "draft";
  const navAudience = checkout || !(previewDraftNav || experimentDraftNav) ? "public" : "builder-preview";
  const locale = await resolveStorefrontLocaleFromRequest(sf.locale ?? "en", null);

  const rawNav = selectNavigationJsonForAudience(sf, navAudience);
  const rawFooter = selectFooterJsonForAudience(sf, navAudience);
  const parsedNav = parseStorefrontNavigationItems(rawNav, storeSlug, {
    locale,
    includeDraftOrHidden: previewDraftNav,
  });
  const navLinks = parsedNav.length > 0 ? parsedNav : defaultFallbackNav(storeSlug);
  const footerBlocks = resolvePublicFooterBlocks(
    parseStorefrontFooterBlocks(rawFooter, storeSlug, {
      locale,
      includeDisabled: previewDraftNav,
    }),
    { description: sf.description, tagline: sf.tagline, publicName: sf.publicName },
  );

  const tokenSf =
    checkout || !(previewDraftNav || experimentDraftNav)
      ? mergePublishedThemeTokensIntoSettings(sf)
      : mergeDraftThemeTokensIntoSettings(sf);

  const accent = tokenSf.brandColor?.trim() || "#286ab8";
  const secondary = tokenSf.secondaryColor?.trim();

  const fpMode = parseFirstPartyAnalyticsMode(sf.firstPartyAnalyticsMode);
  const fpClient = buildStorefrontFpIngestClientPayload({
    storefrontId: sf.id,
    storeSlug,
    mode: fpMode,
  });
  if (fpClient.ingestDisabled && fpMode !== "DISABLED") {
    console.warn(
      "[storefront] First-party analytics ingest disabled: STOREFRONT_ANALYTICS_STRICT_INGEST is true but STOREFRONT_ANALYTICS_SIGNING_SECRET is missing or too short.",
    );
  }

  const preset = (String(tokenSf.themePreset ?? "").trim() || "modern_minimal") as ThemePresetId;
  const designTokens = buildPublicStorefrontDesignTokens(tokenSf);
  const scopedDesignVars: CSSProperties | undefined =
    storefrontDesignTokensCssVarsEnabled() && !checkout
      ? storefrontDesignTokensToCssVarsStyle(designTokens, preset)
      : undefined;

  const themeAudience =
    previewDraftNav || experimentDraftNav ? ("preview" as const) : ("public" as const);
  const themeDraft = selectThemeDraftForAudience(sf, themeAudience);
  const previewThemeRaw = cookieStore.get("kos_theme_preview")?.value;
  let previewCustomizer: Partial<typeof themeDraft.customizer> | undefined;
  if (previewThemeRaw) {
    try {
      previewCustomizer = JSON.parse(previewThemeRaw) as Partial<typeof themeDraft.customizer>;
    } catch {
      previewCustomizer = undefined;
    }
  }
  const customizer = resolveThemeCustomizer(
    { ...themeDraft, customizer: { ...themeDraft.customizer, ...previewCustomizer } },
    tokenSf,
  );
  const fontLink = getFontLink(customizer.fontFamily);
  const brandStyle = {
    ...buildStorefrontBrandStyle({ accent: customizer.accentColor, secondary: customizer.secondaryColor }),
    ...customizerToCssVars(customizer),
    fontFamily: fontFamilyCss(customizer.fontFamily),
  } as CSSProperties;

  const navSticky = customizer.navStyle === "sticky";

  return (
    <div
      className="flex min-h-screen flex-col bg-gradient-to-b from-muted/30 to-background text-foreground dark:from-gray-950 dark:to-gray-950 dark:text-gray-50"
      style={brandStyle}
    >
      {experimentsOn ? (
        <ThemeExperimentAssigner
          storeSlug={storeSlug}
          enabled={experimentConfig?.enabled === true}
          edgeMode={isThemeExperimentEdgeEnabled()}
        />
      ) : null}
      {isStorefrontServerCartEnabled() ? <ServerCartSync storeSlug={storeSlug} /> : null}
      <script
        type="application/json"
        id="kos-storefront-fp-analytics"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            mode: fpMode,
            fpToken: fpClient.fpToken,
            strictIngest: fpClient.strictIngest,
            ingestDisabled: fpClient.ingestDisabled,
          }),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(buildLocalBusinessJsonLd(sf, storeSlug, canonicalBase)),
        }}
      />
      <StorefrontConsentAndMarketingScripts
        mode={parseAnalyticsConsentMode(sf.analyticsConsentMode)}
        firstPartyMode={fpMode}
        bannerText={sf.analyticsConsentBannerText}
        privacyPath="/policies/privacy"
        storeSlug={storeSlug}
        googleTagManagerId={sf.googleTagManagerId}
        googleAnalyticsId={sf.googleAnalyticsId}
        metaPixelId={sf.metaPixelId}
      />
      {draft ? (
        <div className="border-b border-amber-500/40 bg-amber-500/15 px-4 py-2 text-center text-xs font-medium text-amber-950 dark:text-amber-100">
          <span className="block">Draft storefront — not visible to the public until published.</span>
          {signedPreview ? (
            <span className="mt-1 block font-normal text-amber-900/90 dark:text-amber-50/90">
              Signed preview cookie active (short-lived) — safe for embedded admin iframe preview.
            </span>
          ) : user?.id === sf.userId ? (
            <span className="mt-1 block font-normal text-amber-900/90 dark:text-amber-50/90">
              You are viewing as the owner while signed in.
            </span>
          ) : null}
        </div>
      ) : null}
      {sf.announcementEnabled && sf.announcementText ? (
        <div className="border-b border-border/80 bg-primary/10 px-4 py-2 text-center text-sm">
          {sf.announcementText}
        </div>
      ) : null}
      {closedForOrders && sf.closureMessage ? (
        <div className="border-b border-destructive/30 bg-destructive/10 px-4 py-2 text-center text-sm text-destructive">
          {sf.closureMessage}
        </div>
      ) : null}
      <link rel="stylesheet" href={fontLink} />
      <link rel="stylesheet" href={`/s/${storeSlug}/custom.css`} />
      <div
        className="kos-storefront-root flex min-h-screen flex-col"
        style={scopedDesignVars}
        data-checkout={checkout ? "1" : "0"}
        data-hero-layout={customizer.heroLayout}
      >
        <PublicThemeProvider theme={customizer}>
        <Suspense fallback={null}>
          <ThemePreviewListener />
        </Suspense>
        <StorefrontNavigation
          storeSlug={storeSlug}
          publicName={sf.publicName}
          tagline={sf.tagline}
          logoUrl={sf.logoUrl}
          accentColor={customizer.accentColor}
          links={navLinks}
          sticky={navSticky}
          trailing={<StorefrontNavCart storeSlug={storeSlug} />}
          localeSwitcher={
            <Suspense fallback={null}>
              <StorefrontLocaleSwitcher
                currentLocale={locale}
                enabledLocales={enabledLocaleCodes(sf.locale ?? "en")}
                canonicalBase={canonicalBase}
                defaultLocale={primaryLocaleForStorefront(sf.locale ?? "en")}
              />
            </Suspense>
          }
        />
        <div className="sf-container storefront-content flex-1 py-8 sm:py-10">
          <StorefrontAnalyticsBeacon
            storeSlug={storeSlug}
            firstPartyMode={fpMode}
            ingestDisabled={fpClient.ingestDisabled}
          />
          {children}
        </div>
        <StorefrontFooter
          storeSlug={storeSlug}
          publicName={sf.publicName}
          contactEmail={sf.contactEmail}
          privacyText={sf.privacyText}
          blocks={footerBlocks}
          footerTagline={sf.tagline?.trim() || sf.description?.trim() || null}
          showPoweredBy
        />
        </PublicThemeProvider>
      </div>
    </div>
  );
}
