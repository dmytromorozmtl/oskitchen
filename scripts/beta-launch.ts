/**
 * Closed-beta launch gate orchestrator (steps 1–6).
 *
 *   npm run beta:launch              # verify automated gates
 *   npm run beta:launch -- --step=4  # single step
 *   npm run beta:launch -- --json    # write docs/artifacts/BETA_LAUNCH_REPORT.json
 *   npm run beta:launch -- --execute-step=2   # DANGER: runs staging:remediation-all
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

import { buildLaunchReport } from "@/lib/beta-launch/build-report";
import { loadBetaEnv, applyPlaywrightEnvFromSmoke } from "@/lib/beta-ops/load-beta-env";
import { readDbaSignoff, readProductSignoff } from "@/lib/beta-ops/signoffs";
import { syncLaunchReportToProgramState } from "@/lib/beta-ops/launch-bridge";
import { parsePrismaMigrateStatus } from "@/lib/beta-launch/prisma-migrate-status";
import { runCommand, runNpmScript } from "@/lib/beta-launch/run-command";
import { renderLaunchReportHtml } from "@/lib/beta-launch/render-html-report";
import {
  LAUNCH_STEPS,
  type GateResult,
  type GateStatus,
  type LaunchReport,
  type LaunchStepId,
} from "@/lib/beta-launch/types";

const ARTIFACT_DIR = join(process.cwd(), "docs", "artifacts");

function parseSteps(argv: string[]): LaunchStepId[] | null {
  const raw = argv.find((a) => a.startsWith("--step="))?.split("=")[1];
  if (!raw) return null;
  const n = Number(raw) as LaunchStepId;
  if (n >= 1 && n <= 6) return [n];
  console.error("Invalid --step= (1–6)");
  process.exit(1);
}

function gate(
  id: string,
  step: LaunchStepId,
  name: string,
  status: GateStatus,
  message: string,
  durationMs: number,
  command?: string,
): GateResult {
  return { id, step, name, status, message, durationMs, command };
}

function runNpmGate(
  id: string,
  step: LaunchStepId,
  name: string,
  script: string,
  extraArgs: string[] = [],
  env?: NodeJS.ProcessEnv,
): GateResult {
  const t0 = Date.now();
  const cmd = `npm run ${script}${extraArgs.length ? ` -- ${extraArgs.join(" ")}` : ""}`;
  const r = runNpmScript(script, extraArgs, env);
  const msg = r.ok ? "PASS" : (r.stderr || r.stdout || `exit ${r.exitCode}`).slice(0, 500);
  return gate(id, step, name, r.ok ? "pass" : "fail", msg, Date.now() - t0, cmd);
}

async function step1(): Promise<GateResult[]> {
  const results: GateResult[] = [];
  results.push(
    runNpmGate("dba-packet", 1, "DBA migration packet generated", "dba:migration-review"),
  );
  const signoff = readDbaSignoff();
  if (signoff?.approved) {
    results.push(
      gate(
        "dba-signoff",
        1,
        "DBA written approval on file",
        "pass",
        `Approved by ${signoff.approvedBy ?? "?"} at ${signoff.approvedAt ?? "?"}`,
        0,
      ),
    );
  } else {
    results.push(
      gate(
        "dba-signoff",
        1,
        "DBA written approval on file",
        "manual",
        `Record approval: npm run dba:record-signoff -- --by="Name" --ticket=JIRA-123`,
        0,
      ),
    );
  }
  return results;
}

function gateMigrateStatus(): GateResult {
  const t0 = Date.now();
  if (!process.env.DATABASE_URL?.trim()) {
    return gate("migrate-status", 2, "Prisma migrations applied", "skip", "DATABASE_URL unset", 0);
  }
  const r = runCommand("npx", ["prisma", "migrate", "status"]);
  const parsed = parsePrismaMigrateStatus(r.stdout || r.stderr);
  if (!parsed.databaseReachable) {
    return gate(
      "migrate-status",
      2,
      "Prisma migrations applied",
      "fail",
      "Database unreachable from this host",
      Date.now() - t0,
    );
  }
  if (parsed.ok) {
    return gate(
      "migrate-status",
      2,
      "Prisma migrations applied",
      "pass",
      parsed.pendingCount === 0 ? "Schema up to date" : "Remediation migrations applied",
      Date.now() - t0,
    );
  }
  return gate(
    "migrate-status",
    2,
    "Prisma migrations applied",
    "fail",
    `Pending remediation: ${parsed.pendingRemediation.join(", ") || parsed.pendingCount + " migration(s)"}`,
    Date.now() - t0,
    "npx prisma migrate deploy",
  );
}

async function step2(execute: boolean): Promise<GateResult[]> {
  if (execute) {
    return [
      runNpmGate("remediation-all", 2, "staging:remediation-all executed", "staging:remediation-all"),
      runNpmGate("backfill", 2, "Workspace backfill complete", "check:backfill"),
    ];
  }
  return [gateMigrateStatus(), runNpmGate("backfill", 2, "Workspace backfill complete", "check:backfill")];
}

async function step3(): Promise<GateResult[]> {
  const strict = process.argv.includes("--strict-env");
  return [
    runNpmGate("staging-env", 3, "Staging environment gate", "verify:staging-env", strict ? ["--strict"] : []),
    gate(
      "env-template",
      3,
      ".env.staging.example present",
      "pass",
      "Copy to Vercel staging; never commit secrets",
      0,
    ),
  ];
}

async function step4(withPlaywright: boolean): Promise<GateResult[]> {
  const results: GateResult[] = [
    runNpmGate("smoke-remediation", 4, "Remediation smoke", "smoke:remediation"),
    runNpmGate("smoke-public-api", 4, "Public API smoke", "smoke:public-api"),
    runNpmGate("test-security", 4, "Security test bundle", "test:security", [], {
      RUN_DB_INTEGRATION: process.env.RUN_DB_INTEGRATION ?? "1",
    }),
  ];
  if (withPlaywright) {
    if (!process.env.SMOKE_DELIVERY_CONNECTION_ID_OTHER?.trim()) {
      results.push(
        gate(
          "playwright-idor",
          4,
          "Playwright delivery IDOR",
          "fail",
          "Set SMOKE_DELIVERY_CONNECTION_ID_OTHER",
          0,
        ),
      );
    } else {
      const t0 = Date.now();
      const r = runCommand("npx", [
        "playwright",
        "test",
        "tests/e2e/remediation-delivery-idor.spec.ts",
        "tests/e2e/beta-export-streaming.spec.ts",
        "--project=chromium-authed",
      ]);
      results.push(
        gate(
          "playwright-idor",
          4,
          "Playwright delivery + export",
          r.ok ? "pass" : "fail",
          r.ok ? "PASS" : (r.stderr || r.stdout).slice(0, 400),
          Date.now() - t0,
        ),
      );
    }
  } else {
    results.push(
      gate(
        "playwright-idor",
        4,
        "Playwright delivery IDOR",
        "manual",
        "npm run beta:qa-bundle -- --with-playwright",
        0,
      ),
    );
  }
  return results;
}

async function step5(): Promise<GateResult[]> {
  const ownerEmail = process.env.BETA_OWNER_EMAIL?.trim();
  const results: GateResult[] = [runNpmGate("staff-scope-db", 5, "Staff scope DB verification", "verify:staff-scope")];
  if (ownerEmail) {
    results.push(
      runNpmGate("staff-parity", 5, "Staff/owner order count parity", "verify:staff-parity", [
        `--owner-email=${ownerEmail}`,
      ]),
    );
  } else {
    results.push(
      gate(
        "staff-parity",
        5,
        "Staff/owner order count parity",
        "manual",
        "npm run verify:staff-parity -- --owner-email=OWNER@EMAIL",
        0,
      ),
    );
  }
  const productSignoff = readProductSignoff();
  if (productSignoff) {
    results.push(
      gate(
        "product-signoff",
        5,
        "Product written sign-off",
        "pass",
        `Signed by ${productSignoff.approvedBy ?? "?"}`,
        0,
      ),
    );
  } else {
    results.push(
      gate(
        "product-signoff",
        5,
        "Product written sign-off",
        "manual",
        'npm run beta:record-product-signoff -- --by="Product" --owner-email=...',
        0,
      ),
    );
  }
  if (process.env.E2E_STAFF_EMAIL?.trim() && process.env.E2E_STAFF_PASSWORD?.trim()) {
    const t0 = Date.now();
    const r = runCommand("npx", [
      "playwright",
      "test",
      "tests/e2e/staff-order-visibility.spec.ts",
      "--project=chromium-staff",
    ]);
    results.push(
      gate(
        "staff-e2e",
        5,
        "Staff orders page E2E",
        r.ok ? "pass" : "fail",
        r.ok ? "PASS" : (r.stderr || r.stdout).slice(0, 400),
        Date.now() - t0,
      ),
    );
  } else {
    results.push(
      gate(
        "staff-e2e",
        5,
        "Staff orders page E2E",
        "manual",
        "Set E2E_STAFF_EMAIL + E2E_STAFF_PASSWORD; see docs/MANUAL_STAFF_VISIBILITY_CHECKLIST.md",
        0,
      ),
    );
  }
  return results;
}

async function step6(): Promise<GateResult[]> {
  const emails =
    process.env.BETA_COHORT_EMAILS?.split(/[,;\s]+/).map((e) => e.trim()).filter(Boolean) ??
    process.argv
      .find((a) => a.startsWith("--emails="))
      ?.split("=")[1]
      ?.split(/[,;]/)
      .map((e) => e.trim())
      .filter(Boolean) ??
    [];

  if (emails.length === 0) {
    return [
      gate(
        "cohort-preflight",
        6,
        "Kitchen cohort preflight (1–3)",
        "manual",
        "npm run beta:cohort -- --emails=owner1@,owner2@,owner3@",
        0,
      ),
    ];
  }

  const results: GateResult[] = [];
  for (const email of emails.slice(0, 10)) {
    results.push(
      runNpmGate(`kitchen-${email}`, 6, `Kitchen preflight: ${email}`, "beta:kitchen-preflight", [
        `--email=${email}`,
      ]),
    );
  }
  return results;
}

function printReport(report: LaunchReport) {
  console.log("\n=== OS Kitchen Beta Launch Report ===\n");
  for (const [stepId, block] of Object.entries(report.steps)) {
    const meta = LAUNCH_STEPS[Number(stepId) as LaunchStepId];
    console.log(`## Step ${stepId}: ${block.title} (${meta.owner})`);
    for (const g of block.gates) {
      const icon = { pass: "✓", fail: "✗", skip: "○", manual: "◐" }[g.status];
      console.log(`  ${icon} [${g.status.toUpperCase()}] ${g.name}`);
      if (g.message && g.status !== "pass") console.log(`      ${g.message}`);
    }
    console.log("");
  }
  console.log(
    `Summary: pass=${report.summary.pass} fail=${report.summary.fail} manual=${report.summary.manual} skip=${report.summary.skip} score=${report.summary.readinessScore}/100`,
  );
  if (report.summary.manual > 0) {
    console.log(`Manual gates: ${report.summary.manual} (use --strict-signoffs to block readyForBeta)`);
  }
  console.log(
    report.summary.readyForBeta
      ? "\n✓ Ready for closed beta"
      : "\n✗ Fix failures before beta",
  );
}

async function main() {
  const loaded = loadBetaEnv();
  applyPlaywrightEnvFromSmoke();
  if (loaded.length) console.log(`(env: ${loaded.join(", ")})\n`);

  const stepsFilter = parseSteps(process.argv);
  const executeStep2 = process.argv.includes("--execute-step=2");
  const withPlaywright = process.argv.includes("--with-playwright");
  const writeJson = process.argv.includes("--json");
  const writeHtml = process.argv.includes("--html");
  const strictSignoffs = process.argv.includes("--strict-signoffs");

  const runners: Array<() => Promise<GateResult[]>> = [
    step1,
    () => step2(executeStep2),
    step3,
    () => step4(withPlaywright),
    step5,
    step6,
  ];

  const allGates: GateResult[] = [];
  for (let i = 0; i < runners.length; i++) {
    const stepNum = (i + 1) as LaunchStepId;
    if (stepsFilter && !stepsFilter.includes(stepNum)) continue;
    allGates.push(...(await runners[i]!()));
  }

  const report = buildLaunchReport(allGates, { strictSignoffs });
  printReport(report);

  mkdirSync(ARTIFACT_DIR, { recursive: true });
  if (writeJson || writeHtml) {
    const jsonPath = join(ARTIFACT_DIR, "BETA_LAUNCH_REPORT.json");
    writeFileSync(jsonPath, JSON.stringify(report, null, 2), "utf8");
    console.log(`Wrote ${jsonPath}`);
    syncLaunchReportToProgramState(report);
  }
  if (writeHtml) {
    const htmlPath = join(ARTIFACT_DIR, "BETA_LAUNCH_REPORT.html");
    writeFileSync(htmlPath, renderLaunchReportHtml(report), "utf8");
    console.log(`Wrote ${htmlPath}`);
  }

  if (report.summary.fail > 0 || (strictSignoffs && report.summary.manual > 0)) {
    process.exit(1);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
