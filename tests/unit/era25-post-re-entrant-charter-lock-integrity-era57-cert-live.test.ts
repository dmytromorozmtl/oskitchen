import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  ERA25_POST_REENTRANT_CHARTER_LOCK_INTEGRITY_ERA57_CI_SCRIPTS,
  ERA25_POST_REENTRANT_CHARTER_LOCK_INTEGRITY_ERA57_GOVERNANCE_BUNDLES_CERT_CHAIN,
  ERA25_POST_REENTRANT_CHARTER_LOCK_INTEGRITY_ERA57_OPS_SCRIPTS,
  ERA25_POST_REENTRANT_CHARTER_LOCK_INTEGRITY_ERA57_POLICY_ID,
  ERA25_POST_REENTRANT_CHARTER_LOCK_INTEGRITY_ERA57_UNIT_TESTS,
} from "@/lib/commercial/era25-post-re-entrant-charter-lock-integrity-era57-policy";
import { ERA25_POST_REENTRANT_CHARTER_LOCK_DOC } from "@/lib/commercial/era25-post-re-entrant-charter-lock-phases-era57";

const ROOT = process.cwd();

function readPackageScripts(): Record<string, string> {
  const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
    scripts?: Record<string, string>;
  };
  return pkg.scripts ?? {};
}

describe("era25 post-re-entrant charter lock integrity era57 CI certification (live repo)", () => {
  it("locks integrity policy id", () => {
    expect(ERA25_POST_REENTRANT_CHARTER_LOCK_INTEGRITY_ERA57_POLICY_ID).toBe(
      "era57-era25-post-re-entrant-charter-lock-integrity-v1",
    );
  });

  it("defines ops and ci scripts", () => {
    const scripts = readPackageScripts();
    for (const name of [
      ...ERA25_POST_REENTRANT_CHARTER_LOCK_INTEGRITY_ERA57_OPS_SCRIPTS,
      ...ERA25_POST_REENTRANT_CHARTER_LOCK_INTEGRITY_ERA57_CI_SCRIPTS,
    ]) {
      expect(scripts[name], `missing ${name}`).toBeTruthy();
    }
  });

  it("chains charter lock cert into governance-bundles partition-platform", () => {
    const scripts = readPackageScripts();
    const partitionPlatform = scripts["test:ci:governance-bundles:partition-platform"] ?? "";
    for (const chainScript of ERA25_POST_REENTRANT_CHARTER_LOCK_INTEGRITY_ERA57_GOVERNANCE_BUNDLES_CERT_CHAIN) {
      expect(partitionPlatform).toContain(chainScript);
    }
  });

  it("wires workflow, product doc, and unit tests", () => {
    expect(
      existsSync(
        join(
          ROOT,
          ".github/workflows/ops-era25-post-re-entrant-charter-lock-integrity-validate.yml",
        ),
      ),
    ).toBe(true);
    expect(existsSync(join(ROOT, ERA25_POST_REENTRANT_CHARTER_LOCK_DOC))).toBe(true);
    const doc = readFileSync(join(ROOT, ERA25_POST_REENTRANT_CHARTER_LOCK_DOC), "utf8");
    expect(doc).toContain("post-re-entrant-charter-lock");
    expect(doc).toContain("#era25-post-re-entrant-charter-lock");
    for (const path of ERA25_POST_REENTRANT_CHARTER_LOCK_INTEGRITY_ERA57_UNIT_TESTS) {
      expect(existsSync(join(ROOT, path)), `missing ${path}`).toBe(true);
    }
  });
});
