/**
 * Backfill workspace_id on Phase 12 pilot models (owner workspace per userId).
 *
 *   npx tsx scripts/backfill-workspace-phase12.ts --dry-run
 *   npx tsx scripts/backfill-workspace-phase12.ts --execute
 */
import { PrismaClient } from "@prisma/client";

const BATCH = 500;
const PAUSE_MS = 100;

const TABLES: Array<{
  label: string;
  count: (p: PrismaClient, ownerUserId: string) => Promise<number>;
  backfill: (p: PrismaClient, ownerUserId: string, workspaceId: string) => Promise<number>;
}> = [
  {
    label: "catering_quotes",
    count: (p, uid) => p.cateringQuote.count({ where: { userId: uid, workspaceId: null } }),
    backfill: async (p, uid, ws) => {
      const r = await p.cateringQuote.updateMany({
        where: { userId: uid, workspaceId: null },
        data: { workspaceId: ws },
      });
      return r.count;
    },
  },
  {
    label: "api_keys",
    count: (p, uid) => p.apiKey.count({ where: { userId: uid, workspaceId: null } }),
    backfill: async (p, uid, ws) => {
      const r = await p.apiKey.updateMany({
        where: { userId: uid, workspaceId: null },
        data: { workspaceId: ws },
      });
      return r.count;
    },
  },
  {
    label: "billing_customers",
    count: (p, uid) => p.billingCustomer.count({ where: { userId: uid, workspaceId: null } }),
    backfill: async (p, uid, ws) => {
      const r = await p.billingCustomer.updateMany({
        where: { userId: uid, workspaceId: null },
        data: { workspaceId: ws },
      });
      return r.count;
    },
  },
  {
    label: "automation_rules",
    count: (p, uid) => p.automationRule.count({ where: { userId: uid, workspaceId: null } }),
    backfill: async (p, uid, ws) => {
      const r = await p.automationRule.updateMany({
        where: { userId: uid, workspaceId: null },
        data: { workspaceId: ws },
      });
      return r.count;
    },
  },
  {
    label: "cash_counts",
    count: (p, uid) => p.cashCount.count({ where: { userId: uid, workspaceId: null } }),
    backfill: async (p, uid, ws) => {
      const r = await p.cashCount.updateMany({
        where: { userId: uid, workspaceId: null },
        data: { workspaceId: ws },
      });
      return r.count;
    },
  },
  {
    label: "bank_transactions",
    count: (p, uid) => p.bankTransaction.count({ where: { userId: uid, workspaceId: null } }),
    backfill: async (p, uid, ws) => {
      const r = await p.bankTransaction.updateMany({
        where: { userId: uid, workspaceId: null },
        data: { workspaceId: ws },
      });
      return r.count;
    },
  },
  {
    label: "company_accounts",
    count: (p, uid) => p.companyAccount.count({ where: { userId: uid, workspaceId: null } }),
    backfill: async (p, uid, ws) => {
      const r = await p.companyAccount.updateMany({
        where: { userId: uid, workspaceId: null },
        data: { workspaceId: ws },
      });
      return r.count;
    },
  },
  {
    label: "commissary_transfers",
    count: (p, uid) => p.commissaryTransfer.count({ where: { userId: uid, workspaceId: null } }),
    backfill: async (p, uid, ws) => {
      const r = await p.commissaryTransfer.updateMany({
        where: { userId: uid, workspaceId: null },
        data: { workspaceId: ws },
      });
      return r.count;
    },
  },
  {
    label: "analytics_events",
    count: (p, uid) => p.analyticsEvent.count({ where: { userId: uid, workspaceId: null } }),
    backfill: async (p, uid, ws) => {
      const r = await p.analyticsEvent.updateMany({
        where: { userId: uid, workspaceId: null },
        data: { workspaceId: ws },
      });
      return r.count;
    },
  },
  {
    label: "channel_credential_audits",
    count: (p, uid) => p.channelCredentialAudit.count({ where: { userId: uid, workspaceId: null } }),
    backfill: async (p, uid, ws) => {
      const r = await p.channelCredentialAudit.updateMany({
        where: { userId: uid, workspaceId: null },
        data: { workspaceId: ws },
      });
      return r.count;
    },
  },
];

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

function assertSafeEnvironment() {
  const execute = process.argv.includes("--execute");
  if (execute && process.env.NODE_ENV === "production" && !process.argv.includes("--allow-production")) {
    console.error("Refusing production backfill without --allow-production");
    process.exit(1);
  }
}

async function main() {
  assertSafeEnvironment();
  const dryRun = !process.argv.includes("--execute");
  const prisma = new PrismaClient();

  const workspaces = await prisma.workspace.findMany({
    select: { id: true, ownerUserId: true },
  });
  console.log(`Phase 12 backfill — ${workspaces.length} workspace(s), dryRun=${dryRun}`);

  let grandTotal = 0;
  for (const ws of workspaces) {
    for (const table of TABLES) {
      const pending = await table.count(prisma, ws.ownerUserId);
      if (!pending) continue;
      if (dryRun) {
        console.log(`[dry-run] ${table.label} workspace=${ws.id} rows=${pending}`);
        continue;
      }
      const updated = await table.backfill(prisma, ws.ownerUserId, ws.id);
      grandTotal += updated;
      if (updated > 0) {
        console.log(`✓ ${table.label} workspace=${ws.id} updated=${updated}`);
      }
      await sleep(PAUSE_MS);
    }
  }

  console.log(dryRun ? "Dry run complete." : `Backfill complete. Rows updated: ${grandTotal}`);
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
