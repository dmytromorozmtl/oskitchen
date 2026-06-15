import { notFound, redirect } from "next/navigation";

import { resolveBrandPathSlug } from "@/lib/storefront/brand-host-resolve";

/** Enterprise brand entry: /b/{brandSlug} → default published storefront. */
export default async function BrandStorefrontEntryPage({
  params,
}: {
  params: Promise<{ brandSlug: string }>;
}) {
  const { brandSlug } = await params;
  const resolved = await resolveBrandPathSlug(brandSlug);
  if (!resolved) notFound();
  redirect(`/s/${resolved.storeSlug}`);
}
