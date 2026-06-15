import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { AI_INVENTORY_MANAGER_ERA107_POLICY_ID } from "@/lib/ai/inventory-manager-era107-policy";
import {
  AI_INVENTORY_MANAGER_ERA182_CANONICAL_POLICY_ID,
  AI_INVENTORY_MANAGER_ERA182_CAPABILITIES,
  AI_INVENTORY_MANAGER_ERA182_POLICY_ID,
  AI_INVENTORY_MANAGER_ERA182_ROUTE,
  AI_INVENTORY_MANAGER_ERA182_SERVICE,
  AI_INVENTORY_MANAGER_ERA182_SUMMARY_ARTIFACT,
  AI_INVENTORY_MANAGER_ERA182_WIRING_PATHS,
} from "@/lib/ai/inventory-manager-era182-policy";
import {
  auditAiInventoryManagerSmokeEra182Wiring,
  buildAiInventoryManagerSmokeEra182Summary,
  resolveAiInventoryManagerSmokeEra182ProofStatus,
} from "@/lib/ai/inventory-manager-era182-smoke-summary";
import {
  AI_INVENTORY_MANAGER_POLICY_ID,
  AI_INVENTORY_MANAGER_SERVICE,
} from "@/lib/ai/inventory-manager-policy";

const ROOT = process.cwd();

describe("ai inventory manager era182", () => {
  it("locks era182 policy and artifact path", () => {
    expect(AI_INVENTORY_MANAGER_ERA182_POLICY_ID).toBe("era182-ai-inventory-manager-v1");
    expect(AI_INVENTORY_MANAGER_ERA182_SUMMARY_ARTIFACT).toBe(
      "artifacts/ai-inventory-manager-era182-smoke-summary.json",
    );
    expect(AI_INVENTORY_MANAGER_ERA182_ROUTE).toBe("/dashboard/inventory/manager");
    expect(AI_INVENTORY_MANAGER_ERA182_WIRING_PATHS).toHaveLength(5);
    expect(AI_INVENTORY_MANAGER_ERA182_CAPABILITIES).toHaveLength(4);
  });

  it("aligns era182 with canonical AI Inventory Manager policy", () => {
    expect(AI_INVENTORY_MANAGER_ERA182_CANONICAL_POLICY_ID).toBe(
      AI_INVENTORY_MANAGER_ERA107_POLICY_ID,
    );
    expect(AI_INVENTORY_MANAGER_ERA182_SERVICE).toBe(AI_INVENTORY_MANAGER_SERVICE);
    expect(AI_INVENTORY_MANAGER_SERVICE).toBe("services/ai/inventory-manager.ts");
    expect(AI_INVENTORY_MANAGER_POLICY_ID).toBe("ai-inventory-manager-v1");
  });

  it("audits in-repo AI Inventory Manager Round 2 wiring", () => {
    const audit = auditAiInventoryManagerSmokeEra182Wiring(ROOT);
    expect(audit.ok, audit.failures.join("; ")).toBe(true);
    for (const rel of AI_INVENTORY_MANAGER_ERA182_WIRING_PATHS) {
      expect(existsSync(join(ROOT, rel)), rel).toBe(true);
    }
  });

  it("includes waste, theft, shrinkage, and daily brief wiring", () => {
    const service = readFileSync(join(ROOT, AI_INVENTORY_MANAGER_ERA182_SERVICE), "utf8");
    expect(service).toContain("loadInventoryManagerSnapshot");
    expect(service).toContain("buildWasteSignals");
    expect(service).toContain("buildTheftSignals");
    expect(service).toContain("buildShrinkageSignals");

    const client = readFileSync(
      join(ROOT, "components/inventory/inventory-manager-client.tsx"),
      "utf8",
    );
    expect(client).toContain("ai-inventory-manager-daily-brief");
    expect(client).toContain("wasteSignals");
    expect(client).toContain("theftSignals");
    expect(client).toContain("shrinkageSignals");
  });

  it("marks proof_passed only when cert and wiring pass", () => {
    expect(
      resolveAiInventoryManagerSmokeEra182ProofStatus({
        wiringOk: true,
        certPassed: true,
      }),
    ).toBe("proof_passed");
    expect(
      resolveAiInventoryManagerSmokeEra182ProofStatus({
        wiringOk: false,
        certPassed: true,
      }),
    ).toBe("proof_failed_wiring");
  });

  it("builds PASSED summary when wiring and cert pass", () => {
    const summary = buildAiInventoryManagerSmokeEra182Summary({
      certPassed: true,
      root: ROOT,
    });
    expect(summary.overall).toBe("PASSED");
    expect(summary.proofStatus).toBe("proof_passed");
    expect(summary.wiringCertPassed).toBe(true);
    expect(summary.capabilities).toContain("waste");
    expect(summary.capabilities).toContain("theft");
    expect(summary.capabilities).toContain("shrinkage");
  });
});
