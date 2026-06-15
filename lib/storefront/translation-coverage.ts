import { pageTranslationSummary } from "@/lib/storefront/localized-content";
import { pageMetaTranslationSummary } from "@/lib/storefront/localized-page-meta";
import type { StorefrontSectionType } from "@prisma/client";

export type StorefrontTranslationCoverage = {
  locales: string[];
  defaultLocale: string;
  sectionPercent: number;
  pageMetaPercent: number;
  overallPercent: number;
  perLocale: { locale: string; sectionGaps: number; metaGaps: number }[];
};

export function computeStorefrontTranslationCoverage(input: {
  editorLocales: string[];
  defaultLocale: string;
  pages: {
    published: boolean;
    contentJson: unknown;
    sections: { type: StorefrontSectionType; contentJson: unknown }[];
  }[];
}): StorefrontTranslationCoverage {
  const secondary = input.editorLocales.filter((l) => l !== input.defaultLocale);
  if (secondary.length === 0) {
    return {
      locales: input.editorLocales,
      defaultLocale: input.defaultLocale,
      sectionPercent: 100,
      pageMetaPercent: 100,
      overallPercent: 100,
      perLocale: [],
    };
  }

  const published = input.pages.filter((p) => p.published);
  let sectionSlots = 0;
  let sectionFilled = 0;
  let metaSlots = 0;
  let metaFilled = 0;
  const perLocale = secondary.map((locale) => ({ locale, sectionGaps: 0, metaGaps: 0 }));

  for (const page of published) {
    const secSummary = pageTranslationSummary(page.sections, input.editorLocales);
    const metaSummary = pageMetaTranslationSummary(page.contentJson, input.editorLocales, input.defaultLocale);
    for (const loc of secondary) {
      const sec = secSummary.find((s) => s.locale === loc);
      const meta = metaSummary.find((s) => s.locale === loc);
      sectionSlots += page.sections.length;
      sectionFilled += page.sections.length - (sec?.missingCount ?? page.sections.length);
      metaSlots += 2;
      metaFilled += 2 - (meta?.missingCount ?? 2);
      const pl = perLocale.find((x) => x.locale === loc);
      if (pl) {
        pl.sectionGaps += sec?.missingCount ?? 0;
        pl.metaGaps += meta?.missingCount ?? 0;
      }
    }
  }

  const sectionPercent = sectionSlots ? Math.round((sectionFilled / sectionSlots) * 100) : 100;
  const pageMetaPercent = metaSlots ? Math.round((metaFilled / metaSlots) * 100) : 100;
  const overallPercent = Math.round((sectionPercent + pageMetaPercent) / 2);

  return {
    locales: input.editorLocales,
    defaultLocale: input.defaultLocale,
    sectionPercent,
    pageMetaPercent,
    overallPercent,
    perLocale,
  };
}
