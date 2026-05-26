import { validateStorefrontThemeInputs } from "@/lib/storefront/theme-validation";

export type StorefrontThemeFormInput = {
  logoUrl?: string | null;
  faviconUrl?: string | null;
  heroImageUrl?: string | null;
  coverImageUrl?: string | null;
  brandColor?: string | null;
  secondaryColor?: string | null;
  backgroundColor?: string | null;
  textColor?: string | null;
  fontFamily?: string | null;
  themePreset?: string | null;
  layoutPreset?: string | null;
};

/** Throws with a user-safe message when theme media URLs are unsafe. */
export function assertStorefrontThemeUrlsSafe(input: StorefrontThemeFormInput): void {
  const { errors } = validateStorefrontThemeInputs({
    logoUrl: input.logoUrl,
    faviconUrl: input.faviconUrl,
    heroImageUrl: input.heroImageUrl,
    coverImageUrl: input.coverImageUrl,
    brandColor: input.brandColor,
    textColor: input.textColor,
  });
  if (errors.length) {
    throw new Error(errors.join(" "));
  }
}

export function mapStorefrontThemeFormToPrismaData(input: StorefrontThemeFormInput) {
  return {
    logoUrl: input.logoUrl?.trim() || null,
    faviconUrl: input.faviconUrl?.trim() || null,
    heroImageUrl: input.heroImageUrl?.trim() || null,
    coverImageUrl: input.coverImageUrl?.trim() || null,
    brandColor: input.brandColor?.trim() || null,
    secondaryColor: input.secondaryColor?.trim() || null,
    backgroundColor: input.backgroundColor?.trim() || null,
    textColor: input.textColor?.trim() || null,
    fontFamily: input.fontFamily?.trim() || null,
    themePreset: input.themePreset?.trim() || null,
    layoutPreset: input.layoutPreset?.trim() || null,
  };
}
