/**
 * Seed pilot storefront (slug hello) with Phase 2 demo data:
 * - 2 variants on first active-menu product
 * - 1 modifier group with option
 * - sold-out on second product (ProductAvailability)
 *
 * Usage: npm run storefront:seed-phase2-hello
 */
import { config } from "dotenv";
import { resolve } from "path";

config({ path: resolve(process.cwd(), ".env.local") });
config({ path: resolve(process.cwd(), ".env") });

import { PrismaClient } from "@prisma/client";

const SLUG = process.env.STOREFRONT_PILOT_SLUG?.trim() || "hello";
const prisma = new PrismaClient();

async function main() {
  const sf = await prisma.storefrontSettings.findFirst({
    where: { storeSlug: SLUG, published: true },
    include: {
      activeMenu: {
        include: {
          products: { where: { active: true }, orderBy: { title: "asc" }, take: 3 },
        },
      },
    },
  });

  if (!sf) {
    console.error(`No published storefront with slug "${SLUG}".`);
    process.exit(1);
  }
  if (!sf.activeMenuId || !sf.activeMenu?.products.length) {
    console.error(`Storefront "${SLUG}" has no active menu products.`);
    process.exit(1);
  }

  const [p1, p2] = sf.activeMenu.products;
  console.log(`Pilot: ${SLUG} · products: ${sf.activeMenu.products.map((p) => p.title).join(", ")}`);

  await prisma.storefrontProductVariant.deleteMany({
    where: { storefrontId: sf.id, productId: p1.id },
  });

  await prisma.storefrontProductVariant.createMany({
    data: [
      {
        storefrontId: sf.id,
        productId: p1.id,
        title: "Regular",
        priceAdjustment: 0,
        sortOrder: 0,
        active: true,
        soldOut: false,
      },
      {
        storefrontId: sf.id,
        productId: p1.id,
        title: "Large",
        priceAdjustment: 3.5,
        sortOrder: 1,
        active: true,
        soldOut: false,
      },
    ],
  });
  console.log(`✓ Variants on "${p1.title}"`);

  const existingGroup = await prisma.storefrontModifierGroup.findFirst({
    where: { storefrontId: sf.id, name: "Add-ons (demo)" },
  });
  if (!existingGroup) {
    const g = await prisma.storefrontModifierGroup.create({
      data: {
        storefrontId: sf.id,
        productId: null,
        name: "Add-ons (demo)",
        required: false,
        minSelections: 0,
        maxSelections: 3,
        sortOrder: 0,
        options: {
          create: [{ name: "Extra sauce", priceAdjustment: 1.5, sortOrder: 0, active: true }],
        },
      },
    });
    console.log(`✓ Modifier group "${g.name}"`);
  } else {
    console.log(`· Modifier group already exists`);
  }

  if (p2) {
    const now = new Date();
    const until = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);
    const existing = await prisma.productAvailability.findFirst({
      where: { menuId: sf.activeMenuId, productId: p2.id },
    });
    if (existing) {
      await prisma.productAvailability.update({
        where: { id: existing.id },
        data: { soldOut: true, availableUntil: until },
      });
    } else {
      await prisma.productAvailability.create({
        data: {
          productId: p2.id,
          menuId: sf.activeMenuId,
          availableFrom: now,
          availableUntil: until,
          soldOut: true,
          soldQuantity: 0,
        },
      });
    }
    console.log(`✓ Sold out: "${p2.title}"`);
  }

  const kitchen = await prisma.kitchenSettings.findUnique({ where: { userId: sf.userId } });
  const center =
    kitchen?.settingsCenterJson && typeof kitchen.settingsCenterJson === "object"
      ? { ...(kitchen.settingsCenterJson as Record<string, unknown>) }
      : {};
  const sfBlock =
    center.storefront && typeof center.storefront === "object"
      ? { ...(center.storefront as Record<string, unknown>) }
      : {};
  let weekdayMenuId: string | undefined;
  const activeMenuRow = sf.activeMenuId
    ? await prisma.menu.findUnique({
        where: { id: sf.activeMenuId },
        select: { startDate: true, endDate: true, preorderDeadline: true },
      })
    : null;
  const weekdayMenu = await prisma.menu.findFirst({
    where: { userId: sf.userId, title: "Weekday (pilot)" },
    select: { id: true },
  });
  if (weekdayMenu) {
    weekdayMenuId = weekdayMenu.id;
  } else if (activeMenuRow) {
    const now = new Date();
    const created = await prisma.menu.create({
      data: {
        userId: sf.userId,
        title: "Weekday (pilot)",
        catalogOnly: false,
        startDate: activeMenuRow.startDate,
        endDate: activeMenuRow.endDate,
        preorderDeadline: activeMenuRow.preorderDeadline,
        products: { connect: [{ id: p1.id }] },
      },
      select: { id: true },
    });
    weekdayMenuId = created.id;
    console.log("✓ Created weekday menu with first product only");
  }

  sfBlock.markets = [
    { id: "default", name: "Full menu", enabled: true, currency: sf.currency },
    {
      id: "weekday",
      name: "Weekday picks",
      enabled: true,
      hostSubdomain: `${SLUG}-weekday`,
      ...(weekdayMenuId ? { activeMenuId: weekdayMenuId } : {}),
      productIds: [p1.id],
      bannerText: "Weekday market — limited menu (QA demo)",
    },
  ];
  center.storefront = sfBlock;
  await prisma.kitchenSettings.upsert({
    where: { userId: sf.userId },
    create: { userId: sf.userId, settingsCenterJson: center },
    update: { settingsCenterJson: center },
  });
  console.log("✓ Markets: default + weekday (?market=weekday)");

  console.log("\nDone. QA path:");
  console.log(`  /s/${SLUG} — second product should show Sold out`);
  console.log(`  /s/${SLUG}?market=weekday — only "${p1.title}"`);
  console.log(`  /s/${SLUG}/products/<first-product> — variant picker`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
