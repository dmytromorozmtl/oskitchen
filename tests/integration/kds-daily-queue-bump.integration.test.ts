import { randomUUID } from "node:crypto";

import { afterEach, describe, expect, it } from "vitest";

import { prisma } from "@/lib/prisma";
import { getTodayQueue } from "@/services/production/daily-queue-service";

const run =
  process.env.RUN_DB_INTEGRATION === "1" &&
  Boolean(process.env.DATABASE_URL?.trim());

const cleanupUserIds = new Set<string>();
const cleanupWorkspaceIds = new Set<string>();
const cleanupOrderIds = new Set<string>();
const cleanupCustomerIds = new Set<string>();
const cleanupProductIds = new Set<string>();
const cleanupMenuIds = new Set<string>();

afterEach(async () => {
  if (cleanupOrderIds.size) {
    await prisma.orderItem.deleteMany({ where: { orderId: { in: [...cleanupOrderIds] } } });
    await prisma.order.deleteMany({ where: { id: { in: [...cleanupOrderIds] } } });
    cleanupOrderIds.clear();
  }
  if (cleanupCustomerIds.size) {
    await prisma.kitchenCustomer.deleteMany({ where: { id: { in: [...cleanupCustomerIds] } } });
    cleanupCustomerIds.clear();
  }
  if (cleanupProductIds.size) {
    await prisma.product.deleteMany({ where: { id: { in: [...cleanupProductIds] } } });
    cleanupProductIds.clear();
  }
  if (cleanupMenuIds.size) {
    await prisma.menu.deleteMany({ where: { id: { in: [...cleanupMenuIds] } } });
    cleanupMenuIds.clear();
  }
  if (cleanupWorkspaceIds.size) {
    await prisma.workspace.deleteMany({ where: { id: { in: [...cleanupWorkspaceIds] } } });
    cleanupWorkspaceIds.clear();
  }
  if (cleanupUserIds.size) {
    await prisma.userProfile.deleteMany({ where: { id: { in: [...cleanupUserIds] } } });
    cleanupUserIds.clear();
  }
});

describe.skipIf(!run)("KDS daily queue → bump (integration)", () => {
  it("includes today's PREPARING order and reflects READY after bump", async () => {
    const suffix = randomUUID().slice(0, 8);
    const ownerId = randomUUID();
    cleanupUserIds.add(ownerId);

    await prisma.userProfile.create({
      data: {
        id: ownerId,
        email: `kds-${suffix}@example.com`,
        fullName: `KDS Owner ${suffix}`,
        role: "OWNER",
      },
    });

    const workspace = await prisma.workspace.create({
      data: { ownerUserId: ownerId, name: `KDS WS ${suffix}` },
      select: { id: true },
    });
    cleanupWorkspaceIds.add(workspace.id);

    const menu = await prisma.menu.create({
      data: {
        userId: ownerId,
        workspaceId: workspace.id,
        title: `Menu ${suffix}`,
        startDate: new Date("2026-01-01T00:00:00.000Z"),
        endDate: new Date("2026-12-31T00:00:00.000Z"),
        preorderDeadline: new Date("2025-12-31T00:00:00.000Z"),
        active: true,
        published: true,
      },
      select: { id: true },
    });
    cleanupMenuIds.add(menu.id);

    const product = await prisma.product.create({
      data: {
        menuId: menu.id,
        workspaceId: workspace.id,
        title: `Burger ${suffix}`,
        preparedDate: new Date(),
        price: 14,
        active: true,
        allergens: "peanut",
      },
      select: { id: true },
    });
    cleanupProductIds.add(product.id);

    const order = await prisma.order.create({
      data: {
        userId: ownerId,
        workspaceId: workspace.id,
        customerName: `Guest ${suffix}`,
        customerEmail: `guest-${suffix}@example.com`,
        total: 14,
        status: "PREPARING",
        fulfillmentType: "PICKUP",
        orderItems: {
          create: {
            productId: product.id,
            quantity: 1,
            title: `Burger ${suffix}`,
            unitPrice: 14,
            lineTotal: 14,
          },
        },
      },
      select: { id: true },
    });
    cleanupOrderIds.add(order.id);

    const before = await getTodayQueue(ownerId);
    const ticket = before.find((row) => row.id === order.id);
    expect(ticket).toBeDefined();
    expect(ticket?.status).toBe("PREPARING");
    expect(ticket?.items).toContain(`Burger ${suffix}`);

    await prisma.order.update({
      where: { id: order.id },
      data: { status: "READY" },
    });

    const after = await getTodayQueue(ownerId);
    const bumped = after.find((row) => row.id === order.id);
    expect(bumped).toBeDefined();
    expect(bumped?.status).toBe("READY");
  });

  it("reflects PREPARING after recall from READY on today's queue", async () => {
    const suffix = randomUUID().slice(0, 8);
    const ownerId = randomUUID();
    cleanupUserIds.add(ownerId);

    await prisma.userProfile.create({
      data: {
        id: ownerId,
        email: `kds-recall-${suffix}@example.com`,
        fullName: `KDS Recall ${suffix}`,
        role: "OWNER",
      },
    });

    const workspace = await prisma.workspace.create({
      data: { ownerUserId: ownerId, name: `KDS Recall WS ${suffix}` },
      select: { id: true },
    });
    cleanupWorkspaceIds.add(workspace.id);

    const menu = await prisma.menu.create({
      data: {
        userId: ownerId,
        workspaceId: workspace.id,
        title: `Recall Menu ${suffix}`,
        startDate: new Date("2026-01-01T00:00:00.000Z"),
        endDate: new Date("2026-12-31T00:00:00.000Z"),
        preorderDeadline: new Date("2025-12-31T00:00:00.000Z"),
        active: true,
        published: true,
      },
      select: { id: true },
    });
    cleanupMenuIds.add(menu.id);

    const product = await prisma.product.create({
      data: {
        menuId: menu.id,
        workspaceId: workspace.id,
        title: `Salad ${suffix}`,
        preparedDate: new Date(),
        price: 12,
        active: true,
      },
      select: { id: true },
    });
    cleanupProductIds.add(product.id);

    const order = await prisma.order.create({
      data: {
        userId: ownerId,
        workspaceId: workspace.id,
        customerName: `Recall Guest ${suffix}`,
        customerEmail: `recall-${suffix}@example.com`,
        total: 12,
        status: "READY",
        fulfillmentType: "PICKUP",
        orderItems: {
          create: {
            productId: product.id,
            quantity: 1,
            title: `Salad ${suffix}`,
            unitPrice: 12,
            lineTotal: 12,
          },
        },
      },
      select: { id: true },
    });
    cleanupOrderIds.add(order.id);

    const readyQueue = await getTodayQueue(ownerId);
    expect(readyQueue.find((row) => row.id === order.id)?.status).toBe("READY");

    await prisma.order.update({
      where: { id: order.id },
      data: { status: "PREPARING" },
    });

    const recalledQueue = await getTodayQueue(ownerId);
    const recalled = recalledQueue.find((row) => row.id === order.id);
    expect(recalled).toBeDefined();
    expect(recalled?.status).toBe("PREPARING");
  });

  it("flags allergen conflict when customer allergies match product allergens", async () => {
    const suffix = randomUUID().slice(0, 8);
    const ownerId = randomUUID();
    cleanupUserIds.add(ownerId);

    await prisma.userProfile.create({
      data: {
        id: ownerId,
        email: `kds-allergy-${suffix}@example.com`,
        fullName: `KDS Allergy ${suffix}`,
        role: "OWNER",
      },
    });

    const workspace = await prisma.workspace.create({
      data: { ownerUserId: ownerId, name: `KDS Allergy WS ${suffix}` },
      select: { id: true },
    });
    cleanupWorkspaceIds.add(workspace.id);

    const customer = await prisma.kitchenCustomer.create({
      data: {
        userId: ownerId,
        workspaceId: workspace.id,
        email: `allergy-${suffix}@example.com`,
        name: `Allergy Guest ${suffix}`,
        allergiesJson: ["peanut"],
      },
      select: { id: true },
    });
    cleanupCustomerIds.add(customer.id);

    const menu = await prisma.menu.create({
      data: {
        userId: ownerId,
        workspaceId: workspace.id,
        title: `Allergy Menu ${suffix}`,
        startDate: new Date("2026-01-01T00:00:00.000Z"),
        endDate: new Date("2026-12-31T00:00:00.000Z"),
        preorderDeadline: new Date("2025-12-31T00:00:00.000Z"),
        active: true,
        published: true,
      },
      select: { id: true },
    });
    cleanupMenuIds.add(menu.id);

    const product = await prisma.product.create({
      data: {
        menuId: menu.id,
        workspaceId: workspace.id,
        title: `PB Sandwich ${suffix}`,
        preparedDate: new Date(),
        price: 11,
        active: true,
        allergens: "peanut, wheat",
      },
      select: { id: true },
    });
    cleanupProductIds.add(product.id);

    const order = await prisma.order.create({
      data: {
        userId: ownerId,
        workspaceId: workspace.id,
        customerId: customer.id,
        customerName: customer.name ?? "Guest",
        customerEmail: customer.email,
        total: 11,
        status: "PREPARING",
        fulfillmentType: "PICKUP",
        orderItems: {
          create: {
            productId: product.id,
            quantity: 1,
            title: product.title,
            unitPrice: 11,
            lineTotal: 11,
          },
        },
      },
      select: { id: true },
    });
    cleanupOrderIds.add(order.id);

    const queue = await getTodayQueue(ownerId);
    const ticket = queue.find((row) => row.id === order.id);
    expect(ticket?.hasAllergenConflict).toBe(true);
  });
});
