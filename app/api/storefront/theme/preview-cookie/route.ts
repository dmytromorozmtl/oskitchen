import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { z } from "zod";

import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { readStorefrontPreviewCookie } from "@/lib/storefront/preview-cookie-server";
import { enforceStorefrontRouteRateLimit } from "@/lib/storefront/storefront-rate-limit";
import { hasStorefrontPreviewAccess } from "@/lib/storefront/preview-token";

const PREVIEW_COOKIE = "kos_theme_preview";
const MAX_PREVIEW_COOKIE_BYTES = 3_500;
const bodySchema = z.object({
  storeSlug: z.string().trim().min(1).max(120),
  theme: z.record(z.string(), z.unknown()),
});

export async function POST(request: Request) {
  const rate = await enforceStorefrontRouteRateLimit(request, "preview-token");
  if (!rate.ok) {
    return NextResponse.json({ error: rate.message }, { status: 429 });
  }

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) return NextResponse.json({ error: "Invalid payload" }, { status: 400 });

  const storefront = await prisma.storefrontSettings.findUnique({
    where: { storeSlug: parsed.data.storeSlug },
    select: { userId: true },
  });
  if (!storefront) {
    return NextResponse.json({ error: "Storefront not found" }, { status: 404 });
  }

  const [user, previewToken] = await Promise.all([
    getSessionUser(),
    readStorefrontPreviewCookie(),
  ]);
  if (
    !hasStorefrontPreviewAccess({
      ownerUserId: storefront.userId,
      storeSlug: parsed.data.storeSlug,
      viewerUserId: user?.id ?? null,
      previewToken,
    })
  ) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const serializedTheme = JSON.stringify(parsed.data.theme);
  if (Buffer.byteLength(serializedTheme, "utf8") > MAX_PREVIEW_COOKIE_BYTES) {
    return NextResponse.json({ error: "Preview payload too large" }, { status: 400 });
  }

  const store = await cookies();
  store.set(PREVIEW_COOKIE, serializedTheme, {
    httpOnly: true,
    maxAge: 300,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
  return NextResponse.json({ ok: true });
}
