import { describe, expect, it } from "vitest";

import { verifySlackRequestSignature } from "@/lib/storefront/slack-interactive";
import { createHmac } from "node:crypto";

describe("verifySlackRequestSignature", () => {
  it("accepts valid v0 signature", () => {
    const secret = "test-secret";
    const timestamp = String(Math.floor(Date.now() / 1000));
    const body = "payload=%7B%7D";
    const base = `v0:${timestamp}:${body}`;
    const sig = `v0=${createHmac("sha256", secret).update(base).digest("hex")}`;

    expect(
      verifySlackRequestSignature({
        signingSecret: secret,
        timestamp,
        rawBody: body,
        signature: sig,
      }),
    ).toBe(true);
  });
});
