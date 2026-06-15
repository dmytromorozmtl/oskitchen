import { describe, expect, it } from "vitest";

import { ACTION_MUTATION_OPERATIONS } from "@/lib/permissions/action-mutation-registry";
import {
  DOMAIN_MUTATION_HELPERS,
  ENTERPRISE_MUTATION_REGISTRY,
  ENTERPRISE_MUTATION_REGISTRY_COUNTS,
  isEnterpriseMutationRegistryComplete,
} from "@/lib/permissions/domain-mutation-registry";
import { loadMutationRegistryDashboardSnapshot } from "@/services/platform/mutation-registry-dashboard-service";

describe("enterprise mutation registry expansion", () => {
  it("meets 100+ entry enterprise target", () => {
    expect(ENTERPRISE_MUTATION_REGISTRY_COUNTS.total).toBeGreaterThanOrEqual(100);
    expect(isEnterpriseMutationRegistryComplete()).toBe(true);
  });

  it("combines domain helpers and action operations", () => {
    expect(DOMAIN_MUTATION_HELPERS.length).toBeGreaterThan(0);
    expect(ACTION_MUTATION_OPERATIONS.length).toBeGreaterThanOrEqual(80);
    expect(ENTERPRISE_MUTATION_REGISTRY.length).toBe(
      DOMAIN_MUTATION_HELPERS.length + ACTION_MUTATION_OPERATIONS.length,
    );
  });

  it("dashboard snapshot reflects registry counts", () => {
    const snapshot = loadMutationRegistryDashboardSnapshot();
    expect(snapshot.counts.total).toBe(ENTERPRISE_MUTATION_REGISTRY_COUNTS.total);
    expect(snapshot.enterpriseTargetMet).toBe(true);
    expect(snapshot.domainSummaries.length).toBeGreaterThan(10);
  });

  it("action operations have unique ids", () => {
    const ids = ACTION_MUTATION_OPERATIONS.map((e) => e.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
