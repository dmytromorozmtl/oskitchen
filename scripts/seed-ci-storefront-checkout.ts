/**
 * Idempotent CI/staging seed for storefront pay-later checkout E2E.
 *
 * Creates slug `hello` (override via CI_STOREFRONT_SLUG) with one published menu product.
 *
 * Usage:
 *   DATABASE_URL=... npx tsx scripts/seed-ci-storefront-checkout.ts
 */
import { PrismaClient } from "@prisma/client";

const SLUG = process.env.CI_STOREFRONT_SLUG?.trim() || "hello";
const OWNER_ID = "ci000000-0000-4000-8000-000000000001";

const prisma = new PrismaClient();

async function main() {
  const menuStart = new Date();
  menuStart.setDate(menuStart.getDate() - 7);
  const menuEnd = new Date();
  menuEnd.setDate(menuEnd.getDate() + 60);
  const preorderDeadline = new Date();
  preorderDeadline.setDate(preorderDeadline.getDate() + 30);
  const preparedDate = new Date();
  preparedDate.setHours(0, 0, 0, 0);

  await prisma.userProfile.upsert({
    where: { id: OWNER_ID },
    create: {
      id: OWNER_ID,
      email: "ci-storefront@example.com",
      fullName: "CI Storefront Owner",
      role: "OWNER",
    },
    update: {
      email: "ci-storefront@example.com",
      fullName: "CI Storefront Owner",
      role: "OWNER",
    },
  });

  let workspace = await prisma.workspace.findFirst({
    where: { ownerUserId: OWNER_ID },
    select: { id: true },
  });
  if (!workspace) {
    workspace = await prisma.workspace.create({
      data: {
        ownerUserId: OWNER_ID,
        name: "CI Storefront Workspace",
      },
      select: { id: true },
    });
  } else {
    await prisma.workspace.update({
      where: { id: workspace.id },
      data: { name: "CI Storefront Workspace" },
    });
  }

  await prisma.kitchenSettings.upsert({
    where: { userId: OWNER_ID },
    create: {
      userId: OWNER_ID,
      workspaceId: workspace.id,
      businessName: "CI Kitchen",
      notifyOrderConfirmation: false,
    },
    update: {
      workspaceId: workspace.id,
      businessName: "CI Kitchen",
      notifyOrderConfirmation: false,
    },
  });

  let menu = await prisma.menu.findFirst({
    where: { userId: OWNER_ID, workspaceId: workspace.id, active: true },
    orderBy: { createdAt: "desc" },
    select: { id: true },
  });

  if (!menu) {
    menu = await prisma.menu.create({
      data: {
        userId: OWNER_ID,
        workspaceId: workspace.id,
        title: "CI Storefront Menu",
        startDate: menuStart,
        endDate: menuEnd,
        preorderDeadline,
        active: true,
        published: true,
        catalogOnly: false,
      },
      select: { id: true },
    });
  } else {
    await prisma.menu.update({
      where: { id: menu.id },
      data: {
        startDate: menuStart,
        endDate: menuEnd,
        preorderDeadline,
        active: true,
        published: true,
      },
    });
  }

  let product = await prisma.product.findFirst({
    where: { menuId: menu.id, workspaceId: workspace.id, active: true, storefrontVisible: true },
    orderBy: { createdAt: "asc" },
    select: { id: true },
  });

  if (!product) {
    product = await prisma.product.create({
      data: {
        menuId: menu.id,
        workspaceId: workspace.id,
        title: "CI Checkout Meal",
        preparedDate,
        price: 18.5,
        active: true,
        storefrontVisible: true,
      },
      select: { id: true },
    });
  }

  await prisma.storefrontSettings.upsert({
    where: { storeSlug: SLUG },
    create: {
      userId: OWNER_ID,
      workspaceId: workspace.id,
      storeSlug: SLUG,
      publicName: "CI Storefront",
      enabled: true,
      published: true,
      preorderEnabled: true,
      pickupEnabled: true,
      deliveryEnabled: false,
      payLaterOnly: true,
      onlinePaymentEnabled: false,
      currency: "USD",
      timezone: "UTC",
      activeMenuId: menu.id,
    },
    update: {
      userId: OWNER_ID,
      workspaceId: workspace.id,
      publicName: "CI Storefront",
      enabled: true,
      published: true,
      preorderEnabled: true,
      pickupEnabled: true,
      deliveryEnabled: false,
      payLaterOnly: true,
      onlinePaymentEnabled: false,
      activeMenuId: menu.id,
    },
  });

  console.log(`✓ CI storefront checkout seed ready · slug=${SLUG} · product=${product.id}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
