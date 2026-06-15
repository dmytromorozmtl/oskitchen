/**
 * WooCommerce / Shopify certification smoke (staging or local DB).
 *
 * Usage:
 *   npx tsx scripts/smoke-woo-shopify-certification.ts --help
 *   npx tsx scripts/smoke-woo-shopify-certification.ts --owner-email you@example.com
 *   npx tsx scripts/smoke-woo-shopify-certification.ts --owner-email you@example.com --provider woocommerce
 *   npx tsx scripts/smoke-woo-shopify-certification.ts --connection-id <uuid> --skip-live
 */
import { PrismaClient, IntegrationProvider } from "@prisma/client";

import {
  parseCertificationRecord,
  certificationSignOffComplete,
} from "../lib/integrations/channel-certification-types";
import {
  runChannelCertification,
  persistCertificationRecord,
} from "../services/integrations/channel-certification-runner";

const prisma = new PrismaClient();

function arg(name: string): string | undefined {
  const i = process.argv.indexOf(name);
  if (i === -1) return undefined;
  return process.argv[i + 1];
}

function hasFlag(name: string): boolean {
  return process.argv.includes(name);
}

async function main() {
  if (hasFlag("--help") || hasFlag("-h")) {
    console.log(`
Woo/Shopify certification smoke

  --owner-email <email>     Resolve workspace owner by email
  --connection-id <uuid>    Run for a specific connection
  --provider woocommerce|shopify   Filter when multiple connections
  --skip-live               Skip live REST API calls
  --sign-off-engineering    Record engineering sign-off (owner required in app)
`);
    process.exit(0);
  }

  const ownerEmail = arg("--owner-email");
  const connectionId = arg("--connection-id");
  const providerFilter = arg("--provider");
  const skipLive = hasFlag("--skip-live");

  let userId: string | undefined;
  if (ownerEmail) {
    const profile = await prisma.userProfile.findFirst({
      where: { email: ownerEmail.trim().toLowerCase() },
      select: { id: true },
    });
    if (!profile) {
      console.error("No user for email:", ownerEmail);
      process.exit(1);
    }
    userId = profile.id;
  }

  const providerEnum =
    providerFilter === "woocommerce"
      ? IntegrationProvider.WOOCOMMERCE
      : providerFilter === "shopify"
        ? IntegrationProvider.SHOPIFY
        : undefined;

  const conn = connectionId
    ? await prisma.integrationConnection.findUnique({ where: { id: connectionId } })
    : await prisma.integrationConnection.findFirst({
        where: {
          userId,
          provider: providerEnum ?? { in: [IntegrationProvider.WOOCOMMERCE, IntegrationProvider.SHOPIFY] },
        },
        orderBy: { updatedAt: "desc" },
      });

  if (!conn) {
    console.error("No Woo/Shopify connection found. Save credentials in dashboard first.");
    process.exit(1);
  }

  console.log("Connection:", conn.id, conn.provider, conn.name);
  console.log("Store:", conn.baseUrl ?? conn.shopDomain ?? "—");

  const record = await runChannelCertification(conn, { skipLiveApi: skipLive });
  await persistCertificationRecord(conn.id, record, conn.settingsJson);

  console.log("\nOverall:", record.overall);
  for (const c of record.checks) {
    console.log(`  [${c.status.toUpperCase()}] ${c.label}: ${c.message}`);
  }

  const updated = await prisma.integrationConnection.findUnique({
    where: { id: conn.id },
    select: { settingsJson: true },
  });
  const saved = parseCertificationRecord(updated?.settingsJson);
  if (saved && certificationSignOffComplete(saved.signOff)) {
    console.log("\nSign-off: PILOT_SIGNED (all three roles)");
  } else if (saved?.signOff) {
    console.log("\nSign-off partial:", JSON.stringify(saved.signOff));
  } else {
    console.log("\nSign-off: none — complete in dashboard (owner) after 7d pilot");
  }

  process.exit(record.overall === "FAIL" ? 1 : 0);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
