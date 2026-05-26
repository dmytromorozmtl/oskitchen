const GOOGLE_FONTS: Record<string, string> = {
  Inter: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap",
  "Playfair Display":
    "https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&display=swap",
  "DM Sans": "https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&display=swap",
  "Space Grotesk": "https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;700&display=swap",
};

export const STOREFRONT_FONT_OPTIONS = Object.keys(GOOGLE_FONTS);

export function getFontLink(fontFamily: string | null | undefined): string {
  const key = (fontFamily ?? "Inter").trim();
  return GOOGLE_FONTS[key] ?? GOOGLE_FONTS.Inter;
}

export function fontFamilyCss(fontFamily: string | null | undefined): string {
  const name = (fontFamily ?? "Inter").trim();
  if (name.includes(",")) return name;
  return `"${name}", ui-sans-serif, system-ui, sans-serif`;
}
