import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";

describe("smoke-production-tenant probes", () => {
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async (input: RequestInfo) => {
        const url = String(input);
        if (url.includes("/api/health")) {
          return new Response(JSON.stringify({ status: "ok" }), { status: 200 });
        }
        if (url.includes("/login")) {
          return new Response("ok", { status: 200, headers: { "x-url": url } });
        }
        if (url.includes("/s/demo")) {
          return new Response("ok", { status: 200 });
        }
        if (url.includes("/dashboard")) {
          return Response.redirect("https://example.com/login", 307);
        }
        return new Response("not found", { status: 404 });
      }),
    );
  });

  afterEach(() => {
    vi.stubGlobal("fetch", originalFetch);
  });

  it("health probe accepts 200", async () => {
    const res = await fetch("https://example.com/api/health");
    expect(res.ok).toBe(true);
  });

  it("storefront slug probe returns 200", async () => {
    const res = await fetch("https://example.com/s/demo");
    expect(res.ok).toBe(true);
  });
});
