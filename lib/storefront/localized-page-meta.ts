import type { LocalizedSectionPayloadV1 } from "@/lib/storefront/localized-content";
import { toJsonValue } from "@/lib/prisma/json";
import {
  ensureLocalizedEditorState,
  isLocalizedSectionPayload,
  secondaryLocalesForStorefront,
} from "@/lib/storefront/localized-content";

export type PageMetaSlice = {
  title?: string;
  seoTitle?: string | null;
  seoDescription?: string | null;
  seoOgImageUrl?: string | null;
};

export type LocalizedPageMetaPayloadV1 = LocalizedSectionPayloadV1;

const META_KEY = "_pageMeta";

export function readPageMetaFromContentJson(contentJson: unknown): LocalizedPageMetaPayloadV1 | null {
  if (!contentJson || typeof contentJson !== "object" || Array.isArray(contentJson)) return null;
  const raw = (contentJson as Record<string, unknown>)[META_KEY];
  if (!isLocalizedSectionPayload(raw)) return null;
  return raw;
}

export function ensurePageMetaState(
  contentJson: unknown,
  defaultLocale: string,
  fallback: PageMetaSlice,
): { content: Record<string, unknown>; meta: LocalizedPageMetaPayloadV1 } {
  const base =
    contentJson && typeof contentJson === "object" && !Array.isArray(contentJson)
      ? { ...(contentJson as Record<string, unknown>) }
      : {};
  const existing = readPageMetaFromContentJson(base);
  const secondary = secondaryLocalesForStorefront(defaultLocale);
  const meta = existing
    ? existing
    : ensureLocalizedEditorState(
        {
          title: fallback.title ?? "",
          seoTitle: fallback.seoTitle ?? "",
          seoDescription: fallback.seoDescription ?? "",
          seoOgImageUrl: fallback.seoOgImageUrl ?? "",
        },
        defaultLocale,
        secondary,
      );
  if (!meta.byLocale[defaultLocale]) {
    meta.byLocale[defaultLocale] = {
      title: fallback.title ?? "",
      seoTitle: fallback.seoTitle ?? "",
      seoDescription: fallback.seoDescription ?? "",
      seoOgImageUrl: fallback.seoOgImageUrl ?? "",
    };
  }
  base[META_KEY] = meta;
  return { content: base, meta };
}

export function resolvePageMetaForLocale(
  contentJson: unknown,
  locale: string,
  defaultLocale: string,
  rowFallback: PageMetaSlice,
): PageMetaSlice {
  const meta = readPageMetaFromContentJson(contentJson);
  if (!meta) return rowFallback;
  const loc = locale.split("-")[0]?.toLowerCase() ?? defaultLocale;
  const def = defaultLocale.split("-")[0]?.toLowerCase() ?? "en";
  const slice = (meta.byLocale[loc] ?? meta.byLocale[def] ?? meta.byLocale[defaultLocale] ?? {}) as PageMetaSlice;
  return {
    title: typeof slice.title === "string" && slice.title.trim() ? slice.title : rowFallback.title,
    seoTitle:
      typeof slice.seoTitle === "string" && slice.seoTitle.trim() ? slice.seoTitle : rowFallback.seoTitle,
    seoDescription:
      typeof slice.seoDescription === "string" && slice.seoDescription.trim()
        ? slice.seoDescription
        : rowFallback.seoDescription,
    seoOgImageUrl:
      typeof slice.seoOgImageUrl === "string" && slice.seoOgImageUrl.trim()
        ? slice.seoOgImageUrl
        : rowFallback.seoOgImageUrl,
  };
}

export function upsertPageMetaSlice(
  contentJson: unknown,
  locale: string,
  defaultLocale: string,
  slice: PageMetaSlice,
  rowFallback: PageMetaSlice,
): Record<string, unknown> {
  const { content, meta } = ensurePageMetaState(contentJson, defaultLocale, rowFallback);
  const nextMeta = {
    ...meta,
    byLocale: {
      ...meta.byLocale,
      [locale]: { ...(meta.byLocale[locale] ?? {}), ...slice },
    },
  };
  content[META_KEY] = nextMeta;
  return content;
}

export function pageMetaTranslationSummary(
  contentJson: unknown,
  locales: string[],
  defaultLocale: string,
): { locale: string; missingCount: number }[] {
  const meta = readPageMetaFromContentJson(contentJson);
  if (!meta) return locales.filter((l) => l !== defaultLocale).map((locale) => ({ locale, missingCount: 1 }));
  return locales.map((locale) => {
    const slice = meta.byLocale[locale] ?? {};
    const missing =
      (typeof slice.title !== "string" || !slice.title.trim() ? 1 : 0) +
      (typeof slice.seoDescription !== "string" || !slice.seoDescription.trim() ? 1 : 0);
    return { locale, missingCount: missing };
  });
}

export function mergeContentJsonPreservingBody(
  prev: unknown,
  nextContent: Record<string, unknown>,
): Record<string, unknown> {
  const prevObj =
    prev && typeof prev === "object" && !Array.isArray(prev) ? (prev as Record<string, unknown>) : {};
  const body = prevObj.body ?? prevObj.html;
  const out = { ...nextContent };
  if (typeof body === "string") out.body = body;
  return out;
}
