import { describe, expect, it } from "vitest";

import { prisma } from "@/lib/prisma";

const run = process.env.RUN_DB_INTEGRATION === "1" && Boolean(process.env.DATABASE_URL?.trim());

describe.skipIf(!run)("error_recovery_items table (integration)", () => {
  it("is queryable when migration is applied", async () => {
    const rows = await prisma.$queryRaw<Array<{ tablename: string }>>`
      SELECT tablename FROM pg_tables
      WHERE schemaname = 'public' AND tablename = 'error_recovery_items'
    `;
    expect(rows.length).toBe(1);
  });
});
