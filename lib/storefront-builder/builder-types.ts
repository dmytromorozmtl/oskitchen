/**
 * Cross-cutting builder types — orthogonal to Prisma where possible,
 * but aligned with existing `StorefrontSettings` / pages / sections.
 */

export type BuilderSaveState = "saved" | "unsaved" | "publishing";

export type StorefrontBuilderSurface =
  | "theme"
  | "media"
  | "pages"
  | "navigation"
  | "footer"
  | "menu"
  | "product"
  | "seo"
  | "preview";

export type PublishChannel = "draft_preview" | "live_public";
