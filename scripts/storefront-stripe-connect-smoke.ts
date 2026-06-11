/**
 * Stripe Connect smoke — verifies env + storefront readiness (test mode).
 * STOREFRONT_STRIPE_CONNECT=1 required for Connect path.
 */
import { config } from "dotenv";
import { resolve } from "path";

config({ path: resolve(process.cwd(), ".env.local") });
config({ path: resolve(process.cwd(), ".env") });

import { PrismaClient } from "@prisma/client";

import { isStorefrontStripeConnectEnabled } from "@/lib/storefront/storefront-stripe-connect";
import { storefrontPaymentReadiness } from "@/services/storefront/storefront-payment-service";
import { logger } from "@/lib/logger";

const SLUG = process.env.STOREFRONT_PILOT_SLUG?.trim() || "hello";
const prisma = new PrismaClient();

function flag(name: string): boolean {
  return process.env[name] === "1" || process.env[name] === "true";
}

async function main() {
  let fail = 0;
  logger.cli("=== Stripe Connect smoke ===\n");

  const connectOn = isStorefrontStripeConnectEnabled();
  logger.cli(`STOREFRONT_STRIPE_CONNECT: ${connectOn ? "ON" : "off"}`);
  if (!connectOn) {
    logger.cli("  ℹ Set STOREFRONT_STRIPE_CONNECT=1 to exercise Connect onboarding.");
  }

  const stripeKey = process.env.STRIPE_SECRET_KEY?.trim();
  if (!stripeKey) {
    console.error("✗ STRIPE_SECRET_KEY missing");
    fail++;
  } else {
    const mode = stripeKey.startsWith("sk_live") ? "live" : "test";
    logger.cli(`✓ STRIPE_SECRET_KEY (${mode})`);
  }

  if (connectOn && !process.env.STRIPE_CONNECT_CLIENT_ID?.trim()) {
    console.warn("⚠ STRIPE_CONNECT_CLIENT_ID not set — OAuth onboarding may fail");
  }

  const sf = await prisma.storefrontSettings.findFirst({ where: { storeSlug: SLUG } });
  if (!sf) {
    console.error(`✗ Storefront slug "${SLUG}" not found`);
    process.exit(1);
  }

  const pay = storefrontPaymentReadiness(sf);
  logger.cli(`\nStore: /s/${SLUG}`);
  logger.cli(`  Online payments enabled: ${sf.onlinePaymentEnabled}`);
  logger.cli(`  Stripe ready: ${pay.stripeReady} (${pay.stripeMode})`);
  if (connectOn) {
    logger.cli(`  Connect status: ${pay.connect.status} — ${pay.connect.label}`);
    if (sf.stripeConnectAccountId) {
      logger.cli(`  Connect account: ${sf.stripeConnectAccountId}`);
    }
  }

  if (flag("STOREFRONT_SERVER_CART") === false && process.env.STOREFRONT_SERVER_CART === "0") {
    logger.cli("  ℹ Server cart disabled (STOREFRONT_SERVER_CART=0)");
  }

  logger.cli("\n--- Result ---");
  if (fail > 0) {
    console.error(`FAIL (${fail} blocking issue(s))`);
    process.exit(1);
  }
  logger.cli("PASS — env OK; complete Connect onboarding in dashboard if status ≠ ready.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
