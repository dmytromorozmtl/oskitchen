import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  COMMERCIAL_PILOT_CI_SCRIPTS,
  COMMERCIAL_PILOT_RUNBOOK_DOC,
  COMMERCIAL_PILOT_RUNBOOK_POLICY_ID,
  COMMERCIAL_PILOT_UNIT_TESTS,
} from "@/lib/commercial/commercial-pilot-runbook-policy";

const ROOT = process.cwd();

function readPackageScripts(): Record<string, string> {
  const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
    scripts?: Record<string, string>;
  };
  return pkg.scripts ?? {};
}

describe("commercial pilot runbook CI certification (live repo)", () => {
  it("locks era7 commercial pilot runbook policy id", () => {
    expect(COMMERCIAL_PILOT_RUNBOOK_POLICY_ID).toBe("era7-commercial-pilot-runbooks-v1");
  });

  it("defines commercial pilot runbook CI scripts", () => {
    const scripts = readPackageScripts();
    for (const name of COMMERCIAL_PILOT_CI_SCRIPTS) {
      expect(scripts[name], `missing ${name}`).toBeTruthy();
    }
    expect(scripts["test:ci:governance-bundles"]).toContain("test:ci:commercial-pilot-runbook:cert");
    expect(scripts["test:ci:governance-bundles"]).toContain("test:ci:commercial-pilot-runbook");
  });

  it("has policy module, runbook, and unit tests on disk", () => {
    expect(existsSync(join(ROOT, COMMERCIAL_PILOT_RUNBOOK_DOC))).toBe(true);
    expect(existsSync(join(ROOT, "lib/commercial/commercial-pilot-runbook-policy.ts"))).toBe(true);
    for (const rel of COMMERCIAL_PILOT_UNIT_TESTS) {
      expect(existsSync(join(ROOT, rel)), rel).toBe(true);
    }
  });

  it("links runbook from canonical doc index", () => {
    const index = readFileSync(join(ROOT, "docs/canonical-doc-index.md"), "utf8");
    expect(index).toContain("commercial-pilot-runbook.md");
    expect(index).toContain(COMMERCIAL_PILOT_RUNBOOK_POLICY_ID);
  });
});
