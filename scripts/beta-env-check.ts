/**
 * Validate environment variables for a beta program step.
 *
 *   npm run beta:env-check -- --step=0
 *   npm run beta:env-check -- --all
 *   npm run beta:env-check -- --step=0 --validate   # format checks (default for --all)
 */
import { loadBetaEnv } from "@/lib/beta-ops/load-beta-env";
import { checkEnvForStep, ENV_BY_STEP } from "@/lib/beta-ops/env-requirements";
import { validateEnvKeys } from "@/lib/beta-ops/env-validate";
import type { ProgramStepId } from "@/lib/beta-ops/program-state";

const FIX_HINTS: Record<string, string> = {
  SMOKE_BASE_URL: "Staging URL in Vercel → copy to .env.beta.local",
  SMOKE_PUBLIC_API_KEY: "Settings → API keys on staging tenant",
  SMOKE_DELIVERY_CONNECTION_ID_OTHER: "UUID of another tenant's delivery connection (IDOR test)",
  E2E_LOGIN_EMAIL: "Owner account email on staging",
  E2E_LOGIN_PASSWORD: "Owner password for Playwright auth.setup",
  DATABASE_URL: "Supabase → Project Settings → Database → connection string",
  NEXT_PUBLIC_SUPPORT_EMAIL: "Team inbox for in-app mailto links",
  BETA_COHORT_EMAILS: "Comma-separated owner emails for pilot kitchens",
};

function main() {
  const loaded = loadBetaEnv();
  if (loaded.length) console.log(`Loaded: ${loaded.join(", ")}\n`);

  const all = process.argv.includes("--all");
  const validate =
    process.argv.includes("--validate") || all || process.argv.some((a) => a.startsWith("--step=0"));
  const stepRaw = process.argv.find((a) => a.startsWith("--step="))?.split("=")[1];
  const steps: ProgramStepId[] = all
    ? ([0, 1, 2, 3, 4, 5] as ProgramStepId[])
    : stepRaw != null
      ? [Number(stepRaw) as ProgramStepId]
      : [];

  if (steps.length === 0 || steps.some((s) => s < 0 || s > 5)) {
    console.error("Usage: npm run beta:env-check -- --step=0  OR  --all");
    process.exit(1);
  }

  let fail = false;
  for (const step of steps) {
    const result = checkEnvForStep(step);
    let stepFail = !result.ok;
    console.log(`=== Step ${step} env ===\n`);
    for (const r of ENV_BY_STEP[step]) {
      const val = process.env[r.key]?.trim();
      const set = Boolean(val);
      const tag = set ? "OK" : r.required ? "MISSING" : "optional";
      if (!set && r.required) {
        stepFail = true;
        console.log(`  ${tag.padEnd(8)} ${r.key} — ${r.description}`);
        if (FIX_HINTS[r.key]) console.log(`           → ${FIX_HINTS[r.key]}`);
      } else {
        console.log(`  ${tag.padEnd(8)} ${r.key} — ${r.description}`);
      }
    }

    if (validate) {
      const keys = ENV_BY_STEP[step].filter((r) => process.env[r.key]?.trim()).map((r) => r.key);
      const validations = validateEnvKeys(keys);
      if (validations.length) {
        console.log("\n  Format validation:");
        for (const v of validations) {
          console.log(`    ${v.ok ? "OK" : "FAIL"}  ${v.key}: ${v.message}`);
          if (!v.ok) {
            stepFail = true;
            if (v.hint) console.log(`         hint: ${v.hint}`);
          }
        }
      }
    }

    if (result.optionalMissing.length) {
      console.log(`\n  Optional unset: ${result.optionalMissing.join(", ")}`);
    }
    if (stepFail) fail = true;
    console.log(stepFail ? "\n  Step env: FAIL\n" : "\n  Step env: PASS\n");
  }

  if (fail) {
    console.error("Fix .env.beta.local then: npm run beta:preflight");
    process.exit(1);
  }
}

main();
