#!/usr/bin/env npx tsx
/**
 * Adds kitchen_settings.demo_expires_at when migrate deploy has not run yet.
 * Usage: npm run db:repair-kitchen-demo
 */
import { loadProductionEnvLocal } from "@/scripts/lib/load-dotenv-file";
import { prisma } from "@/lib/prisma";

loadProductionEnvLocal();

async function main() {
  await prisma.$executeRawUnsafe(`
    ALTER TABLE "kitchen_settings"
    ADD COLUMN IF NOT EXISTS "demo_expires_at" TIMESTAMPTZ;
  `);
  console.log("✅ kitchen_settings.demo_expires_at ensured");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
