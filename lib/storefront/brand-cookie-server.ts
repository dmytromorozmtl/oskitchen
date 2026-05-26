import { cookies, headers } from "next/headers";

import {
  isValidBrandId,
  KOS_BRAND_ID_HEADER,
  KOS_BRAND_SLUG_HEADER,
  STOREFRONT_BRAND_COOKIE,
  STOREFRONT_BRAND_SLUG_COOKIE,
} from "@/lib/storefront/brand-cookie";

export type StorefrontBrandContext = {
  brandId: string;
  brandSlug: string | null;
};

/** Read brand from middleware header (preferred) or cookie — avoids extra DB on every RSC pass. */
export async function readStorefrontBrandContext(): Promise<StorefrontBrandContext | null> {
  const headerList = await headers();
  const fromHeader = headerList.get(KOS_BRAND_ID_HEADER)?.trim();
  if (isValidBrandId(fromHeader)) {
    return {
      brandId: fromHeader,
      brandSlug: headerList.get(KOS_BRAND_SLUG_HEADER)?.trim().toLowerCase() ?? null,
    };
  }

  const jar = await cookies();
  const fromCookie = jar.get(STOREFRONT_BRAND_COOKIE)?.value?.trim();
  if (!isValidBrandId(fromCookie)) return null;

  return {
    brandId: fromCookie,
    brandSlug: jar.get(STOREFRONT_BRAND_SLUG_COOKIE)?.value?.trim().toLowerCase() ?? null,
  };
}
