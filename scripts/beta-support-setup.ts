/**
 * Validate support channel configuration (Week 1).
 *
 *   npm run beta:support-setup
 */
import { loadBetaEnv } from "@/lib/beta-ops/load-beta-env";

function main() {
  const loaded = loadBetaEnv();
  if (loaded.length) console.log(`(env: ${loaded.join(", ")})\n`);
  const supportEmail = process.env.NEXT_PUBLIC_SUPPORT_EMAIL?.trim();
  const slack = process.env.BETA_SLACK_WEBHOOK_URL?.trim();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL?.trim();

  console.log("=== Beta support channel setup ===\n");

  let fail = false;

  if (supportEmail) {
    console.log(`OK    NEXT_PUBLIC_SUPPORT_EMAIL=${supportEmail}`);
    console.log("      → Dashboard mailto feedback / bug links enabled");
  } else {
    console.log("FAIL  NEXT_PUBLIC_SUPPORT_EMAIL unset");
    fail = true;
  }

  if (appUrl) {
    console.log(`OK    NEXT_PUBLIC_APP_URL=${appUrl}`);
  } else {
    console.log("WARN  NEXT_PUBLIC_APP_URL unset");
  }

  if (slack) {
    console.log("OK    BETA_SLACK_WEBHOOK_URL set (optional daily digest hook)");
  } else {
    console.log("INFO  BETA_SLACK_WEBHOOK_URL optional — paste Slack incoming webhook for alerts");
  }

  console.log("\nRecommended support stack for Week 1:");
  console.log("  1. Shared Slack channel #beta-pilot-<cohort>");
  console.log("  2. NEXT_PUBLIC_SUPPORT_EMAIL → team@yourdomain.com");
  console.log("  3. Book onboarding link: /book-demo");
  console.log("  4. Weekly pulse template: docs/BETA_LAUNCH_PACKAGE.md");

  if (fail) process.exit(1);
  console.log("\nSupport channel ready.");
}

main();
