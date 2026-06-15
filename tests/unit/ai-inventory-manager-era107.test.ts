import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  AI_INVENTORY_MANAGER_ERA107_CANONICAL_POLICY_ID,
  AI_INVENTORY_MANAGER_ERA107_CAPABILITIES,
  AI_INVENTORY_MANAGER_ERA107_POLICY_ID,
  AI_INVENTORY_MANAGER_ERA107_ROUTE,
  AI_INVENTORY_MANAGER_ERA107_SERVICE,
  AI_INVENTORY_MANAGER_ERA107_SUMMARY_ARTIFACT,
  AI_INVENTORY_MANAGER_ERA107_WIRING_PATHS,
} from "@/lib/ai/inventory-manager-era107-policy";
import {
  auditAiInventoryManagerSmokeWiring,
  buildAiInventoryManagerSmokeEra107Summary,
  resolveAiInventoryManagerSmokeEra107ProofStatus,
} from "@/lib/ai/inventory-manager-smoke-summary";
import {
  AI_INVENTORY_MANAGER_POLICY_ID,
  AI_INVENTORY_MANAGER_SERVICE,
} from "@/lib/ai/inventory-manager-policy";

const ROOT = process.cwd();

describe("ai inventory manager era107", () => {
  it("locks era107 policy and artifact path", () => {
    expect(AI_INVENTORY_MANAGER_ERA107_POLICY_ID).toBe("era107-ai-inventory-manager-v1");
    expect(AI_INVENTORY_MANAGER_ERA107_SUMMARY_ARTIFACT).toBe(
      "artifacts/ai-inventory-manager-smoke-summary.json",
    );
    expect(AI_INVENTORY_MANAGER_ERA107_ROUTE).toBe("/dashboard/inventory/manager");
    expect(AI_INVENTORY_MANAGER_ERA107_CAPABILITIES).toHaveLength(4);
  });

  it("aligns era107 with canonical inventory manager policy", () => {
    expect(AI_INVENTORY_MANAGER_ERA107_CANONICAL_POLICY_ID).toBe(AI_INVENTORY_MANAGER_POLICY_ID);
    expect(AI_INVENTORY_MANAGER_ERA107_SERVICE).toBe(AI_INVENTORY_MANAGER_SERVICE);
  });

  it("audits in-repo AI Inventory Manager wiring", () => {
    const audit = auditAiInventoryManagerSmokeWiring(ROOT);
    expect(audit.ok, audit.failures.join("; ")).toBe(true);
    for (const rel of AI_INVENTORY_MANAGER_ERA107_WIRING_PATHS) {
      expect(existsSync(join(ROOT, rel)), rel).toBe(true);
    }
  });

  it("includes waste, theft, shrinkage, and daily brief wiring", () => {
    const service = readFileSync(join(ROOT, AI_INVENTORY_MANAGER_ERA107_SERVICE), "utf8");
    expect(service).toContain("loadInventoryManagerSnapshot");
    expect(service).toContain("getWasteSummary");
    expect(service).toContain("listTheftDetectionAlerts");

    const client = readFileSync(
      join(ROOT, "components/inventory/inventory-manager-client.tsx"),
      "utf8",
    );
    expect(client).toContain("ai-inventory-manager-daily-brief");
    expect(client).toContain("Theft detection");
    expect(client).toContain("Count shrinkage");
  });

  it("marks proof_passed only when cert and wiring pass", () => {
    expect(
      resolveAiInventoryManagerSmokeEra107ProofStatus({
        wiringOk: true,
        certPassed: true,
      }),
    ).toBe("proof_passed");
    expect(
      resolveAiInventoryManagerSmokeEra107ProofStatus({
        wiringOk: false,
        certPassed: true,
      }),
    ).toBe("proof_failed_wiring");
  });

  it("builds PASSED summary when wiring and cert pass", () => {
    const summary = buildAiInventoryManagerSmokeEra107Summary({
      certPassed: true,
    });
    expect(summary.overall).toBe("PASSED");
    expect(summary.proofStatus).toBe("proof_passed");
    expect(summary.wiringCertPassed).toBe(true);
    expect(summary.capabilities).toContain("shrinkage");
  });
});
