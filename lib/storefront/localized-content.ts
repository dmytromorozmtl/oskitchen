import type { StorefrontSectionType } from "@prisma/client";
import { STOREFRONT_SUPPORTED_LOCALES, type StorefrontLocaleCode } from "@/lib/storefront/regional";
import { schemaForSectionType } from "@/lib/storefront/sections";

/** Versioned wrapper stored in section `contentJson` when localized. */
export type LocalizedSectionPayloadV1 = {
  _localized: true;
  version: 1;
  defaultLocale: string;
  byLocale: Record<string, Record<string, unknown>>;
};

export function isLocalizedSectionPayload(raw: unknown): raw is LocalizedSectionPayloadV1 {
  return (
    typeof raw === "object" &&
    raw !== null &&
    (raw as LocalizedSectionPayloadV1)._localized === true &&
    typeof (raw as LocalizedSectionPayloadV1).byLocale === "object"
  );
}

/** Resolve section content for a guest locale (legacy flat JSON supported). */
export function resolveSectionContentForLocale(
  raw: unknown,
  locale: string,
  fallbackLocale = "en",
): Record<string, unknown> {
  if (isLocalizedSectionPayload(raw)) {
    const loc = locale.split("-")[0]?.toLowerCase() ?? fallbackLocale;
    const def = raw.defaultLocale.split("-")[0]?.toLowerCase() ?? fallbackLocale;
    const pick =
      raw.byLocale[loc] ??
      raw.byLocale[def] ??
      raw.byLocale[fallbackLocale] ??
      Object.values(raw.byLocale)[0];
    return (pick ?? {}) as Record<string, unknown>;
  }
  if (raw && typeof raw === "object" && !Array.isArray(raw)) {
    return raw as Record<string, unknown>;
  }
  return {};
}

export function wrapSectionContentAsLocalized(
  byLocale: Record<string, Record<string, unknown>>,
  defaultLocale: string,
): LocalizedSectionPayloadV1 {
  return {
    _localized: true,
    version: 1,
    defaultLocale,
    byLocale,
  };
}

/** Merge flat legacy content into localized shape for editing. */
export function ensureLocalizedEditorState(
  raw: unknown,
  defaultLocale: string,
  secondaryLocales: string[],
): LocalizedSectionPayloadV1 {
  if (isLocalizedSectionPayload(raw)) {
    return raw;
  }
  const flat =
    raw && typeof raw === "object" && !Array.isArray(raw) ? (raw as Record<string, unknown>) : {};
  const byLocale: Record<string, Record<string, unknown>> = {
    [defaultLocale]: { ...flat },
  };
  for (const loc of secondaryLocales) {
    byLocale[loc] = byLocale[loc] ?? {};
  }
  return wrapSectionContentAsLocalized(byLocale, defaultLocale);
}

const REQUIRED_FIELDS: Partial<Record<StorefrontSectionType, string[]>> = {
  TEXT_BLOCK: ["body"],
  ANNOUNCEMENT: ["message"],
};

export type LocaleTranslationStatus = {
  locale: string;
  complete: boolean;
  missingFields: string[];
};

export function sectionTranslationStatus(
  type: StorefrontSectionType,
  raw: unknown,
  locales: string[],
): LocaleTranslationStatus[] {
  const required = REQUIRED_FIELDS[type] ?? [];
  const payload = isLocalizedSectionPayload(raw)
    ? raw
    : ensureLocalizedEditorState(raw, locales[0] ?? "en", locales.slice(1));

  return locales.map((locale) => {
    const content = payload.byLocale[locale] ?? {};
    const missingFields = required.filter((f) => {
      const v = content[f];
      return typeof v !== "string" || !v.trim();
    });
    const schema = schemaForSectionType(type);
    const schemaOk = required.length === 0 ? true : schema.safeParse(content).success;
    return {
      locale,
      complete: missingFields.length === 0 && schemaOk,
      missingFields,
    };
  });
}

export function pageTranslationSummary(
  sections: { type: StorefrontSectionType; contentJson: unknown }[],
  locales: string[],
): { locale: string; missingCount: number }[] {
  return locales.map((locale) => {
    let missingCount = 0;
    for (const s of sections) {
      const st = sectionTranslationStatus(s.type, s.contentJson, locales).find((x) => x.locale === locale);
      if (st && !st.complete) missingCount += 1;
    }
    return { locale, missingCount };
  });
}

export function supportedLocaleCodesForStorefront(primary: string): StorefrontLocaleCode[] {
  const p = primary.split("-")[0]?.toLowerCase() ?? "en";
  const codes = STOREFRONT_SUPPORTED_LOCALES.map((l) => l.code);
  return codes.filter((c) => c === p || true) as StorefrontLocaleCode[];
}

export function secondaryLocalesForStorefront(primary: string): string[] {
  const p = primary.split("-")[0]?.toLowerCase() ?? "en";
  return STOREFRONT_SUPPORTED_LOCALES.map((l) => l.code).filter((c) => c !== p);
}

export function primaryLocaleForStorefront(settingsLocale: string): string {
  return settingsLocale.split("-")[0]?.toLowerCase() ?? "en";
}

export function allEditorLocalesForStorefront(settingsLocale: string): string[] {
  const primary = primaryLocaleForStorefront(settingsLocale);
  return [primary, ...secondaryLocalesForStorefront(primary)];
}

/** Persist a locale slice into section contentJson (creates wrapper when needed). */
/** Copy primary locale slice into secondary locales (shallow field copy). */
export function copyLocalizedPayloadToSecondaryLocales(
  payload: LocalizedSectionPayloadV1,
  sourceLocale: string,
  targetLocales: string[],
): LocalizedSectionPayloadV1 {
  const src = payload.byLocale[sourceLocale] ?? {};
  const byLocale = { ...payload.byLocale };
  for (const loc of targetLocales) {
    if (loc === sourceLocale) continue;
    byLocale[loc] = { ...src };
  }
  return { ...payload, byLocale };
}

export function upsertLocalizedSectionSlice(
  existing: unknown,
  locale: string,
  defaultLocale: string,
  slice: Record<string, unknown>,
): LocalizedSectionPayloadV1 {
  const payload = ensureLocalizedEditorState(
    existing,
    defaultLocale,
    secondaryLocalesForStorefront(defaultLocale),
  );
  return {
    ...payload,
    byLocale: {
      ...payload.byLocale,
      [locale]: { ...(payload.byLocale[locale] ?? {}), ...slice },
    },
  };
}
