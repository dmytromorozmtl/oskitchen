import { SITE_URL } from "@/lib/constants";
import {
  computeWhiteLabelDepthReadinessPercent,
  countWhiteLabelDepthByMaturity,
  resolveWhiteLabelCustomDomainConfigured,
  WHITE_LABEL_STOREFRONT_DEPTH_ABSOLUTE_FINAL_POLICY_ID,
  type WhiteLabelDepthCapability,
  type WhiteLabelDepthMaturity,
  type WhiteLabelStorefrontDepthModel,
} from "@/lib/storefront/white-label-storefront-depth-absolute-final-policy";
import { WHITE_LABEL_STOREFRONT_DEPTH_BASE_CAPABILITIES } from "@/lib/storefront/white-label-storefront-depth-content";
import { findAdminStorefront } from "@/lib/storefront/load-admin-storefront";
import { prisma } from "@/lib/prisma";
import { generateBrandedPWA } from "@/services/branding/white-label-service";

function parsePwaPublished(themePublishedJson: unknown): boolean {
  if (!themePublishedJson || typeof themePublishedJson !== "object") return false;
  const pwa = (themePublishedJson as Record<string, unknown>).pwa;
  if (!pwa || typeof pwa !== "object") return false;
  const at = (pwa as Record<string, unknown>).publishedAt;
  return typeof at === "string" && at.length > 0;
}

function resolveCapabilityMaturity(
  id: string,
  ctx: {
    hasLogo: boolean;
    hasBrandColor: boolean;
    hasFont: boolean;
    hasCustomDomain: boolean;
    hasStoreSlug: boolean;
    pwaPublished: boolean;
    hideBranding: boolean;
    hasForms: boolean;
    hasCampaigns: boolean;
  },
): { maturity: WhiteLabelDepthMaturity; detail: string } {
  switch (id) {
    case "branded_logo":
      return ctx.hasLogo
        ? { maturity: "LIVE", detail: "Logo URL saved on storefront theme." }
        : { maturity: "BETA", detail: "Upload or paste a logo URL in Theme → Visual identity." };
    case "brand_colors":
      return ctx.hasBrandColor
        ? { maturity: "LIVE", detail: "Brand color configured on storefront." }
        : { maturity: "BETA", detail: "Set primary brand color in Theme customizer." };
    case "layout_presets":
      return ctx.hasFont
        ? { maturity: "LIVE", detail: "Font family and layout preset saved." }
        : { maturity: "BETA", detail: "Choose layout preset and font in Theme." };
    case "custom_domain":
      return ctx.hasCustomDomain
        ? { maturity: "BETA", detail: "Custom domain saved — DNS is not automatic; verify at registrar." }
        : {
            maturity: "SKIPPED",
            detail: "Do not promise custom domains yet — configure hostname manually in Domains tab.",
          };
    case "subdomain_path":
      return ctx.hasStoreSlug
        ? { maturity: "LIVE", detail: "Branded path URL live on platform domain." }
        : { maturity: "SKIPPED", detail: "Create storefront slug on Overview first." };
    case "direct_ordering":
      return ctx.hasStoreSlug
        ? { maturity: "LIVE", detail: "First-party checkout on owned storefront — payment processing fees still apply." }
        : { maturity: "SKIPPED", detail: "Publish storefront menu to enable direct ordering." };
    case "owned_channel":
      return { maturity: "BETA", detail: "Own-your-channel upsell flow — commission-free vs aggregators; not guaranteed savings." };
    case "catering_pages":
      return ctx.hasForms
        ? { maturity: "BETA", detail: "Catering or group-order forms published." }
        : { maturity: "ROADMAP", detail: "Create forms under Storefront → Forms for catering intake." };
    case "marketing_campaigns":
      return ctx.hasCampaigns
        ? { maturity: "BETA", detail: "Marketing campaigns configured — transactional email separate." }
        : { maturity: "ROADMAP", detail: "Email campaign builder expanding — API drafts available." };
    case "branded_pwa":
      return ctx.pwaPublished
        ? { maturity: "BETA", detail: "Branded PWA manifest published — install from /branding." }
        : { maturity: "BETA", detail: "Generate manifest at /branding — BETA web install, not App Store binary." };
    case "hide_platform_branding":
      return ctx.hideBranding
        ? { maturity: "BETA", detail: "Hide OS Kitchen branding enabled on PWA manifest." }
        : { maturity: "ROADMAP", detail: "Enterprise gate — enable hide branding in kitchen settings." };
    default:
      return { maturity: "SKIPPED", detail: "Unknown capability." };
  }
}

export async function loadWhiteLabelStorefrontDepthModel(
  userId: string,
): Promise<WhiteLabelStorefrontDepthModel> {
  const settings = await findAdminStorefront(userId);

  let hasForms = false;
  let hasCampaigns = false;
  let hideBranding = false;
  let pwaPublished = false;
  let restaurantName = "Your restaurant";

  if (settings) {
    restaurantName =
      settings.publicName?.trim() || settings.storeSlug || restaurantName;
    hasForms =
      (await prisma.storefrontForm.count({ where: { storefrontId: settings.id } })) > 0;
    hasCampaigns =
      (await prisma.storefrontCampaign.count({ where: { storefrontId: settings.id } })) > 0;
    pwaPublished = parsePwaPublished(settings.themePublishedJson);

    const kitchen = await prisma.kitchenSettings.findUnique({
      where: { userId },
      select: { hideKitchenOsBranding: true },
    });
    hideBranding = kitchen?.hideKitchenOsBranding ?? false;

    if (settings.workspaceId) {
      const pwa = await generateBrandedPWA(settings.workspaceId);
      if (pwa?.published) pwaPublished = true;
    }
  }

  const hasLogo = Boolean(settings?.logoUrl?.trim());
  const hasBrandColor = Boolean(settings?.brandColor?.trim());
  const hasFont = Boolean(settings?.fontFamily?.trim());
  const hasCustomDomain = resolveWhiteLabelCustomDomainConfigured(
    settings?.customDomain,
    settings?.primaryDomainMode,
  );
  const hasStoreSlug = Boolean(settings?.storeSlug?.trim());

  const ctx = {
    hasLogo,
    hasBrandColor,
    hasFont,
    hasCustomDomain,
    hasStoreSlug,
    pwaPublished,
    hideBranding,
    hasForms,
    hasCampaigns,
  };

  const capabilities: WhiteLabelDepthCapability[] =
    WHITE_LABEL_STOREFRONT_DEPTH_BASE_CAPABILITIES.map((base) => {
      const resolved = resolveCapabilityMaturity(base.id, ctx);
      return { ...base, ...resolved };
    });

  const counts = countWhiteLabelDepthByMaturity(capabilities);
  const base = SITE_URL.replace(/\/$/, "");
  const storefrontUrl = hasStoreSlug
    ? hasCustomDomain && settings?.customDomain
      ? `https://${settings.customDomain.replace(/^https?:\/\//, "")}`
      : `${base}/s/${settings!.storeSlug}`
    : null;

  return {
    policyId: WHITE_LABEL_STOREFRONT_DEPTH_ABSOLUTE_FINAL_POLICY_ID,
    restaurantName,
    summary: {
      ...counts,
      readinessPercent: computeWhiteLabelDepthReadinessPercent(capabilities),
      hasLogo,
      hasBrandColor,
      hasCustomDomain,
      pwaPublished,
      storefrontUrl,
      previewThemeColor: settings?.brandColor?.trim() || "#FF5F1F",
    },
    capabilities,
    refreshedAt: new Date().toISOString(),
  };
}
