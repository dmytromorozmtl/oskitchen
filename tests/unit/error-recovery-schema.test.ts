import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

const SCHEMA_PATH = join(process.cwd(), "prisma/schema.prisma");

describe("error_recovery_items schema", () => {
  it("defines ErrorRecoveryItem in Prisma schema", () => {
    const schema = readFileSync(SCHEMA_PATH, "utf8");
    expect(schema).toMatch(/model ErrorRecoveryItem\b/);
  });
});
