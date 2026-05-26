/** Supabase GoTrue health — requires anon key (HEAD/GET without key returns 401). */
export async function checkSupabaseAuthHealth(): Promise<{
  ok: boolean;
  latencyMs?: number;
  status?: number;
}> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
  if (!supabaseUrl) return { ok: false };

  const started = Date.now();
  try {
    const headers: HeadersInit = {};
    if (anonKey) {
      headers.apikey = anonKey;
      headers.Authorization = `Bearer ${anonKey}`;
    }
    const res = await fetch(`${supabaseUrl}/auth/v1/health`, {
      method: "GET",
      headers,
      signal: AbortSignal.timeout(5000),
      cache: "no-store",
    });
    const latencyMs = Date.now() - started;
    return { ok: res.ok, latencyMs, status: res.status };
  } catch {
    return { ok: false, latencyMs: Date.now() - started };
  }
}
