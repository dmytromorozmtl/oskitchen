import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { z } from "zod";

import { getSessionUser } from "@/lib/auth";
import { mapBuilderSectionType } from "@/lib/storefront/builder-section-type-map";
import { defaultSectionContent } from "@/lib/storefront/sections";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { revalidateStorefrontDashboardAndPublic } from "@/lib/storefront/revalidate-storefront-dashboard";

const bodySchema = z.object({
  pageId: z.string().uuid(),
  type: z.string().min(1).max(64),
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

  const sectionType = mapBuilderSectionType(parsed.data.type);
  let content = defaultSectionContent(sectionType);
  if (parsed.data.type.toUpperCase() === "HOW_IT_WORKS") {
    content = {
      heading: "How it works",
      body: "Browse the menu, build your cart, and submit your order.",
      bodyFormat: "plain",
    };
  }

  const maxSort = await prisma.storefrontSection.aggregate({
    where: { pageId: page.id },
    _max: { sortOrder: true },
  });
  const sortOrder = (maxSort._max.sortOrder ?? -1) + 1;

  const section = await prisma.storefrontSection.create({
    data: {
      pageId: page.id,
      type: sectionType,
      sortOrder,
      contentJson: content as Prisma.InputJsonValue,
    },
    select: { id: true, type: true, sortOrder: true, visible: true },
  });

  revalidateStorefrontDashboardAndPublic(page.storefront.storeSlug);
  revalidatePath("/dashboard/storefront/builder");
  revalidatePath(`/dashboard/storefront/pages/${page.id}`);

  return NextResponse.json({
    id: section.id,
    type: section.type,
    sortOrder: section.sortOrder,
    visible: section.visible,
  });
}
