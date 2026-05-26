/**
 * Detect whether Supabase Auth env is set to real values (not template placeholders).
 * Used by middleware to avoid crashing when `.env.local` is incomplete during local setup.
 */
export function isSupabaseConfigured(): boolean {
  const url = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").trim();
  const key = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "").trim();
  if (!url || !key) return false;

  const u = url.toLowerCase();
  const k = key.toLowerCase();
  if (
    u.includes("your_project") ||
    u.includes("placeholder") ||
    k === "your_anon_key" ||
    k.includes("placeholder-anon-key") ||
    k === "placeholder"
  ) {
    return false;
  }

  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return false;
  } catch {
    return false;
  }

  return key.length >= 20;
}
