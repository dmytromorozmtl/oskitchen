import { describe, expect, it } from "vitest";

import {
  decryptPiiField,
  encryptPiiField,
  isPiiEncryptionEnabled,
  maskEmailForLog,
  PII_ENCRYPTED_PREFIX,
} from "@/lib/security/pii-field";

describe("pii-field encryption", () => {
  it("passes through plaintext when ENCRYPTION_KEY is unset", () => {
    const original = process.env.ENCRYPTION_KEY;
    delete process.env.ENCRYPTION_KEY;
    expect(isPiiEncryptionEnabled()).toBe(false);
    expect(encryptPiiField("user@example.com")).toBe("user@example.com");
    expect(decryptPiiField("user@example.com")).toBe("user@example.com");
    if (original) process.env.ENCRYPTION_KEY = original;
  });

  it("masks email for logs", () => {
    expect(maskEmailForLog("alice@kitchen.test")).toMatch(/^al\*\*\*@kitchen\.test$/);
  });

  it("round-trips encrypted values when key is configured", () => {
    const key = "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef";
    const prev = process.env.ENCRYPTION_KEY;
    process.env.ENCRYPTION_KEY = key;
    const enc = encryptPiiField("secret@example.com");
    expect(enc?.startsWith(PII_ENCRYPTED_PREFIX)).toBe(true);
    expect(decryptPiiField(enc)).toBe("secret@example.com");
    if (prev) process.env.ENCRYPTION_KEY = prev;
    else delete process.env.ENCRYPTION_KEY;
  });
});
