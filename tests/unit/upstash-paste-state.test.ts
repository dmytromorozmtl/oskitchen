import { describe, expect, it } from "vitest";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { getUpstashPasteState } from "@/scripts/lib/upstash-paste-state";
import { isValidUpstashUrl } from "@/scripts/lib/staging-env-placeholders";

describe("upstash paste state", () => {
  it("rejects template example URL", () => {
    expect(isValidUpstashUrl("https://us1-example-12345.upstash.io")).toBe(false);
  });

  it("detects template paste file", () => {
    const dir = mkdtempSync(join(tmpdir(), "kos-paste-"));
    writeFileSync(
      join(dir, ".env.upstash.paste.local"),
      "UPSTASH_REDIS_REST_URL=https://us1-example-12345.upstash.io\nUPSTASH_REDIS_REST_TOKEN=\n",
      "utf8",
    );
    expect(getUpstashPasteState(dir).state).toBe("template");
  });

  it("detects ready paste file", () => {
    const dir = mkdtempSync(join(tmpdir(), "kos-paste-"));
    writeFileSync(
      join(dir, ".env.upstash.paste.local"),
      [
        "UPSTASH_REDIS_REST_URL=https://us1-realdb-99999.upstash.io",
        "UPSTASH_REDIS_REST_TOKEN=AX1aBcDeFgHiJkLmNoPqRsTuVwXyZ0123456789",
      ].join("\n"),
      "utf8",
    );
    expect(getUpstashPasteState(dir).state).toBe("ready");
  });
});
