import { existsSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";

import { loadSmokeEnv } from "../../scripts/lib/load-smoke-env";

const TMP = join(process.cwd(), ".tmp-smoke-env-test");

describe("loadSmokeEnv", () => {
  afterEach(() => {
    delete process.env.SMOKE_TEST_KEY;
    if (existsSync(TMP)) rmSync(TMP, { recursive: true, force: true });
  });

  it("loads .env.smoke.local into process.env", () => {
    mkdirSync(TMP, { recursive: true });
    writeFileSync(join(TMP, ".env.smoke.local"), "SMOKE_TEST_KEY=from-smoke-local\n", "utf8");
    delete process.env.SMOKE_TEST_KEY;

    const loaded = loadSmokeEnv(TMP);

    expect(loaded).toContain(".env.smoke.local");
    expect(process.env.SMOKE_TEST_KEY).toBe("from-smoke-local");
  });
});
