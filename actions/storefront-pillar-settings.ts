"use server";


import { fail, ok } from "@/lib/action-result";
import { Prisma } from "@prisma/client";
import { revalidatePath, revalidateTag } from "next/cache";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { parseDeliveryZonesJson } from "@/lib/storefront/delivery-zones";
import { parseAnalyticsConsentMode, parseFirstPartyAnalyticsMode } from "@/lib/storefront/consent";
import { isStripeSecretConfigured } from "@/lib/storefront/stripe-readiness";
import { assertStorefrontManageAccess } from "@/lib/storefront/require-storefront-actor";
import { requireTenantActor } from "@/lib/scope/require-tenant-actor";
import { requireAdminStorefrontRow } from "@/lib/storefront/require-admin-storefront";
import { safeError } from "@/lib/security";
import { revalidateStorefrontDashboardAndPublic } from "@/lib/storefront/revalidate-storefront-dashboard";
import { assertStorefrontThemeUrlsSafe, mapStorefrontThemeFormToPrismaData } from "@/services/storefront/storefront-theme-service";

function revalidateStorefrontPaths(storeSlug: string, storefrontId?: string) {
  revalidateStorefrontDashboardAndPublic(storeSlug);
  revalidatePath("/dashboard/storefront/ordering");
  revalidatePath("/dashboard/storefront/fulfillment");
  revalidatePath("/dashboard/storefront/seo");
  revalidatePath("/dashboard/storefront/settings");
  revalidatePath("/dashboard/storefront/domains");
  if (storefrontId) {
    revalidateTag(`storefront-${storefrontId}`);
  }
  revalidateTag("storefront-public");
}

const urlOrEmpty = z.string().max(2000).optional().or(z.literal(""));

const themeSchema = z.object({
  logoUrl: urlOrEmpty,
  faviconUrl: urlOrEmpty,
  heroImageUrl: urlOrEmpty,
  coverImageUrl: urlOrEmpty,
  brandColor: z.string().max(32).optional().or(z.literal("")),
  secondaryColor: z.string().max(32).optional().or(z.literal("")),
  backgroundColor: z.string().max(32).optional().or(z.literal("")),
  textColor: z.string().max(32).optional().or(z.literal("")),
  fontFamily: z.string().max(120).optional().or(z.literal("")),
  themePreset: z.string().max(64).optional().or(z.literal("")),
  layoutPreset: z.string().max(64).optional().or(z.literal("")),
});

export async function updateStorefrontThemeSettings(formData: FormData) {
  try {
    await requireTenantActor();
    const parsed = themeSchema.safeParse({
      logoUrl: formData.get("logoUrl")?.toString(),
      faviconUrl: formData.get("faviconUrl")?.toString(),
      heroImageUrl: formData.get("heroImageUrl")?.toString(),
      coverImageUrl: formData.get("coverImageUrl")?.toString(),
      brandColor: formData.get("brandColor")?.toString(),
      secondaryColor: formData.get("secondaryColor")?.toString(),
      backgroundColor: formData.get("backgroundColor")?.toString(),
      textColor: formData.get("textColor")?.toString(),
      fontFamily: formData.get("fontFamily")?.toString(),
      themePreset: formData.get("themePreset")?.toString(),
      layoutPreset: formData.get("layoutPreset")?.toString(),
    });
    if (!parsed.success) return { error: "Check theme fields." };
    const d = parsed.data;
    const { sf: row } = await requireAdminStorefrontRow("storefront.theme", { id: true, storeSlug: true, userId: true });
    if (!row) return { error: "Save the storefront overview once before editing theme." };

    assertStorefrontThemeUrlsSafe(d);
    const data = mapStorefrontThemeFormToPrismaData(d);

    await prisma.storefrontSettings.update({
      where: { id: row.id },
      data,
    });
    revalidateStorefrontPaths(row.storeSlug, row.id);
    return { ok: true as const };
  } catch (e) {
    return { error: safeError(e) };
  }
}

export async function updateStorefrontThemeSettingsFormAction(formData: FormData): Promise<void> {
  void (await updateStorefrontThemeSettings(formData));
}

const fulfillmentSchema = z.object({
  pickupEnabled: z.coerce.boolean(),
  deliveryEnabled: z.coerce.boolean(),
  pickupInstructions: z.string().max(8000).optional().or(z.literal("")),
  deliveryInstructions: z.string().max(8000).optional().or(z.literal("")),
  storefrontDeliveryFee: z.string().max(32).optional().or(z.literal("")),
  freeDeliveryThreshold: z.string().max(32).optional().or(z.literal("")),
  deliveryRadiusKm: z.string().max(8).optional().or(z.literal("")),
  deliveryZonesJson: z.string().max(32000).optional().or(z.literal("")),
});

export async function updateStorefrontFulfillmentSettings(formData: FormData) {
  try {
    await requireTenantActor();
    const parsed = fulfillmentSchema.safeParse({
      pickupEnabled: formData.get("pickupEnabled") === "on",
      deliveryEnabled: formData.get("deliveryEnabled") === "on",
      pickupInstructions: formData.get("pickupInstructions")?.toString(),
      deliveryInstructions: formData.get("deliveryInstructions")?.toString(),
      storefrontDeliveryFee: formData.get("storefrontDeliveryFee")?.toString(),
      freeDeliveryThreshold: formData.get("freeDeliveryThreshold")?.toString(),
      deliveryRadiusKm: formData.get("deliveryRadiusKm")?.toString(),
      deliveryZonesJson: formData.get("deliveryZonesJson")?.toString(),
    });
    if (!parsed.success) return { error: "Check fulfillment fields." };
    const d = parsed.data;
    const { sf: row } = await requireAdminStorefrontRow("storefront.settings", { id: true, storeSlug: true, userId: true });
    if (!row) return { error: "Save the storefront overview once first." };

    const feeRaw = d.storefrontDeliveryFee?.trim() ?? "";
    const freeRaw = d.freeDeliveryThreshold?.trim() ?? "";
    const radRaw = d.deliveryRadiusKm?.trim() ?? "";
    let storefrontDeliveryFee: number | null = null;
    let freeDeliveryThreshold: number | null = null;
    let deliveryRadiusKm: number | null = null;
    if (feeRaw) {
      const n = Number(feeRaw);
      if (!Number.isFinite(n) || n < 0) return { error: "Delivery fee is invalid." };
      storefrontDeliveryFee = n;
    }
    if (freeRaw) {
      const n = Number(freeRaw);
      if (!Number.isFinite(n) || n < 0) return { error: "Free delivery threshold is invalid." };
      freeDeliveryThreshold = n;
    }
    if (radRaw) {
      const n = parseInt(radRaw, 10);
      if (!Number.isFinite(n) || n < 0 || n > 20000) return { error: "Delivery radius km is invalid." };
      deliveryRadiusKm = n;
    }

    let zones: unknown = null;
    const zRaw = d.deliveryZonesJson?.trim() ?? "";
    if (zRaw) {
      try {
        zones = JSON.parse(zRaw) as unknown;
      } catch {
        return { error: "Delivery zones must be valid JSON." };
      }
      const parsed = parseDeliveryZonesJson(zones);
      if (parsed.error) {
        return { error: parsed.error };
      }
    }

    await prisma.storefrontSettings.update({
      where: { id: row.id },
      data: {
        pickupEnabled: d.pickupEnabled,
        deliveryEnabled: d.deliveryEnabled,
        pickupInstructions: d.pickupInstructions?.trim() || null,
        deliveryInstructions: d.deliveryInstructions?.trim() || null,
        storefrontDeliveryFee,
        freeDeliveryThreshold,
        deliveryRadiusKm,
        deliveryZonesJson: zones as Prisma.InputJsonValue,
      },
    });
    revalidateStorefrontPaths(row.storeSlug, row.id);
    return { ok: true as const };
  } catch (e) {
    return { error: safeError(e) };
  }
}

export async function updateStorefrontFulfillmentSettingsFormAction(formData: FormData): Promise<void> {
  void (await updateStorefrontFulfillmentSettings(formData));
}

const orderingSchema = z.object({
  preorderEnabled: z.coerce.boolean(),
  payLaterOnly: z.coerce.boolean(),
  onlinePaymentEnabled: z.coerce.boolean(),
  minimumOrderAmount: z.string().max(32).optional().or(z.literal("")),
  orderCutoffTime: z.string().max(8).optional().or(z.literal("")),
  maxOrdersPerDay: z.string().max(8).optional().or(z.literal("")),
});

export async function updateStorefrontOrderingSettings(formData: FormData) {
  try {
    await requireTenantActor();
    const parsed = orderingSchema.safeParse({
      preorderEnabled: formData.get("preorderEnabled") === "on",
      payLaterOnly: formData.get("payLaterOnly") === "on",
      onlinePaymentEnabled: formData.get("onlinePaymentEnabled") === "on",
      minimumOrderAmount: formData.get("minimumOrderAmount")?.toString(),
      orderCutoffTime: formData.get("orderCutoffTime")?.toString(),
      maxOrdersPerDay: formData.get("maxOrdersPerDay")?.toString(),
    });
    if (!parsed.success) return { error: "Check ordering fields." };
    const d = parsed.data;
    const { sf: row } = await requireAdminStorefrontRow("storefront.settings", { id: true, storeSlug: true, userId: true });
    if (!row) return { error: "Save the storefront overview once first." };

    const minRaw = d.minimumOrderAmount?.trim() ?? "";
    let minimumOrderAmount: number | null = null;
    if (minRaw) {
      const n = Number(minRaw);
      if (!Number.isFinite(n) || n < 0) return { error: "Minimum order amount is invalid." };
      minimumOrderAmount = n;
    }

    const cutoffRaw = d.orderCutoffTime?.trim() ?? "";
    let orderCutoffTime: string | null = null;
    if (cutoffRaw) {
      if (!/^\d{1,2}:\d{2}$/.test(cutoffRaw)) {
        return { error: "Order cutoff must be HH:mm (24h)." };
      }
      orderCutoffTime = cutoffRaw;
    }

    const maxRaw = d.maxOrdersPerDay?.trim() ?? "";
    let maxOrdersPerDay: number | null = null;
    if (maxRaw) {
      const n = parseInt(maxRaw, 10);
      if (!Number.isFinite(n) || n < 1 || n > 100000) return { error: "Max orders per day is invalid." };
      maxOrdersPerDay = n;
    }

    if (d.onlinePaymentEnabled && !isStripeSecretConfigured()) {
      return {
        error:
          "Online payments cannot be enabled until STRIPE_SECRET_KEY is configured on the server and Stripe webhooks are wired for checkout.session.completed.",
      };
    }

    await prisma.storefrontSettings.update({
      where: { id: row.id },
      data: {
        preorderEnabled: d.preorderEnabled,
        payLaterOnly: d.payLaterOnly,
        onlinePaymentEnabled: d.onlinePaymentEnabled,
        minimumOrderAmount,
        orderCutoffTime,
        maxOrdersPerDay,
      },
    });
    revalidateStorefrontPaths(row.storeSlug, row.id);
    return { ok: true as const };
  } catch (e) {
    return { error: safeError(e) };
  }
}

export async function updateStorefrontOrderingSettingsFormAction(formData: FormData): Promise<void> {
  void (await updateStorefrontOrderingSettings(formData));
}

const marketingSchema = z.object({
  announcementEnabled: z.coerce.boolean(),
  announcementText: z.string().max(4000).optional().or(z.literal("")),
  closureEnabled: z.coerce.boolean(),
  closureMessage: z.string().max(4000).optional().or(z.literal("")),
  closureStartDate: z.string().max(16).optional().or(z.literal("")),
  closureEndDate: z.string().max(16).optional().or(z.literal("")),
});

export async function updateStorefrontMarketingSettings(formData: FormData) {
  try {
    await requireTenantActor();
    const parsed = marketingSchema.safeParse({
      announcementEnabled: formData.get("announcementEnabled") === "on",
      announcementText: formData.get("announcementText")?.toString(),
      closureEnabled: formData.get("closureEnabled") === "on",
      closureMessage: formData.get("closureMessage")?.toString(),
      closureStartDate: formData.get("closureStartDate")?.toString(),
      closureEndDate: formData.get("closureEndDate")?.toString(),
    });
    if (!parsed.success) return { error: "Check announcement / closure fields." };
    const d = parsed.data;
    const { sf: row } = await requireAdminStorefrontRow("storefront.settings", { id: true, storeSlug: true, userId: true });
    if (!row) return { error: "Save the storefront overview once first." };

    const parseDate = (s: string): Date | null => {
      const t = s.trim();
      if (!t) return null;
      const dt = new Date(`${t}T12:00:00.000Z`);
      return Number.isNaN(dt.getTime()) ? null : dt;
    };

    const closureStartDate = parseDate(d.closureStartDate ?? "");
    const closureEndDate = parseDate(d.closureEndDate ?? "");
    if (d.closureEnabled && closureStartDate && closureEndDate && closureEndDate < closureStartDate) {
      return { error: "Closure end date must be on or after the start date." };
    }

    await prisma.storefrontSettings.update({
      where: { id: row.id },
      data: {
        announcementEnabled: d.announcementEnabled,
        announcementText: d.announcementText?.trim() || null,
        closureEnabled: d.closureEnabled,
        closureMessage: d.closureMessage?.trim() || null,
        closureStartDate,
        closureEndDate,
      },
    });
    revalidateStorefrontPaths(row.storeSlug, row.id);
    return { ok: true as const };
  } catch (e) {
    return { error: safeError(e) };
  }
}

export async function updateStorefrontMarketingSettingsFormAction(formData: FormData): Promise<void> {
  void (await updateStorefrontMarketingSettings(formData));
}

const seoSchema = z.object({
  seoTitle: z.string().max(255).optional().or(z.literal("")),
  seoDescription: z.string().max(4000).optional().or(z.literal("")),
  seoImageUrl: urlOrEmpty,
  canonicalBaseUrl: urlOrEmpty,
  robotsPolicy: z.string().max(64).optional().or(z.literal("")),
  metaPixelId: z.string().max(64).optional().or(z.literal("")),
  googleAnalyticsId: z.string().max(64).optional().or(z.literal("")),
  googleAnalyticsPropertyId: z.string().max(32).optional().or(z.literal("")),
  googleTagManagerId: z.string().max(64).optional().or(z.literal("")),
  analyticsConsentMode: z.string().max(32).optional().or(z.literal("")),
  analyticsConsentBannerText: z.string().max(4000).optional().or(z.literal("")),
  analyticsExcludeTestOrders: z.enum(["on", "off"]).optional(),
  firstPartyAnalyticsMode: z.string().max(32).optional().or(z.literal("")),
});

export async function updateStorefrontSeoSettings(formData: FormData) {
  try {
    await requireTenantActor();
    const parsed = seoSchema.safeParse({
      seoTitle: formData.get("seoTitle")?.toString(),
      seoDescription: formData.get("seoDescription")?.toString(),
      seoImageUrl: formData.get("seoImageUrl")?.toString(),
      canonicalBaseUrl: formData.get("canonicalBaseUrl")?.toString(),
      robotsPolicy: formData.get("robotsPolicy")?.toString(),
      metaPixelId: formData.get("metaPixelId")?.toString(),
      googleAnalyticsId: formData.get("googleAnalyticsId")?.toString(),
      googleAnalyticsPropertyId: formData.get("googleAnalyticsPropertyId")?.toString(),
      googleTagManagerId: formData.get("googleTagManagerId")?.toString(),
      analyticsConsentMode: formData.get("analyticsConsentMode")?.toString(),
      analyticsConsentBannerText: formData.get("analyticsConsentBannerText")?.toString(),
      analyticsExcludeTestOrders: formData.get("analyticsExcludeTestOrders") === "on" ? "on" : "off",
      firstPartyAnalyticsMode: formData.get("firstPartyAnalyticsMode")?.toString(),
    });
    if (!parsed.success) return { error: "Check SEO / analytics fields." };
    const d = parsed.data;
    const { sf: row } = await requireAdminStorefrontRow("storefront.settings", { id: true, storeSlug: true, userId: true });
    if (!row) return { error: "Save the storefront overview once first." };

    const gtm = d.googleTagManagerId?.trim() ?? "";
    if (gtm && !/^GTM-[A-Z0-9]+$/i.test(gtm)) {
      return { error: "Google Tag Manager ID must look like GTM-XXXX." };
    }

    const propertyId = d.googleAnalyticsPropertyId?.replace(/\D/g, "") || null;
    if (propertyId) {
      const { validateGa4PropertyId } = await import("@/lib/storefront/ga4-property-validator");
      const validation = await validateGa4PropertyId(propertyId);
      if (!validation.ok) {
        return { error: validation.detail };
      }
    }

    await prisma.storefrontSettings.update({
      where: { id: row.id },
      data: {
        seoTitle: d.seoTitle?.trim() || null,
        seoDescription: d.seoDescription?.trim() || null,
        seoImageUrl: d.seoImageUrl?.trim() || null,
        canonicalBaseUrl: d.canonicalBaseUrl?.trim() || null,
        robotsPolicy: d.robotsPolicy?.trim() || null,
        metaPixelId: d.metaPixelId?.trim() || null,
        googleAnalyticsId: d.googleAnalyticsId?.trim() || null,
        googleAnalyticsPropertyId: propertyId,
        googleTagManagerId: gtm ? gtm.toUpperCase() : null,
        analyticsConsentMode: parseAnalyticsConsentMode(d.analyticsConsentMode),
        analyticsConsentBannerText: d.analyticsConsentBannerText?.trim() || null,
        analyticsExcludeTestOrders: d.analyticsExcludeTestOrders === "on",
        firstPartyAnalyticsMode: parseFirstPartyAnalyticsMode(d.firstPartyAnalyticsMode),
      },
    });
    revalidateStorefrontPaths(row.storeSlug, row.id);
    return { ok: true as const };
  } catch (e) {
    return { error: safeError(e) };
  }
}

export async function updateStorefrontSeoSettingsFormAction(formData: FormData): Promise<void> {
  void (await updateStorefrontSeoSettings(formData));
}

const customDomainSchema = z.object({
  customDomain: z.string().max(255).optional().or(z.literal("")),
  customDomainVerificationToken: z.string().max(64).optional().or(z.literal("")),
});

function normalizeHostname(input: string): string {
  let h = input.trim().toLowerCase();
  if (!h) return "";
  h = h.replace(/^https?:\/\//, "");
  h = h.split("/")[0] ?? "";
  h = h.split(":")[0] ?? "";
  return h.trim();
}

export async function updateStorefrontCustomDomainSettings(formData: FormData) {
  try {
    await requireTenantActor();
    const manageDenied = await assertStorefrontManageAccess("storefront.domain.update");
    if (manageDenied) return manageDenied;
    const parsed = customDomainSchema.safeParse({
      customDomain: formData.get("customDomain")?.toString(),
      customDomainVerificationToken: formData.get("customDomainVerificationToken")?.toString(),
    });
    if (!parsed.success) return { error: "Check domain fields." };
    const d = parsed.data;
    const { sf: row } = await requireAdminStorefrontRow("storefront.settings", { id: true, storeSlug: true, userId: true });
    if (!row) return { error: "Save the storefront overview once first." };

    const host = normalizeHostname(d.customDomain ?? "");
    const token = (d.customDomainVerificationToken ?? "").trim() || null;

    if (host && /[\s<>"']/.test(host)) {
      return { error: "Hostname contains invalid characters." };
    }
    if (host.length > 253) {
      return { error: "Hostname is too long." };
    }

    await prisma.storefrontSettings.update({
      where: { id: row.id },
      data: {
        customDomain: host || null,
        customDomainVerificationToken: token,
      },
    });
    revalidateStorefrontPaths(row.storeSlug, row.id);
    return { ok: true as const };
  } catch (e) {
    return { error: safeError(e) };
  }
}

export async function updateStorefrontCustomDomainSettingsFormAction(formData: FormData): Promise<void> {
  void (await updateStorefrontCustomDomainSettings(formData));
}
