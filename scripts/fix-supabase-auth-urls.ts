/**
 * Read or patch Supabase Auth Site URL + redirect allow list (Management API).
 *
 *   npx tsx scripts/fix-supabase-auth-urls.ts --verify
 *   SUPABASE_ACCESS_TOKEN="sbp_..." npx tsx scripts/fix-supabase-auth-urls.ts --apply
 *
 * Token: https://supabase.com/dashboard/account/tokens (auth_config_read + auth_config_write).
 */
import { loadEnvFiles } from "./lib/load-dotenv-file";

const PRODUCTION_SITE = "https://os-kitchen.com";

/** Matches Release Commander checklist (19 May 2026). */
export const REDIRECT_ALLOW_LIST = [
  `${PRODUCTION_SITE}/**`,
  `${PRODUCTION_SITE}/auth/callback`,
  `${PRODUCTION_SITE}/login`,
  `${PRODUCTION_SITE}/signup`,
  `${PRODUCTION_SITE}/dashboard`,
  `${PRODUCTION_SITE}/s/**`,
  "http://localhost:3000/**",
].join(",");

function projectRefFromSupabaseUrl(url: string): string | null {
  try {
    const host = new URL(url).hostname;
    const m = host.match(/^([a-z0-9]+)\.supabase\.co$/i);
    return m?.[1] ?? null;
  } catch {
    return null;
  }
}

function parseArgs(): { verify: boolean; apply: boolean } {
  const args = process.argv.slice(2);
  return {
    verify: args.includes("--verify") || (!args.includes("--apply") && args.length === 0),
    apply: args.includes("--apply"),
  };
}

async function fetchAuthConfig(ref: string, token: string) {
  const res = await fetch(`https://api.supabase.com/v1/projects/${ref}/config/auth`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const body = await res.text();
  if (!res.ok) {
    throw new Error(`GET config/auth failed (${res.status}): ${body}`);
  }
  return JSON.parse(body) as { site_url?: string; uri_allow_list?: string };
}

function printConfig(label: string, cfg: { site_url?: string; uri_allow_list?: string }) {
  console.log(`\n=== ${label} ===`);
  console.log(`site_url: ${cfg.site_url ?? "(missing)"}`);
  console.log(`uri_allow_list:\n  ${(cfg.uri_allow_list ?? "").split(",").join("\n  ")}`);
}

function auditConfig(cfg: { site_url?: string; uri_allow_list?: string }): boolean {
  const siteOk = cfg.site_url === PRODUCTION_SITE;
  const allow = cfg.uri_allow_list ?? "";
  const hasProdWildcard = allow.includes(`${PRODUCTION_SITE}/**`);
  const hasCallback = allow.includes(`${PRODUCTION_SITE}/auth/callback`);
  const hasLocalhost = allow.includes("http://localhost:3000/**");

  console.log("\n=== Audit ===");
  console.log(`Site URL is ${PRODUCTION_SITE}: ${siteOk ? "PASS" : "FAIL"}`);
  console.log(`Redirect has ${PRODUCTION_SITE}/**: ${hasProdWildcard ? "PASS" : "FAIL"}`);
  console.log(`Redirect has /auth/callback: ${hasCallback ? "PASS" : "FAIL"}`);
  console.log(`Redirect has localhost dev: ${hasLocalhost ? "PASS" : "WARN (optional)"}`);

  return siteOk && hasProdWildcard && hasCallback;
}

async function main() {
  const { verify, apply } = parseArgs();
  loadEnvFiles([".env", ".env.local", ".env.staging.local"]);

  const token = process.env.SUPABASE_ACCESS_TOKEN?.trim();
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  if (!token) {
    console.error(
      "SUPABASE_ACCESS_TOKEN is not set.\n" +
        "  Dashboard: https://supabase.com/dashboard/project/eycxwxxyrzdhhqcnxifz/auth/url-configuration\n" +
        "  Or token: https://supabase.com/dashboard/account/tokens\n" +
        "  Then: SUPABASE_ACCESS_TOKEN=sbp_... npx tsx scripts/fix-supabase-auth-urls.ts --verify",
    );
    process.exit(1);
  }
  if (!supabaseUrl) {
    console.error("NEXT_PUBLIC_SUPABASE_URL is not set.");
    process.exit(1);
  }

  const ref = projectRefFromSupabaseUrl(supabaseUrl);
  if (!ref) {
    console.error(`Could not parse project ref from ${supabaseUrl}`);
    process.exit(1);
  }

  if (verify) {
    const current = await fetchAuthConfig(ref, token);
    printConfig(`Current auth config (project ${ref})`, current);
    const ok = auditConfig(current);
    if (!ok) {
      console.log("\nRun with --apply to patch, or update Dashboard manually.");
      process.exit(2);
    }
    console.log("\nAuth URL configuration: PASS");
    return;
  }

  if (apply) {
    const res = await fetch(`https://api.supabase.com/v1/projects/${ref}/config/auth`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        site_url: PRODUCTION_SITE,
        uri_allow_list: REDIRECT_ALLOW_LIST,
      }),
    });
    const body = await res.text();
    if (!res.ok) {
      console.error(`PATCH failed (${res.status}):`, body);
      process.exit(1);
    }

    const updated = await fetchAuthConfig(ref, token);
    printConfig(`Updated auth config (project ${ref})`, updated);
    const ok = auditConfig(updated);
    if (!ok) process.exit(1);
    console.log("\nPATCH OK — wait 60–120s before sending new confirmation emails.");
    return;
  }

  console.error("Use --verify (default) or --apply");
  process.exit(1);
}

void main();
