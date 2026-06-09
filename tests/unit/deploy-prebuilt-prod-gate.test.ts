import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

const ROOT = process.cwd();
const DEPLOY_SCRIPT = join(ROOT, "scripts/deploy-prebuilt-prod.sh");

describe("deploy-prebuilt-prod vitest gate", () => {
  it("always runs vitest with no DEPLOY_SKIP_VITEST bypass", () => {
    const script = readFileSync(DEPLOY_SCRIPT, "utf8");
    expect(script).not.toContain("DEPLOY_SKIP_VITEST");
    expect(script).not.toContain("skipping vitest");
    expect(script).toContain("vitest.mjs run");
    expect(script).toContain("required gate before deploy");
  });
});
