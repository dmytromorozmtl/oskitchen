/**
 * Create workspaces for kitchen owners who have tenant data but no Workspace row.
 * Run before workspace backfill when preflight shows NULL workspace_id on menus/orders
 * for users without a workspace.
 *
 *   npx tsx scripts/provision-orphan-workspaces.ts
 *   npx tsx scripts/provision-orphan-workspaces.ts --dry-run
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function assertSafeEnvironment() {
  const allowProd =
    process.argv.includes("--allow-production") || process.env.PILOT_LOCAL_ENV === "1";
  if (process.env.NODE_ENV === "production" && !allowProd) {
    console.error("Refusing on NODE_ENV=production without --allow-production or PILOT_LOCAL_ENV=1.");
    process.exit(1);
  }
}

async function main() {
  assertSafeEnvironment();
  const dryRun = process.argv.includes("--dry-run");

  const ownerIds = await prisma.$queryRaw<Array<{ user_id: string }>>`
    SELECT DISTINCT m.user_id
    FROM menus m
    WHERE m.workspace_id IS NULL
    UNION
    SELECT DISTINCT o.user_id
    FROM orders o
    WHERE o.workspace_id IS NULL
  `;

  let created = 0;
  for (const { user_id: ownerUserId } of ownerIds) {
    const existing = await prisma.workspace.findFirst({
      where: { ownerUserId },
      select: { id: true },
    });
    if (existing) continue;

    const profile = await prisma.userProfile.findUnique({
      where: { id: ownerUserId },
      select: { fullName: true, companyName: true, email: true },
    });
    const name =
      profile?.companyName?.trim() ||
      profile?.fullName?.trim() ||
      profile?.email?.split("@")[0] ||
      "Kitchen workspace";

    if (dryRun) {
      console.log(`[dry-run] would create workspace for owner ${ownerUserId} (${name})`);
      created++;
      continue;
    }

    const ws = await prisma.workspace.create({
      data: {
        name,
        ownerUserId,
        members: { create: { userId: ownerUserId, role: "OWNER" } },
      },
      select: { id: true },
    });
    console.log(`Created workspace ${ws.id} for owner ${ownerUserId}`);
    created++;
  }

  console.log(dryRun ? `Dry run: ${created} workspace(s) needed.` : `Provisioned ${created} workspace(s).`);
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
