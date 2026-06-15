/**
 * Probe Supabase email link redirect (no inbox required).
 * Uses Admin generateLink — inspects redirect_to in action_link.
 *
 *   npx tsx scripts/verify-supabase-email-redirect.ts
 */
import { createClient } from "@supabase/supabase-js";

import { PRODUCTION_APP_URL } from "@/lib/auth/public-site-url";
import { loadEnvFiles } from "./lib/load-dotenv-file";

async function main() {
  loadEnvFiles([".env", ".env.local", ".env.staging.local"]);

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!url || !serviceKey) {
    console.error("Need NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local");
    process.exit(1);
  }

  const redirectTo = `${PRODUCTION_APP_URL}/auth/callback`;
  const email = `probe-${Date.now()}@kitchenos-test.com`;

  const supabase = createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data, error } = await supabase.auth.admin.generateLink({
    type: "signup",
    email,
    password: "ProbePassword123!",
    options: { redirectTo },
  });

  if (error) {
    console.error("generateLink failed:", error.message);
    process.exit(1);
  }

  const actionLink = data.properties?.action_link;
  if (!actionLink) {
    console.error("No action_link in response");
    process.exit(1);
  }

  console.log("action_link:", actionLink);

  const parsed = new URL(actionLink);
  const redirectParam = parsed.searchParams.get("redirect_to");
  console.log("redirect_to param:", redirectParam ?? "(missing)");

  const usesLocalhost =
    actionLink.includes("localhost") || redirectParam?.includes("localhost");
  const usesProduction =
    actionLink.includes("os-kitchen.com") || redirectParam?.includes("os-kitchen.com");

  if (redirectParam !== redirectTo) {
    console.warn(`WARN: expected redirect_to=${redirectTo}`);
  }

  if (usesLocalhost) {
    console.error("FAIL: link still references localhost");
    process.exit(2);
  }

  if (usesProduction) {
    console.log("PASS: production redirect present in generated link");
    return;
  }

  console.log(
    "INFO: link uses Supabase verify host (expected). Final redirect depends on Dashboard Site URL + allow list.",
  );
  console.log(`Ensure Dashboard Site URL = ${PRODUCTION_APP_URL} and allow list includes ${PRODUCTION_APP_URL}/**`);
}

void main();
