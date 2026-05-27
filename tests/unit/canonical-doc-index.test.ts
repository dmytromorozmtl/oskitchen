import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const DOCS = join(process.cwd(), "docs");

/** Paths listed in docs/canonical-doc-index.md — must exist on disk. */
const CANONICAL_DOC_PATHS = [
  "docs/canonical-doc-index.md",
  "docs/system-reality-model.md",
  "docs/feature-maturity-matrix.md",
  "docs/p0-hardening-roadmap.md",
  "docs/rbac-permission-architecture.md",
  "docs/implementation-backlog.md",
  "docs/definition-of-done.md",
  "docs/qa-master-test-plan.md",
  "docs/devops-release-enterprise-readiness.md",
  "docs/product-positioning.md",
  "docs/competitor-feature-gap-matrix.md",
  "docs/kds-v1-scope.md",
  "docs/ci-e2e-tier-matrix.md",
  "docs/full-strategic-reaudit-2026-05-27.md",
  "docs/next-master-prompt-input-2026-05-27.md",
  "docs/_DEPRECATED_AUDIT_FAMILY.md",
];

describe("canonical doc index governance", () => {
  it("canonical-doc-index.md exists and references deprecated notice", () => {
    const indexPath = join(DOCS, "canonical-doc-index.md");
    expect(existsSync(indexPath)).toBe(true);
    const content = readFileSync(indexPath, "utf8");
    expect(content).toContain("_DEPRECATED_AUDIT_FAMILY.md");
    expect(content).toContain("Core canon");
    expect(content).toContain("Cycle 27–28");
  });

  it.each(CANONICAL_DOC_PATHS)("required canonical doc exists: %s", (relativePath) => {
    expect(existsSync(join(process.cwd(), relativePath))).toBe(true);
  });

  it("gateway deprecated audits carry deprecation banner", () => {
    const gateways = [
      "docs/enterprise-full-audit-26mayafter.md",
      "docs/KITCHENOS_FULL_FINAL_READINESS_AUDIT.md",
      "docs/PRODUCTION_READINESS_NEXT_PRIORITY_AUDIT.md",
    ];
    for (const relativePath of gateways) {
      const content = readFileSync(join(process.cwd(), relativePath), "utf8");
      expect(content.startsWith("> **DEPRECATED"), `${relativePath} missing banner`).toBe(true);
      expect(content).toContain("canonical-doc-index.md");
    }
  });

  it("Evolution Era 2 scorecard is published in canonical docs", () => {
    const reaudit = readFileSync(join(DOCS, "full-strategic-reaudit-2026-05-27.md"), "utf8");
    const promptInput = readFileSync(join(DOCS, "next-master-prompt-input-2026-05-27.md"), "utf8");
    expect(reaudit).toContain("Step 19 — Evolution Era 2 Scorecard Refresh");
    expect(reaudit).toContain("| **Overall** | 64 | **71** | +7 |");
    expect(promptInput).toContain("Evolution Era 2 end — 2026-05-27");
    expect(promptInput).toContain("| Overall | 64 | **71** | +7 |");
  });
});
