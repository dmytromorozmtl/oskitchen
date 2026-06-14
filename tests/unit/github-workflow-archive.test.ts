import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  GITHUB_WORKFLOW_ACTIVE_ALLOWLIST,
  GITHUB_WORKFLOW_ACTIVE_DIR,
  GITHUB_WORKFLOW_ACTIVE_MAX,
  GITHUB_WORKFLOW_ARCHIVE_DIR,
  GITHUB_WORKFLOW_ARCHIVE_POLICY_ID,
  GITHUB_WORKFLOW_ARCHIVE_SCRIPT,
  GITHUB_WORKFLOW_ARCHIVE_UNIT_TEST,
  shouldArchiveWorkflow,
} from "@/lib/devops/github-workflow-archive-policy";

const ROOT = process.cwd();

describe("GitHub workflow archive (P1-17)", () => {
  it("locks policy id and ~40 active workflow target", () => {
    expect(GITHUB_WORKFLOW_ARCHIVE_POLICY_ID).toBe("github-workflow-archive-p1-17-v1");
    expect(GITHUB_WORKFLOW_ACTIVE_MAX).toBe(40);
    expect(GITHUB_WORKFLOW_ACTIVE_ALLOWLIST.length).toBe(34);
  });

  it("keeps active workflows under 40 in .github/workflows", () => {
    const activeDir = join(ROOT, GITHUB_WORKFLOW_ACTIVE_DIR);
    const active = readdirSync(activeDir).filter(
      (f) => f.endsWith(".yml") || f.endsWith(".yaml"),
    );
    expect(active.length).toBeLessThanOrEqual(GITHUB_WORKFLOW_ACTIVE_MAX);
    for (const name of GITHUB_WORKFLOW_ACTIVE_ALLOWLIST) {
      expect(active).toContain(name);
    }
  });

  it("archives era25 ops theater workflows outside workflows dir", () => {
    expect(shouldArchiveWorkflow("ops-era25-engineering-gates-integrity-validate.yml")).toBe(true);
    expect(shouldArchiveWorkflow("ci.yml")).toBe(false);
    expect(shouldArchiveWorkflow("commercial-gate-execution-check.yml")).toBe(true);

    const archiveDir = join(ROOT, GITHUB_WORKFLOW_ARCHIVE_DIR);
    expect(existsSync(archiveDir)).toBe(true);
    const archived = readdirSync(archiveDir).filter(
      (f) => f.endsWith(".yml") || f.endsWith(".yaml"),
    );
    expect(archived.length).toBeGreaterThan(80);
  });

  it("registers archive script and unit test wiring", () => {
    expect(existsSync(join(ROOT, GITHUB_WORKFLOW_ARCHIVE_SCRIPT))).toBe(true);
    expect(GITHUB_WORKFLOW_ARCHIVE_UNIT_TEST).toBe(
      "tests/unit/github-workflow-archive.test.ts",
    );
    const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
      scripts?: Record<string, string>;
    };
    expect(pkg.scripts?.["check:github-workflow-surface"]).toContain(
      "audit-github-workflow-surface.ts",
    );
  });
});
