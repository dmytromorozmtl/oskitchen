/**
 * Staging / ops: verify Prisma migrations that back async webhooks + error recovery are present.
 *
 * Usage (from repo root, with DATABASE_URL pointing at staging or local):
 *   npx tsx scripts/verify-staging-webhook-readiness.ts
 *
 * Exit 1 if required public tables are missing.
 */
import { PrismaClient } from "@prisma/client";

const REQUIRED = ["webhook_processing_jobs", "error_recovery_items"] as const;

async function main() {
  const prisma = new PrismaClient();
  try {
    const rows = await prisma.$queryRaw<Array<{ tablename: string }>>`
      SELECT tablename
      FROM pg_tables
      WHERE schemaname = 'public'
        AND tablename IN ('webhook_processing_jobs', 'error_recovery_items')
    `;
    const found = new Set(rows.map((r) => r.tablename));
    const missing = REQUIRED.filter((t) => !found.has(t));
    if (missing.length > 0) {
      console.error(`Missing tables: ${missing.join(", ")} — run npm run db:deploy on this database.`);
      process.exitCode = 1;
      return;
    }
    console.log(`OK — required tables present: ${[...found].join(", ")}`);
  } finally {
    await prisma.$disconnect();
  }
}

void main();
