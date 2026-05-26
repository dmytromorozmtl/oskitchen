/**
 * Local Phase 9 seed: workspace brand + optional second storefront for multi-store E2E.
 *
 *   npm run storefront:seed-phase9-local
 */
import { config } from "dotenv";
import { resolve } from "path";

config({ path: resolve(process.cwd(), ".env.local") });
config({ path: resolve(process.cwd(), ".env") });

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const PRIMARY_SLUG = process.env.STOREFRONT_PILOT_SLUG?.trim() || "hello";
const SECOND_SLUG = process.env.STOREFRONT_PHASE9_SECOND_SLUG?.trim() || "hello-bistro";
const BRAND_SLUG = process.env.STOREFRONT_PHASE9_BRAND_SLUG?.trim() || "weekend";

async function main() {
  const primary = await prisma.storefrontSettings.findFirst({
    where: { storeSlug: PRIMARY_SLUG },
    select: { id: true, userId: true, workspaceId: true, publicName: true },
  });
  if (!primary) {
    console.error(`Storefront "${PRIMARY_SLUG}" not found. Run: npm run storefront:seed-phase2-hello`);
    process.exit(1);
  }

  let workspaceId = primary.workspaceId;
  if (!workspaceId) {
    const ws = await prisma.workspace.create({
      data: {
        name: `${primary.publicName} workspace`,
        ownerUserId: primary.userId,
        members: {
          create: { userId: primary.userId, role: "OWNER" },
        },
      },
      select: { id: true },
    });
    workspaceId = ws.id;
    await prisma.storefrontSettings.update({
      where: { id: primary.id },
      data: { workspaceId, isPrimary: true },
    });
    console.log(`✓ Created workspace ${workspaceId}`);
  }

  let brand = await prisma.brand.findFirst({
    where: { workspaceId, slug: { equals: BRAND_SLUG, mode: "insensitive" } },
    select: { id: true, slug: true },
  });
  if (!brand) {
    brand = await prisma.brand.create({
      data: {
        workspaceId,
        slug: BRAND_SLUG,
        name: "Weekend brand (Phase 9)",
        brandColor: "#7c3aed",
        secondaryColor: "#a78bfa",
        seoTitle: "Weekend at Hello Kitchen",
        seoDescription: "Weekend pop-up menu — brand vanity pilot",
        lifecycleStatus: "ACTIVE",
        defaultStorefrontId: primary.id,
      },
      select: { id: true, slug: true },
    });
    console.log(`✓ Created brand "${brand.slug}" (${brand.id})`);
  } else {
    console.log(`✓ Brand "${brand.slug}" exists (${brand.id})`);
  }

  await prisma.storefrontSettings.update({
    where: { id: primary.id },
    data: { brandId: brand.id, workspaceId },
  });

  const second = await prisma.storefrontSettings.findFirst({
    where: { userId: primary.userId, storeSlug: SECOND_SLUG },
    select: { id: true },
  });
  if (!second) {
    const created = await prisma.storefrontSettings.create({
      data: {
        userId: primary.userId,
        workspaceId,
        storeSlug: SECOND_SLUG,
        publicName: "Hello Bistro (Phase 9)",
        enabled: true,
        published: true,
        isPrimary: false,
        locale: "en",
        currency: "USD",
      },
      select: { id: true },
    });
    console.log(`✓ Second storefront /s/${SECOND_SLUG} (${created.id})`);
  } else {
    console.log(`✓ Second storefront /s/${SECOND_SLUG} already exists`);
  }

  console.log("\n── Phase 9 local env hints ──");
  console.log(`E2E_STOREFRONT_BRAND_ID=${brand.id}`);
  console.log(`E2E_BRAND_VANITY_HOST=${BRAND_SLUG}.${PRIMARY_SLUG}.<NEXT_PUBLIC_STOREFRONT_ROOT_DOMAIN>`);
  console.log(`Composite host test: ${BRAND_SLUG}.${PRIMARY_SLUG}.your-root-domain.com`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
