/**
 * Validate DATABASE_URL before dev — catches shell-poisoned exports.
 *   npm run validate:database-env
 */
import { loadProductionEnvLocal } from "./lib/load-dotenv-file";
import { diagnoseDatabaseUrl } from "./lib/validate-database-url";

const shellUrl = process.env.DATABASE_URL?.trim() || undefined;

delete process.env.DATABASE_URL;
delete process.env.DIRECT_URL;
loadProductionEnvLocal();
const fileUrl = process.env.DATABASE_URL?.trim() || undefined;

console.log("DATABASE_URL check\n");

const fileDiag = diagnoseDatabaseUrl(fileUrl);
if (!fileDiag.ok) {
  console.error(`✗ .env files: ${fileDiag.hint}`);
  console.error("  Fix: npm run storefront:env:sync-local");
  process.exit(1);
}
console.log("✓ .env.local — DATABASE_URL valid");

if (shellUrl && shellUrl !== fileUrl) {
  const shellDiag = diagnoseDatabaseUrl(shellUrl);
  console.warn("⚠ Shell DATABASE_URL ≠ .env.local (stale export from `source .env.production.local`)");
  if (!shellDiag.ok) {
    console.error(`  Shell value invalid: ${shellDiag.hint}`);
  }
  console.error("\nFix: close terminal OR  unset DATABASE_URL DIRECT_URL  OR  npm run dev:safe");
  process.exit(1);
}

if (shellUrl && shellUrl === fileUrl) {
  console.log("✓ Shell matches .env");
}

console.log("\nOK — start dev: npm run dev:safe");
