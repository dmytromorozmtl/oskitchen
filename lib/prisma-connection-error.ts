import { Prisma } from "@prisma/client";

/** P1001 / P1000 — pooler unreachable, paused project, or stale dev env. */
export function isPrismaConnectionError(err: unknown): boolean {
  if (err instanceof Prisma.PrismaClientInitializationError) return true;
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    return err.code === "P1001" || err.code === "P1000" || err.code === "P1017";
  }
  const msg = err instanceof Error ? err.message : String(err);
  return /Can't reach database server|Connection refused|ECONNREFUSED|ETIMEDOUT/i.test(msg);
}

export function prismaConnectionErrorHint(): string {
  return [
    "Supabase pooler unreachable from this machine.",
    "1. Restart: npm run dev:safe (fresh terminal — do not source .env.production.local)",
    "2. Supabase Dashboard → project not Paused",
    "3. npm run check:database-connectivity",
  ].join("\n");
}
