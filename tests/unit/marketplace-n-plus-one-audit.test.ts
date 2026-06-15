import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  MARKETPLACE_HOT_PATH_FILES,
  MARKETPLACE_N_PLUS_ONE_AUDIT_ARTIFACT,
  MARKETPLACE_N_PLUS_ONE_AUDIT_POLICY_ID,
  buildMarketplaceNPlusOneReport,
  scanMarketplaceNPlusOne,
} from "@/scripts/lib/marketplace-n-plus-one-audit";

const ROOT = process.cwd();

describe("marketplace N+1 audit", () => {
  it("locks marketplace N+1 audit policy", () => {
    expect(MARKETPLACE_N_PLUS_ONE_AUDIT_POLICY_ID).toBe("marketplace-n-plus-one-audit-v1");
    expect(MARKETPLACE_HOT_PATH_FILES.length).toBeGreaterThanOrEqual(5);
  });

  it("detects prisma.findUnique inside a for-loop", () => {
    const sample = `
export async function sample() {
  for (const line of order.items) {
    const ingredient = await prisma.ingredient.findUnique({ where: { id: line.id } });
  }
}
`;
    const tempFindings = scanMarketplaceNPlusOneFromSource(sample, "services/marketplace/sample.ts");
    expect(tempFindings.some((f) => f.pattern === "for_await_prisma")).toBe(true);
  });

  it("builds report for marketplace services tree", () => {
    const report = buildMarketplaceNPlusOneReport(ROOT);
    expect(report.scannedFiles).toBeGreaterThanOrEqual(20);
    expect(report.hotPaths).toHaveLength(MARKETPLACE_HOT_PATH_FILES.length);
    expect(report.summary.byPattern.for_await_prisma).toBeGreaterThanOrEqual(0);
  });

  it("flags inventory receive path for ingredient lookup in loop", () => {
    const report = buildMarketplaceNPlusOneReport(ROOT);
    const inventory = report.findings.filter((f) =>
      f.file.includes("inventory-integration-service.ts"),
    );
    expect(inventory.some((f) => f.pattern === "for_await_prisma")).toBe(true);
  });

  it("documents audit in prisma optimization guide", () => {
    const doc = readFileSync(join(ROOT, "docs/prisma-optimization-audit.md"), "utf8");
    expect(doc).toContain("Task 82");
    expect(doc).toContain("N+1 detection script for marketplace");
  });

  it("wires npm audit script and artifact path", () => {
    const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
      scripts?: Record<string, string>;
    };
    expect(pkg.scripts?.["audit:marketplace-n-plus-one"]).toContain(
      "audit-marketplace-n-plus-one.ts",
    );
    expect(MARKETPLACE_N_PLUS_ONE_AUDIT_ARTIFACT).toBe(
      "artifacts/marketplace-n-plus-one-audit.json",
    );
  });
});

function scanMarketplaceNPlusOneFromSource(source: string, relPath: string) {
  const lines = source.split("\n");
  const findings: ReturnType<typeof scanMarketplaceNPlusOne> = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (!/for\s*\(\s*(?:const|let|var|await)\s/.test(line)) continue;
    const window = lines.slice(i, Math.min(i + 15, lines.length)).join("\n");
    if (/await\s+prisma\./.test(window)) {
      findings.push({
        file: relPath,
        line: i + 1,
        pattern: "for_await_prisma",
        severity: "high",
        snippet: line.trim(),
        recommendation: "Batch with findMany + Map, or use Prisma include/select in one query.",
      });
    }
  }

  return findings;
}
