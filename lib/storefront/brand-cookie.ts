/** Active brand context on public storefront (set by middleware on brand vanity hosts). */

export const STOREFRONT_BRAND_COOKIE = "kos_brand";
export const STOREFRONT_BRAND_SLUG_COOKIE = "kos_brand_slug";
export const KOS_BRAND_ID_HEADER = "x-kos-brand-id";
export const KOS_BRAND_SLUG_HEADER = "x-kos-brand-slug";

const MAX_AGE_SEC = 60 * 60 * 24 * 30;

export function isValidBrandId(value: string | null | undefined): value is string {
  return Boolean(value && /^[0-9a-f-]{36}$/i.test(value.trim()));
}

export function brandCookieOptions(brandId: string, brandSlug?: string | null) {
  const cookies: {
    name: string;
    value: string;
    httpOnly: boolean;
    sameSite: "lax";
    secure: boolean;
    path: string;
    maxAge: number;
  }[] = [
    {
      name: STOREFRONT_BRAND_COOKIE,
      value: brandId,
      httpOnly: false,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: MAX_AGE_SEC,
    },
  ];
  if (brandSlug?.trim()) {
    cookies.push({
      name: STOREFRONT_BRAND_SLUG_COOKIE,
      value: brandSlug.trim().toLowerCase(),
      httpOnly: false,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: MAX_AGE_SEC,
    });
  }
  return cookies;
}

export function clearBrandCookiesOnResponse(): { name: string; value: string; maxAge: number; path: string }[] {
  return [
    { name: STOREFRONT_BRAND_COOKIE, value: "", maxAge: 0, path: "/" },
    { name: STOREFRONT_BRAND_SLUG_COOKIE, value: "", maxAge: 0, path: "/" },
  ];
}
