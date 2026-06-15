/**
 * Idempotent CI seed for POS cash-checkout prerequisites (no Supabase auth).
 *
 * Creates a fixed owner workspace with PRO subscription, register, staff, and
 * one POS-visible product. Use for DB-backed CI validation; Playwright E2E still
 * requires real dashboard credentials via `seed-e2e-pos-fixture.ts`.
 *
 * Usage:
 *   DATABASE_URL=... npx tsx scripts/seed-ci-pos-checkout.ts
 */
import {
  PosRegisterStatus,
  ProductCategory,
  StaffRoleType,
  StaffStatus,
  SubscriptionPlan,
  SubscriptionStatus,
} from "@prisma/client";
import { PrismaClient } from "@prisma/client";

import { menuCreateBaseForOwner } from "@/lib/products/menu-create-base";

/** Stable CI owner — do not use for Supabase login E2E without matching auth user. */
export const CI_POS_OWNER_ID = "ci000000-0000-4000-8000-000000000002";

const prisma = new PrismaClient();

async function main() {
  const ownerId = process.env.CI_POS_OWNER_ID?.trim() || CI_POS_OWNER_ID;

  await prisma.userProfile.upsert({
    where: { id: ownerId },
    create: {
      id: ownerId,
      email: "ci-pos@example.com",
      fullName: "CI POS Owner",
      role: "OWNER",
    },
    update: {
      email: "ci-pos@example.com",
      fullName: "CI POS Owner",
      role: "OWNER",
    },
  });

  let workspace = await prisma.workspace.findFirst({
    where: { ownerUserId: ownerId },
    select: { id: true },
  });
  if (!workspace) {
    workspace = await prisma.workspace.create({
      data: {
        ownerUserId: ownerId,
        name: "CI POS Workspace",
      },
      select: { id: true },
    });
  }

  await prisma.kitchenSettings.upsert({
    where: { userId: ownerId },
    create: {
      userId: ownerId,
      workspaceId: workspace.id,
      businessName: "CI POS Kitchen",
    },
    update: {
      workspaceId: workspace.id,
      businessName: "CI POS Kitchen",
    },
  });

  await prisma.subscription.upsert({
    where: { userId: ownerId },
    create: {
      userId: ownerId,
      workspaceId: workspace.id,
      plan: SubscriptionPlan.PRO,
      status: SubscriptionStatus.TRIALING,
    },
    update: {
      workspaceId: workspace.id,
      plan: SubscriptionPlan.PRO,
      status: SubscriptionStatus.TRIALING,
    },
  });

  const regCount = await prisma.pOSRegister.count({
    where: { userId: ownerId, status: PosRegisterStatus.ACTIVE },
  });
  if (regCount === 0) {
    await prisma.pOSRegister.create({
      data: {
        userId: ownerId,
        workspaceId: workspace.id,
        name: "CI register",
        status: PosRegisterStatus.ACTIVE,
      },
    });
  }

  const staffCount = await prisma.staffMember.count({
    where: { userId: ownerId, status: StaffStatus.ACTIVE, archivedAt: null },
  });
  if (staffCount === 0) {
    await prisma.staffMember.create({
      data: {
        userId: ownerId,
        workspaceId: workspace.id,
        name: "CI cashier",
        status: StaffStatus.ACTIVE,
        roleType: StaffRoleType.CUSTOM,
        active: true,
      },
    });
  }

  const posProductCount = await prisma.product.count({
    where: {
      active: true,
      posVisible: true,
      workspaceId: workspace.id,
      menu: { active: true, userId: ownerId },
    },
  });

  if (posProductCount === 0) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const end = new Date(today);
    end.setDate(end.getDate() + 14);

    const base = await menuCreateBaseForOwner(ownerId);
    const menu = await prisma.menu.create({
      data: {
        ...base,
        workspaceId: workspace.id,
        title: "CI POS catalog",
        startDate: today,
        endDate: end,
        preorderDeadline: new Date(today.getTime() - 86400000),
        active: true,
        sortOrder: 999,
      },
    });
    await prisma.product.create({
      data: {
        menuId: menu.id,
        workspaceId: workspace.id,
        title: "CI POS item",
        description: "Synthetic catalog row for POS money-path CI.",
        category: ProductCategory.OTHER,
        preparedDate: today,
        pickupDate: today,
        deliveryAvailable: false,
        active: true,
        price: 12.5,
        posVisible: true,
        sortOrder: 0,
      },
    });
  }

  console.log(`✓ CI POS checkout seed ready · ownerId=${ownerId}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
