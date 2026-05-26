import { StorefrontSectionType } from "@prisma/client";

import type { SectionTypeMeta } from "@/lib/storefront-builder/section-types";

export const STOREFRONT_SECTION_REGISTRY: SectionTypeMeta[] = [
  { type: StorefrontSectionType.HERO, category: "hero", label: "Hero", description: "Headline, CTAs, optional background messaging." },
  { type: StorefrontSectionType.FEATURED_MENU, category: "commerce", label: "Featured menu", description: "Highlights from the published menu." },
  { type: StorefrontSectionType.TEXT_BLOCK, category: "content", label: "Text block", description: "Rich story, hours, policies (plain text / light HTML policy TBD)." },
  { type: StorefrontSectionType.IMAGE_TEXT, category: "content", label: "Image + text", description: "Split storytelling with validated image URL." },
  { type: StorefrontSectionType.TESTIMONIALS, category: "social", label: "Testimonials", description: "Quotes grid." },
  { type: StorefrontSectionType.FAQ, category: "utility", label: "FAQ", description: "Structured Q&A list." },
  { type: StorefrontSectionType.CONTACT_FORM, category: "utility", label: "Contact form", description: "Links to storefront forms pipeline." },
  { type: StorefrontSectionType.CTA, category: "commerce", label: "Call to action", description: "Conversion strip." },
  { type: StorefrontSectionType.GALLERY, category: "content", label: "Gallery", description: "Image grid with alt text." },
  { type: StorefrontSectionType.ANNOUNCEMENT, category: "utility", label: "Announcement", description: "Top-of-page notice." },
  { type: StorefrontSectionType.CATERING, category: "commerce", label: "Catering", description: "Catering pitch + CTA." },
  { type: StorefrontSectionType.REVIEWS, category: "social", label: "Reviews", description: "Placeholder for future provider embeds." },
  { type: StorefrontSectionType.SLIDER, category: "hero", label: "Slider", description: "Accessible image slider with optional CTAs." },
];

export function listSectionTypeMeta(): SectionTypeMeta[] {
  return STOREFRONT_SECTION_REGISTRY;
}
