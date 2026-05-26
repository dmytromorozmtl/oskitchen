/**
 * Print hour-by-hour Day 1 closed-beta execution plan (steps 1–6).
 *
 *   npm run beta:day1
 */
const PLAN = [
  {
    step: 1,
    time: "15 min",
    who: "DBA / You",
    action: "DBA packet → written approve",
    commands: [
      "npm run dba:migration-review",
      "# Send docs/templates/DBA_APPROVAL_REQUEST.md to DBA",
      'npm run dba:record-signoff -- --by="DBA Name" --ticket=INFRA-123',
    ],
    gate: "docs/artifacts/DBA_SIGNOFF.json (approved: true)",
  },
  {
    step: 2,
    time: "30–60 min",
    who: "DevOps",
    action: "Staging migrate + backfill",
    commands: [
      "npm run staging:remediation-all",
      "npm run check:backfill",
      "npm run beta:launch -- --step=2",
    ],
    gate: "check:backfill → all OK",
  },
  {
    step: 3,
    time: "20 min",
    who: "DevOps",
    action: "Vercel staging env",
    commands: [
      "# Copy .env.staging.example → Vercel staging",
      "npm run setup:impersonation-totp",
      "npm run verify:staging-env -- --strict",
    ],
    gate: "verify:staging-env PASS",
  },
  {
    step: 4,
    time: "45 min",
    who: "QA",
    action: "QA bundle + Playwright",
    commands: [
      "export SMOKE_BASE_URL=https://staging...",
      "E2E_LOGIN_EMAIL=... E2E_LOGIN_PASSWORD=... npx playwright test e2e/auth.setup.ts --project=setup",
      'eval "$(npm run smoke:session-cookie --silent)"',
      "export SMOKE_DELIVERY_CONNECTION_ID_OTHER=uuid-tenant-b",
      "npm run beta:qa-bundle -- --with-playwright",
    ],
    gate: "beta:launch step 4 → 0 FAIL",
  },
  {
    step: 5,
    time: "20 min",
    who: "Product",
    action: "Staff visibility",
    commands: [
      "npm run verify:staff-scope",
      "npm run verify:staff-parity -- --owner-email=OWNER@EMAIL",
      "# Manual: docs/MANUAL_STAFF_VISIBILITY_CHECKLIST.md",
      'npm run beta:record-product-signoff -- --by="Product" --owner-email=OWNER@EMAIL',
    ],
    gate: "PRODUCT_SIGNOFF.json + manual checklist",
  },
  {
    step: 6,
    time: "1–2 h",
    who: "Founder",
    action: "Onboard 1–3 kitchens",
    commands: [
      "npm run beta:cohort -- --emails=chef1@,chef2@,chef3@",
      "npm run beta:launch -- --step=6 --emails=chef1@,chef2@,chef3@",
    ],
    gate: "3× green kitchen preflight",
  },
] as const;

function main() {
  console.log("╔══════════════════════════════════════════════════════════════╗");
  console.log("║  KitchenOS — Closed Beta Day 1 (steps 1–6)                   ║");
  console.log("╚══════════════════════════════════════════════════════════════╝\n");

  for (const row of PLAN) {
    console.log(`━━ Step ${row.step} · ${row.time} · ${row.who} ━━`);
    console.log(row.action);
    console.log("\nCommands:");
    for (const c of row.commands) console.log(`  ${c}`);
    console.log(`\nGate: ${row.gate}\n`);
  }

  console.log("Final gate (all steps):");
  console.log("  npm run beta:launch -- --with-playwright --json --html");
  console.log("\nDocs: docs/BETA_LAUNCH_DAY1.md · docs/BETA_LAUNCH_SIGNOFF.md");
}

main();
