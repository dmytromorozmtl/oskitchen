/**
 * Diagnose env Prisma CLI will use (without printing secrets).
 *   npm run diagnose:prisma-env
 */
import { loadProductionEnvLocal } from "./lib/load-dotenv-file";
import { diagnoseDatabaseUrl } from "./lib/validate-database-url";
import { logger } from "@/lib/logger";

const shellDb = process.env.DATABASE_URL?.trim();
const shellDirect = process.env.DIRECT_URL?.trim();

delete process.env.DATABASE_URL;
delete process.env.DIRECT_URL;
const loaded = loadProductionEnvLocal();

const fileDb = process.env.DATABASE_URL?.trim() ?? "";
const fileDirect = process.env.DIRECT_URL?.trim() ?? "";

logger.cli("Prisma env diagnosis\n");
logger.cli("Loaded files:", loaded.join(", ") || "(none)");

function report(label: string, url: string | undefined) {
  const d = diagnoseDatabaseUrl(url);
  if (!url) {
    logger.cli(`${label}: (empty)`);
    return;
  }
  if (!d.ok) {
    logger.cli(`${label}: ✗ ${d.hint}`);
    return;
  }
  try {
    const u = new URL(url);
    const params = [...u.searchParams.keys()];
    logger.cli(`${label}: ✓ host=${u.hostname} params=[${params.join(", ") || "none"}]`);
  } catch {
    logger.cli(`${label}: ✗ parse failed`);
  }
}

if (shellDb && shellDb !== fileDb) {
  logger.cli("\n⚠ Shell DATABASE_URL differs from .env files — Prisma CLI may use poisoned shell value.");
  report("  shell DATABASE_URL", shellDb);
}
if (shellDirect && shellDirect !== fileDirect) {
  logger.cli("⚠ Shell DIRECT_URL differs from .env files");
  report("  shell DIRECT_URL", shellDirect);
}

logger.cli("\nFrom .env files (use for migrate):");
report("DATABASE_URL", fileDb);
report("DIRECT_URL", fileDirect);

if (!fileDirect) {
  logger.cli(
    "\n⚠ DIRECT_URL missing — prisma/schema.prisma requires it for migrations.",
  );
  logger.cli("  Add DIRECT_URL to .env.local (Supabase → Settings → Database → Direct connection).");
}

const dbOk = diagnoseDatabaseUrl(fileDb).ok;
const directOk = fileDirect ? diagnoseDatabaseUrl(fileDirect).ok : false;

if (!dbOk || (fileDirect && !directOk)) {
  logger.cli("\nFix: npm run storefront:env:sync-local");
  logger.cli("Never: source .env.production.local in zsh");
  process.exit(1);
}

logger.cli("\nOK — run: npm run prisma:migrate:safe");
