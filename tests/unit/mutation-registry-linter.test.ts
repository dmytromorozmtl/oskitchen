import { describe, expect, it } from "vitest";

import {
  MUTATION_REGISTRY_LINTER_ERA16_POLICY_ID,
  MUTATION_REGISTRY_LINTER_GOVERNANCE_PATTERNS,
} from "@/lib/permissions/mutation-registry-linter-era16-policy";
import {
  hasMutationRegistryGovernance,
  isSensitiveMutationAction,
  resolveMutationRegistryAllowlist,
  scanMutationRegistryCompliance,
} from "@/lib/permissions/mutation-registry-linter";

describe("mutation registry linter", () => {
  it("flags sensitive server actions with prisma writes", () => {
    const content = `"use server";
export async function saveThing() {
  await prisma.widget.create({ data: {} });
}`;
    expect(isSensitiveMutationAction(content)).toBe(true);
  });

  it("ignores read-only server actions", () => {
    const content = `"use server";
export async function loadThing() {
  return prisma.widget.findMany();
}`;
    expect(isSensitiveMutationAction(content)).toBe(false);
  });

  it("accepts requireMutationPermission as governance", () => {
    const content = `"use server";
import { requireMutationPermission } from "@/lib/permissions/mutation-access";
export async function saveThing() {
  await requireMutationPermission("workspace.settings");
  await prisma.widget.update({ where: { id: "1" }, data: {} });
}`;
    expect(hasMutationRegistryGovernance("actions/example.ts", content)).toBe(true);
  });

  it("accepts domain registry entrypoints as governance", () => {
    for (const pattern of MUTATION_REGISTRY_LINTER_GOVERNANCE_PATTERNS) {
      const content = `"use server";
export async function saveThing() {
  await ${pattern}("op");
  await prisma.widget.delete({ where: { id: "1" } });
}`;
      expect(hasMutationRegistryGovernance(`actions/${pattern}.ts`, content)).toBe(true);
    }
  });

  it("accepts inline allowlist marker with documented exception id", () => {
    const content = `"use server";
/** mutation-registry-linter-allowlist: copilot_capability_matrix */
export async function saveThing() {
  await prisma.widget.create({ data: {} });
}`;
    expect(resolveMutationRegistryAllowlist("actions/copilot-inline.ts", content)).toBe(
      "copilot_capability_matrix",
    );
    expect(hasMutationRegistryGovernance("actions/copilot-inline.ts", content)).toBe(true);
  });

  it("passes on live repo action scan", () => {
    const scan = scanMutationRegistryCompliance();
    expect(scan.ok).toBe(true);
    expect(scan.violations).toEqual([]);
    expect(scan.sensitiveFiles).toBeGreaterThan(50);
    expect(scan.governedFiles).toBe(scan.sensitiveFiles);
  });
});

describe("mutation registry linter era16 policy", () => {
  it("locks era16 policy id", () => {
    expect(MUTATION_REGISTRY_LINTER_ERA16_POLICY_ID).toBe("era16-mutation-registry-linter-v1");
  });
});
