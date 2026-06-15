/**
 * Print shell-safe export lines for DATABASE_URL and DIRECT_URL (no secrets in stderr).
 */
import { loadProductionEnvLocal } from "./lib/load-dotenv-file";
import { diagnoseDatabaseUrl } from "./lib/validate-database-url";

loadProductionEnvLocal();
const db = process.env.DATABASE_URL?.trim() ?? "";
const direct = process.env.DIRECT_URL?.trim() ?? "";

const dbD = diagnoseDatabaseUrl(db);
const dirD = diagnoseDatabaseUrl(direct);

if (!dbD.ok) {
  console.error("DATABASE_URL invalid:", dbD.hint);
  process.exit(1);
}
if (!direct) {
  console.error("DIRECT_URL missing — add Supabase direct connection to .env.local");
  process.exit(1);
}
if (!dirD.ok) {
  console.error("DIRECT_URL invalid:", dirD.hint);
  process.exit(1);
}

function shEscape(s: string): string {
  return `'${s.replace(/'/g, `'\\''`)}'`;
}

console.log(`export DATABASE_URL=${shEscape(db)}`);
console.log(`export DIRECT_URL=${shEscape(direct)}`);
