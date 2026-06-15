import { hasCohortEmails } from "@/lib/beta-ops/cohort-emails";
import type { ProgramStepId } from "@/lib/beta-ops/program-state";

export type EnvRequirement = {
  key: string;
  required: boolean;
  description: string;
};

const COMMON_DB: EnvRequirement[] = [
  { key: "DATABASE_URL", required: true, description: "Staging DB for backfill/migrate checks" },
];

export const ENV_BY_STEP: Record<ProgramStepId, EnvRequirement[]> = {
  0: [
    { key: "SMOKE_BASE_URL", required: true, description: "Staging app URL" },
    { key: "SMOKE_PUBLIC_API_KEY", required: true, description: "Public API key for smoke" },
    { key: "SMOKE_DELIVERY_CONNECTION_ID_OTHER", required: true, description: "Tenant B UUID for IDOR test" },
    { key: "E2E_LOGIN_EMAIL", required: true, description: "Owner login for Playwright" },
    { key: "E2E_LOGIN_PASSWORD", required: true, description: "Owner password" },
    ...COMMON_DB,
    { key: "E2E_STAFF_EMAIL", required: false, description: "Staff E2E (step 5 in launch)" },
    { key: "E2E_STAFF_PASSWORD", required: false, description: "Staff password" },
    { key: "SMOKE_DELIVERY_CONNECTION_ID", required: false, description: "Own tenant connection" },
    { key: "CRON_SECRET", required: false, description: "Experimental cron smoke" },
  ],
  1: [
    ...COMMON_DB,
    {
      key: "BETA_COHORT_EMAILS",
      required: false,
      description: "Comma-separated owner emails (or --emails= / BETA_COHORT_REGISTRY.json)",
    },
  ],
  2: [
    ...COMMON_DB,
    { key: "BETA_COHORT_EMAILS", required: false, description: "Or use BETA_COHORT_REGISTRY.json" },
    { key: "NEXT_PUBLIC_SUPPORT_EMAIL", required: true, description: "In-app support mailto" },
    { key: "BETA_SLACK_WEBHOOK_URL", required: false, description: "Slack daily digest" },
  ],
  3: [...COMMON_DB],
  4: [...COMMON_DB],
  5: [
    ...COMMON_DB,
    { key: "BETA_OWNER_EMAIL", required: false, description: "Staff parity check target" },
  ],
};

export type EnvCheckResult = {
  step: ProgramStepId;
  ok: boolean;
  missing: string[];
  optionalMissing: string[];
};

export function checkEnvForStep(step: ProgramStepId, argv = process.argv): EnvCheckResult {
  const reqs = ENV_BY_STEP[step];
  const missing: string[] = [];
  const optionalMissing: string[] = [];
  for (const r of reqs) {
    const set = Boolean(process.env[r.key]?.trim());
    if (!set) {
      if (r.required) missing.push(r.key);
      else optionalMissing.push(r.key);
    }
  }

  if (step === 1 && !hasCohortEmails(argv)) {
    missing.push("BETA_COHORT_EMAILS|--emails|BETA_COHORT_REGISTRY.json");
  }

  return { step, ok: missing.length === 0, missing, optionalMissing };
}
