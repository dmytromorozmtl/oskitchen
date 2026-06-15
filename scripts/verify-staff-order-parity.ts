/**
 * Step 5 — verify staff would see the same order universe as owner (DB parity).
 *
 *   npm run verify:staff-parity -- --owner-email=owner@pilot.com
 */
import { PrismaClient } from "@prisma/client";

import { orderListWhereForOwner } from "@/lib/scope/workspace-order-scope";
import { resolveTenantDataUserId } from "@/lib/scope/resolve-tenant-data-user-id";

const prisma = new PrismaClient();

async function main() {
  let ownerEmail = process.argv.find((a) => a.startsWith("--owner-email="))?.split("=")[1]?.trim();
  ownerEmail ||= process.env.STAGING_PILOT_OWNER_EMAIL?.trim();

  let owner: { id: string; email: string } | null = null;
  if (ownerEmail) {
    owner = await prisma.userProfile.findUnique({
      where: { email: ownerEmail },
      select: { id: true, email: true },
    });
    if (!owner) {
      console.error(`Owner not found: ${ownerEmail}`);
      process.exit(1);
    }
  } else {
    const ws = await prisma.workspace.findFirst({
      where: { orders: { some: {} } },
      orderBy: { createdAt: "asc" },
      select: {
        ownerUserId: true,
        owner: { select: { id: true, email: true } },
      },
    });
    owner = ws?.owner ?? null;
    if (!owner) {
      console.warn("WARN: No --owner-email and no workspace with orders — skipping parity check.");
      await prisma.$disconnect();
      process.exit(0);
    }
    ownerEmail = owner.email;
    console.log(`Auto-selected owner: ${ownerEmail}`);
  }

  const ws = await prisma.workspace.findFirst({
    where: { ownerUserId: owner.id },
    select: {
      id: true,
      name: true,
      members: {
        select: {
          userId: true,
          userProfile: { select: { email: true } },
        },
      },
    },
    orderBy: { createdAt: "asc" },
  });

  if (!ws) {
    console.error("No workspace for owner.");
    process.exit(1);
  }

  const ownerWhere = await orderListWhereForOwner(owner.id);
  const ownerCount = await prisma.order.count({ where: ownerWhere });

  console.log(`=== Staff order parity: ${owner.email} (${ws.name}) ===\n`);
  console.log(`Owner visible orders (workspace scope): ${ownerCount}\n`);

  const staff = ws.members.filter((m) => m.userId !== owner.id);
  if (staff.length === 0) {
    console.warn("WARN: No staff members — invite staff before step 5 sign-off.");
    await prisma.$disconnect();
    process.exit(0);
  }

  let fail = false;
  for (const m of staff) {
    const dataUserId = await resolveTenantDataUserId(m.userId);
    const staffWhere = await orderListWhereForOwner(dataUserId);
    const staffCount = await prisma.order.count({ where: staffWhere });
    const ok = dataUserId === owner.id && staffCount === ownerCount;
    if (!ok) fail = true;
    console.log(
      `${ok ? "OK" : "FAIL"}  ${m.userProfile.email}: count=${staffCount} dataUserId=${dataUserId === owner.id ? "owner" : dataUserId}`,
    );
  }

  await prisma.$disconnect();
  if (fail) {
    console.error("\nParity check FAILED.");
    process.exit(1);
  }
  console.log("\nParity check passed — staff and owner share the same order scope.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
