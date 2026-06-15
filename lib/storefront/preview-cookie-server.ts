import { cookies } from "next/headers";

import { storefrontPreviewCookie } from "@/lib/storefront/preview-token";

export async function readStorefrontPreviewCookie(): Promise<string | null> {
  const jar = await cookies();
  return jar.get(storefrontPreviewCookie.name)?.value ?? null;
}
