import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";

import { loadPrismaSchema, parseModelsFromSchema } from "./prisma-workspace-audit";

export const PRISMA_UNUSED_MODELS_ARTIFACT = "artifacts/prisma-unused-models.json" as const;

export const PRISMA_UNUSED_MODELS_POLICY_ID = "prisma-unused-models-v1" as const;

const RUNTIME_ROOTS = ["app", "services", "actions", "lib"] as const;
const SCRIPT_ROOTS = ["scripts", "prisma"] as const;
const TEST_ROOTS = ["tests", "e2e"] as const;

export type ModelUsageCounts = {
  runtime: number;
  scripts: number;
  tests: number;
};

export type UnusedModelRow = {
  model: string;
  clientAccessor: string;
  domain: string;
  usage: ModelUsageCounts;
  tier: "A_orphan" | "C_low_traffic" | "active";
  recommendedAction: string;
};

export type PrismaUnusedModelsReport = {
  version: typeof PRISMA_UNUSED_MODELS_POLICY_ID;
  generatedAt: string;
  policy: string;
  scanRoots: {
    runtime: readonly string[];
    scripts: readonly string[];
    tests: readonly string[];
  };
  schema: {
    totalModels: number;
  };
  summary: {
    zeroRuntimeReferences: number;
    lowRuntimeReferences: number;
    activeModels: number;
  };
  tierA_orphan: UnusedModelRow[];
  tierC_lowTraffic: UnusedModelRow[];
  dropCandidates: {
    phase1_review: string[];
    phase2_storefront_signoff: string[];
  };
  overall: "PASS" | "ATTENTION";
};

function modelToClientAccessor(model: string): string {
  return model.charAt(0).toLowerCase() + model.slice(1);
}

function inferDomain(model: string): string {
  if (model.startsWith("Storefront")) return "Storefront";
  if (model.startsWith("Marketplace")) return "Marketplace";
  if (model.startsWith("Vendor")) return "Marketplace";
  if (model.startsWith("Kitchen")) return "Kitchen";
  if (model.startsWith("Automation")) return "Automation";
  if (model.startsWith("Integration") || model.startsWith("Webhook")) return "Integrations";
  if (model.startsWith("Cron")) return "Cron";
  if (model.startsWith("Customer") || model.startsWith("CRM")) return "CRM";
  if (model.startsWith("Production") || model.startsWith("Ingredient")) return "Production";
  if (model.startsWith("Implementation")) return "Implementation";
  if (model.startsWith("FloorPlan")) return "Floor plan";
  if (model.startsWith("Training")) return "Training";
  if (model.startsWith("Support")) return "Support";
  if (model.startsWith("Partner")) return "Partner";
  if (model.startsWith("Channel")) return "Channels";
  if (model.startsWith("Import") || model.startsWith("Staged") || model.startsWith("DataTemplate"))
    return "Import";
  return "Other";
}

function walkFiles(root: string, dir: string, out: string[] = []): string[] {
  const full = join(root, dir);
  let entries: string[];
  try {
    entries = readdirSync(full);
  } catch {
    return out;
  }
  for (const entry of entries) {
    const path = join(full, entry);
    const stat = statSync(path);
    if (stat.isDirectory()) {
      if (entry === "node_modules" || entry === ".next") continue;
      walkFiles(root, relative(root, path), out);
      continue;
    }
    if (/\.(ts|tsx|js|jsx)$/.test(entry)) {
      out.push(path);
    }
  }
  return out;
}

function countAccessorHits(source: string, accessor: string): number {
  const patterns = [
    new RegExp(`\\bprisma\\.${accessor}\\.`, "g"),
    new RegExp(`\\bprisma\\.${accessor}\\(`, "g"),
    new RegExp(`\\btx\\.${accessor}\\.`, "g"),
    new RegExp(`\\bdb\\.${accessor}\\.`, "g"),
  ];
  let total = 0;
  for (const pattern of patterns) {
    total += source.match(pattern)?.length ?? 0;
  }
  return total;
}

function countUsageInRoots(root: string, dirs: readonly string[], accessor: string): number {
  let total = 0;
  for (const dir of dirs) {
    for (const file of walkFiles(root, dir)) {
      total += countAccessorHits(readFileSync(file, "utf8"), accessor);
    }
  }
  return total;
}

function recommendedAction(row: UnusedModelRow): string {
  if (row.usage.runtime > 0) return "keep";
  if (row.domain === "Storefront") return "deprecate_after_storefront_audit_signoff";
  if (row.domain === "Floor plan" || row.domain === "Implementation") return "wire_ui_or_hide_nav";
  if (row.usage.scripts > 0 || row.usage.tests > 0) return "review_seed_or_test_only";
  return "deprecate_candidate";
}

export function buildPrismaUnusedModelsReport(root = process.cwd()): PrismaUnusedModelsReport {
  const schema = loadPrismaSchema(join(root, "prisma/schema.prisma"));
  const models = parseModelsFromSchema(schema).map((m) => m.model);

  const rows: UnusedModelRow[] = models.map((model) => {
    const clientAccessor = modelToClientAccessor(model);
    const usage: ModelUsageCounts = {
      runtime: countUsageInRoots(root, RUNTIME_ROOTS, clientAccessor),
      scripts: countUsageInRoots(root, SCRIPT_ROOTS, clientAccessor),
      tests: countUsageInRoots(root, TEST_ROOTS, clientAccessor),
    };

    let tier: UnusedModelRow["tier"] = "active";
    if (usage.runtime === 0) tier = "A_orphan";
    else if (usage.runtime <= 2) tier = "C_low_traffic";

    const row: UnusedModelRow = {
      model,
      clientAccessor,
      domain: inferDomain(model),
      usage,
      tier,
      recommendedAction: "keep",
    };
    row.recommendedAction = recommendedAction(row);
    return row;
  });

  const tierA = rows.filter((r) => r.tier === "A_orphan").sort((a, b) => a.model.localeCompare(b.model));
  const tierC = rows.filter((r) => r.tier === "C_low_traffic").sort((a, b) => a.model.localeCompare(b.model));

  const phase1 = tierA
    .filter((r) => r.usage.scripts === 0 && r.usage.tests === 0)
    .map((r) => r.model);
  const phase2Storefront = tierA
    .filter((r) => r.domain === "Storefront")
    .map((r) => r.model);

  return {
    version: PRISMA_UNUSED_MODELS_POLICY_ID,
    generatedAt: new Date().toISOString(),
    policy:
      "Tier A = zero prisma.* accessor hits in app/services/actions/lib. Do not DROP without raw SQL + nav review.",
    scanRoots: {
      runtime: RUNTIME_ROOTS,
      scripts: SCRIPT_ROOTS,
      tests: TEST_ROOTS,
    },
    schema: {
      totalModels: models.length,
    },
    summary: {
      zeroRuntimeReferences: tierA.length,
      lowRuntimeReferences: tierC.length,
      activeModels: rows.length - tierA.length - tierC.length,
    },
    tierA_orphan: tierA,
    tierC_lowTraffic: tierC,
    dropCandidates: {
      phase1_review: phase1,
      phase2_storefront_signoff: phase2Storefront,
    },
    overall: tierA.length > 0 ? "ATTENTION" : "PASS",
  };
}
