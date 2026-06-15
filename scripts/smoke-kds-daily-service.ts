/**
 * KDS daily-service staging smoke — queue → bump → recall (DB-level).
 *
 * Usage:
 *   npx tsx scripts/smoke-kds-daily-service.ts --help
 *   npx tsx scripts/smoke-kds-daily-service.ts --ephemeral
 *   npx tsx scripts/smoke-kds-daily-service.ts --owner-email you@example.com
 *   npx tsx scripts/smoke-kds-daily-service.ts --owner-email you@example.com --skip-recall
 */
import { randomUUID } from "node:crypto";

import { PrismaClient } from "@prisma/client";

import { KDS_STAGING_SMOKE_POLICY_ID } from "../lib/kitchen/kds-staging-smoke-policy";
import { getDailyKdsOrders } from "../services/kitchen-screen/daily-kds-service";
import { getTodayQueue } from "../services/production/daily-queue-service";

const prisma = new PrismaClient();

function arg(name: string): string | undefined {
  const i = process.argv.indexOf(name);
  if (i === -1) return undefined;
  return process.argv[i + 1];
}

function hasFlag(name: string): boolean {
  return process.argv.includes(name);
}

type StageResult = { stage: string; ok: boolean; detail?: string };

async function cleanupIds(ids: {
  orderIds: string[];
  productIds: string[];
  menuIds: string[];
  customerIds: string[];
  workspaceIds: string[];
  userIds: string[];
}) {
  if (ids.orderIds.length) {
    await prisma.orderItem.deleteMany({ where: { orderId: { in: ids.orderIds } } });
    await prisma.order.deleteMany({ where: { id: { in: ids.orderIds } } });
  }
  if (ids.customerIds.length) {
    await prisma.kitchenCustomer.deleteMany({ where: { id: { in: ids.customerIds } } });
  }
  if (ids.productIds.length) {
    await prisma.product.deleteMany({ where: { id: { in: ids.productIds } } });
  }
  if (ids.menuIds.length) {
    await prisma.menu.deleteMany({ where: { id: { in: ids.menuIds } } });
  }
  if (ids.workspaceIds.length) {
    await prisma.workspace.deleteMany({ where: { id: { in: ids.workspaceIds } } });
  }
  if (ids.userIds.length) {
    await prisma.userProfile.deleteMany({ where: { id: { in: ids.userIds } } });
  }
}

async function resolveOwnerId(): Promise<{ ownerId: string; ephemeral: boolean }> {
  const ownerEmail = arg("--owner-email");
  if (ownerEmail) {
    const profile = await prisma.userProfile.findFirst({
      where: { email: ownerEmail.trim().toLowerCase() },
      select: { id: true },
    });
    if (!profile) {
      throw new Error(`No user for email: ${ownerEmail}`);
    }
    return { ownerId: profile.id, ephemeral: false };
  }
  if (!hasFlag("--ephemeral")) {
    throw new Error("Provide --owner-email or --ephemeral");
  }
  const ownerId = randomUUID();
  const suffix = ownerId.slice(0, 8);
  await prisma.userProfile.create({
    data: {
      id: ownerId,
      email: `kds-smoke-${suffix}@example.com`,
      fullName: `KDS Smoke ${suffix}`,
      role: "OWNER",
    },
  });
  return { ownerId, ephemeral: true };
}

async function seedPreparingOrder(ownerId: string): Promise<{
  orderId: string;
  productId: string;
  menuId: string;
  workspaceId: string;
  title: string;
}> {
  const suffix = randomUUID().slice(0, 8);
  const workspace = await prisma.workspace.create({
    data: { ownerUserId: ownerId, name: `KDS Smoke WS ${suffix}` },
    select: { id: true },
  });
  const menu = await prisma.menu.create({
    data: {
      userId: ownerId,
      workspaceId: workspace.id,
      title: `Smoke Menu ${suffix}`,
      startDate: new Date("2026-01-01T00:00:00.000Z"),
      endDate: new Date("2026-12-31T00:00:00.000Z"),
      preorderDeadline: new Date("2025-12-31T00:00:00.000Z"),
      active: true,
      published: true,
    },
    select: { id: true },
  });
  const title = `Smoke Burger ${suffix}`;
  const product = await prisma.product.create({
    data: {
      menuId: menu.id,
      workspaceId: workspace.id,
      title,
      preparedDate: new Date(),
      price: 12,
      active: true,
    },
    select: { id: true },
  });
  const order = await prisma.order.create({
    data: {
      userId: ownerId,
      workspaceId: workspace.id,
      customerName: `Guest ${suffix}`,
      customerEmail: `guest-${suffix}@example.com`,
      total: 12,
      status: "PREPARING",
      fulfillmentType: "PICKUP",
      orderItems: {
        create: {
          productId: product.id,
          quantity: 1,
          title,
          unitPrice: 12,
          lineTotal: 12,
        },
      },
    },
    select: { id: true },
  });
  return {
    orderId: order.id,
    productId: product.id,
    menuId: menu.id,
    workspaceId: workspace.id,
    title,
  };
}

async function main() {
  if (hasFlag("--help") || hasFlag("-h")) {
    console.log(`
KDS daily-service staging smoke (${KDS_STAGING_SMOKE_POLICY_ID})

  --ephemeral              Create disposable owner + order (default cleanup)
  --owner-email <email>    Use existing owner; cleans up only the smoke order graph
  --skip-recall            Skip READY → PREPARING recall stage
`);
    process.exit(0);
  }

  if (!process.env.DATABASE_URL?.trim()) {
    console.error("DATABASE_URL is required");
    process.exit(1);
  }

  const results: StageResult[] = [];
  const cleanup = {
    orderIds: [] as string[],
    productIds: [] as string[],
    menuIds: [] as string[],
    customerIds: [] as string[],
    workspaceIds: [] as string[],
    userIds: [] as string[],
  };

  try {
    const { ownerId, ephemeral } = await resolveOwnerId();
    if (ephemeral) cleanup.userIds.push(ownerId);

    const seeded = await seedPreparingOrder(ownerId);
    cleanup.orderIds.push(seeded.orderId);
    cleanup.productIds.push(seeded.productId);
    cleanup.menuIds.push(seeded.menuId);
    cleanup.workspaceIds.push(seeded.workspaceId);

    const queue = await getTodayQueue(ownerId);
    results.push({
      stage: "queue_load",
      ok: Array.isArray(queue),
      detail: `rows=${queue.length}`,
    });

    const ticket = queue.find((row) => row.id === seeded.orderId);
    results.push({
      stage: "ticket_visible",
      ok: Boolean(ticket && ticket.status === "PREPARING"),
      detail: ticket ? `status=${ticket.status}` : "missing",
    });

    const kdsRows = await getDailyKdsOrders(ownerId);
    const kdsTicket = kdsRows.find((row) => row.id === seeded.orderId);
    results.push({
      stage: "kds_adapter_elapsed",
      ok: Boolean(kdsTicket && kdsTicket.elapsedSeconds >= 0),
    });

    await prisma.order.update({
      where: { id: seeded.orderId },
      data: { status: "READY" },
    });
    const afterBump = await getTodayQueue(ownerId);
    const bumped = afterBump.find((row) => row.id === seeded.orderId);
    results.push({
      stage: "bump_to_ready",
      ok: bumped?.status === "READY",
      detail: bumped ? `status=${bumped.status}` : "missing",
    });

    if (!hasFlag("--skip-recall")) {
      await prisma.order.update({
        where: { id: seeded.orderId },
        data: { status: "PREPARING" },
      });
      const afterRecall = await getTodayQueue(ownerId);
      const recalled = afterRecall.find((row) => row.id === seeded.orderId);
      results.push({
        stage: "recall_to_preparing",
        ok: recalled?.status === "PREPARING",
        detail: recalled ? `status=${recalled.status}` : "missing",
      });
    }

    const failed = results.filter((r) => !r.ok);
    console.log(JSON.stringify({ policy: KDS_STAGING_SMOKE_POLICY_ID, results }, null, 2));
    if (failed.length) {
      console.error("KDS staging smoke FAILED:", failed.map((f) => f.stage).join(", "));
      process.exit(1);
    }
    console.log("KDS staging smoke PASSED");
  } finally {
    await cleanupIds(cleanup);
    await prisma.$disconnect();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
