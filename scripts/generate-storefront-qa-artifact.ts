/**
 * Full release QA artifact: env report + HTTP smoke + manual checklist.
 *
 *   STOREFRONT_SMOKE_BASE_URL=https://staging.example.com \
 *   STOREFRONT_SMOKE_SLUG=demo \
 *   STOREFRONT_STRIPE_OPTION=A \
 *   npm run storefront:qa-artifact
 */
import { spawnSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

import {
  evaluateStorefrontReleaseEnv,
  storefrontReleaseEnvSummary,
} from "@/lib/storefront/storefront-release-env";
import { formatQaArtifactMarkdown } from "@/lib/storefront/storefront-release-reports";
import { loadProductionEnvLocal } from "./lib/load-dotenv-file";
import { formatSmokeUrlError, validateSmokeBaseUrl } from "./lib/validate-smoke-base-url";
import { runStorefrontHttpSmoke, smokeSlug } from "./storefront-release-smoke";

const ROOT = process.cwd();

async function main(): Promise<void> {
  const rawBase =
    process.env.STOREFRONT_SMOKE_BASE_URL?.trim() ||
    process.env.PLAYWRIGHT_BASE_URL?.trim() ||
    "";
  const urlCheck = validateSmokeBaseUrl(rawBase);
  if (!urlCheck.ok) {
    console.error(formatSmokeUrlError(urlCheck));
    console.error("\nSee docs/artifacts/SMOKE_URL_TROUBLESHOOTING.md");
    process.exit(1);
  }
  const base = urlCheck.origin;
  const slug = smokeSlug();
  const stripeRaw = (process.env.STOREFRONT_STRIPE_OPTION ?? "A").toUpperCase();
  const stripeOption = stripeRaw === "B" ? "B" : stripeRaw === "A" ? "A" : "PENDING";

  loadProductionEnvLocal(ROOT);
  const envChecks = evaluateStorefrontReleaseEnv({
    requireStripe: stripeOption === "B",
    requireEmail: process.env.STOREFRONT_CHECK_EMAIL === "1",
  });
  const envOk = storefrontReleaseEnvSummary(envChecks).allCriticalPassed;

  const gitSha = spawnSync("git", ["rev-parse", "--short", "HEAD"], { encoding: "utf8" });
  const releaseTag = gitSha.status === 0 ? gitSha.stdout.trim() : undefined;

  console.log("Running HTTP smoke…");
  let smokeResults;
  try {
    smokeResults = await runStorefrontHttpSmoke(base, slug);
  } catch (e) {
    console.error(e instanceof Error ? e.message : e);
    process.exit(1);
  }

  const date = new Date().toISOString().slice(0, 10);
  const outPath =
    process.env.STOREFRONT_QA_OUTPUT?.trim() ||
    join(ROOT, "docs", "artifacts", `storefront-qa-release-${date}.md`);

  const smokeEnvRaw = process.env.STOREFRONT_SMOKE_ENV?.trim().toLowerCase();
  const smokeEnvironment =
    smokeEnvRaw === "production" || smokeEnvRaw === "staging"
      ? smokeEnvRaw
      : undefined;

  const doc = formatQaArtifactMarkdown({
    baseUrl: base,
    slug,
    stripeOption,
    smokeResults,
    envCriticalPass: envOk,
    releaseTag,
    smokeEnvironment,
  });

  mkdirSync(join(ROOT, "docs", "artifacts"), { recursive: true });
  writeFileSync(outPath, doc, "utf8");
  console.log(`\nWrote ${outPath}`);

  const envReport = join(ROOT, "docs", "artifacts", `storefront-env-report-${date}.md`);
  spawnSync("npm", ["run", "check-env:storefront:report"], {
    stdio: "inherit",
    env: { ...process.env, STOREFRONT_ENV_REPORT: envReport, STOREFRONT_CHECK_STRIPE: stripeOption === "B" ? "1" : "" },
    shell: true,
  });

  const failed = smokeResults.filter((r) => !r.pass);
  if (failed.length > 0) {
    console.error(`HTTP smoke: ${failed.length} check(s) failed — fix before ship.`);
    if (process.env.STOREFRONT_QA_ALLOW_FAIL !== "1") {
      process.exit(1);
    }
    console.warn("STOREFRONT_QA_ALLOW_FAIL=1 — artifact written with FAIL status.");
  }
}

void main();
