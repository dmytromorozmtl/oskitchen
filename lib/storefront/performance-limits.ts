/** Central caps for storefront abuse prevention and UX quality. */
export const STOREFRONT_PERF = {
  maxSectionsPerPage: 24,
  maxSliderSlides: 8,
  maxNavLinks: 24,
  maxFooterLinkBlocks: 8,
  maxFooterLinksPerBlock: 30,
  maxFaqItems: 40,
  maxRichTextChars: 50_000,
  maxGalleryImages: 24,
  defaultMaxImageBytes: 5 * 1024 * 1024,
} as const;

export function sectionCountWarning(count: number): string | null {
  if (count > STOREFRONT_PERF.maxSectionsPerPage) {
    return `This page exceeds the recommended maximum of ${STOREFRONT_PERF.maxSectionsPerPage} sections.`;
  }
  if (count > Math.floor(STOREFRONT_PERF.maxSectionsPerPage * 0.85)) {
    return `Approaching the ${STOREFRONT_PERF.maxSectionsPerPage} section limit — consider splitting content across pages.`;
  }
  return null;
}
