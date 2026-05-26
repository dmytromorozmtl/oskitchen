import { describe, expect, it } from "vitest";

import { formatImpersonationTtl } from "@/lib/platform/impersonation-session";
import { PLATFORM_IMPERSONATION_MAX_SECONDS } from "@/lib/platform/platform-impersonation";

describe("platform impersonation", () => {
  it("formats TTL for banner", () => {
    expect(formatImpersonationTtl(125)).toBe("2m 5s");
    expect(formatImpersonationTtl(45)).toBe("45s");
  });

  it("uses one-hour max session constant", () => {
    expect(PLATFORM_IMPERSONATION_MAX_SECONDS).toBe(3600);
  });
});
