/** Detect common DATABASE_URL mistakes (sed corruption, shell source, extra quotes). */
export function diagnoseDatabaseUrl(url: string | undefined): {
  ok: boolean;
  hint?: string;
} {
  const u = url?.trim() ?? "";
  if (!u) {
    return { ok: false, hint: "DATABASE_URL is empty — check .env.local" };
  }
  if (u.includes("DATABASE_URL=") || u.includes("DIRECT_URL=")) {
    return {
      ok: false,
      hint:
        "URL contains duplicated key names — .env.production.local was corrupted by sed. Run: npm run storefront:env:sync-local",
    };
  }
  if (u.startsWith('"') || u.endsWith('"')) {
    return { ok: false, hint: "URL has extra quote characters — fix .env file" };
  }
  if (!u.startsWith("postgresql://") && !u.startsWith("postgres://")) {
    return { ok: false, hint: "URL must start with postgresql://" };
  }
  try {
    const parsed = new URL(u);
    if (!parsed.hostname) return { ok: false, hint: "invalid hostname" };
    const params = parsed.searchParams;
    for (const key of params.keys()) {
      if (key.includes("DATABASE_URL") || key.includes("DIRECT_URL")) {
        return { ok: false, hint: "malformed query string — re-sync from .env.local" };
      }
    }
    return { ok: true };
  } catch {
    return { ok: false, hint: "URL parse failed — password may need URL-encoding if it contains ? & # @" };
  }
}
