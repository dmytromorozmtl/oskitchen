import { prisma } from "@/lib/prisma";

export type DbHealth = {
  ok: boolean;
  latencyMs: number;
  /** True when DATABASE_URL uses Supabase transaction pooler (PgBouncer :6543). */
  poolerConfigured: boolean;
  error?: string;
};

function isPoolerConfigured(): boolean {
  const url = process.env.DATABASE_URL ?? "";
  return url.includes("pgbouncer=true") || url.includes(":6543");
}

/** Lightweight connectivity probe — safe for health routes (no secrets). */
export async function checkDatabaseHealth(): Promise<DbHealth> {
  const started = Date.now();
  const poolerConfigured = isPoolerConfigured();
  try {
    await prisma.$queryRaw`SELECT 1`;
    return { ok: true, latencyMs: Date.now() - started, poolerConfigured };
  } catch (e) {
    const message = e instanceof Error ? e.message : "unknown_error";
    return { ok: false, latencyMs: Date.now() - started, poolerConfigured, error: message };
  }
}
