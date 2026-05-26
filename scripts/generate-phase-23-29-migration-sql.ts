/**
 * Emit migration SQL for phase 23–29 models (workspace_id column + index + FK).
 */
import fs from "node:fs";
import path from "node:path";

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

const schema = fs.readFileSync(path.join(process.cwd(), "prisma/schema.prisma"), "utf8");

function tableForModel(model: string): string {
  const re = new RegExp(`model ${model} \\{[\\s\\S]*?@@map\\("([^"]+)"\\)`, "m");
  const m = schema.match(re);
  if (!m) throw new Error(`@@map not found for ${model}`);
  return m[1]!;
}

const lines: string[] = ["-- Phases 23–29: final user-scoped workspace_id columns\n"];

for (const model of MODELS) {
  const table = tableForModel(model);
  lines.push(`ALTER TABLE "${table}" ADD COLUMN IF NOT EXISTS "workspace_id" UUID;`);
  lines.push(
    `CREATE INDEX IF NOT EXISTS "${table}_workspace_id_idx" ON "${table}"("workspace_id");`,
  );
  lines.push(
    `DO $$ BEGIN ALTER TABLE "${table}" ADD CONSTRAINT "${table}_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE SET NULL ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $$;`,
  );
  lines.push("");
}

const outDir = path.join(process.cwd(), "prisma/migrations/20260524300000_workspace_phases_23_29_models");
fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, "migration.sql"), lines.join("\n"));
console.log(`Wrote ${MODELS.length} tables → ${outDir}/migration.sql`);
