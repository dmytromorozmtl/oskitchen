import { Prisma } from "@prisma/client";
import { describe, expect, it } from "vitest";

import { isPrismaMigrationMissingError } from "@/lib/prisma-migration-missing";

describe("isPrismaMigrationMissingError", () => {
  it("detects missing table Prisma errors", () => {
    const error = new Prisma.PrismaClientKnownRequestError("table missing", {
      code: "P2021",
      clientVersion: "6.19.3",
    });
    expect(isPrismaMigrationMissingError(error)).toBe(true);
  });

  it("ignores unrelated errors", () => {
    const error = new Prisma.PrismaClientKnownRequestError("unique", {
      code: "P2002",
      clientVersion: "6.19.3",
    });
    expect(isPrismaMigrationMissingError(error)).toBe(false);
  });
});
