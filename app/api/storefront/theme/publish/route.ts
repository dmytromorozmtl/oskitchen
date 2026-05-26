import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { z } from "zod";

import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { publishStorefrontThemeSnapshot } from "@/services/storefront/storefront-theme-publish-service";

const bodySchema = z.object({
  storefrontId: z.string().uuid(),
});

/**
 * Programmatic theme publish (dashboard also uses publishStorefrontThemeFormAction).
 * Requires authenticated owner; experiment gates apply when enabled.
 */
export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) return NextResponse.json({ error: "Invalid payload" }, { status: 400 });

  const owned = await prisma.storefrontSettings.findFirst({
    where: { id: parsed.data.storefrontId, userId: user.id },
    select: { id: true, storeSlug: true },
  });
  if (!owned) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const res = await publishStorefrontThemeSnapshot({
    userId: user.id,
    storefrontId: owned.id,
  });

  if (!res.ok) return NextResponse.json({ error: res.error }, { status: 400 });

  revalidatePath("/dashboard/storefront/theme");
  revalidatePath(`/s/${owned.storeSlug}`);

  return NextResponse.json({ ok: true, publishedAt: new Date().toISOString() });
}
