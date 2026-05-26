import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { selectThemeDraftForAudience } from "@/lib/storefront/theme-snapshot";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ storeSlug: string }> },
) {
  const { storeSlug } = await params;
  const sf = await prisma.storefrontSettings.findUnique({
    where: { storeSlug },
    select: {
      themeDraftJson: true,
      themePublishedJson: true,
      themePublishedAt: true,
      enabled: true,
      published: true,
    },
  });

  if (!sf?.enabled) {
    return new NextResponse("/* */", { headers: { "Content-Type": "text/css; charset=utf-8" } });
  }

  const draft = selectThemeDraftForAudience(sf, "public");
  const css = (draft.customCss ?? "").slice(0, 32_000);

  return new NextResponse(css || "/* */", {
    headers: {
      "Content-Type": "text/css; charset=utf-8",
      "Cache-Control": "public, max-age=60",
    },
  });
}
