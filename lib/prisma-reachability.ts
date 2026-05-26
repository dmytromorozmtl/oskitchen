import { Prisma } from "@prisma/client";

/** Prisma codes where the client could not talk to Postgres (network / host / pause). */
const DATABASE_UNREACHABLE_CODES = new Set(["P1001", "P1002", "P1017"]);

export function isPrismaDatabaseUnreachableError(error: unknown): boolean {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    DATABASE_UNREACHABLE_CODES.has(error.code)
  );
}
