import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import {
  mergeThemeDraft,
  parseThemeDraft,
  resolveThemeCustomizer,
  type ThemeCustomizerState,
} from "@/lib/storefront/theme-draft";
import { revalidateStorefrontDashboardAndPublic } from "@/lib/storefront/revalidate-storefront-dashboard";

export async function loadThemeCustomizerForStorefront(storefrontId: string) {
  const sf = await prisma.storefrontSettings.findUnique({
    where: { id: storefrontId },
    select: {
      id: true,
      storeSlug: true,
      brandColor: true,
      secondaryColor: true,
      backgroundColor: true,
      textColor: true,
      fontFamily: true,
      layoutPreset: true,
      themeDraftJson: true,
    },
  });
  if (!sf) return null;
  const draft = parseThemeDraft(sf.themeDraftJson);
  const customizer = resolveThemeCustomizer(draft, sf);
  return { sf, draft, customizer };
}

export async function saveThemeCustomizer(input: {
  storefrontId: string;
  userId: string;
  customizer: ThemeCustomizerState;
}) {
  const sf = await prisma.storefrontSettings.findFirst({
    where: { id: input.storefrontId, userId: input.userId },
    select: { id: true, storeSlug: true, themeDraftJson: true },
  });
  if (!sf) return { ok: false as const, error: "Storefront not found." };

  const draft = parseThemeDraft(sf.themeDraftJson);
  const themeDraftJson = mergeThemeDraft(sf.themeDraftJson, {
    customizer: input.customizer,
  });

  await prisma.storefrontSettings.update({
    where: { id: sf.id },
    data: {
      brandColor: input.customizer.accentColor,
      secondaryColor: input.customizer.secondaryColor,
      fontFamily: input.customizer.fontFamily,
      layoutPreset: `${input.customizer.heroLayout}:${input.customizer.navStyle}`,
      themeDraftJson: themeDraftJson as Prisma.InputJsonValue,
    },
  });

  revalidateStorefrontDashboardAndPublic(sf.storeSlug);
  return { ok: true as const };
}

export async function saveStorefrontCustomCss(input: {
  storefrontId: string;
  userId: string;
  customCss: string;
}) {
  const sf = await prisma.storefrontSettings.findFirst({
    where: { id: input.storefrontId, userId: input.userId },
    select: { id: true, storeSlug: true, themeDraftJson: true },
  });
  if (!sf) return { ok: false as const, error: "Storefront not found." };

  const css = input.customCss.slice(0, 32_000);
  const themeDraftJson = mergeThemeDraft(sf.themeDraftJson, { customCss: css });

  await prisma.storefrontSettings.update({
    where: { id: sf.id },
    data: { themeDraftJson: themeDraftJson as Prisma.InputJsonValue },
  });

  revalidateStorefrontDashboardAndPublic(sf.storeSlug);
  return { ok: true as const };
}

export async function saveStorefrontSeoSocial(input: {
  storefrontId: string;
  userId: string;
  seoSocial: {
    ogTitle?: string;
    ogDescription?: string;
    twitterTitle?: string;
    twitterDescription?: string;
  };
}) {
  const sf = await prisma.storefrontSettings.findFirst({
    where: { id: input.storefrontId, userId: input.userId },
    select: { id: true, storeSlug: true, themeDraftJson: true },
  });
  if (!sf) return { ok: false as const, error: "Storefront not found." };

  const themeDraftJson = mergeThemeDraft(sf.themeDraftJson, { seoSocial: input.seoSocial });

  await prisma.storefrontSettings.update({
    where: { id: sf.id },
    data: { themeDraftJson: themeDraftJson as Prisma.InputJsonValue },
  });

  revalidateStorefrontDashboardAndPublic(sf.storeSlug);
  return { ok: true as const };
}
