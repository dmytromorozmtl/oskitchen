#!/usr/bin/env tsx
/**
 * Verify storefront DB columns/tables match current Prisma schema expectations.
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function columnExists(table: string, column: string): Promise<boolean> {
  const rows = await prisma.$queryRawUnsafe<{ exists: boolean }[]>(
    `SELECT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = $1 AND column_name = $2
    ) AS exists`,
    table,
    column,
  );
  return Boolean(rows[0]?.exists);
}

async function tableExists(table: string): Promise<boolean> {
  const rows = await prisma.$queryRawUnsafe<{ exists: boolean }[]>(
    `SELECT EXISTS (
      SELECT 1 FROM information_schema.tables
      WHERE table_schema = 'public' AND table_name = $1
    ) AS exists`,
    table,
  );
  return Boolean(rows[0]?.exists);
}

async function main() {
  let fail = 0;

  const checks: { label: string; ok: boolean; fix?: string }[] = [];

  checks.push({
    label: "storefront_settings.is_primary",
    ok: await columnExists("storefront_settings", "is_primary"),
    fix: "npm run db:apply-storefront-phase7-core",
  });

  checks.push({
    label: "storefront_team_invites table",
    ok: await tableExists("storefront_team_invites"),
    fix: "npm run db:apply-storefront-phase6",
  });

  checks.push({
    label: "storefront_team_invite_events table",
    ok: await tableExists("storefront_team_invite_events"),
    fix: "npm run db:apply-storefront-phase7 (after phase 6)",
  });

  console.log("Storefront DB schema check\n");
  for (const c of checks) {
    if (c.ok) {
      console.log(`✓ ${c.label}`);
    } else {
      console.log(`✗ ${c.label}`);
      if (c.fix) console.log(`  Fix: ${c.fix}`);
      fail = 1;
    }
  }

  if (fail === 0) {
    console.log("\n✓ DB ready for seed and dev.");
  } else {
    console.log("\n✗ Run: npm run db:apply-storefront-phases");
  }

  await prisma.$disconnect();
  process.exit(fail);
}

main().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});
