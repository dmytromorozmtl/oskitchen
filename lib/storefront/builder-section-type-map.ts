import { StorefrontSectionType } from "@prisma/client";

/** Map UI / prompt aliases to Prisma section types. */
export function mapBuilderSectionType(type: string): StorefrontSectionType {
  const t = type.trim().toUpperCase();
  switch (t) {
    case "PRODUCT_GRID":
      return StorefrontSectionType.FEATURED_MENU;
    case "HOW_IT_WORKS":
      return StorefrontSectionType.TEXT_BLOCK;
    case "CONTACT":
      return StorefrontSectionType.CONTACT_FORM;
    default:
      if (Object.values(StorefrontSectionType).includes(t as StorefrontSectionType)) {
        return t as StorefrontSectionType;
      }
      return StorefrontSectionType.TEXT_BLOCK;
  }
}

export function builderSectionLabel(type: StorefrontSectionType | string): string {
  const t = String(type);
  const labels: Record<string, string> = {
    HERO: "Hero",
    FEATURED_MENU: "Product grid",
    PRODUCT_GRID: "Product grid",
    TEXT_BLOCK: "Text / How it works",
    HOW_IT_WORKS: "How it works",
    TESTIMONIALS: "Testimonials",
    CONTACT_FORM: "Contact",
    CONTACT: "Contact",
    CATERING: "Catering",
    FAQ: "FAQ",
    REVIEWS: "Reviews",
    GALLERY: "Gallery",
    SLIDER: "Image slider",
    CTA: "Call to action",
    IMAGE_TEXT: "Image + text",
    ANNOUNCEMENT: "Announcement",
  };
  return labels[t] ?? t;
}
