import { randomUUID } from "node:crypto";

import {
  PosRegisterStatus,
  SubscriptionPlan,
  SubscriptionStatus,
} from "@prisma/client";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { prisma } from "@/lib/prisma";
import { checkoutPosSale } from "@/services/pos/pos-checkout-service";

const run =
  process.env.RUN_DB_INTEGRATION === "1" &&
  Boolean(process.env.DATABASE_URL?.trim());
const ENCRYPTION_KEY_B64 = Buffer.alloc(32, 11).toString("base64");

type PosInventoryFixture = {
  ownerId: string;
  workspaceId: string;
  registerId: string;
  productWithRecipeId: string;
  productWithoutRecipeId: string;
  ingredientId: string;
};

const cleanupUserIds = new Set<string>();
const cleanupWorkspaceIds = new Set<string>();

async function createPosInventoryFixture(tag: string): Promise<PosInventoryFixture> {
  const suffix = randomUUID().slice(0, 8);
  const ownerId = randomUUID();

  await prisma.userProfile.create({
    data: {
      id: ownerId,
      email: `${tag}-${suffix}@example.com`,
      fullName: `Owner ${tag}`,
      role: "OWNER",
    },
  });

  const workspace = await prisma.workspace.create({
    data: {
      ownerUserId: ownerId,
      name: `Workspace ${tag} ${suffix}`,
    },
    select: { id: true },
  });

  await prisma.subscription.create({
    data: {
      userId: ownerId,
      workspaceId: workspace.id,
      plan: SubscriptionPlan.PRO,
      status: SubscriptionStatus.TRIALING,
    },
  });

  const menu = await prisma.menu.create({
    data: {
      userId: ownerId,
      workspaceId: workspace.id,
      title: `Menu ${suffix}`,
      startDate: new Date("2026-05-26T00:00:00.000Z"),
      endDate: new Date("2026-12-31T00:00:00.000Z"),
      preorderDeadline: new Date("2026-05-25T00:00:00.000Z"),
      active: true,
      published: true,
    },
  });

  const productWithRecipe = await prisma.product.create({
    data: {
      menuId: menu.id,
      workspaceId: workspace.id,
      title: `Recipe meal ${suffix}`,
      preparedDate: new Date("2026-05-26T00:00:00.000Z"),
      price: 12.5,
      active: true,
      posVisible: true,
    },
    select: { id: true },
  });

  const productWithoutRecipe = await prisma.product.create({
    data: {
      menuId: menu.id,
      workspaceId: workspace.id,
      title: `Plain meal ${suffix}`,
      preparedDate: new Date("2026-05-26T00:00:00.000Z"),
      price: 9,
      active: true,
      posVisible: true,
    },
    select: { id: true },
  });

  const ingredient = await prisma.ingredient.create({
    data: {
      userId: ownerId,
      workspaceId: workspace.id,
      name: `Flour ${suffix}`,
      unit: "kg",
      costPerUnit: 2.5,
      currentStock: 10,
    },
    select: { id: true },
  });

  const recipe = await prisma.recipe.create({
    data: {
      userId: ownerId,
      workspaceId: workspace.id,
      productId: productWithRecipe.id,
      name: `Recipe ${suffix}`,
      yieldQuantity: 1,
      yieldUnit: "each",
      active: true,
      ingredients: {
        create: {
          ingredientId: ingredient.id,
          quantity: 0.5,
          unit: "kg",
          wastePercent: 0,
        },
      },
    },
  });

  void recipe;

  const register = await prisma.pOSRegister.create({
    data: {
      userId: ownerId,
      workspaceId: workspace.id,
      name: `Register ${suffix}`,
      status: PosRegisterStatus.ACTIVE,
    },
    select: { id: true },
  });

  cleanupUserIds.add(ownerId);
  cleanupWorkspaceIds.add(workspace.id);

  return {
    ownerId,
    workspaceId: workspace.id,
    registerId: register.id,
    productWithRecipeId: productWithRecipe.id,
    productWithoutRecipeId: productWithoutRecipe.id,
    ingredientId: ingredient.id,
  };
}

describe.skipIf(!run)("POS inventory depletion integration", () => {
  beforeEach(() => {
    process.env.ENCRYPTION_KEY = ENCRYPTION_KEY_B64;
  });

  afterEach(async () => {
    const userIds = Array.from(cleanupUserIds);
    const workspaceIds = Array.from(cleanupWorkspaceIds);
    cleanupUserIds.clear();
    cleanupWorkspaceIds.clear();
    if (userIds.length === 0) return;

    await prisma.posInventoryImpactEvent.deleteMany({ where: { userId: { in: userIds } } });
    await prisma.pOSPayment.deleteMany({ where: { userId: { in: userIds } } });
    await prisma.pOSReceipt.deleteMany({ where: { userId: { in: userIds } } });
    await prisma.pOSTransaction.deleteMany({ where: { userId: { in: userIds } } });
    await prisma.pOSAuditEvent.deleteMany({ where: { userId: { in: userIds } } });
    await prisma.orderItem.deleteMany({ where: { order: { userId: { in: userIds } } } });
    await prisma.order.deleteMany({ where: { userId: { in: userIds } } });
    await prisma.recipeIngredient.deleteMany({ where: { recipe: { userId: { in: userIds } } } });
    await prisma.recipe.deleteMany({ where: { userId: { in: userIds } } });
    await prisma.ingredient.deleteMany({ where: { userId: { in: userIds } } });
    await prisma.product.deleteMany({ where: { workspaceId: { in: workspaceIds } } });
    await prisma.menu.deleteMany({ where: { userId: { in: userIds } } });
    await prisma.pOSRegister.deleteMany({ where: { userId: { in: userIds } } });
    await prisma.subscription.deleteMany({ where: { userId: { in: userIds } } });
    await prisma.workspace.deleteMany({ where: { id: { in: workspaceIds } } });
    await prisma.userProfile.deleteMany({ where: { id: { in: userIds } } });
  });

  it("applies recipe depletion when POS checkout sells a configured product", async () => {
    const fixture = await createPosInventoryFixture("pos-inv-applied");

    const result = await checkoutPosSale(fixture.ownerId, fixture.ownerId, {
      registerId: fixture.registerId,
      shiftId: null,
      staffMemberId: null,
      locationId: null,
      brandId: null,
      customerId: null,
      fulfillmentDetail: "PICKUP",
      paymentMode: "CASH",
      lines: [
        {
          productId: fixture.productWithRecipeId,
          title: "Recipe meal",
          quantity: 2,
          unitPrice: 12.5,
        },
      ],
    });

    expect(result.ok).toBe(true);
    if (!result.ok) return;

    const impact = await prisma.posInventoryImpactEvent.findFirst({
      where: { orderId: result.orderId, userId: fixture.ownerId },
    });
    expect(impact).toEqual(
      expect.objectContaining({
        productId: fixture.productWithRecipeId,
        status: "APPLIED",
      }),
    );

    const ingredient = await prisma.ingredient.findUnique({
      where: { id: fixture.ingredientId },
      select: { currentStock: true },
    });
    expect(Number(ingredient?.currentStock)).toBe(9);
  });

  it("records pending inventory impact when POS product has no recipe", async () => {
    const fixture = await createPosInventoryFixture("pos-inv-pending");

    const result = await checkoutPosSale(fixture.ownerId, fixture.ownerId, {
      registerId: fixture.registerId,
      shiftId: null,
      staffMemberId: null,
      locationId: null,
      brandId: null,
      customerId: null,
      fulfillmentDetail: "PICKUP",
      paymentMode: "CASH",
      lines: [
        {
          productId: fixture.productWithoutRecipeId,
          title: "Plain meal",
          quantity: 1,
          unitPrice: 9,
        },
      ],
    });

    expect(result.ok).toBe(true);
    if (!result.ok) return;

    const impact = await prisma.posInventoryImpactEvent.findFirst({
      where: { orderId: result.orderId, userId: fixture.ownerId },
    });
    expect(impact).toEqual(
      expect.objectContaining({
        productId: fixture.productWithoutRecipeId,
        status: "PENDING_CONFIGURATION",
      }),
    );
  });
});
