/**
 * Safe Woo live smoke diagnostics (no secrets printed).
 * Usage: npx tsx scripts/diagnose-woo-live-smoke.ts
 */
import { IntegrationProvider, PrismaClient } from "@prisma/client";

import { testConnection } from "@/services/integrations/woocommerce";

import { loadSmokeEnv } from "./lib/load-smoke-env";
import {
import { logger } from "@/lib/logger";
  readWooCommerceLiveSmokeEnv,
  listMissingWooCommerceLiveSmokeEnvVars,
  wooStoreHostLabel,
  formatWooPingFailureDetail,
} from "./smoke-woocommerce-live";

async function main() {
  loadSmokeEnv();
const input = readWooCommerceLiveSmokeEnv();
const missing = listMissingWooCommerceLiveSmokeEnvVars(input);

logger.cli("Woo live smoke diagnose\n");
if (missing.length) {
  logger.cli("Missing env:", missing.join(", "));
  return;
}

const hasDirect = Boolean(
  input.wooBaseUrl && input.wooConsumerKey && input.wooConsumerSecret && input.connectionId,
);

if (hasDirect) {
  logger.cli("Credential path: direct WOOCOMMERCE_* env");
  logger.cli("Store host:", wooStoreHostLabel(input.wooBaseUrl!));
  const ping = await testConnection({
    baseUrl: input.wooBaseUrl!,
    consumerKey: input.wooConsumerKey!,
    consumerSecret: input.wooConsumerSecret!,
  });
  logger.cli("REST ping:", ping.ok ? "OK" : "FAIL", "—", ping.message);
  return;
}

logger.cli("Credential path: DATABASE_URL connection");
const prisma = new PrismaClient();
try {
  const conn = input.connectionId
    ? await prisma.integrationConnection.findUnique({ where: { id: input.connectionId } })
    : null;
  if (!conn && input.ownerEmail) {
    const profile = await prisma.userProfile.findFirst({
      where: { email: input.ownerEmail.trim().toLowerCase() },
      select: { id: true },
    });
    if (profile) {
      const fromDb = await prisma.integrationConnection.findFirst({
        where: { userId: profile.id, provider: IntegrationProvider.WOOCOMMERCE },
        orderBy: { updatedAt: "desc" },
      });
      if (fromDb) {
        const { getWooCommerceCredentials } = await import("@/lib/integrations/decrypt-connection");
        const creds = getWooCommerceCredentials(fromDb);
        if (creds) {
          logger.cli("Connection id:", fromDb.id);
          logger.cli("Store host:", wooStoreHostLabel(creds.baseUrl));
          const ping = await testConnection(creds);
          logger.cli(
            "REST ping:",
            ping.ok ? "OK" : "FAIL",
            "—",
            ping.ok ? ping.message : formatWooPingFailureDetail(creds.baseUrl, ping.message),
          );
        } else {
          logger.cli("FAIL — could not decrypt Woo credentials (ENCRYPTION_KEY?)");
        }
      } else {
        logger.cli("FAIL — no WOOCOMMERCE connection for owner email");
      }
    } else {
      logger.cli("FAIL — owner profile not found");
    }
  } else if (conn) {
    const { getWooCommerceCredentials } = await import("@/lib/integrations/decrypt-connection");
    const creds = getWooCommerceCredentials(conn);
    if (creds) {
      logger.cli("Connection id:", conn.id);
      logger.cli("Store host:", wooStoreHostLabel(creds.baseUrl));
      const ping = await testConnection(creds);
      logger.cli("REST ping:", ping.ok ? "OK" : "FAIL", "—", ping.message);
    } else {
      logger.cli("FAIL — could not decrypt Woo credentials");
    }
  } else {
    logger.cli("FAIL — connection not found");
  }
} finally {
  await prisma.$disconnect();
}
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
