import { Prisma } from "@prisma/client";

/** Prisma errors when a table/column from a pending migration is not in the database yet. */
export function isPrismaMigrationMissingError(error: unknown): boolean {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2021" || error.code === "P2022") return true;
    const message = error.message.toLowerCase();
    return message.includes("does not exist") || message.includes("column");
  }
  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    return message.includes("does not exist") && message.includes("table");
  }
  return false;
}
