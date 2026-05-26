import {
  FulfillmentType,
  OrderStatus,
  ProductCategory,
  SubscriptionPlan,
  SubscriptionStatus,
  UserRole,
} from "@prisma/client";
import { randomUUID } from "crypto";

import { prisma } from "../lib/prisma";

function token12(): string {
  return randomUUID().replace(/-/g, "").slice(0, 12);
}

/**
 * Run after creating a Supabase user: set SEED_USER_ID to that user's UUID.
 * Example: SEED_USER_ID=... SEED_RESET=1 npm run db:seed
 */
async function main() {
  const userId = process.env.SEED_USER_ID;
  const email = process.env.SEED_USER_EMAIL ?? "demo@kitchenos.app";

  if (!userId) {
    console.warn(
      "Skip seed: set SEED_USER_ID to your Supabase auth user UUID and optionally SEED_USER_EMAIL.",
    );
    return;
  }

  if (process.env.SEED_RESET === "1") {
    await prisma.notificationLog.deleteMany({ where: { userId } });
    await prisma.order.deleteMany({ where: { userId } });
    await prisma.menu.deleteMany({ where: { userId } });
    console.log("SEED_RESET=1: cleared menus, orders, and notification logs.");
  }

  await prisma.userProfile.upsert({
    where: { id: userId },
    create: {
      id: userId,
      email,
      fullName: "Demo Chef",
      companyName: "FreshPrep Collective",
      role: UserRole.OWNER,
      onboardingCompleted: true,
      onboardingStep: 6,
    },
    update: {
      email,
      fullName: "Demo Chef",
      companyName: "FreshPrep Collective",
      onboardingCompleted: true,
      onboardingStep: 6,
    },
  });

  await prisma.kitchenSettings.upsert({
    where: { userId },
    create: {
      userId,
      businessName: "FreshPrep Collective",
      pickupAddress: "214 River Rd, Austin, TX 78704",
      deliveryEnabled: true,
      deliveryNotes: "Within 12km · text on arrival",
      deliveryRadiusKm: 12,
      deliveryFee: 6.5,
      orderCutoffTime: "18:00",
      timezone: "America/Chicago",
      locale: "en",
      notifyOrderConfirmation: true,
      notifyPreorderReminder: true,
      notifyPickupReminder: true,
      notifyDeliveryReminder: true,
    },
    update: {
      businessName: "FreshPrep Collective",
      pickupAddress: "214 River Rd, Austin, TX 78704",
      deliveryEnabled: true,
    },
  });

  await prisma.subscription.upsert({
    where: { userId },
    create: {
      userId,
      plan: SubscriptionPlan.PRO,
      status: SubscriptionStatus.TRIALING,
    },
    update: {
      plan: SubscriptionPlan.PRO,
      status: SubscriptionStatus.TRIALING,
    },
  });

  const existingMenus = await prisma.menu.count({ where: { userId } });
  if (existingMenus > 0 && process.env.SEED_RESET !== "1") {
    console.log("Menus already exist; skipping demo data. Use SEED_RESET=1 to replace.");
    return;
  }

  const now = new Date();
  const weekdayOffset = (now.getDay() + 6) % 7;
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - weekdayOffset);
  weekStart.setHours(0, 0, 0, 0);

  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);

  const nextWeekStart = new Date(weekStart);
  nextWeekStart.setDate(weekStart.getDate() + 7);
  const nextWeekEnd = new Date(nextWeekStart);
  nextWeekEnd.setDate(nextWeekStart.getDate() + 6);

  const menuActive = await prisma.menu.create({
    data: {
      userId,
      title: `Week of ${weekStart.toISOString().slice(0, 10)}`,
      startDate: weekStart,
      endDate: weekEnd,
      preorderDeadline: new Date(weekStart.getTime() - 2 * 86400000),
      active: true,
      sortOrder: 0,
    },
  });

  const menuDraft = await prisma.menu.create({
    data: {
      userId,
      title: `Week of ${nextWeekStart.toISOString().slice(0, 10)} (planned)`,
      startDate: nextWeekStart,
      endDate: nextWeekEnd,
      preorderDeadline: new Date(nextWeekStart.getTime() - 3 * 86400000),
      active: false,
      sortOrder: 1,
    },
  });

  const img =
    "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&q=80";

  const activeProductsSpec: {
    title: string;
    description: string;
    category: ProductCategory;
    price: number;
    deliveryAvailable: boolean;
    dayOffset: number;
    allergens?: string;
    portionSize?: string;
  }[] = [
    {
      title: "Harissa lamb & couscous",
      description: "Slow-braised shoulder, preserved lemon, herbs.",
      category: ProductCategory.MAINS,
      price: 19.5,
      deliveryAvailable: true,
      dayOffset: 0,
      allergens: "Gluten",
      portionSize: "480g",
    },
    {
      title: "Miso maple salmon",
      description: "Atlantic salmon, baby bok choy, sesame rice.",
      category: ProductCategory.MAINS,
      price: 21,
      deliveryAvailable: true,
      dayOffset: 1,
      portionSize: "420g",
    },
    {
      title: "Smoky tofu grain bowl",
      description: "Farro, roasted squash, kale, tahini drizzle.",
      category: ProductCategory.MAINS,
      price: 15.5,
      deliveryAvailable: true,
      dayOffset: 2,
      allergens: "Sesame",
    },
    {
      title: "Chicken cacciatore",
      description: "San Marzano sauce, olives, polenta.",
      category: ProductCategory.MAINS,
      price: 17.25,
      deliveryAvailable: false,
      dayOffset: 3,
    },
    {
      title: "Roasted roots & feta",
      description: "Beets, carrots, honey vinegar, mint.",
      category: ProductCategory.SIDES,
      price: 9,
      deliveryAvailable: true,
      dayOffset: 1,
    },
    {
      title: "Broccoli & cheddar gratin",
      description: "Brown butter crumb, smaller portion.",
      category: ProductCategory.SIDES,
      price: 8.5,
      deliveryAvailable: false,
      dayOffset: 4,
      allergens: "Dairy",
    },
    {
      title: "Seeded sourdough loaf",
      description: "Half loaf, excellent for toast.",
      category: ProductCategory.BAKERY,
      price: 6,
      deliveryAvailable: true,
      dayOffset: 0,
      allergens: "Gluten",
    },
    {
      title: "Brown butter blondie",
      description: "Toasted pecan, flaky salt.",
      category: ProductCategory.BAKERY,
      price: 5.5,
      deliveryAvailable: true,
      dayOffset: 5,
    },
    {
      title: "Cold brew concentrate",
      description: "32oz bottle — mix 1:1 with water or milk.",
      category: ProductCategory.BEVERAGES,
      price: 12,
      deliveryAvailable: true,
      dayOffset: 0,
    },
    {
      title: "Spinach & feta egg bites",
      description: "Breakfast pack of 4, reheat 90s.",
      category: ProductCategory.BREAKFAST,
      price: 11,
      deliveryAvailable: true,
      dayOffset: 6,
      allergens: "Eggs, dairy",
    },
  ];

  const activeProductIds: string[] = [];

  for (let i = 0; i < activeProductsSpec.length; i++) {
    const p = activeProductsSpec[i];
    const preparedDate = new Date(weekStart);
    preparedDate.setDate(weekStart.getDate() + p.dayOffset);
    const pickupDate = new Date(preparedDate);

    const product = await prisma.product.create({
      data: {
        menuId: menuActive.id,
        title: p.title,
        description: p.description,
        category: p.category,
        allergens: p.allergens ?? null,
        portionSize: p.portionSize ?? null,
        ingredients: "See allergen card in bag.",
        reheatingInstructions: "Microwave 2–3 min or oven 350°F until 165°F internal.",
        kitchenNotes: "Batch A · label with menu sticker.",
        preparedDate,
        pickupDate,
        deliveryAvailable: p.deliveryAvailable,
        active: true,
        price: p.price,
        image: img,
        sortOrder: i,
      },
    });
    activeProductIds.push(product.id);

    await prisma.productionTask.create({
      data: { productId: product.id, cooked: i % 3 === 0, packed: i % 4 === 0 },
    });
  }

  const priceMap = new Map(
    (
      await prisma.product.findMany({
        where: { menuId: menuActive.id },
        select: { id: true, price: true, pickupDate: true },
      })
    ).map((p) => [p.id, { price: Number(p.price), pickup: p.pickupDate }] as const),
  );

  const draftProducts = [
    {
      title: "Spring asparagus risotto",
      category: ProductCategory.MAINS,
      price: 16,
      dayOffset: 2,
    },
    {
      title: "Strawberry olive oil cake",
      category: ProductCategory.BAKERY,
      price: 7,
      dayOffset: 4,
    },
  ];

  for (let i = 0; i < draftProducts.length; i++) {
    const p = draftProducts[i];
    const preparedDate = new Date(nextWeekStart);
    preparedDate.setDate(nextWeekStart.getDate() + p.dayOffset);
    const product = await prisma.product.create({
      data: {
        menuId: menuDraft.id,
        title: p.title,
        description: "Coming soon on next menu.",
        category: p.category,
        preparedDate,
        pickupDate: new Date(preparedDate),
        deliveryAvailable: true,
        active: true,
        price: p.price,
        image: img,
        sortOrder: i,
      },
    });
    await prisma.productionTask.create({ data: { productId: product.id } });
  }

  const customers = [
    { name: "Jordan Lee", email: "jordan@example.com", phone: "+1 512-555-0101" },
    { name: "Sam Rivera", email: "sam@example.com", phone: "+1 512-555-0102" },
    { name: "Alex Morgan", email: "alex@example.com", phone: "+1 512-555-0103" },
    { name: "Priya Shah", email: "priya@example.com", phone: "+1 512-555-0104" },
    { name: "Chris Bell", email: "chris@example.com", phone: "+1 512-555-0105" },
    { name: "Taylor Nguyen", email: "taylor@example.com", phone: "+1 512-555-0106" },
    { name: "Riley Chen", email: "riley@example.com", phone: "+1 512-555-0107" },
    { name: "Morgan Diaz", email: "morgan@example.com", phone: "+1 512-555-0108" },
  ];

  const statuses: OrderStatus[] = [
    OrderStatus.PENDING,
    OrderStatus.CONFIRMED,
    OrderStatus.PREPARING,
    OrderStatus.READY,
    OrderStatus.COMPLETED,
    OrderStatus.CONFIRMED,
    OrderStatus.PREPARING,
    OrderStatus.PENDING,
    OrderStatus.CANCELLED,
    OrderStatus.CONFIRMED,
    OrderStatus.READY,
    OrderStatus.COMPLETED,
  ];

  const fulfillment: FulfillmentType[] = [
    FulfillmentType.PICKUP,
    FulfillmentType.DELIVERY,
    FulfillmentType.PICKUP,
    FulfillmentType.DELIVERY,
    FulfillmentType.PICKUP,
    FulfillmentType.PICKUP,
    FulfillmentType.DELIVERY,
    FulfillmentType.PICKUP,
    FulfillmentType.PICKUP,
    FulfillmentType.DELIVERY,
    FulfillmentType.PICKUP,
    FulfillmentType.DELIVERY,
  ];

  for (let o = 0; o < 12; o++) {
    const c = customers[o % customers.length];
    const nLines = 1 + (o % 3);
    const startIdx = o % activeProductIds.length;
    const chosen: string[] = [];
    for (let j = 0; j < nLines; j++) {
      chosen.push(activeProductIds[(startIdx + j) % activeProductIds.length]!);
    }

    let total = 0;
    const lines = chosen.map((productId, idx) => {
      const qty = 1 + (idx % 2);
      const row = priceMap.get(productId);
      total += (row?.price ?? 0) * qty;
      return { productId, quantity: qty };
    });

    const first = priceMap.get(lines[0]!.productId);
    const pickupDate = first?.pickup ?? weekStart;

    await prisma.order.create({
      data: {
        id: randomUUID(),
        userId,
        customerName: c.name,
        customerEmail: c.email,
        customerPhone: c.phone,
        total,
        status: statuses[o] ?? OrderStatus.CONFIRMED,
        fulfillmentType: fulfillment[o] ?? FulfillmentType.PICKUP,
        pickupDate,
        notes: o === 3 ? "Leave at concierge" : null,
        publicLookupToken: token12(),
        orderItems: {
          create: lines.map((line) => ({
            productId: line.productId,
            quantity: line.quantity,
          })),
        },
      },
    });
  }

  console.log("Seed complete for user", userId);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
