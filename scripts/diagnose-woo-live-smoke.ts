/**
 * Safe Woo live smoke diagnostics (no secrets printed).
 * Usage: npx tsx scripts/diagnose-woo-live-smoke.ts
 */
import { IntegrationProvider, PrismaClient } from "@prisma/client";

import { testConnection } from "@/services/integrations/woocommerce";

import { loadSmokeEnv } from "./lib/load-smoke-env";
import {
  readWooCommerceLiveSmokeEnv,
  listMissingWooCommerceLiveSmokeEnvVars,
  wooStoreHostLabel,
  formatWooPingFailureDetail,
} from "./smoke-woocommerce-live";

async function main() {
  loadSmokeEnv();
const input = readWooCommerceLiveSmokeEnv();
const missing = listMissingWooCommerceLiveSmokeEnvVars(input);

console.log("Woo live smoke diagnose\n");
if (missing.length) {
  console.log("Missing env:", missing.join(", "));
  return;
}

const hasDirect = Boolean(
  input.wooBaseUrl && input.wooConsumerKey && input.wooConsumerSecret && input.connectionId,
);

if (hasDirect) {
  console.log("Credential path: direct WOOCOMMERCE_* env");
  console.log("Store host:", wooStoreHostLabel(input.wooBaseUrl!));
  const ping = await testConnection({
    baseUrl: input.wooBaseUrl!,
    consumerKey: input.wooConsumerKey!,
    consumerSecret: input.wooConsumerSecret!,
  });
  console.log("REST ping:", ping.ok ? "OK" : "FAIL", "—", ping.message);
  return;
}

console.log("Credential path: DATABASE_URL connection");
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
          console.log("Connection id:", fromDb.id);
          console.log("Store host:", wooStoreHostLabel(creds.baseUrl));
          const ping = await testConnection(creds);
          console.log(
            "REST ping:",
            ping.ok ? "OK" : "FAIL",
            "—",
            ping.ok ? ping.message : formatWooPingFailureDetail(creds.baseUrl, ping.message),
          );
        } else {
          console.log("FAIL — could not decrypt Woo credentials (ENCRYPTION_KEY?)");
        }
      } else {
        console.log("FAIL — no WOOCOMMERCE connection for owner email");
      }
    } else {
      console.log("FAIL — owner profile not found");
    }
  } else if (conn) {
    const { getWooCommerceCredentials } = await import("@/lib/integrations/decrypt-connection");
    const creds = getWooCommerceCredentials(conn);
    if (creds) {
      console.log("Connection id:", conn.id);
      console.log("Store host:", wooStoreHostLabel(creds.baseUrl));
      const ping = await testConnection(creds);
      console.log("REST ping:", ping.ok ? "OK" : "FAIL", "—", ping.message);
    } else {
      console.log("FAIL — could not decrypt Woo credentials");
    }
  } else {
    console.log("FAIL — connection not found");
  }
} finally {
  await prisma.$disconnect();
}
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
