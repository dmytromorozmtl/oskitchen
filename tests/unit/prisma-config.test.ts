import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

const ROOT = process.cwd();

describe("prisma config migration", () => {
  it("uses prisma.config.ts instead of deprecated package.json#prisma", () => {
    expect(existsSync(join(ROOT, "prisma.config.ts"))).toBe(true);

    const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
      prisma?: unknown;
    };
    expect(pkg.prisma).toBeUndefined();

    const config = readFileSync(join(ROOT, "prisma.config.ts"), "utf8");
    expect(config).toContain('schema: "prisma/schema.prisma"');
    expect(config).toContain('path: "prisma/migrations"');
    expect(config).toContain('seed: "tsx prisma/seed.ts"');
  });
});
