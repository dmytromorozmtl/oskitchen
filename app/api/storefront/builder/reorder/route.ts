import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { z } from "zod";

import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidateStorefrontDashboardAndPublic } from "@/lib/storefront/revalidate-storefront-dashboard";

const bodySchema = z.object({
  pageId: z.string().uuid(),
  order: z.array(z.string().uuid()),
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

  const page = await prisma.storefrontPage.findFirst({
    where: { id: parsed.data.pageId, userId: user.id },
    include: { storefront: { select: { storeSlug: true } } },
  });
  if (!page) return NextResponse.json({ error: "Page not found" }, { status: 404 });

  const sections = await prisma.storefrontSection.findMany({
    where: { pageId: page.id },
    select: { id: true },
  });
  const idSet = new Set(sections.map((s) => s.id));
  if (parsed.data.order.length !== sections.length || !parsed.data.order.every((id) => idSet.has(id))) {
    return NextResponse.json({ error: "Order mismatch" }, { status: 400 });
  }

  await prisma.$transaction(
    parsed.data.order.map((id, index) =>
      prisma.storefrontSection.update({
        where: { id },
        data: { sortOrder: index },
      }),
    ),
  );

  revalidateStorefrontDashboardAndPublic(page.storefront.storeSlug);
  revalidatePath(`/dashboard/storefront/pages/${page.id}`);
  revalidatePath("/dashboard/storefront/builder");
  return NextResponse.json({ ok: true });
}
