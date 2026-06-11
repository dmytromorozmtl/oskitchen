/**
 * Validate support channel configuration (Week 1).
 *
 *   npm run beta:support-setup
 */
import { loadBetaEnv } from "@/lib/beta-ops/load-beta-env";
import { logger } from "@/lib/logger";

function main() {
  const loaded = loadBetaEnv();
  if (loaded.length) logger.cli(`(env: ${loaded.join(", ")})\n`);
  const supportEmail = process.env.NEXT_PUBLIC_SUPPORT_EMAIL?.trim();
  const slack = process.env.BETA_SLACK_WEBHOOK_URL?.trim();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL?.trim();

  logger.cli("=== Beta support channel setup ===\n");

  let fail = false;

  if (supportEmail) {
    logger.cli(`OK    NEXT_PUBLIC_SUPPORT_EMAIL=${supportEmail}`);
    logger.cli("      → Dashboard mailto feedback / bug links enabled");
  } else {
    logger.cli("FAIL  NEXT_PUBLIC_SUPPORT_EMAIL unset");
    fail = true;
  }

  if (appUrl) {
    logger.cli(`OK    NEXT_PUBLIC_APP_URL=${appUrl}`);
  } else {
    logger.cli("WARN  NEXT_PUBLIC_APP_URL unset");
  }

  if (slack) {
    logger.cli("OK    BETA_SLACK_WEBHOOK_URL set (optional daily digest hook)");
  } else {
    logger.cli("INFO  BETA_SLACK_WEBHOOK_URL optional — paste Slack incoming webhook for alerts");
  }

  logger.cli("\nRecommended support stack for Week 1:");
  logger.cli("  1. Shared Slack channel #beta-pilot-<cohort>");
  logger.cli("  2. NEXT_PUBLIC_SUPPORT_EMAIL → team@yourdomain.com");
  logger.cli("  3. Book onboarding link: /book-demo");
  logger.cli("  4. Weekly pulse template: docs/BETA_LAUNCH_PACKAGE.md");

  if (fail) process.exit(1);
  logger.cli("\nSupport channel ready.");
}

main();
