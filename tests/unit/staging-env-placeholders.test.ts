import { describe, expect, it } from "vitest";

import {
  isPlaceholderEnvValue,
  isValidUpstashToken,
  isValidUpstashUrl,
} from "@/scripts/lib/staging-env-placeholders";

describe("staging-env-placeholders", () => {
  it("detects doc and localized placeholders", () => {
    expect(isPlaceholderEnvValue("https://ВАШ-ID.upstash.io")).toBe(true);
    expect(isPlaceholderEnvValue("AX…")).toBe(true);
    expect(isPlaceholderEnvValue("https://staging.yourdomain.com")).toBe(true);
  });

  it("rejects doc-template upstash hostname fragments", () => {
    expect(isValidUpstashUrl("https://us1-example-12345.upstash.io")).toBe(false);
    expect(isPlaceholderEnvValue("https://us1-example-12345.upstash.io")).toBe(true);
  });

  it("accepts real-shaped upstash values", () => {
    expect(isValidUpstashUrl("https://us1-realdb-99999.upstash.io")).toBe(true);
    expect(isValidUpstashToken("AX1aBcDeFgHiJkLmNoPqRsTuVwXyZ0123456789")).toBe(true);
  });
});
