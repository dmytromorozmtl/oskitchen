import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { timingSafeEqualHex } from "@/lib/storefront/analytics-signature";
import { decodeStorefrontAnalyticsToken, encodeStorefrontAnalyticsToken } from "@/lib/storefront/storefront-analytics-token";
import {
  issueStorefrontAnalyticsToken,
  verifyStorefrontAnalyticsTokenForIngest,
} from "@/services/storefront/storefront-analytics-signing-service";

const SECRET = "unit-test-signing-secret-32chars!!";

describe("storefront analytics token", () => {
  beforeEach(() => {
    vi.stubEnv("STOREFRONT_ANALYTICS_SIGNING_SECRET", SECRET);
  });
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("encodes and decodes a valid token", () => {
    const iat = Math.floor(Date.now() / 1000);
    const exp = iat + 3600;
    const raw = encodeStorefrontAnalyticsToken(
      { v: 1, sid: "sid-1", slug: "demo", iat, exp, src: "storefront_beacon" },
      SECRET,
    );
    const p = decodeStorefrontAnalyticsToken(raw, SECRET);
    expect(p?.slug).toBe("demo");
    expect(p?.sid).toBe("sid-1");
  });

  it("rejects expired token", () => {
    const iat = Math.floor(Date.now() / 1000) - 7200;
    const exp = iat + 60;
    const raw = encodeStorefrontAnalyticsToken(
      { v: 1, sid: "sid-1", slug: "demo", iat, exp, src: "storefront_beacon" },
      SECRET,
    );
    expect(decodeStorefrontAnalyticsToken(raw, SECRET)).toBeNull();
  });

  it("rejects tampered token", () => {
    const iat = Math.floor(Date.now() / 1000);
    const exp = iat + 3600;
    const raw = encodeStorefrontAnalyticsToken(
      { v: 1, sid: "sid-1", slug: "demo", iat, exp, src: "storefront_beacon" },
      SECRET,
    );
    const broken = `${raw.slice(0, -4)}xxxx`;
    expect(decodeStorefrontAnalyticsToken(broken, SECRET)).toBeNull();
  });

  it("issue + verify ingest accepts matching slug and storefront id", () => {
    const tok = issueStorefrontAnalyticsToken({ storefrontId: "abc", storeSlug: "foo" });
    expect(tok).toBeTruthy();
    expect(
      verifyStorefrontAnalyticsTokenForIngest({
        token: tok!,
        expectedStoreSlug: "foo",
        expectedStorefrontId: "abc",
      }),
    ).toBe(true);
    expect(
      verifyStorefrontAnalyticsTokenForIngest({
        token: tok!,
        expectedStoreSlug: "other",
        expectedStorefrontId: "abc",
      }),
    ).toBe(false);
  });

  it("timingSafeEqualHex distinguishes lengths", () => {
    expect(timingSafeEqualHex("ab", "abcd")).toBe(false);
  });
});
