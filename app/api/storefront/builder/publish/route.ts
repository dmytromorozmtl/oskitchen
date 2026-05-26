import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { z } from "zod";

import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { publishStorefrontHomeLayout } from "@/services/storefront/storefront-page-builder-publish-service";

const bodySchema = z.object({
  storefrontId: z.string().uuid(),
});

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
    select: { id: true },
  });
  if (!owned) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const res = await publishStorefrontHomeLayout({
    storefrontId: parsed.data.storefrontId,
    userId: user.id,
  });

  if (!res.ok) return NextResponse.json({ error: res.error }, { status: 400 });

  const sf = await prisma.storefrontSettings.findFirst({
    where: { id: parsed.data.storefrontId, userId: user.id },
    select: { storeSlug: true },
  });

  revalidatePath("/dashboard/storefront/builder");
  if (sf) revalidatePath(`/s/${sf.storeSlug}`);

  return NextResponse.json({ ok: true, publishedAt: res.publishedAt });
}
