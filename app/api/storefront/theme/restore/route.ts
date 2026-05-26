import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { z } from "zod";

import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { restoreStorefrontThemeVersion } from "@/services/storefront/storefront-theme-version-service";

const bodySchema = z.object({
  storefrontId: z.string().uuid(),
  versionId: z.string().uuid(),
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

  const res = await restoreStorefrontThemeVersion({
    storefrontId: parsed.data.storefrontId,
    versionId: parsed.data.versionId,
    userId: user.id,
  });

  if (!res.ok) return NextResponse.json({ error: res.error }, { status: 400 });

  const sf = await prisma.storefrontSettings.findFirst({
    where: { id: parsed.data.storefrontId, userId: user.id },
    select: { storeSlug: true },
  });
  if (sf) {
    revalidatePath("/dashboard/storefront/theme");
    revalidatePath(`/s/${sf.storeSlug}`);
  }

  return NextResponse.json({ ok: true, theme: res.theme });
}
