import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { z } from "zod";

import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidateStorefrontDashboardAndPublic } from "@/lib/storefront/revalidate-storefront-dashboard";

const bodySchema = z.object({
  sectionId: z.string().uuid(),
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

  const section = await prisma.storefrontSection.findFirst({
    where: { id: parsed.data.sectionId, page: { userId: user.id } },
    include: { page: { include: { storefront: { select: { storeSlug: true } } } } },
  });
  if (!section) return NextResponse.json({ error: "Section not found" }, { status: 404 });

  await prisma.storefrontSection.delete({ where: { id: section.id } });

  revalidateStorefrontDashboardAndPublic(section.page.storefront.storeSlug);
  revalidatePath("/dashboard/storefront/builder");
  revalidatePath(`/dashboard/storefront/pages/${section.pageId}`);

  return NextResponse.json({ ok: true });
}
