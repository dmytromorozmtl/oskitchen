import { NextResponse } from "next/server";

import { getStorefrontForPublicFromRequest } from "@/lib/storefront/public-access";
import { prisma } from "@/lib/prisma";
import {
  buildBrandedManifest,
  normalizeThemeColor,
} from "@/services/branding/white-label-service";

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ storeSlug: string }> },
) {
  const { storeSlug } = await ctx.params;
  const sf = await getStorefrontForPublicFromRequest(storeSlug, null);
  if (!sf) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const kitchen = await prisma.kitchenSettings.findUnique({
    where: { userId: sf.userId },
    select: { hideKitchenOsBranding: true },
  });

  const name = sf.publicName?.trim() || storeSlug;
  const manifest = buildBrandedManifest({
    storeSlug,
    restaurantName: name,
    logoUrl: sf.logoUrl,
    themeColor: normalizeThemeColor(sf.brandColor ?? ""),
    hideKitchenOsBranding: kitchen?.hideKitchenOsBranding ?? false,
  });

  return NextResponse.json(manifest, {
    headers: {
      "Content-Type": "application/manifest+json",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
