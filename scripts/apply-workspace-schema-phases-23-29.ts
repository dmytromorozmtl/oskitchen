/**
 * Add workspaceId to remaining user-scoped models (phases 23–29).
 * Run: npx tsx scripts/apply-workspace-schema-phases-23-29.ts && npx prisma format
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

function camelPlural(model: string): string {
  const c = model.charAt(0).toLowerCase() + model.slice(1);
  if (c.endsWith("s")) return `${c}es`;
  if (c.endsWith("y")) return `${c.slice(0, -1)}ies`;
  return `${c}s`;
}

const schemaPath = path.join(process.cwd(), "prisma/schema.prisma");
let schema = fs.readFileSync(schemaPath, "utf8");
let added = 0;

for (const model of MODELS) {
  const re = new RegExp(`model ${model} \\{[\\s\\S]*?^\\}`, "m");
  const match = schema.match(re);
  if (!match) {
    console.warn(`not found: ${model}`);
    continue;
  }
  let block = match[0];
  if (block.includes("workspaceId")) {
    console.log(`skip: ${model}`);
    continue;
  }

  const userIdRe = /^(\s+)userId\s+String/m;
  const um = block.match(userIdRe);
  if (!um) {
    console.warn(`no userId: ${model}`);
    continue;
  }
  const indent = um[1];
  const relName = `${model}Workspace`;

  block = block.replace(
    userIdRe,
    `$&\n${indent}workspaceId String?             @map("workspace_id") @db.Uuid`,
  );

  if (!block.includes("workspace   Workspace?")) {
    const idx = block.search(/\n\s+@@/);
    const line = `\n${indent}workspace   Workspace?  @relation("${relName}", fields: [workspaceId], references: [id], onDelete: SetNull)`;
    if (idx > 0) block = block.slice(0, idx) + line + block.slice(idx);
  }

  if (!block.includes("@@index([workspaceId])")) {
    block = block.replace(/(\n\s+@@index\(\[userId)/, `\n${indent}@@index([workspaceId])$1`);
  }

  schema = schema.replace(match[0], block);
  added++;
}

const wsMarker = "  packingScanEvents      PackingScanEvent[]";
const insertLines: string[] = [];
for (const model of MODELS) {
  const field = camelPlural(model);
  const line = `  ${field.padEnd(24)} ${model}[] @relation("${model}Workspace")`;
  if (!schema.includes(`${field} ${model}[]`)) insertLines.push(line);
}

if (insertLines.length && schema.includes(wsMarker)) {
  schema = schema.replace(
    `${wsMarker}\n\n  @@index([ownerUserId])`,
    `${wsMarker}\n${insertLines.join("\n")}\n\n  @@index([ownerUserId])`,
  );
}

fs.writeFileSync(schemaPath, schema);
console.log(`Patched ${added} models, ${insertLines.length} Workspace relation fields.`);
