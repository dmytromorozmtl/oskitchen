import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  PAR_LEVELS_AUTO_REORDER_P1_18_ARTIFACT,
  PAR_LEVELS_AUTO_REORDER_P1_18_CHECK_NPM_SCRIPT,
  PAR_LEVELS_AUTO_REORDER_P1_18_CI_NPM_SCRIPT,
  PAR_LEVELS_AUTO_REORDER_P1_18_CI_WORKFLOW,
  PAR_LEVELS_AUTO_REORDER_P1_18_DOC,
  PAR_LEVELS_AUTO_REORDER_P1_18_DRAFT_PO_FN,
  PAR_LEVELS_AUTO_REORDER_P1_18_FORBIDDEN_DRAFT_PO_MARKERS,
  PAR_LEVELS_AUTO_REORDER_P1_18_FORBIDDEN_SYNC_MARKERS,
  PAR_LEVELS_AUTO_REORDER_P1_18_POLICY_ID,
  PAR_LEVELS_AUTO_REORDER_P1_18_REQUIRED_BATCH_MARKERS,
  PAR_LEVELS_AUTO_REORDER_P1_18_SERVICE,
  PAR_LEVELS_AUTO_REORDER_P1_18_SYNC_FN,
  PAR_LEVELS_AUTO_REORDER_P1_18_WIRING_PATHS,
} from "@/lib/perf/par-levels-auto-reorder-p1-18-policy";

const ROOT = process.cwd();

function extractFunctionBody(source: string, fnName: string): string {
  const start = source.indexOf(`export async function ${fnName}`);
  if (start < 0) return "";
  const braceStart = source.indexOf("{", start);
  if (braceStart < 0) return "";

  let depth = 0;
  for (let i = braceStart; i < source.length; i++) {
    const ch = source[i];
    if (ch === "{") depth += 1;
    else if (ch === "}") {
      depth -= 1;
      if (depth === 0) return source.slice(braceStart, i + 1);
    }
  }
  return "";
}

describe("Par levels auto-reorder N+1 batch fix (P1-18)", () => {
  it("locks P1-18 policy id", () => {
    expect(PAR_LEVELS_AUTO_REORDER_P1_18_POLICY_ID).toBe(
      "p1-18-par-levels-auto-reorder-n1-v1",
    );
  });

  it("syncReorderQueueFromBelowParLevels uses batch findMany + createMany", () => {
    const source = readFileSync(join(ROOT, PAR_LEVELS_AUTO_REORDER_P1_18_SERVICE), "utf8");
    const syncBody = extractFunctionBody(source, PAR_LEVELS_AUTO_REORDER_P1_18_SYNC_FN);
    expect(syncBody.length).toBeGreaterThan(0);

    for (const marker of PAR_LEVELS_AUTO_REORDER_P1_18_REQUIRED_BATCH_MARKERS) {
      expect(syncBody, marker).toContain(marker);
    }
    for (const marker of PAR_LEVELS_AUTO_REORDER_P1_18_FORBIDDEN_SYNC_MARKERS) {
      expect(syncBody, marker).not.toContain(marker);
    }
  });

  it("createDraftPurchaseOrdersFromReorderQueue batches supplierItem lookups", () => {
    const source = readFileSync(join(ROOT, PAR_LEVELS_AUTO_REORDER_P1_18_SERVICE), "utf8");
    const draftBody = extractFunctionBody(source, PAR_LEVELS_AUTO_REORDER_P1_18_DRAFT_PO_FN);
    expect(draftBody.length).toBeGreaterThan(0);
    expect(draftBody).toContain("supplierItem.findMany");

    for (const marker of PAR_LEVELS_AUTO_REORDER_P1_18_FORBIDDEN_DRAFT_PO_MARKERS) {
      expect(draftBody, marker).not.toContain(marker);
    }
  });

  it("documents P1-18 and wires npm scripts + CI workflow", () => {
    for (const rel of PAR_LEVELS_AUTO_REORDER_P1_18_WIRING_PATHS) {
      if (rel.endsWith(".json")) continue;
      expect(existsSync(join(ROOT, rel))).toBe(true);
    }

    const doc = readFileSync(join(ROOT, PAR_LEVELS_AUTO_REORDER_P1_18_DOC), "utf8");
    expect(doc).toContain(PAR_LEVELS_AUTO_REORDER_P1_18_POLICY_ID);
    expect(doc).toContain("createMany");

    const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
      scripts?: Record<string, string>;
    };
    expect(pkg.scripts?.[PAR_LEVELS_AUTO_REORDER_P1_18_CHECK_NPM_SCRIPT]).toContain(
      "par-levels-auto-reorder-p1-18.test.ts",
    );
    expect(pkg.scripts?.[PAR_LEVELS_AUTO_REORDER_P1_18_CI_NPM_SCRIPT]).toContain(
      "par-levels-auto-reorder-p1-18.test.ts",
    );

    const workflow = readFileSync(join(ROOT, PAR_LEVELS_AUTO_REORDER_P1_18_CI_WORKFLOW), "utf8");
    expect(workflow).toContain("par-levels-auto-reorder-p1-18");

    const artifact = JSON.parse(
      readFileSync(join(ROOT, PAR_LEVELS_AUTO_REORDER_P1_18_ARTIFACT), "utf8"),
    ) as { policyId: string; batchFixed: boolean };
    expect(artifact.policyId).toBe(PAR_LEVELS_AUTO_REORDER_P1_18_POLICY_ID);
    expect(artifact.batchFixed).toBe(true);
  });
});
