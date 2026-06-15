import { NextResponse } from "next/server";

import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createStorefrontPreviewToken, storefrontPreviewCookie } from "@/lib/storefront/preview-token";
import { enforceStorefrontRouteRateLimit } from "@/lib/storefront/storefront-rate-limit";

export async function POST(request: Request) {
  const rate = await enforceStorefrontRouteRateLimit(request, "preview-token");
  if (!rate.ok) {
    return NextResponse.json({ error: rate.message }, { status: 429 });
  }

  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  let body: { storeSlug?: string };
  try {
    body = (await request.json()) as { storeSlug?: string };
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const slug = body.storeSlug?.trim();
  if (!slug) {
    return NextResponse.json({ error: "storeSlug required" }, { status: 400 });
  }
  const sf = await prisma.storefrontSettings.findUnique({
    where: { storeSlug: slug },
    select: { userId: true, storeSlug: true },
  });
  if (!sf || sf.userId !== user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  const token = createStorefrontPreviewToken(user.id, sf.storeSlug);
  if (!token) {
    return NextResponse.json(
      { error: "Preview tokens are not configured (set STOREFRONT_PREVIEW_SECRET or AUTH_SECRET)." },
      { status: 503 },
    );
  }
  const res = NextResponse.json({ ok: true as const, token });
  res.cookies.set(storefrontPreviewCookie.name, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 900,
    path: "/",
  });
  return res;
}
