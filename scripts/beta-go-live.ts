/**
 * Mark pilot kitchen(s) LIVE after green preflight (post-launch phase 1).
 *
 *   npm run beta:go-live -- --emails=chef1@,chef2@,chef3@
 *   npm run beta:go-live -- --registry   # use BETA_COHORT_REGISTRY.json
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

import {
  createRegistry,
  DEFAULT_REGISTRY_PATH,
  loadCohortRegistry,
  saveCohortRegistry,
  upsertKitchen,
} from "@/lib/beta-ops/cohort-registry";
import { resolveCohortEmails } from "@/lib/beta-ops/cohort-emails";
import { checkEnvForStep } from "@/lib/beta-ops/env-requirements";
import { guardStep } from "@/lib/beta-ops/step-guards";
import { renderExecutiveSummary } from "@/lib/beta-ops/executive-summary";
import { loadBetaEnv } from "@/lib/beta-ops/load-beta-env";
import { loadProgramState, markStep, saveProgramState } from "@/lib/beta-ops/program-state";
import { runKitchenPreflight } from "@/services/beta-ops/kitchen-preflight-service";

async function main() {
  loadBetaEnv();
  const env = checkEnvForStep(1);
  if (!env.ok) {
    for (const key of env.missing) console.error(`MISSING ${key}`);
    console.error("\nFix: npm run beta:env-check -- --step=1");
    process.exit(1);
  }

  const stateBefore = loadProgramState();
  const guard = guardStep(1, stateBefore);
  for (const w of guard.warnings) console.warn(`WARN ${w}`);
  if (!guard.ok) {
    for (const b of guard.blockers) console.error(`BLOCK ${b}`);
    console.error("\nRun: npm run beta:preflight -- --step=1");
    process.exit(1);
  }

  const useRegistry = process.argv.includes("--registry");
  const resolved = useRegistry
    ? { emails: loadCohortRegistry()?.kitchens.map((k) => k.email) ?? [], source: "registry" as const }
    : resolveCohortEmails();
  const emails = resolved.emails;

  if (emails.length === 0) {
    console.error("Usage: npm run beta:go-live -- --emails=a@,b@ OR --registry");
    process.exit(1);
  }
  console.log(`Cohort source: ${resolved.source} (${emails.length} kitchen(s))\n`);

  let registry = loadCohortRegistry() ?? createRegistry(emails);
  const now = new Date().toISOString();
  const onboarding: Array<{ email: string; ready: boolean; businessName: string | null }> = [];

  console.log("=== Guided closed beta — go live ===\n");

  let fail = 0;
  for (const email of emails) {
    const result = await runKitchenPreflight(email);
    if (!result) {
      console.log(`FAIL  ${email} — user not found`);
      fail++;
      continue;
    }
    if (!result.ready) {
      console.log(`FAIL  ${email} — preflight not green`);
      if (result.gates.some((g) => g.label === "Demo mode off" && !g.ok)) {
        console.log(`      hint: npm run tenant:demo:reset -- --email=${email}`);
      }
      fail++;
      upsertKitchen(registry, {
        email,
        status: "pending",
        lastPreflightAt: now,
        lastPreflightOk: false,
        businessName: result.businessName ?? undefined,
      });
      continue;
    }

    upsertKitchen(registry, {
      email,
      status: "live",
      goLiveAt: now,
      lastPreflightAt: now,
      lastPreflightOk: true,
      businessName: result.businessName ?? undefined,
    });
    onboarding.push({ email, ready: true, businessName: result.businessName });
    console.log(`LIVE  ${email} — ${result.businessName ?? result.workspaceName ?? "kitchen"}`);
  }

  saveCohortRegistry(registry);

  const pack = {
    generatedAt: now,
    kitchens: onboarding,
    checklist: [
      "15-min onboarding call (docs/BETA_LAUNCH_PACKAGE.md)",
      "Staff invite sent",
      "First channel webhook verified",
      "Support channel shared with kitchen",
      "Schedule week-1 check-in",
    ],
  };
  const outDir = join(process.cwd(), "docs", "artifacts");
  mkdirSync(outDir, { recursive: true });
  writeFileSync(join(outDir, "BETA_GO_LIVE_PACK.json"), JSON.stringify(pack, null, 2), "utf8");
  console.log(`\nWrote docs/artifacts/BETA_GO_LIVE_PACK.json`);
  console.log(`Registry: ${DEFAULT_REGISTRY_PATH}`);

  const state = loadProgramState();
  markStep(state, 1, {
    ok: fail === 0,
    notes: `${onboarding.length} kitchens live`,
    artifact: DEFAULT_REGISTRY_PATH,
  });
  saveProgramState(state);
  writeFileSync(
    join(outDir, "BETA_EXECUTIVE_SUMMARY.md"),
    renderExecutiveSummary(state),
    "utf8",
  );

  if (fail > 0) {
    console.error(`\n${fail} kitchen(s) could not go live.`);
    process.exit(1);
  }
  console.log("\nAll kitchens marked LIVE. Start Week 1: npm run beta:daily-ops");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
