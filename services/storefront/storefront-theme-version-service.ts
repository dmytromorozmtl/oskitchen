import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import {
  mergeThemeDraft,
  parseThemeDraft,
  resolveThemeCustomizer,
  type ThemeCustomizerState,
} from "@/lib/storefront/theme-draft";
import type { ThemeSnapshotV1 } from "@/lib/storefront/theme-snapshot";
import { revalidateStorefrontDashboardAndPublic } from "@/lib/storefront/revalidate-storefront-dashboard";
import { saveThemeCustomizer } from "@/services/storefront/storefront-theme-customizer-service";

const MAX_VERSIONS = 50;

export async function recordStorefrontThemeVersion(input: {
  storefrontId: string;
  themeJson: Prisma.InputJsonValue;
}) {
  await prisma.storefrontThemeVersion.create({
    data: {
      storefrontId: input.storefrontId,
      themeJson: input.themeJson,
    },
  });

  const excess = await prisma.storefrontThemeVersion.findMany({
    where: { storefrontId: input.storefrontId },
    orderBy: { createdAt: "desc" },
    skip: MAX_VERSIONS,
    select: { id: true },
  });
  if (excess.length > 0) {
    await prisma.storefrontThemeVersion.deleteMany({
      where: { id: { in: excess.map((v) => v.id) } },
    });
  }
}

export async function listStorefrontThemeVersions(storefrontId: string, userId: string) {
  const sf = await prisma.storefrontSettings.findFirst({
    where: { id: storefrontId, userId },
    select: { id: true },
  });
  if (!sf) return null;

  return prisma.storefrontThemeVersion.findMany({
    where: { storefrontId },
    orderBy: { createdAt: "desc" },
    take: MAX_VERSIONS,
    select: { id: true, createdAt: true },
  });
}

function customizerFromVersionJson(themeJson: unknown): ThemeCustomizerState | null {
  const snap = themeJson as ThemeSnapshotV1 | null;
  if (snap?.customizer && typeof snap.customizer === "object") {
    return snap.customizer as ThemeCustomizerState;
  }
  const draft = parseThemeDraft(themeJson);
  if (draft.customizer) {
    return resolveThemeCustomizer(draft, {});
  }
  return null;
}

export async function restoreStorefrontThemeVersion(input: {
  storefrontId: string;
  versionId: string;
  userId: string;
}): Promise<{ ok: true; theme: ThemeCustomizerState } | { ok: false; error: string }> {
  const sf = await prisma.storefrontSettings.findFirst({
    where: { id: input.storefrontId, userId: input.userId },
    select: { id: true, storeSlug: true, themeDraftJson: true },
  });
  if (!sf) return { ok: false, error: "Storefront not found." };

  const version = await prisma.storefrontThemeVersion.findFirst({
    where: { id: input.versionId, storefrontId: sf.id },
    select: { themeJson: true },
  });
  if (!version) return { ok: false, error: "Version not found." };

  const customizer = customizerFromVersionJson(version.themeJson);
  if (!customizer) return { ok: false, error: "This version has no theme customizer data." };

  const snap = version.themeJson as ThemeSnapshotV1;
  const customCss =
    typeof snap?.customCss === "string"
      ? snap.customCss
      : parseThemeDraft(version.themeJson).customCss ?? null;

  const themeDraftJson = mergeThemeDraft(sf.themeDraftJson, {
    customizer,
    customCss,
  });

  await prisma.storefrontSettings.update({
    where: { id: sf.id },
    data: { themeDraftJson: themeDraftJson as Prisma.InputJsonValue },
  });

  const saved = await saveThemeCustomizer({
    storefrontId: sf.id,
    userId: input.userId,
    customizer,
  });
  if (!saved.ok) return { ok: false, error: saved.error };

  revalidateStorefrontDashboardAndPublic(sf.storeSlug);
  return { ok: true, theme: customizer };
}
