import { describe, expect, it } from "vitest";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { scanUpstashCredentials } from "@/scripts/lib/scan-upstash-credentials";

describe("scanUpstashCredentials", () => {
  it("finds valid pair in .env.upstash.paste.local", () => {
    const dir = mkdtempSync(join(tmpdir(), "kos-upstash-"));
    writeFileSync(
      join(dir, ".env.upstash.paste.local"),
      [
        "UPSTASH_REDIS_REST_URL=https://us1-testdb-99999.upstash.io",
        "UPSTASH_REDIS_REST_TOKEN=AX1aBcDeFgHiJkLmNoPqRsTuVwXyZ0123456789",
      ].join("\n"),
      "utf8",
    );
    const hit = scanUpstashCredentials(dir);
    expect(hit?.source).toBe(".env.upstash.paste.local");
    expect(hit?.url).toContain("upstash.io");
  });

  it("ignores placeholders", () => {
    const dir = mkdtempSync(join(tmpdir(), "kos-upstash-"));
    writeFileSync(
      join(dir, ".env.local"),
      "UPSTASH_REDIS_REST_URL=https://ВАШ-ID.upstash.io\nUPSTASH_REDIS_REST_TOKEN=AX…\n",
      "utf8",
    );
    expect(scanUpstashCredentials(dir)).toBeUndefined();
  });
});
