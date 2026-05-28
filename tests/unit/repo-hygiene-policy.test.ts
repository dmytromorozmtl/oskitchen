import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  REPO_HYGIENE_POLICY_ID,
  REPO_HYGIENE_REQUIRED_GITIGNORE_LINES,
  findForbiddenTrackedPaths,
  gitignoreCoversRequiredLines,
} from "@/lib/ci/repo-hygiene-policy";

const ROOT = process.cwd();

describe("repo hygiene policy", () => {
  it("locks era7 tests/node_modules hygiene policy", () => {
    expect(REPO_HYGIENE_POLICY_ID).toBe("era7-tests-node-modules-hygiene-v1");
    expect(REPO_HYGIENE_REQUIRED_GITIGNORE_LINES).toContain("/tests/node_modules/");
  });

  it("detects forbidden tracked paths under tests/node_modules", () => {
    expect(
      findForbiddenTrackedPaths([
        "lib/foo.ts",
        "tests/node_modules/.vite/cache/results.json",
        "tests/node_modules",
      ]),
    ).toEqual(["tests/node_modules/.vite/cache/results.json", "tests/node_modules"]);
    expect(findForbiddenTrackedPaths(["lib/foo.ts", "tests/unit/bar.test.ts"])).toEqual([]);
  });

  it("root gitignore covers required hygiene lines", () => {
    const gitignore = readFileSync(join(ROOT, ".gitignore"), "utf8");
    expect(gitignoreCoversRequiredLines(gitignore)).toBe(true);
  });
});
