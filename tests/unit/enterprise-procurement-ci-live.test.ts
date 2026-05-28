import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  ENTERPRISE_PROCUREMENT_CI_SCRIPTS,
  ENTERPRISE_PROCUREMENT_EVIDENCE_ANCHORS,
  ENTERPRISE_PROCUREMENT_PACK_DOC,
  ENTERPRISE_PROCUREMENT_POLICY_ID,
} from "@/lib/enterprise/enterprise-procurement-policy";

const ROOT = process.cwd();

function readPackageScripts(): Record<string, string> {
  const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
    scripts?: Record<string, string>;
  };
  return pkg.scripts ?? {};
}

describe("enterprise procurement CI certification (live repo)", () => {
  it("locks era4 procurement honesty policy", () => {
    expect(ENTERPRISE_PROCUREMENT_POLICY_ID).toBe("era4-procurement-honesty-v1");
  });

  it("defines enterprise procurement CI scripts", () => {
    const scripts = readPackageScripts();
    for (const name of ENTERPRISE_PROCUREMENT_CI_SCRIPTS) {
      expect(scripts[name], `missing ${name}`).toBeTruthy();
    }
    expect(scripts["test:ci:enterprise-procurement"]).toContain(
      "enterprise-procurement-policy.test.ts",
    );
  });

  it("includes enterprise procurement cert in governance bundles", () => {
    const scripts = readPackageScripts();
    expect(scripts["test:ci:governance-bundles"]).toContain("test:ci:enterprise-procurement:cert");
    expect(scripts["test:ci:governance-bundles"]).toContain("test:ci:enterprise-procurement");
  });

  it("has procurement pack and evidence anchors on disk", () => {
    expect(existsSync(join(ROOT, ENTERPRISE_PROCUREMENT_PACK_DOC))).toBe(true);
    for (const rel of ENTERPRISE_PROCUREMENT_EVIDENCE_ANCHORS) {
      expect(existsSync(join(ROOT, rel)), rel).toBe(true);
    }
  });

  it("links procurement pack from canonical doc index and devops readiness", () => {
    const index = readFileSync(join(ROOT, "docs/canonical-doc-index.md"), "utf8");
    expect(index).toContain("enterprise-procurement-pack.md");
    expect(index).toContain(ENTERPRISE_PROCUREMENT_POLICY_ID);

    const devops = readFileSync(join(ROOT, "docs/devops-release-enterprise-readiness.md"), "utf8");
    expect(devops).toContain("enterprise-procurement-pack.md");
  });
});
