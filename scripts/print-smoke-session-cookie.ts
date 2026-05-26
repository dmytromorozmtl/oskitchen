/**
 * Extract Cookie header for smoke:remediation from Playwright auth state.
 *
 *   E2E_LOGIN_EMAIL=... E2E_LOGIN_PASSWORD=... npx playwright test e2e/auth.setup.ts --project=setup
 *   npx tsx scripts/print-smoke-session-cookie.ts
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";

const authPath = join(process.cwd(), "e2e", ".auth", "user.json");

function main() {
  const raw = readFileSync(authPath, "utf8");
  const state = JSON.parse(raw) as {
    cookies?: Array<{ name: string; value: string; domain: string }>;
  };
  const cookies = state.cookies ?? [];
  const relevant = cookies.filter(
    (c) =>
      c.name.includes("auth") ||
      c.name.includes("supabase") ||
      c.name.startsWith("sb-"),
  );
  if (relevant.length === 0) {
    console.error("No Supabase cookies in", authPath);
    console.error("Run: npx playwright test e2e/auth.setup.ts --project=setup");
    process.exit(1);
  }
  const header = relevant.map((c) => `${c.name}=${c.value}`).join("; ");
  console.log("export SMOKE_SESSION_COOKIE='" + header.replace(/'/g, "'\\''") + "'");
}

main();
