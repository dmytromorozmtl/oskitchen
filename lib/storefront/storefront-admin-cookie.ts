import { cookies } from "next/headers";

/** Active storefront in dashboard admin (multi-store picker). */
export const KOS_ADMIN_STOREFRONT_COOKIE = "kos_admin_storefront_id";

const MAX_AGE_SEC = 60 * 60 * 24 * 365;

export async function readAdminStorefrontCookie(): Promise<string | null> {
  const jar = await cookies();
  const raw = jar.get(KOS_ADMIN_STOREFRONT_COOKIE)?.value?.trim();
  if (!raw || !/^[0-9a-f-]{36}$/i.test(raw)) return null;
  return raw;
}

export function adminStorefrontCookieOptions(storefrontId: string) {
  return {
    name: KOS_ADMIN_STOREFRONT_COOKIE,
    value: storefrontId,
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/dashboard/storefront",
    maxAge: MAX_AGE_SEC,
  };
}
