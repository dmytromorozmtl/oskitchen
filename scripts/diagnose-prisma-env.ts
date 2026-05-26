/**
 * Diagnose env Prisma CLI will use (without printing secrets).
 *   npm run diagnose:prisma-env
 */
import { loadProductionEnvLocal } from "./lib/load-dotenv-file";
import { diagnoseDatabaseUrl } from "./lib/validate-database-url";

const shellDb = process.env.DATABASE_URL?.trim();
const shellDirect = process.env.DIRECT_URL?.trim();

delete process.env.DATABASE_URL;
delete process.env.DIRECT_URL;
const loaded = loadProductionEnvLocal();

const fileDb = process.env.DATABASE_URL?.trim() ?? "";
const fileDirect = process.env.DIRECT_URL?.trim() ?? "";

console.log("Prisma env diagnosis\n");
console.log("Loaded files:", loaded.join(", ") || "(none)");

function report(label: string, url: string | undefined) {
  const d = diagnoseDatabaseUrl(url);
  if (!url) {
    console.log(`${label}: (empty)`);
    return;
  }
  if (!d.ok) {
    console.log(`${label}: ✗ ${d.hint}`);
    return;
  }
  try {
    const u = new URL(url);
    const params = [...u.searchParams.keys()];
    console.log(`${label}: ✓ host=${u.hostname} params=[${params.join(", ") || "none"}]`);
  } catch {
    console.log(`${label}: ✗ parse failed`);
  }
}

if (shellDb && shellDb !== fileDb) {
  console.log("\n⚠ Shell DATABASE_URL differs from .env files — Prisma CLI may use poisoned shell value.");
  report("  shell DATABASE_URL", shellDb);
}
if (shellDirect && shellDirect !== fileDirect) {
  console.log("⚠ Shell DIRECT_URL differs from .env files");
  report("  shell DIRECT_URL", shellDirect);
}

console.log("\nFrom .env files (use for migrate):");
report("DATABASE_URL", fileDb);
report("DIRECT_URL", fileDirect);

if (!fileDirect) {
  console.log(
    "\n⚠ DIRECT_URL missing — prisma/schema.prisma requires it for migrations.",
  );
  console.log("  Add DIRECT_URL to .env.local (Supabase → Settings → Database → Direct connection).");
}

const dbOk = diagnoseDatabaseUrl(fileDb).ok;
const directOk = fileDirect ? diagnoseDatabaseUrl(fileDirect).ok : false;

if (!dbOk || (fileDirect && !directOk)) {
  console.log("\nFix: npm run storefront:env:sync-local");
  console.log("Never: source .env.production.local in zsh");
  process.exit(1);
}

console.log("\nOK — run: npm run prisma:migrate:safe");
