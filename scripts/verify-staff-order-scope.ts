/**
 * DB-level staff / owner order scope verification (post-backfill).
 *
 *   npx tsx scripts/verify-staff-order-scope.ts
 *   npx tsx scripts/verify-staff-order-scope.ts --owner-email=owner@kitchen.test
 */
import { PrismaClient } from "@prisma/client";

import { resolveTenantDataUserId } from "@/lib/scope/resolve-tenant-data-user-id";

const prisma = new PrismaClient();

async function main() {
  const ownerEmailArg = process.argv.find((a) => a.startsWith("--owner-email="))?.split("=")[1]?.trim();

  console.log("=== Staff / owner order scope verification ===\n");

  const workspaces = await prisma.workspace.findMany({
    select: {
      id: true,
      name: true,
      ownerUserId: true,
      owner: { select: { email: true, fullName: true } },
      members: { select: { userId: true, role: true, userProfile: { select: { email: true, role: true } } } },
    },
    orderBy: { createdAt: "asc" },
    take: ownerEmailArg ? 50 : 25,
  });

  const filtered = ownerEmailArg
    ? workspaces.filter((w) => w.owner.email.toLowerCase() === ownerEmailArg.toLowerCase())
    : workspaces;

  if (filtered.length === 0) {
    console.error(ownerEmailArg ? `No workspace for owner email ${ownerEmailArg}` : "No workspaces found.");
    process.exit(1);
  }

  let fail = false;

  for (const ws of filtered) {
    const nullOrders = await prisma.order.count({
      where: { userId: ws.ownerUserId, workspaceId: null },
    });
    const scopedOrders = await prisma.order.count({
      where: { workspaceId: ws.id },
    });
    const ownerOrders = await prisma.order.count({ where: { userId: ws.ownerUserId } });

    const staffMembers = ws.members.filter((m) => m.userId !== ws.ownerUserId);
    const status =
      nullOrders === 0 && scopedOrders > 0 ? "OK" : nullOrders > 0 ? "PENDING" : scopedOrders === 0 ? "EMPTY" : "OK";

    if (nullOrders > 0) fail = true;

    console.log(`${status.padEnd(8)} ${ws.name} (${ws.owner.email})`);
    console.log(`         workspace_id=${ws.id}`);
    console.log(`         orders: total=${ownerOrders} scoped=${scopedOrders} null_workspace=${nullOrders}`);

    for (const m of staffMembers) {
      const resolved = await resolveTenantDataUserId(m.userId);
      const ok = resolved === ws.ownerUserId;
      if (!ok) fail = true;
      console.log(
        `         staff ${m.userProfile.email}: dataUserId ${ok ? "→ owner OK" : `MISMATCH (got ${resolved})`}`,
      );
    }

    if (staffMembers.length === 0) {
      console.log("         staff: none — invite a staff member for manual UI test");
    }
    console.log("");
  }

  await prisma.$disconnect();

  if (fail) {
    console.error("Staff scope check FAILED — run backfill or fix workspace membership.");
    process.exit(1);
  }
  console.log("Staff scope check passed for listed workspaces.");
  console.log("\nManual UI: log in as staff → /dashboard/orders and /dashboard/order-hub must match owner counts.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
