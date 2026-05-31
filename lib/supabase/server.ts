import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";

import { resolveSupabasePublicEnv } from "@/lib/supabase/resolve-public-env";

type CookieToSet = {
  name: string;
  value: string;
  options: CookieOptions;
};

export async function createClient() {
  const cookieStore = await cookies();
  const { url, anonKey } = resolveSupabasePublicEnv();

  return createServerClient(
    url,
    anonKey,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: CookieToSet[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }: CookieToSet) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            /* ignore when called from Server Component */
          }
        },
      },
    },
  );
}
