import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  isSensitiveStorefrontRedirectPath,
  storefrontRedirectMaxChainDepth,
  wouldRedirectLoop,
} from "@/lib/storefront/storefront-redirects";

describe("storefront redirect edge helpers", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("detects self-loop", () => {
    expect(wouldRedirectLoop("/old", "/s/demo/old")).toBe(true);
  });

  it("flags sensitive paths", () => {
    expect(isSensitiveStorefrontRedirectPath("/checkout")).toBe(true);
    expect(isSensitiveStorefrontRedirectPath("/order/abc")).toBe(true);
    expect(isSensitiveStorefrontRedirectPath("/order-confirmation/x")).toBe(true);
    expect(isSensitiveStorefrontRedirectPath("/menu")).toBe(false);
    expect(isSensitiveStorefrontRedirectPath("/cart")).toBe(false);
  });

  it("default chain depth is 1", () => {
    vi.stubEnv("STOREFRONT_REDIRECT_FOLLOW_CHAIN", "");
    expect(storefrontRedirectMaxChainDepth()).toBe(1);
  });

  it("follow chain caps at 3", () => {
    vi.stubEnv("STOREFRONT_REDIRECT_FOLLOW_CHAIN", "true");
    vi.stubEnv("STOREFRONT_REDIRECT_CHAIN_MAX", "99");
    expect(storefrontRedirectMaxChainDepth()).toBe(3);
  });
});
