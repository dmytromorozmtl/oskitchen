/**
 * Quick DB connectivity probe (no secrets logged).
 *   npm run check:database-connectivity
 */
import { PrismaClient } from "@prisma/client";

import { loadProductionEnvLocal } from "./lib/load-dotenv-file";
import { diagnoseDatabaseUrl } from "./lib/validate-database-url";

async function main(): Promise<void> {
  loadProductionEnvLocal();
  const url = process.env.DATABASE_URL;
  const diag = diagnoseDatabaseUrl(url);
  console.log("DATABASE_URL:", diag.ok ? "valid format" : diag.hint);
  if (!diag.ok) process.exit(1);

  let host = "";
  try {
    host = new URL(url!).hostname;
  } catch {
    /* */
  }
  console.log("Host:", host, "port 6543 (pooler)\n");

  const prisma = new PrismaClient();
  try {
    await prisma.$queryRaw`SELECT 1`;
    const jobs = await prisma.storefrontEdgeSyncJob.count();
    console.log("✓ SELECT 1 OK");
    console.log(`✓ storefrontEdgeSyncJob.count = ${jobs}`);
  } catch (e) {
    console.error("✗ Query failed:", e instanceof Error ? e.message : e);
    console.error("\nIf format is valid but query fails:");
    console.error("  • Supabase project paused? (Dashboard → Restore)");
    console.error("  • Wrong password in .env.local?");
    console.error("  • Restart dev in new terminal: npm run dev:safe");
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

void main();
