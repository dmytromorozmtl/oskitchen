/**
 * CDN-aware product image URLs (Supabase render API + passthrough for others).
 * Used on menu tiles and PDP for LCP-friendly widths.
 */

export type StorefrontImageTransform = {
  width?: number;
  height?: number;
  quality?: number;
  resize?: "cover" | "contain" | "fill";
};

const DEFAULT_MENU_WIDTH = 640;
const DEFAULT_PDP_WIDTH = 1080;
const DEFAULT_QUALITY = 80;

function appendQuery(url: string, params: Record<string, string | number | undefined>) {
  const u = new URL(url);
  for (const [k, v] of Object.entries(params)) {
    if (v === undefined) continue;
    u.searchParams.set(k, String(v));
  }
  return u.toString();
}

/** Transform Supabase public object URL to render/image endpoint. */
function supabaseRenderUrl(publicUrl: string, transform: StorefrontImageTransform): string | null {
  const marker = "/storage/v1/object/public/";
  const idx = publicUrl.indexOf(marker);
  if (idx < 0) return null;

  const base = publicUrl.slice(0, idx);
  const objectPath = publicUrl.slice(idx + marker.length);
  const renderBase = `${base}/storage/v1/render/image/public/${objectPath}`;

  return appendQuery(renderBase, {
    width: transform.width,
    height: transform.height,
    quality: transform.quality ?? DEFAULT_QUALITY,
    resize: transform.resize ?? "cover",
  });
}

export function storefrontProductImageUrl(
  url: string | null | undefined,
  transform?: StorefrontImageTransform,
): string | null {
  const raw = url?.trim();
  if (!raw) return null;
  if (raw.startsWith("data:")) return raw;

  const t = transform ?? { width: DEFAULT_MENU_WIDTH, quality: DEFAULT_QUALITY };
  const supa = supabaseRenderUrl(raw, t);
  if (supa) return supa;

  // Cloudinary fetch transform (optional host)
  if (raw.includes("res.cloudinary.com") && t.width) {
    return raw.replace("/upload/", `/upload/c_fill,w_${t.width},q_${t.quality ?? DEFAULT_QUALITY}/`);
  }

  return raw;
}

export function storefrontMenuImageUrl(url: string | null | undefined) {
  return storefrontProductImageUrl(url, { width: DEFAULT_MENU_WIDTH, quality: DEFAULT_QUALITY });
}

export function storefrontPdpImageUrl(url: string | null | undefined) {
  return storefrontProductImageUrl(url, { width: DEFAULT_PDP_WIDTH, quality: 85 });
}
