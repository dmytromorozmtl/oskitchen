import { Prisma, StorefrontPageType, StorefrontSectionType } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { defaultSectionContent } from "@/lib/storefront/sections";

/** Ensures a single HOME builder page exists (sections power `/s/[slug]` when published). */
export async function ensureDefaultHomeStorefrontPage(storefrontId: string, userId: string): Promise<void> {
  const existing = await prisma.storefrontPage.findFirst({
    where: { storefrontId, pageType: StorefrontPageType.HOME },
  });
  if (existing) return;

  await prisma.storefrontPage.create({
    data: {
      userId,
      storefrontId,
      slug: "home",
      title: "Home",
      pageType: StorefrontPageType.HOME,
      contentJson: { body: "" },
      published: true,
      sortOrder: -100,
      sections: {
        create: [
          {
            type: StorefrontSectionType.HERO,
            sortOrder: 0,
            contentJson: defaultSectionContent(StorefrontSectionType.HERO) as Prisma.InputJsonValue,
          },
          {
            type: StorefrontSectionType.FEATURED_MENU,
            sortOrder: 10,
            contentJson: defaultSectionContent(StorefrontSectionType.FEATURED_MENU) as Prisma.InputJsonValue,
          },
          {
            type: StorefrontSectionType.TEXT_BLOCK,
            sortOrder: 20,
            contentJson: {
              heading: "How it works",
              body: "Browse the menu, build your cart, and submit a preorder request.",
              bodyFormat: "plain",
            } as Prisma.InputJsonValue,
          },
          {
            type: StorefrontSectionType.FAQ,
            sortOrder: 30,
            contentJson: defaultSectionContent(StorefrontSectionType.FAQ) as Prisma.InputJsonValue,
          },
          {
            type: StorefrontSectionType.CONTACT_FORM,
            sortOrder: 40,
            contentJson: defaultSectionContent(StorefrontSectionType.CONTACT_FORM) as Prisma.InputJsonValue,
          },
        ],
      },
    },
  });
}
