import type { Prisma } from "@prisma/client";

import { asJsonRecord } from "@/lib/prisma/json";
import type { ThemeCustomizerState, ThemeDraftPayload } from "@/lib/storefront/theme-draft";
import { parseThemeDraft } from "@/lib/storefront/theme-draft";

export type ThemeSnapshotV1 = {
  version: 1;
  navigationItems?: unknown;
  footerBlocks?: unknown;
  tokens?: Partial<{
    brandColor: string | null;
    secondaryColor: string | null;
    backgroundColor: string | null;
    textColor: string | null;
  }>;
  customizer?: ThemeCustomizerState;
  customCss?: string | null;
};

/** Theme draft for public guests — published snapshot when available. */
export function selectThemeDraftForAudience(
  sf: {
    themeDraftJson: Prisma.JsonValue | null;
    themePublishedJson: Prisma.JsonValue | null;
    themePublishedAt: Date | null;
  },
  audience: "public" | "preview",
): ThemeDraftPayload {
  if (audience === "preview") return parseThemeDraft(sf.themeDraftJson);
  if (sf.themePublishedAt) {
    const pub = asJsonRecord(sf.themePublishedJson);
    if (pub && ("customizer" in pub || "customCss" in pub)) {
      return {
        customizer: pub.customizer as ThemeCustomizerState | undefined,
        customCss: typeof pub.customCss === "string" ? pub.customCss : null,
        seoSocial: parseThemeDraft(sf.themeDraftJson).seoSocial,
      };
    }
  }
  return parseThemeDraft(sf.themeDraftJson);
}

/** Public storefront + checkout: prefer published snapshot when a publish has occurred. */
export function selectNavigationJsonForAudience(
  sf: {
    themePublishedAt: Date | null;
    themePublishedJson: Prisma.JsonValue | null;
    navigation: { itemsJson: Prisma.JsonValue } | null;
  },
  audience: "public" | "builder-preview",
): unknown {
  if (audience === "public" && sf.themePublishedAt) {
    const j = asJsonRecord(sf.themePublishedJson);
    if (j && "navigationItems" in j) {
      return { items: j.navigationItems };
    }
  }
  return sf.navigation?.itemsJson ?? { items: [] };
}

export function selectFooterJsonForAudience(
  sf: {
    themePublishedAt: Date | null;
    themePublishedJson: Prisma.JsonValue | null;
    footer: { blocksJson: Prisma.JsonValue } | null;
  },
  audience: "public" | "builder-preview",
): unknown {
  if (audience === "public" && sf.themePublishedAt) {
    const j = asJsonRecord(sf.themePublishedJson);
    if (j && "footerBlocks" in j) {
      return { blocks: j.footerBlocks };
    }
  }
  return sf.footer?.blocksJson ?? { blocks: [] };
}

export function mergePublishedThemeTokensIntoSettings<
  T extends {
    brandColor?: string | null;
    secondaryColor?: string | null;
    backgroundColor?: string | null;
    textColor?: string | null;
    themePublishedJson: Prisma.JsonValue | null;
    themePublishedAt: Date | null;
  },
>(sf: T): T {
  if (!sf.themePublishedAt) return sf;
  const j = asJsonRecord(sf.themePublishedJson);
  const tok = j?.tokens as Record<string, unknown> | undefined;
  if (!tok) return sf;
  return {
    ...sf,
    brandColor: typeof tok.brandColor === "string" ? tok.brandColor : sf.brandColor,
    secondaryColor: typeof tok.secondaryColor === "string" ? tok.secondaryColor : sf.secondaryColor,
    backgroundColor: typeof tok.backgroundColor === "string" ? tok.backgroundColor : sf.backgroundColor,
    textColor: typeof tok.textColor === "string" ? tok.textColor : sf.textColor,
  };
}

export function mergeDraftThemeTokensIntoSettings<
  T extends {
    brandColor?: string | null;
    secondaryColor?: string | null;
    backgroundColor?: string | null;
    textColor?: string | null;
    themeDraftJson?: Prisma.JsonValue | null;
  },
>(sf: T): T {
  const j = asJsonRecord(sf.themeDraftJson);
  const tok = j?.tokens as Record<string, unknown> | undefined;
  if (!tok) return sf;
  return {
    ...sf,
    brandColor: typeof tok.brandColor === "string" ? tok.brandColor : sf.brandColor,
    secondaryColor: typeof tok.secondaryColor === "string" ? tok.secondaryColor : sf.secondaryColor,
    backgroundColor: typeof tok.backgroundColor === "string" ? tok.backgroundColor : sf.backgroundColor,
    textColor: typeof tok.textColor === "string" ? tok.textColor : sf.textColor,
  };
}

export function buildThemeSnapshotV1(input: {
  navigationItems: unknown;
  footerBlocks: unknown;
  tokens: ThemeSnapshotV1["tokens"];
  customizer?: ThemeCustomizerState;
  customCss?: string | null;
}): ThemeSnapshotV1 {
  return {
    version: 1,
    navigationItems: input.navigationItems,
    footerBlocks: input.footerBlocks,
    tokens: input.tokens ?? {},
    customizer: input.customizer,
    customCss: input.customCss ?? null,
  };
}
