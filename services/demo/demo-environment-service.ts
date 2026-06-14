import { randomUUID } from "crypto";

import {
  AnalyticsPeriodType,
  BusinessType,
  FulfillmentType,
  OrderStatus,
} from "@prisma/client";

import { authCallbackUrl } from "@/lib/auth/public-site-url";
import {
  DEMO_SESSION_HOURS,
  demoSessionExpiresAt,
  isGuestDemoEmail,
} from "@/lib/demo/demo-session";
import type { DemoVerticalSlug } from "@/lib/demo-verticals";
import { ensureOwnerWorkspaceId } from "@/lib/scope/ensure-owner-workspace";
import {
  analyticsSnapshotListWhereForOwner,
  ingredientListWhereForOwner,
  inventoryStockListWhereForOwner,
  orderListWhereForOwner,
  supplierListWhereForOwner,
} from "@/lib/scope/workspace-resource-scope";
import { prisma } from "@/lib/prisma";
import {
  areDemoWorkspaceMutationsAllowed,
  demoWorkspaceBlockedInProductionMessage,
} from "@/lib/production-guards";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { seedCommercialDemoWorkspace } from "@/services/demo/commercial-demo-seed";

const DEMO_SUPPLIERS = [
  {
    name: "Fresh Farms Co-op",
    contactName: "Sam Rivera",
    email: "orders@freshfarms.demo",
    phone: "+1 512-555-0101",
  },
  {
    name: "Metro Protein Supply",
    contactName: "Jordan Lee",
    email: "buyers@metroprotein.demo",
    phone: "+1 512-555-0102",
  },
  {
    name: "Coastal Seafood",
    contactName: "Pat Nguyen",
    email: "dock@coastalsea.demo",
    phone: "+1 512-555-0103",
  },
];

const EXTRA_INVENTORY = [
  { name: "Chicken breast", unit: "lb", cost: 3.8, stock: 40 },
  { name: "Salmon fillet", unit: "lb", cost: 12.5, stock: 18 },
  { name: "Basil", unit: "bunch", cost: 1.5, stock: 24 },
  { name: "Tomatoes", unit: "lb", cost: 2.1, stock: 35 },
  { name: "Olive oil", unit: "gal", cost: 18, stock: 6 },
  { name: "Flour", unit: "lb", cost: 0.9, stock: 50 },
  { name: "Butter", unit: "lb", cost: 4.2, stock: 22 },
  { name: "Eggs", unit: "dozen", cost: 3.5, stock: 30 },
  { name: "Onions", unit: "lb", cost: 1.1, stock: 45 },
  { name: "Garlic", unit: "lb", cost: 2.8, stock: 12 },
  { name: "Potatoes", unit: "lb", cost: 0.75, stock: 60 },
  { name: "Cream", unit: "qt", cost: 4.5, stock: 14 },
  { name: "Rice", unit: "lb", cost: 1.2, stock: 40 },
  { name: "Black beans", unit: "lb", cost: 1.4, stock: 28 },
  { name: "Lemons", unit: "each", cost: 0.35, stock: 80 },
  { name: "Avocado", unit: "each", cost: 1.1, stock: 36 },
  { name: "Cheddar", unit: "lb", cost: 5.2, stock: 16 },
  { name: "Bacon", unit: "lb", cost: 6.8, stock: 20 },
  { name: "Spinach", unit: "lb", cost: 2.4, stock: 15 },
  { name: "Coffee beans", unit: "lb", cost: 9.5, stock: 10 },
];

export type CreateDemoWorkspaceResult =
  | {
      ok: true;
      actionLink: string;
      expiresAt: Date;
      businessName: string;
      userId: string;
    }
  | { ok: false; error: string };

function guestDemoPassword(): string {
  return `Demo-${randomUUID().replace(/-/g, "").slice(0, 16)}!`;
}

async function seedExtendedDemoData(userId: string): Promise<void> {
  const workspaceId = await ensureOwnerWorkspaceId(userId);

  const [orderWhere, supplierWhere, ingredientWhere, stockWhere] = await Promise.all([
    orderListWhereForOwner(userId),
    supplierListWhereForOwner(userId),
    ingredientListWhereForOwner(userId),
    inventoryStockListWhereForOwner(userId),
  ]);

  const orderCount = await prisma.order.count({ where: orderWhere });
  const needOrders = Math.max(0, 50 - orderCount);
  const products = await prisma.product.findMany({
    where: { menu: { userId } },
    select: { id: true, price: true },
    take: 40,
  });

  for (let o = 0; o < needOrders && products.length > 0; o++) {
    const line = products[o % products.length]!;
    const qty = 1 + (o % 3);
    const daysAgo = o % 30;
    const pickupDate = new Date();
    pickupDate.setDate(pickupDate.getDate() - daysAgo);
    await prisma.order.create({
      data: {
        userId,
        workspaceId,
        customerName: `Guest Demo ${orderCount + o + 1}`,
        customerEmail: `guest-order-${orderCount + o + 1}@demo.os-kitchen.app`,
        customerPhone: "+1 512-555-0142",
        total: Number(line.price) * qty,
        status: [OrderStatus.COMPLETED, OrderStatus.READY, OrderStatus.PREPARING, OrderStatus.PENDING][
          o % 4
        ]!,
        fulfillmentType: o % 2 === 0 ? FulfillmentType.PICKUP : FulfillmentType.DELIVERY,
        pickupDate,
        publicLookupToken: randomUUID().replace(/-/g, "").slice(0, 12),
        orderItems: { create: [{ productId: line.id, quantity: qty }] },
      },
    });
  }

  const supplierCount = await prisma.supplier.count({ where: supplierWhere });
  for (const s of DEMO_SUPPLIERS.slice(supplierCount)) {
    await prisma.supplier.create({
      data: {
        userId,
        workspaceId,
        name: s.name,
        contactName: s.contactName,
        email: s.email,
        phone: s.phone,
        active: true,
        paymentTerms: "Net 30 · demo",
      },
    });
  }

  let inventoryRows = await prisma.ingredient.count({ where: ingredientWhere });
  for (const ing of EXTRA_INVENTORY) {
    if (inventoryRows >= 20) break;
    const existing = await prisma.ingredient.findFirst({
      where: { AND: [ingredientWhere, { name: ing.name }] },
    });
    const ingredient =
      existing ??
      (await prisma.ingredient.create({
        data: {
          userId,
          name: ing.name,
          unit: ing.unit,
          costPerUnit: ing.cost,
          currentStock: ing.stock,
          parLevel: Math.max(1, Math.floor(ing.stock * 0.4)),
          active: true,
        },
      }));
    inventoryRows += existing ? 0 : 1;

    const stockRow = await prisma.inventoryStock.findFirst({
      where: { AND: [stockWhere, { ingredientId: ingredient.id }] },
    });
    if (stockRow) {
      await prisma.inventoryStock.update({
        where: { id: stockRow.id },
        data: { quantityOnHand: ing.stock, unit: ing.unit },
      });
    } else {
      await prisma.inventoryStock.create({
        data: {
          userId,
          ingredientId: ingredient.id,
          quantityOnHand: ing.stock,
          unit: ing.unit,
        },
      });
    }
  }

  const snapshotScope = await analyticsSnapshotListWhereForOwner(userId);
  const existingSnapshots = await prisma.analyticsSnapshot.count({
    where: { AND: [snapshotScope, { periodType: AnalyticsPeriodType.DAILY }] },
  });
  if (existingSnapshots < 30) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    for (let d = 0; d < 30; d++) {
      const snapshotDate = new Date(today);
      snapshotDate.setDate(today.getDate() - d);
      const rangeStart = new Date(snapshotDate);
      const rangeEnd = new Date(snapshotDate);
      rangeEnd.setHours(23, 59, 59, 999);
      const revenue = 1200 + (d % 7) * 180 + (30 - d) * 12;
      const orders = 8 + (d % 5);
      await prisma.analyticsSnapshot.create({
        data: {
          userId,
          workspaceId,
          snapshotDate,
          periodType: AnalyticsPeriodType.DAILY,
          rangeStart,
          rangeEnd,
          grossRevenue: revenue,
          netRevenue: revenue * 0.92,
          orderCount: orders,
          averageOrderValue: revenue / Math.max(orders, 1),
          repeatRate: 0.22 + (d % 10) * 0.01,
          newCustomerCount: 2 + (d % 4),
          activeCustomerCount: 12 + (d % 6),
          productionCompletionRate: 0.88,
          packingCompletionRate: 0.91,
          deliveryCompletionRate: 0.86,
        },
      });
    }
  }
}

/**
 * Creates an isolated guest demo workspace (no signup), seeds sales-ready data,
 * and returns a one-time magic link for auto-login.
 */
export async function createDemoWorkspace(
  vertical: DemoVerticalSlug = "restaurant",
): Promise<CreateDemoWorkspaceResult> {
  if (!areDemoWorkspaceMutationsAllowed()) {
    return { ok: false, error: demoWorkspaceBlockedInProductionMessage() };
  }

  const admin = getSupabaseAdminClient();
  const guestId = randomUUID().slice(0, 8);
  const email = `guest-${guestId}@demo.os-kitchen.app`;
  const password = guestDemoPassword();
  const expiresAt = demoSessionExpiresAt();

  const { data: created, error: createError } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      full_name: "Demo Guest",
      company_name: "OS Kitchen Demo",
      guest_demo: true,
    },
  });

  if (createError || !created.user) {
    return { ok: false, error: createError?.message ?? "Could not create demo session." };
  }

  const userId = created.user.id;

  try {
    await prisma.userProfile.create({
      data: {
        id: userId,
        email,
        fullName: "Demo Guest",
        companyName: "OS Kitchen Demo",
        onboardingCompleted: true,
        onboardingStep: 6,
      },
    });

    await ensureOwnerWorkspaceId(userId);
    await seedCommercialDemoWorkspace(userId, vertical);
    await seedExtendedDemoData(userId);

    const presetName = "Riverside Demo Kitchen";
    await prisma.kitchenSettings.upsert({
      where: { userId },
      create: {
        userId,
        businessName: presetName,
        businessType: BusinessType.RESTAURANT,
        demoMode: true,
        demoExpiresAt: expiresAt,
        timezone: "America/Chicago",
        locale: "en",
        deliveryEnabled: true,
      },
      update: {
        demoMode: true,
        demoExpiresAt: expiresAt,
        businessName: presetName,
      },
    });

    const redirectTo = authCallbackUrl("/dashboard/today");
    const { data: linkData, error: linkError } = await admin.auth.admin.generateLink({
      type: "magiclink",
      email,
      options: { redirectTo },
    });

    if (linkError || !linkData.properties?.action_link) {
      return { ok: false, error: linkError?.message ?? "Could not start demo session." };
    }

    return {
      ok: true,
      actionLink: linkData.properties.action_link,
      expiresAt,
      businessName: presetName,
      userId,
    };
  } catch (e) {
    await admin.auth.admin.deleteUser(userId).catch(() => undefined);
    const msg = e instanceof Error ? e.message : "Demo workspace setup failed.";
    return { ok: false, error: msg };
  }
}

export async function getDemoSessionForUser(userId: string): Promise<{
  demoMode: boolean;
  expiresAt: Date | null;
  isGuest: boolean;
}> {
  const [settings, profile] = await Promise.all([
    prisma.kitchenSettings.findUnique({
      where: { userId },
      select: { demoMode: true, demoExpiresAt: true },
    }),
    prisma.userProfile.findUnique({
      where: { id: userId },
      select: { email: true },
    }),
  ]);

  return {
    demoMode: settings?.demoMode ?? false,
    expiresAt: settings?.demoExpiresAt ?? null,
    isGuest: isGuestDemoEmail(profile?.email),
  };
}

export function demoSessionHoursLabel(): string {
  return `${DEMO_SESSION_HOURS} hours`;
}
