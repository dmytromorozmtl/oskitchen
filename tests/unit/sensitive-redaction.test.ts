import { describe, expect, it } from "vitest";

import { redactSensitiveText, toSafeErrorPreview } from "@/lib/security/sensitive-redaction";

describe("redactSensitiveText", () => {
  it("redacts bearer token", () => {
    const s = 'Failed: authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.dozjgNryP4J3jVmNHl0w5N_XgL0n3I9PlFUP0THsR8U';
    expect(redactSensitiveText(s)).toContain("[REDACTED]");
    expect(redactSensitiveText(s)).not.toContain("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9");
  });

  it("redacts Stripe secret key", () => {
    const s = "charge failed sk_live_12345678901234567890123456789012";
    expect(redactSensitiveText(s)).toContain("[REDACTED_STRIPE_SECRET]");
    expect(redactSensitiveText(s)).not.toContain("sk_live_");
  });

  it("redacts postgres URL", () => {
    const s = "could not connect postgresql://user:secret@db.example.com:5432/app";
    expect(redactSensitiveText(s)).toContain("[REDACTED_DATABASE_URL]");
    expect(redactSensitiveText(s)).not.toContain("postgresql://");
  });

  it("redacts webhook secret style kv", () => {
    const s = 'api_key: "abcdefghijklmnopqrstuvwxyz123456789012"';
    expect(redactSensitiveText(s)).toMatch(/REDACTED/i);
    expect(redactSensitiveText(s)).not.toContain("abcdefghijklmnopqrstuvwxyz123456789012");
  });

  it("redacts long high-entropy hex token", () => {
    const s = "token deadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef";
    expect(redactSensitiveText(s)).toContain("[REDACTED_TOKEN]");
  });

  it("preserves harmless operational error", () => {
    const s = "Order validation failed: missing pickup window for 2026-05-14";
    expect(redactSensitiveText(s)).toBe(s);
  });
});

describe("toSafeErrorPreview", () => {
  it("marks redacted when patterns apply", () => {
    const p = toSafeErrorPreview("Bearer abcdefghijklmnopqrstuvwxyz0123456789", 160);
    expect(p.redacted).toBe(true);
    expect(p.text.length).toBeLessThanOrEqual(160);
  });

  it("truncates after redaction", () => {
    const noise = "no_secret_here_".repeat(50);
    const long = `${noise} sk_test_123456789012345678901234567890123456789012345678901234567890`;
    const p = toSafeErrorPreview(long, 80);
    expect(p.text.length).toBeLessThanOrEqual(80);
    expect(p.redacted).toBe(true);
  });

  it("handles empty input", () => {
    const p = toSafeErrorPreview(null, 160);
    expect(p.text).toBe("—");
    expect(p.redacted).toBe(false);
  });
});
