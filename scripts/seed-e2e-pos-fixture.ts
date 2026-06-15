import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

function loadE2eLocalEnv() {
  const p = join(process.cwd(), ".env.e2e.local");
  if (!existsSync(p)) return;
  for (const line of readFileSync(p, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq <= 0) continue;
    const key = trimmed.slice(0, eq).trim();
    if (process.env[key]?.trim()) continue;
    process.env[key] = trimmed.slice(eq + 1).trim();
  }
}

loadE2eLocalEnv();

/**
 * Ensures Playwright POS checkout E2E preconditions for a given workspace user:
 * PRO-tier subscription (POS terminal entitlement), at least one ACTIVE POS register,
 * one ACTIVE staff member, and at least one active POS-visible catalog product.
 *
 * Usage (same DATABASE_URL / DIRECT_URL as your app):
 *
 *   E2E_SEED_USER_ID=<supabase-auth-user-uuid> npx tsx scripts/seed-e2e-pos-fixture.ts
 *
 * `SEED_USER_ID` is accepted as an alias. Use the same user as `E2E_LOGIN_EMAIL` in Playwright.
 *
 * Safe to run repeatedly — only creates missing rows; does not delete orders.
 */
import {
  PosRegisterStatus,
  ProductCategory,
  StaffRoleType,
  StaffStatus,
  SubscriptionPlan,
  SubscriptionStatus,
} from "@prisma/client";

import { menuCreateBaseForOwner } from "@/lib/products/menu-create-base";
import { productListWhereForOwnerAnd } from "@/lib/scope/workspace-resource-scope";
import { prisma } from "@/lib/prisma";

async function main() {
  const userId = process.env.E2E_SEED_USER_ID?.trim() || process.env.SEED_USER_ID?.trim();
  if (!userId) {
    console.error(
      "Set E2E_SEED_USER_ID (or SEED_USER_ID) to your Supabase auth user UUID — the same workspace as E2E_LOGIN_EMAIL.",
    );
    process.exit(1);
  }

  const profile = await prisma.userProfile.findUnique({ where: { id: userId }, select: { id: true, email: true } });
  if (!profile) {
    console.error(`No UserProfile row for user id ${userId}. Sign in once or create the profile first.`);
    process.exit(1);
  }

  const workspace = await prisma.workspace.findFirst({
    where: { ownerUserId: userId },
    select: { id: true, name: true },
    orderBy: { createdAt: "asc" },
  });
  if (!workspace) {
    console.error(`No workspace found for user ${userId}. Run bootstrap-e2e-credentials first.`);
    process.exit(1);
  }

  await prisma.subscription.upsert({
    where: { userId },
    create: {
      userId,
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
    where: { userId, status: PosRegisterStatus.ACTIVE },
  });
  if (regCount === 0) {
    await prisma.pOSRegister.create({
      data: {
        userId,
        workspaceId: workspace.id,
        name: "E2E register",
        status: PosRegisterStatus.ACTIVE,
      },
    });
    console.log("Created POS register: E2E register");
  }

  const staffCount = await prisma.staffMember.count({
    where: { userId, status: StaffStatus.ACTIVE, archivedAt: null },
  });
  if (staffCount === 0) {
    await prisma.staffMember.create({
      data: {
        userId,
        workspaceId: workspace.id,
        name: "E2E cashier",
        status: StaffStatus.ACTIVE,
        roleType: StaffRoleType.CUSTOM,
        active: true,
      },
    });
    console.log("Created staff: E2E cashier");
  }

  const posProductCount = await prisma.product.count({
    where: await productListWhereForOwnerAnd(userId, {
      active: true,
      posVisible: true,
      menu: { active: true },
    }),
  });
  if (posProductCount === 0) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const end = new Date(today);
    end.setDate(end.getDate() + 14);

    const base = await menuCreateBaseForOwner(userId);
    const menu = await prisma.menu.create({
      data: {
        ...base,
        title: "E2E POS catalog",
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
        title: "E2E POS item",
        description: "Synthetic catalog row for Playwright POS checkout.",
        category: ProductCategory.OTHER,
        preparedDate: today,
        pickupDate: today,
        deliveryAvailable: false,
        active: true,
        price: 1,
        posVisible: true,
        sortOrder: 0,
      },
    });
    console.log("Created menu “E2E POS catalog” + product “E2E POS item”.");
  }

  console.log("E2E POS fixture OK for user", userId, profile.email ?? "", `workspace=${workspace.name}`);
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
