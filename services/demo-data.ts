/**
 * Demo workspace import + reset helpers.
 * `clearWorkspaceSampleData` requires demo mode — never call destructive clears for live workspaces.
 * CLI bulk seed remains `prisma/seed.ts` (see DEMO_BRANDS for fixture roadmap).
 */

import { randomUUID } from "crypto";

import {
  FulfillmentType,
  OrderStatus,
  ProductCategory,
  SubscriptionPlan,
  SubscriptionStatus,
} from "@prisma/client";

import type { DemoVerticalSlug } from "@/lib/demo-verticals";
import { getDemoWorkspacePreset } from "@/lib/demo-verticals";
import {
  externalOrderListWhereForOwner,
  externalProductListWhereForOwner,
} from "@/lib/scope/workspace-channel-scope";
import {
  deliveryRouteListWhereForOwner,
  menuChannelPublishListWhereForOwner,
  menuListWhereForOwner,
  notificationLogListWhereForOwner,
  orderListWhereForOwner,
  posTransactionListWhereForOwner,
  storefrontOrderListWhereForOwner,
  webhookEventListWhereForOwner,
} from "@/lib/scope/workspace-resource-scope";
import { menuCreateBaseForOwner } from "@/lib/products/menu-create-base";
import { prisma } from "@/lib/prisma";
import { ensureOwnerWorkspaceId } from "@/lib/scope/ensure-owner-workspace";

export const DEMO_BRANDS = [
  {
    slug: "fitfresh-meals",
    name: "FitFresh Meals",
    vertical: "meal_prep",
    accent: "High-protein weekly drops",
  },
  {
    slug: "officebite-catering",
    name: "OfficeBite Catering",
    vertical: "catering",
    accent: "Corporate lunch programs",
  },
  {
    slug: "cloudkitchen-express",
    name: "CloudKitchen Express",
    vertical: "ghost_kitchen",
    accent: "Multi-brand delivery",
  },
  {
    slug: "sweetdrop-bakery",
    name: "SweetDrop Bakery",
    vertical: "bakery",
    accent: "Pastry preorders",
  },
] as const;

/** Integration rows use real architecture — labels clarify simulation vs live keys in demos. */
export const DEMO_INTEGRATION_LABELS = [
  "WooCommerce (demo credentials)",
  "Shopify (demo store)",
  "Uber Eats (sandbox)",
  "Uber Direct (sandbox)",
] as const;

const DEMO_IMG =
  "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&q=80";

const CATEGORY_ROTATION: ProductCategory[] = [
  ProductCategory.MAINS,
  ProductCategory.SIDES,
  ProductCategory.BAKERY,
  ProductCategory.BEVERAGES,
  ProductCategory.BREAKFAST,
];

function token12(): string {
  return randomUUID().replace(/-/g, "").slice(0, 12);
}

/**
 * Removes operational rows commonly created during demo import.
 * Used internally by `seedDemoWorkspace` (explicit demo path only).
 */
async function deleteDemoOperationalData(userId: string): Promise<void> {
  const [
    orderWhere,
    menuWhere,
    webhookWhere,
    externalOrderWhere,
    externalProductWhere,
    notificationWhere,
    publishWhere,
    storefrontOrderWhere,
    routeWhere,
    posTxWhere,
  ] = await Promise.all([
    orderListWhereForOwner(userId),
    menuListWhereForOwner(userId),
    webhookEventListWhereForOwner(userId),
    externalOrderListWhereForOwner(userId),
    externalProductListWhereForOwner(userId),
    notificationLogListWhereForOwner(userId),
    menuChannelPublishListWhereForOwner(userId),
    storefrontOrderListWhereForOwner(userId),
    deliveryRouteListWhereForOwner(userId),
    posTransactionListWhereForOwner(userId),
  ]);

  await prisma.$transaction([
    prisma.notificationLog.deleteMany({ where: notificationWhere }),
    prisma.webhookEvent.deleteMany({ where: webhookWhere }),
    prisma.externalProduct.deleteMany({ where: externalProductWhere }),
    prisma.externalOrder.deleteMany({ where: externalOrderWhere }),
    prisma.menuChannelPublish.deleteMany({ where: publishWhere }),
    prisma.storefrontOrder.deleteMany({ where: storefrontOrderWhere }),
    prisma.deliveryRoute.deleteMany({ where: routeWhere }),
    prisma.pOSTransaction.deleteMany({ where: posTxWhere }),
    prisma.order.deleteMany({ where: orderWhere }),
    prisma.menu.deleteMany({ where: menuWhere }),
  ]);
}

export type DemoOperationalDataPreview = {
  notificationLogs: number;
  webhookEvents: number;
  externalProducts: number;
  externalOrders: number;
  menuChannelPublishes: number;
  storefrontOrders: number;
  deliveryRoutes: number;
  posTransactions: number;
  orders: number;
  menus: number;
};

/**
 * Preview of rows that `clearWorkspaceSampleData()` would delete for a demo workspace.
 * Use this for dry-runs before supervised production resets.
 */
export async function previewWorkspaceSampleDataClear(
  userId: string,
): Promise<DemoOperationalDataPreview> {
  const [
    orderWhere,
    menuWhere,
    webhookWhere,
    externalOrderWhere,
    externalProductWhere,
    notificationWhere,
    publishWhere,
    storefrontOrderWhere,
    routeWhere,
    posTxWhere,
  ] = await Promise.all([
    orderListWhereForOwner(userId),
    menuListWhereForOwner(userId),
    webhookEventListWhereForOwner(userId),
    externalOrderListWhereForOwner(userId),
    externalProductListWhereForOwner(userId),
    notificationLogListWhereForOwner(userId),
    menuChannelPublishListWhereForOwner(userId),
    storefrontOrderListWhereForOwner(userId),
    deliveryRouteListWhereForOwner(userId),
    posTransactionListWhereForOwner(userId),
  ]);

  const [
    notificationLogs,
    webhookEvents,
    externalProducts,
    externalOrders,
    menuChannelPublishes,
    storefrontOrders,
    deliveryRoutes,
    posTransactions,
    orders,
    menus,
  ] = await Promise.all([
    prisma.notificationLog.count({ where: notificationWhere }),
    prisma.webhookEvent.count({ where: webhookWhere }),
    prisma.externalProduct.count({ where: externalProductWhere }),
    prisma.externalOrder.count({ where: externalOrderWhere }),
    prisma.menuChannelPublish.count({ where: publishWhere }),
    prisma.storefrontOrder.count({ where: storefrontOrderWhere }),
    prisma.deliveryRoute.count({ where: routeWhere }),
    prisma.pOSTransaction.count({ where: posTxWhere }),
    prisma.order.count({ where: orderWhere }),
    prisma.menu.count({ where: menuWhere }),
  ]);

  return {
    notificationLogs,
    webhookEvents,
    externalProducts,
    externalOrders,
    menuChannelPublishes,
    storefrontOrders,
    deliveryRoutes,
    posTransactions,
    orders,
    menus,
  };
}

/**
 * Safe reset: only when `kitchen_settings.demo_mode` is true (see `resetDemoWorkspace` action).
 */
export async function clearWorkspaceSampleData(userId: string): Promise<void> {
  const settings = await prisma.kitchenSettings.findUnique({
    where: { userId },
  });
  if (!settings?.demoMode) {
    throw new Error(
      "Demo reset is only allowed for workspaces in demo mode.",
    );
  }
  await deleteDemoOperationalData(userId);
}

/**
 * Replace workspace operational data with a vertical-specific demo dataset and enable demo mode.
 * Intended only for the `/demo` import flow (may delete existing menus and orders for this user).
 */
export async function seedDemoWorkspace(
  userId: string,
  vertical: DemoVerticalSlug,
): Promise<void> {
  const preset = getDemoWorkspacePreset(vertical);

  await deleteDemoOperationalData(userId);

  await prisma.kitchenSettings.upsert({
    where: { userId },
    create: {
      userId,
      businessName: preset.businessName,
      businessType: preset.businessType,
      pickupAddress: "214 River Rd, Austin, TX 78704",
      deliveryEnabled: true,
      deliveryNotes: "Demo workspace · simulated deliveries only",
      deliveryRadiusKm: 12,
      deliveryFee: 6.5,
      orderCutoffTime: "18:00",
      timezone: "America/Chicago",
      locale: "en",
      demoMode: true,
      notifyOrderConfirmation: true,
      notifyPreorderReminder: true,
      notifyPickupReminder: true,
      notifyDeliveryReminder: true,
    },
    update: {
      businessName: preset.businessName,
      businessType: preset.businessType,
      demoMode: true,
    },
  });

  const workspaceId = await ensureOwnerWorkspaceId(userId);
  await prisma.subscription.upsert({
    where: { userId },
    create: {
      userId,
      workspaceId,
      plan: SubscriptionPlan.PRO,
      status: SubscriptionStatus.TRIALING,
    },
    update: {
      workspaceId,
      plan: SubscriptionPlan.PRO,
      status: SubscriptionStatus.TRIALING,
    },
  });

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

  const menuBase = await menuCreateBaseForOwner(userId);

  const menuActive = await prisma.menu.create({
    data: {
      ...menuBase,
      title: preset.menuWeekOneTitle,
      startDate: weekStart,
      endDate: weekEnd,
      preorderDeadline: new Date(weekStart.getTime() - 2 * 86400000),
      active: true,
      sortOrder: 0,
    },
  });

  const menuDraft = await prisma.menu.create({
    data: {
      ...menuBase,
      title: preset.menuWeekTwoTitle,
      startDate: nextWeekStart,
      endDate: nextWeekEnd,
      preorderDeadline: new Date(nextWeekStart.getTime() - 3 * 86400000),
      active: false,
      sortOrder: 1,
    },
  });

  const titles = preset.productTitles.slice(0, 12);
  const activeProductIds: string[] = [];

  for (let i = 0; i < titles.length; i++) {
    const title = titles[i]!;
    const category =
      preset.slug === "bakery"
        ? i % 3 === 0
          ? ProductCategory.BAKERY
          : ProductCategory.BREAKFAST
        : CATEGORY_ROTATION[i % CATEGORY_ROTATION.length]!;
    const price = 8 + (i % 7) + (i % 2) * 0.25;
    const preparedDate = new Date(weekStart);
    preparedDate.setDate(weekStart.getDate() + (i % 7));
    const pickupDate = new Date(preparedDate);

    const product = await prisma.product.create({
      data: {
        menuId: menuActive.id,
        title,
        description: "Demo menu item · replace with your kitchen copy.",
        category,
        ingredients: "See allergen card in bag.",
        reheatingInstructions:
          "Microwave 2–3 min or oven 350°F until 165°F internal.",
        kitchenNotes: "Demo batch · label with menu sticker.",
        preparedDate,
        pickupDate,
        deliveryAvailable: i % 3 !== 0,
        active: true,
        price,
        image: DEMO_IMG,
        sortOrder: i,
      },
    });
    activeProductIds.push(product.id);

    await prisma.productionTask.create({
      data: {
        productId: product.id,
        cooked: i % 3 === 0,
        packed: i % 4 === 0,
      },
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

  const draftSeed = preset.productTitles.slice(12, 14);
  const draftTitles =
    draftSeed.length >= 2
      ? draftSeed
      : ["Demo · Coming soon plate", "Demo · Baker's choice"];

  for (let i = 0; i < draftTitles.length; i++) {
    const title = draftTitles[i]!;
    const preparedDate = new Date(nextWeekStart);
    preparedDate.setDate(nextWeekStart.getDate() + i + 1);
    const product = await prisma.product.create({
      data: {
        menuId: menuDraft.id,
        title,
        description: "Planned for next menu cycle.",
        category:
          preset.slug === "bakery"
            ? ProductCategory.BAKERY
            : ProductCategory.MAINS,
        preparedDate,
        pickupDate: new Date(preparedDate),
        deliveryAvailable: true,
        active: true,
        price: 12 + i,
        image: DEMO_IMG,
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
    const c = customers[o % customers.length]!;
    const nLines = 1 + (o % 3);
    const startIdx = o % Math.max(activeProductIds.length, 1);
    const chosen: string[] = [];
    for (let j = 0; j < nLines; j++) {
      chosen.push(
        activeProductIds[(startIdx + j) % activeProductIds.length]!,
      );
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
        workspaceId,
        customerName: c.name,
        customerEmail: c.email,
        customerPhone: c.phone,
        total,
        status: statuses[o] ?? OrderStatus.CONFIRMED,
        fulfillmentType: fulfillment[o] ?? FulfillmentType.PICKUP,
        pickupDate,
        notes: o === 3 ? "Demo · Leave at concierge" : null,
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
}
