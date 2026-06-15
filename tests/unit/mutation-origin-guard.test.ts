import { describe, expect, it, vi } from "vitest";

import { rejectCrossSiteMutation } from "@/lib/security/mutation-origin-guard";

describe("mutation-origin-guard", () => {
  it("allows GET without origin check", () => {
    expect(rejectCrossSiteMutation(new Request("http://localhost/api/x", { method: "GET" }))).toBeNull();
  });

  it("blocks POST with foreign origin in production", () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("NEXT_PUBLIC_APP_URL", "https://app.kitchenos.test");
    const res = rejectCrossSiteMutation(
      new Request("https://app.kitchenos.test/api/x", {
        method: "POST",
        headers: { Origin: "https://evil.example" },
      }),
    );
    expect(res?.status).toBe(403);
    vi.unstubAllEnvs();
  });

  it("allows POST when origin matches app url", () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("NEXT_PUBLIC_APP_URL", "https://app.kitchenos.test");
    const res = rejectCrossSiteMutation(
      new Request("https://app.kitchenos.test/api/x", {
        method: "POST",
        headers: { Origin: "https://app.kitchenos.test" },
      }),
    );
    expect(res).toBeNull();
    vi.unstubAllEnvs();
  });
});
