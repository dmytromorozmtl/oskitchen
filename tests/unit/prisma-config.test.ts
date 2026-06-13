import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  PRISMA_CONFIG_NPM_SCRIPT,
  PRISMA_CONFIG_PATH,
  PRISMA_CONFIG_POLICY_ID,
  PRISMA_CONFIG_UNIT_TEST,
  PRISMA_CONFIG_WIRING_PATHS,
  PRISMA_MIGRATIONS_PATH,
  PRISMA_SCHEMA_PATH,
  PRISMA_SEED_COMMAND,
} from "@/lib/prisma/prisma-config-policy";

const ROOT = process.cwd();

describe("prisma config migration (P1-15)", () => {
  it("locks policy id and prisma.config.ts paths", () => {
    expect(PRISMA_CONFIG_POLICY_ID).toBe("prisma-config-p1-15-v1");
    expect(existsSync(join(ROOT, PRISMA_CONFIG_PATH))).toBe(true);
    expect(existsSync(join(ROOT, PRISMA_SCHEMA_PATH))).toBe(true);
    expect(existsSync(join(ROOT, PRISMA_MIGRATIONS_PATH))).toBe(true);
  });

  it("uses prisma.config.ts instead of deprecated package.json#prisma", () => {
    const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
      prisma?: unknown;
    };
    expect(pkg.prisma).toBeUndefined();

    const config = readFileSync(join(ROOT, PRISMA_CONFIG_PATH), "utf8");
    expect(config).toContain('defineConfig');
    expect(config).toContain(`schema: "${PRISMA_SCHEMA_PATH}"`);
    expect(config).toContain(`path: "${PRISMA_MIGRATIONS_PATH}"`);
    expect(config).toContain(`seed: "${PRISMA_SEED_COMMAND}"`);
  });

  it("schema.prisma keeps datasource env refs (client runtime unchanged)", () => {
    const schema = readFileSync(join(ROOT, PRISMA_SCHEMA_PATH), "utf8");
    expect(schema).toContain('provider  = "postgresql"');
    expect(schema).toContain('url       = env("DATABASE_URL")');
    expect(schema).toContain('directUrl = env("DIRECT_URL")');
  });

  it("registers CI test script and wiring paths", () => {
    expect(PRISMA_CONFIG_UNIT_TEST).toBe("tests/unit/prisma-config.test.ts");

    const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
      scripts?: Record<string, string>;
    };
    expect(pkg.scripts?.[PRISMA_CONFIG_NPM_SCRIPT]).toContain(PRISMA_CONFIG_UNIT_TEST);

    for (const path of PRISMA_CONFIG_WIRING_PATHS) {
      expect(existsSync(join(ROOT, path))).toBe(true);
    }
  });
});
