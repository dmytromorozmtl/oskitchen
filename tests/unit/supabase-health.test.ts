import { describe, expect, it, vi, afterEach } from "vitest";

import { checkSupabaseAuthHealth } from "@/lib/observability/supabase-health";

describe("checkSupabaseAuthHealth", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  });

  it("returns ok false when URL missing", async () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "";
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "";
    const r = await checkSupabaseAuthHealth();
    expect(r.ok).toBe(false);
  });

  it("calls health with anon headers when configured", async () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "sb_publishable_test";
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
    });
    vi.stubGlobal("fetch", fetchMock);

    const r = await checkSupabaseAuthHealth();
    expect(r.ok).toBe(true);
    expect(fetchMock).toHaveBeenCalledWith(
      "https://example.supabase.co/auth/v1/health",
      expect.objectContaining({
        method: "GET",
        headers: expect.objectContaining({
          apikey: "sb_publishable_test",
        }),
      }),
    );
  });
});
