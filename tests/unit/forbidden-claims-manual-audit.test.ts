import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import {
  auditForbiddenClaimsManualAuditArtifact,
  FORBIDDEN_CLAIMS_MANUAL_AUDIT_ARTIFACT,
  FORBIDDEN_CLAIMS_MANUAL_AUDIT_BASELINE_RECONCILIATION,
  FORBIDDEN_CLAIMS_MANUAL_AUDIT_BASELINE_TOTAL,
  FORBIDDEN_CLAIMS_MANUAL_AUDIT_DOC,
  FORBIDDEN_CLAIMS_MANUAL_AUDIT_POLICY_DOC_PATHS,
  FORBIDDEN_CLAIMS_MANUAL_AUDIT_POLICY_ID,
  FORBIDDEN_CLAIMS_MANUAL_AUDIT_SCAN_ROOTS,
  classifyForbiddenClaimContext,
  isForbiddenClaimsPolicyPath,
  scanTextForForbiddenClaimMatches,
  summarizeForbiddenClaimsManualAudit,
} from "@/lib/governance/forbidden-claims-manual-audit-policy";

const ROOT = process.cwd();
const MAX_FILE_BYTES = 512_000;

function collectLiveScanFiles(): string[] {
  const files = [...FORBIDDEN_CLAIMS_MANUAL_AUDIT_POLICY_DOC_PATHS];

  function walk(relDir: string): void {
    const full = join(ROOT, relDir);
    if (!existsSync(full)) return;
    for (const entry of readdirSync(full, { withFileTypes: true })) {
      const rel = join(relDir, entry.name).replace(/\\/g, "/");
      if (entry.isDirectory()) {
        if (entry.name === "node_modules") continue;
        walk(rel);
      } else if (entry.isFile() && /\.(tsx?|md|json)$/.test(entry.name)) {
        files.push(rel);
      }
    }
  }

  for (const root of FORBIDDEN_CLAIMS_MANUAL_AUDIT_SCAN_ROOTS) {
    const full = join(ROOT, root);
    if (!existsSync(full)) continue;
    if (statSync(full).isFile()) files.push(root);
    else walk(root);
  }

  return [...new Set(files)];
}

function runLiveScan() {
  const matches = [];
  for (const filePath of collectLiveScanFiles()) {
    const full = join(ROOT, filePath);
    if (!existsSync(full) || statSync(full).size > MAX_FILE_BYTES) continue;
    const text = readFileSync(full, "utf8");
    matches.push(...scanTextForForbiddenClaimMatches(text, filePath));
  }
  return summarizeForbiddenClaimsManualAudit(matches);
}

describe("Forbidden claims manual audit (Task 31)", () => {
  it("locks policy id and 183 baseline reconciliation", () => {
    expect(FORBIDDEN_CLAIMS_MANUAL_AUDIT_POLICY_ID).toBe(
      "forbidden-claims-manual-audit-absolute-final-v1",
    );
    expect(FORBIDDEN_CLAIMS_MANUAL_AUDIT_BASELINE_TOTAL).toBe(183);
    const b = FORBIDDEN_CLAIMS_MANUAL_AUDIT_BASELINE_RECONCILIATION;
    expect(b.rawMatches).toBe(183);
    expect(b.policyDoc + b.negation + b.realClaimReviewed).toBe(183);
    expect(b.realClaimRemediated).toBe(b.realClaimReviewed);
  });

  it("classifies policy docs and negation contexts", () => {
    expect(isForbiddenClaimsPolicyPath("docs/forbidden-claims-training.md")).toBe(true);
    expect(
      classifyForbiddenClaimContext(
        "docs/forbidden-claims-training.md",
        "Do not claim production SSO for all tenants.",
      ),
    ).toBe("policy_doc");
    expect(
      classifyForbiddenClaimContext(
        "components/marketing/hero.tsx",
        "We do not offer rush-hour KDS certification today.",
      ),
    ).toBe("negation");
  });

  it("passes live scan on marketing + honesty surfaces with zero real claims", () => {
    const liveScan = runLiveScan();
    expect(liveScan.realClaimCount, JSON.stringify(liveScan)).toBe(0);
    expect(liveScan.totalMatches).toBeGreaterThan(0);
    expect(liveScan.passed).toBe(true);
  });

  it("passes audit on committed artifact", () => {
    const raw = readFileSync(join(ROOT, FORBIDDEN_CLAIMS_MANUAL_AUDIT_ARTIFACT), "utf8");
    const artifact = JSON.parse(raw) as {
      liveScan: ReturnType<typeof summarizeForbiddenClaimsManualAudit>;
      baselineReconciliation: typeof FORBIDDEN_CLAIMS_MANUAL_AUDIT_BASELINE_RECONCILIATION;
    };
    expect(artifact.baselineReconciliation.rawMatches).toBe(183);
    expect(auditForbiddenClaimsManualAuditArtifact(artifact.liveScan)).toBe(true);
  });

  it("documents manual audit in canonical doc", () => {
    const doc = readFileSync(join(ROOT, FORBIDDEN_CLAIMS_MANUAL_AUDIT_DOC), "utf8");
    expect(doc).toContain("183");
    expect(doc).toContain("policy_doc");
    expect(doc).toContain("negation");
    expect(doc).toContain("real_claim");
  });
});
