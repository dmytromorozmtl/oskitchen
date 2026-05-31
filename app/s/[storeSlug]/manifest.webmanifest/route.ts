import { NextResponse } from "next/server";

import { BRAND_ACCENT } from "@/lib/constants";
import { getStorefrontForPublicFromRequest } from "@/lib/storefront/public-access";

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ storeSlug: string }> },
) {
  const { storeSlug } = await ctx.params;
  const sf = await getStorefrontForPublicFromRequest(storeSlug, null);
  if (!sf) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const name = sf.publicName?.trim() || storeSlug;
  const manifest = {
    name,
    short_name: name.slice(0, 12),
    description: `Order from ${name} — powered by OS Kitchen`,
    start_url: `/s/${storeSlug}`,
    scope: `/s/${storeSlug}`,
    display: "standalone",
    background_color: "#FFFFFF",
    theme_color: sf.brandColor ?? BRAND_ACCENT,
    icons: [
      {
        src: sf.logoUrl?.trim() || "/favicon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
    ],
  };

  return NextResponse.json(manifest, {
    headers: {
      "Content-Type": "application/manifest+json",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
