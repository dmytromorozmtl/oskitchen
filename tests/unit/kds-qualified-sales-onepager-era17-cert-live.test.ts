import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  KDS_QUALIFIED_SALES_ONEPAGER_ERA17_CANONICAL_DOC_PATHS,
  KDS_QUALIFIED_SALES_ONEPAGER_ERA17_CANONICAL_MARKERS,
  KDS_QUALIFIED_SALES_ONEPAGER_ERA17_CI_SCRIPTS,
  KDS_QUALIFIED_SALES_ONEPAGER_ERA17_DOC,
  KDS_QUALIFIED_SALES_ONEPAGER_ERA17_POLICY_ID,
  KDS_QUALIFIED_SALES_ONEPAGER_ERA17_REQUIRED_SECTIONS,
  KDS_QUALIFIED_SALES_ONEPAGER_ERA17_REVIEW_SECTION,
  KDS_QUALIFIED_SALES_ONEPAGER_ERA17_UNIT_TESTS,
} from "@/lib/kitchen/kds-qualified-sales-onepager-era17-policy";

const ROOT = process.cwd();

function readPackageScripts(): Record<string, string> {
  const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
    scripts?: Record<string, string>;
  };
  return pkg.scripts ?? {};
}

describe("kds qualified sales onepager era17 CI certification (live repo)", () => {
  it("locks era17 kds qualified sales onepager policy id", () => {
    expect(KDS_QUALIFIED_SALES_ONEPAGER_ERA17_POLICY_ID).toBe(
      "era17-kds-qualified-sales-onepager-v1",
    );
  });

  it("defines era17 kds qualified sales onepager cert scripts", () => {
    const scripts = readPackageScripts();
    for (const name of KDS_QUALIFIED_SALES_ONEPAGER_ERA17_CI_SCRIPTS) {
      expect(scripts[name], `missing ${name}`).toBeTruthy();
    }
    expect(scripts["test:ci:kds-staging-smoke:cert"]).toContain(
      "kds-qualified-sales-onepager-era17-cert-live",
    );
  });

  it("documents era17 kds qualified sales onepager in canonical docs", () => {
    expect(existsSync(join(ROOT, KDS_QUALIFIED_SALES_ONEPAGER_ERA17_DOC))).toBe(true);
    const onepager = readFileSync(join(ROOT, KDS_QUALIFIED_SALES_ONEPAGER_ERA17_DOC), "utf8");
    for (const section of KDS_QUALIFIED_SALES_ONEPAGER_ERA17_REQUIRED_SECTIONS) {
      expect(onepager, section).toContain(section);
    }
    for (const rel of KDS_QUALIFIED_SALES_ONEPAGER_ERA17_CANONICAL_DOC_PATHS) {
      const text = readFileSync(join(ROOT, rel), "utf8").toLowerCase();
      expect(text, rel).toContain(KDS_QUALIFIED_SALES_ONEPAGER_ERA17_POLICY_ID.toLowerCase());
    }
    const runbook = readFileSync(join(ROOT, "docs/commercial-pilot-runbook.md"), "utf8");
    expect(runbook).toContain(KDS_QUALIFIED_SALES_ONEPAGER_ERA17_REVIEW_SECTION);
    for (const marker of KDS_QUALIFIED_SALES_ONEPAGER_ERA17_CANONICAL_MARKERS) {
      expect(runbook.toLowerCase()).toContain(marker.toLowerCase());
    }
    const index = readFileSync(join(ROOT, "docs/canonical-doc-index.md"), "utf8");
    expect(index).toContain(KDS_QUALIFIED_SALES_ONEPAGER_ERA17_POLICY_ID);
    for (const rel of KDS_QUALIFIED_SALES_ONEPAGER_ERA17_UNIT_TESTS) {
      expect(existsSync(join(ROOT, rel)), rel).toBe(true);
    }
  });
});
