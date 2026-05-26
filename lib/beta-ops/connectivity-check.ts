export type ConnectivityResult = {
  smokeUrl: { ok: boolean; status?: number; message: string };
  database: { ok: boolean; message: string; skipped: boolean };
};

export async function checkSmokeBaseUrl(
  baseUrl: string,
  timeoutMs = 15_000,
): Promise<{ ok: boolean; status?: number; message: string }> {
  const url = baseUrl.replace(/\/$/, "");
  const healthPaths = ["/api/health", "/api/healthz", "/"];
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  for (const path of healthPaths) {
    try {
      const res = await fetch(`${url}${path}`, {
        method: "GET",
        signal: controller.signal,
        headers: { Accept: "application/json" },
      });
      clearTimeout(timer);
      if (res.ok || res.status < 500) {
        return {
          ok: true,
          status: res.status,
          message: `Reachable ${path} → HTTP ${res.status}`,
        };
      }
    } catch {
      /* try next path */
    }
  }
  clearTimeout(timer);
  return {
    ok: false,
    message: `Could not reach ${url} (tried /api/health, /)`,
  };
}

export async function checkDatabasePing(databaseUrl: string): Promise<{ ok: boolean; message: string }> {
  try {
    const { PrismaClient } = await import("@prisma/client");
    const prisma = new PrismaClient({
      datasources: { db: { url: databaseUrl } },
    });
    await prisma.$queryRaw`SELECT 1`;
    await prisma.$disconnect();
    return { ok: true, message: "Database SELECT 1 ok" };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return { ok: false, message: msg.slice(0, 200) };
  }
}

export async function runConnectivityChecks(opts?: {
  skipDatabase?: boolean;
}): Promise<ConnectivityResult> {
  const base = process.env.SMOKE_BASE_URL?.trim();
  const smokeUrl = base
    ? await checkSmokeBaseUrl(base)
    : { ok: false, message: "SMOKE_BASE_URL unset" };

  const dbUrl = process.env.DATABASE_URL?.trim();
  if (opts?.skipDatabase || !dbUrl) {
    return {
      smokeUrl,
      database: { ok: true, message: "Skipped", skipped: true },
    };
  }

  const database = await checkDatabasePing(dbUrl);
  return {
    smokeUrl,
    database: { ...database, skipped: false },
  };
}
