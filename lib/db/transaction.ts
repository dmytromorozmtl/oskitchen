import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

type TxFn<T> = (tx: Prisma.TransactionClient) => Promise<T>;

/**
 * Default interactive transaction — tune `timeout` / `maxWait` per call site for heavy jobs.
 */
export async function withTransaction<T>(
  fn: TxFn<T>,
  options?: { maxWait?: number; timeout?: number; isolationLevel?: Prisma.TransactionIsolationLevel },
): Promise<T> {
  return prisma.$transaction(fn, {
    maxWait: options?.maxWait ?? 5_000,
    timeout: options?.timeout ?? 15_000,
    isolationLevel: options?.isolationLevel,
  });
}
