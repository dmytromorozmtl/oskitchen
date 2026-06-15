import { describe, expect, it } from "vitest";

import { buildPrismaPerformanceAuditReport } from "../../scripts/lib/prisma-performance-audit";

describe("prisma performance audit", () => {
  it("builds report with schema and heuristic sections", () => {
    const report = buildPrismaPerformanceAuditReport(process.cwd());

    expect(report.version).toBe("prisma-performance-audit-v1");
    expect(report.schema.totalModels).toBeGreaterThan(50);
    expect(report.schema.totalIndexDeclarations).toBeGreaterThan(20);
    expect(Array.isArray(report.indexes.userScopedMissingTenantIndex)).toBe(true);
    expect(report.softDelete.candidateModelsMissingDeletedAt.length).toBeGreaterThan(0);
    expect(["PASSED", "NEEDS_ATTENTION"]).toContain(report.overall);
  });
});
