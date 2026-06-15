import { cookies } from "next/headers";

import type { StorefrontLocaleCode } from "@/lib/storefront/regional";
import { STOREFRONT_SUPPORTED_LOCALES } from "@/lib/storefront/regional";

export function resolveStorefrontLocale(settingsLocale: string, langParam?: string | null): string {
  const fromQuery = langParam?.trim().toLowerCase().split("-")[0];
  if (fromQuery && STOREFRONT_SUPPORTED_LOCALES.some((l) => l.code === fromQuery)) {
    return fromQuery;
  }
  return (settingsLocale ?? "en").split("-")[0] ?? "en";
}

export async function resolveStorefrontLocaleFromRequest(
  settingsLocale: string,
  langParam?: string | null,
): Promise<string> {
  const cookieStore = await cookies();
  const fromCookie = cookieStore.get("kos-sf-lang")?.value?.trim().toLowerCase().split("-")[0];
  if (fromCookie && STOREFRONT_SUPPORTED_LOCALES.some((l) => l.code === fromCookie)) {
    return fromCookie;
  }
  return resolveStorefrontLocale(settingsLocale, langParam);
}

export function enabledLocaleCodes(primary: string): StorefrontLocaleCode[] {
  return STOREFRONT_SUPPORTED_LOCALES.map((l) => l.code);
}
