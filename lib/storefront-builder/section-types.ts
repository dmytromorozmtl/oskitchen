import type { StorefrontSectionType } from "@prisma/client";

export type { StorefrontSectionType };

/** Builder grouping for admin UI (does not change DB enum). */
export type SectionCategory = "hero" | "content" | "commerce" | "social" | "utility";

export type SectionTypeMeta = {
  type: StorefrontSectionType;
  category: SectionCategory;
  label: string;
  description: string;
};
