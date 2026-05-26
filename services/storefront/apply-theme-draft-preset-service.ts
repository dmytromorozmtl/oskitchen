import { prisma } from "@/lib/prisma";
import { themePresetToSettingsPatch } from "@/services/storefront/apply-theme-preset-service";
import { buildThemeSnapshotV1 } from "@/lib/storefront/theme-snapshot";

/** Apply a theme preset into themeDraftJson (experiment draft arm) without publishing live colors. */
export async function applyPresetToThemeDraftJson(input: {
  storefrontId: string;
  presetId: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const patch = themePresetToSettingsPatch(input.presetId);
  if (!patch) return { ok: false, error: "Unknown theme preset." };

  const sf = await prisma.storefrontSettings.findUnique({
    where: { id: input.storefrontId },
    include: { navigation: true, footer: true },
  });
  if (!sf) return { ok: false, error: "Storefront not found." };

  const snapshot = buildThemeSnapshotV1({
    navigationItems: sf.navigation?.itemsJson ?? [],
    footerBlocks: sf.footer?.blocksJson ?? [],
    tokens: {
      brandColor: patch.brandColor ?? sf.brandColor,
      secondaryColor: patch.secondaryColor ?? sf.secondaryColor,
      backgroundColor: patch.backgroundColor ?? sf.backgroundColor,
      textColor: patch.textColor ?? sf.textColor,
    },
  });

  const draftBundle = {
    ...(typeof sf.themeDraftJson === "object" && sf.themeDraftJson ? (sf.themeDraftJson as object) : {}),
    snapshot,
    presetId: input.presetId,
    tokens: {
      brandColor: patch.brandColor,
      secondaryColor: patch.secondaryColor,
      backgroundColor: patch.backgroundColor,
      textColor: patch.textColor,
    },
    themePreset: patch.themePreset,
    layoutPreset: patch.layoutPreset,
    fontFamily: patch.fontFamily,
  };

  await prisma.storefrontSettings.update({
    where: { id: sf.id },
    data: {
      themeDraftJson: draftBundle as object,
      themePreset: patch.themePreset,
    },
  });

  return { ok: true };
}
