/** Small set of nav icon keys rendered as emoji in public nav (no extra font deps). */
export const NAV_ICON_OPTIONS: { value: string; label: string; glyph: string }[] = [
  { value: "", label: "None", glyph: "" },
  { value: "menu", label: "Menu", glyph: "🍽" },
  { value: "cart", label: "Cart", glyph: "🛒" },
  { value: "home", label: "Home", glyph: "🏠" },
  { value: "contact", label: "Contact", glyph: "✉️" },
  { value: "info", label: "Info", glyph: "ℹ️" },
  { value: "star", label: "Featured", glyph: "⭐" },
];

export function navIconGlyph(key: string | undefined | null): string {
  if (!key) return "";
  return NAV_ICON_OPTIONS.find((o) => o.value === key)?.glyph ?? "";
}
