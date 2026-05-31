const HEX = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i;

export function isSafeHttpsUrl(raw: string | null | undefined): { ok: boolean; reason?: string } {
  const u = (raw ?? "").trim();
  if (!u) return { ok: true };
  if (u.toLowerCase().startsWith("javascript:")) return { ok: false, reason: "javascript: URLs are not allowed." };
  if (u.toLowerCase().startsWith("data:")) return { ok: false, reason: "data: URLs are not allowed for theme media." };
  try {
    const parsed = new URL(u);
    if (parsed.protocol !== "https:") return { ok: false, reason: "Theme media URLs must use HTTPS." };
    return { ok: true };
  } catch {
    return { ok: false, reason: "Invalid URL." };
  }
}

export function isValidHexColor(raw: string | null | undefined): boolean {
  const v = (raw ?? "").trim();
  return v.length > 0 && HEX.test(v);
}

/** Relative luminance for sRGB hex (#rgb or #rrggbb). */
function luminance(hex: string): number {
  const h = hex.replace("#", "");
  const full = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
  const r = parseInt(full.slice(0, 2), 16) / 255;
  const g = parseInt(full.slice(2, 4), 16) / 255;
  const b = parseInt(full.slice(4, 6), 16) / 255;
  const f = (x: number) => (x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4);
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
}

export function contrastRatio(hexA: string, hexB: string): number | null {
  if (!isValidHexColor(hexA) || !isValidHexColor(hexB)) return null;
  const L1 = luminance(hexA);
  const L2 = luminance(hexB);
  const light = Math.max(L1, L2);
  const dark = Math.min(L1, L2);
  return (light + 0.05) / (dark + 0.05);
}

export function validateStorefrontThemeInputs(input: {
  logoUrl?: string | null;
  faviconUrl?: string | null;
  heroImageUrl?: string | null;
  coverImageUrl?: string | null;
  brandColor?: string | null;
  textColor?: string | null;
}): { errors: string[]; warnings: string[] } {
  const errors: string[] = [];
  const warnings: string[] = [];
  for (const [label, val] of [
    ["Logo", input.logoUrl],
    ["Favicon", input.faviconUrl],
    ["Hero", input.heroImageUrl],
    ["Cover", input.coverImageUrl],
  ] as const) {
    const r = isSafeHttpsUrl(val ?? "");
    if (!r.ok && (val ?? "").trim()) errors.push(`${label}: ${r.reason}`);
  }
  if (input.brandColor && !isValidHexColor(input.brandColor)) warnings.push("Accent color should be a hex value like #FF5F1F.");
  if (input.textColor && !isValidHexColor(input.textColor)) warnings.push("Text color should be a valid hex value.");
  const ratio =
    input.brandColor && input.textColor ? contrastRatio(input.brandColor, input.textColor) : null;
  if (ratio != null && ratio < 3) warnings.push("Accent vs text contrast is low — consider adjusting for readability.");
  return { errors, warnings };
}
