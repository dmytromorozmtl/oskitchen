/** Resolve Supabase URL + anon key for server/middleware (runtime on Vercel). */
export function resolveSupabasePublicEnv(): { url: string; anonKey: string } {
  const url = (
    process.env.SUPABASE_URL ??
    process.env.NEXT_PUBLIC_SUPABASE_URL ??
    ""
  ).trim();
  const anonKey = (
    process.env.SUPABASE_ANON_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
    ""
  ).trim();
  return { url, anonKey };
}
