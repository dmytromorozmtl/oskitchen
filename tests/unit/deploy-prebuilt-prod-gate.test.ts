import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

const ROOT = process.cwd();
const DEPLOY_SCRIPT = join(ROOT, "scripts/deploy-prebuilt-prod.sh");

describe("deploy-prebuilt-prod vitest gate", () => {
  it("rejects DEPLOY_SKIP_VITEST=1 and always runs vitest", () => {
    const script = readFileSync(DEPLOY_SCRIPT, "utf8");
    expect(script).toContain("DEPLOY_SKIP_VITEST=1 is no longer supported");
    expect(script).not.toContain("skipping vitest (DEPLOY_SKIP_VITEST=1)");
    expect(script).toContain("vitest.mjs run");
  });

  it("documents npm test && deploy:prod flow", () => {
    const script = readFileSync(DEPLOY_SCRIPT, "utf8");
    expect(script).toContain("npm test && npm run deploy:prod");
  });
});
