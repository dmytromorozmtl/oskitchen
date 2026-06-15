import type { StorefrontSectionType } from "@prisma/client";

/** Declarative hints for a future all-field form renderer (dashboard still uses JSON textarea today for some types). */
export const SECTION_FORM_FIELDS: Partial<
  Record<StorefrontSectionType, { fields: { name: string; label: string; type: "text" | "textarea" | "url" }[] }>
> = {
  HERO: {
    fields: [
      { name: "headline", label: "Headline", type: "text" },
      { name: "subheadline", label: "Subheadline", type: "textarea" },
      { name: "primaryCtaLabel", label: "Primary CTA label", type: "text" },
      { name: "primaryCtaHref", label: "Primary CTA href", type: "url" },
    ],
  },
};
