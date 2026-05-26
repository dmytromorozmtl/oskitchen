/**
 * Backfill workspace_id on Phase 23–29 models (70 tables).
 */
import { PrismaClient as Client } from "@prisma/client";

const PAUSE_MS = 50;

const MODELS = [
  "PackingTask",
  "PackingVerificationSession",
  "PackingWave",
  "PartnerMember",
  "PickupWindow",
  "PlatformUserRole",
  "Playbook",
  "PlaybookEvent",
  "PlaybookRun",
  "PnlSnapshot",
  "POSAuditEvent",
  "POSHeldOrder",
  "PosInventoryImpactEvent",
  "PosTab",
  "PriceScenario",
  "PrintedLabel",
  "ProductionBatch",
  "ProductionPlanTask",
  "ProductionStagePreset",
  "ProductionStation",
  "ProductionTemplate",
  "ProductionWorkItem",
  "ProductMappingEvent",
  "ProductMappingImportBatch",
  "PurchaseOrder",
  "ReferralCode",
  "ReorderQueueItem",
  "RestaurantTable",
  "SavedReport",
  "SOPAcknowledgement",
  "SOPDocument",
  "StaffAvailability",
  "StaffCertification",
  "StaffEvent",
  "StaffMember",
  "StaffRole",
  "StaffShift",
  "StorefrontAsset",
  "StorefrontCampaign",
  "StorefrontDomain",
  "StorefrontGiftCard",
  "StorefrontInventoryItem",
  "StorefrontLoyaltyProgram",
  "StorefrontMenuSchedule",
  "StorefrontOrder",
  "StorefrontPage",
  "StorefrontReservation",
  "StorefrontTheme",
  "StorefrontUpsellRule",
  "StorefrontWaitlistEntry",
  "SupplierInvoice",
  "TemperatureLog",
  "TemplateApplication",
  "TemplateApplicationEvent",
  "TimeEntry",
  "TrainingAssignment",
  "TrainingCertification",
  "TrainingEvent",
  "TrainingIncidentDrill",
  "TrainingProgram",
  "TrainingProgress",
  "TrainingQuizAttempt",
  "TrainingSimulation",
  "TrainingSimulationRun",
  "TrialState",
  "UsageCounter",
  "UserTourState",
  "WasteEvent",
  "WebhookProcessingJob",
  "WorkspaceProductCategory",
] as const;

function delegateKey(model: string): string {
  return model.charAt(0).toLowerCase() + model.slice(1);
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

async function main() {
  const execute = process.argv.includes("--execute");
  const prisma = new Client();
  const workspaces = await prisma.workspace.findMany({ select: { id: true, ownerUserId: true } });

  console.log(
    `Phases 23–29 backfill — ${workspaces.length} workspace(s) — ${execute ? "EXECUTE" : "DRY RUN"}`,
  );

  let total = 0;
  for (const ws of workspaces) {
    for (const model of MODELS) {
      const key = delegateKey(model);
      const delegate = (prisma as unknown as Record<string, { count: Function; updateMany: Function }>)[key];
      if (!delegate?.count) {
        console.warn(`skip missing delegate: ${model} (${key})`);
        continue;
      }
      const pending = await delegate.count({
        where: { userId: ws.ownerUserId, workspaceId: null },
      });
      if (!pending) continue;
      if (!execute) {
        console.log(`[dry] ${key}: ${pending}`);
        continue;
      }
      const result = await delegate.updateMany({
        where: { userId: ws.ownerUserId, workspaceId: null },
        data: { workspaceId: ws.id },
      });
      total += result.count;
      if (result.count) console.log(`✓ ${key} +${result.count}`);
      await sleep(PAUSE_MS);
    }
  }

  console.log(execute ? `Done. ${total} rows updated.` : "Dry run complete.");
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
