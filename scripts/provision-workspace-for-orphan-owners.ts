/**
 * Users with tenant rows but no Workspace (incomplete onboarding).
 * Creates a Workspace per orphan owner, then run SQL owner backfill.
 *
 *   npx tsx scripts/provision-workspace-for-orphan-owners.ts --dry-run
 *   npx tsx scripts/provision-workspace-for-orphan-owners.ts --execute
 */
import { PrismaClient } from "@prisma/client";

async function main() {
  const execute = process.argv.includes("--execute");
  const prisma = new PrismaClient();

  const ownerIds = new Set(
    (await prisma.workspace.findMany({ select: { ownerUserId: true } })).map((w) => w.ownerUserId),
  );

  const candidates = await prisma.kitchenSettings.findMany({
    where: { workspaceId: null },
    select: { userId: true, businessName: true },
  });

  const orphans = candidates.filter((c) => !ownerIds.has(c.userId));
  console.log(`Orphan kitchen owners (no workspace): ${orphans.length}`);

  if (!execute) {
    for (const o of orphans.slice(0, 10)) {
      console.log(`  would provision workspace for ${o.userId} (${o.businessName ?? "Kitchen"})`);
    }
    if (orphans.length > 10) console.log(`  … and ${orphans.length - 10} more`);
    await prisma.$disconnect();
    return;
  }

  let created = 0;
  for (const o of orphans) {
    const profile = await prisma.userProfile.findUnique({
      where: { id: o.userId },
      select: { email: true, companyName: true },
    });
    if (!profile) continue;

    const name =
      o.businessName?.trim() ||
      profile.companyName?.trim() ||
      profile.email.split("@")[0] ||
      "Kitchen workspace";

    await prisma.workspace.create({
      data: {
        ownerUserId: o.userId,
        name: name.slice(0, 255),
        timezone: "UTC",
        currency: "USD",
      },
    });
    created++;
  }

  console.log(`Created ${created} workspace(s). Next: npx tsx scripts/backfill-workspace-sql-owner.ts --execute --via-members`);
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
