import { afterEach, describe, expect, it, vi } from "vitest";

import {
  PRODUCTION_APP_URL,
  authCallbackUrl,
  resolvePublicSiteUrl,
} from "@/lib/auth/public-site-url";

describe("resolvePublicSiteUrl", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("uses NEXT_PUBLIC_APP_URL when set", () => {
    vi.stubEnv("NEXT_PUBLIC_APP_URL", "https://app.example.com/");
    expect(resolvePublicSiteUrl()).toBe("https://app.example.com");
  });

  it("treats empty NEXT_PUBLIC_APP_URL as unset in production", () => {
    vi.stubEnv("NEXT_PUBLIC_APP_URL", "");
    vi.stubEnv("VERCEL_ENV", "production");
    expect(resolvePublicSiteUrl()).toBe(PRODUCTION_APP_URL);
  });

  it("defaults to localhost in development", () => {
    vi.stubEnv("NEXT_PUBLIC_APP_URL", "");
    vi.stubEnv("VERCEL_ENV", "development");
    vi.stubEnv("NODE_ENV", "development");
    expect(resolvePublicSiteUrl()).toBe("http://localhost:3000");
  });
});

describe("authCallbackUrl", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("builds callback with optional next path", () => {
    vi.stubEnv("NEXT_PUBLIC_APP_URL", "https://os-kitchen.com");
    expect(authCallbackUrl()).toBe("https://os-kitchen.com/auth/callback");
    expect(authCallbackUrl("/dashboard")).toBe(
      "https://os-kitchen.com/auth/callback?next=%2Fdashboard",
    );
  });
});
